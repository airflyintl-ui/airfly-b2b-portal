"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";


interface Flight {
  id: number;
  airline_id?: number;
  flight_no?: string;
  from?: string;
  to?: string;
  departure_time?: string;
  arrival_time?: string;
  economy_fare?: string | number;
  business_fare?: string | number;
  available_seats?: number;
  status?: boolean;
}

interface Booking {
  id: number;
  agent_id: number;
  flight_id: number;
  pnr: string;
  passenger_name: string;
  passport: string;
  nationality?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  journey_type?: string;
  travel_class?: string;
  adults?: number;
  children?: number;
  infants?: number;
  total_amount: string | number;
  ticket_number?: string;
  payment_status?: string;
  booking_status?: string;
  remarks?: string | null;
  created_at?: string;
  updated_at?: string;
  flight?: Flight;
}

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wallet, setWallet] = useState<string | number>("0");

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  // =========================================================
  // FETCH BOOKINGS
  // =========================================================

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/bookings`, {
        method: "GET",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },

        cache: "no-store",
      });

      const data = await response.json();

      console.log("BOOKINGS RESPONSE:", data);

      if (response.status === 401) {
        localStorage.removeItem("token");

        alert("Session expired. Please login again.");

        router.push("/login");

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load bookings."
        );
      }

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setBookings([]);
        setError(
          data.message || "No bookings found."
        );
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);

      setError(
        "Unable to connect with Laravel API. Please make sure backend is running on port 8090."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchBookings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchBookings]);

  // =========================================================
  // FETCH WALLET
  // =========================================================

  const fetchWallet = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await fetch(
        `${API}/wallet/statement`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setWallet(data.wallet || "0");
      }
    } catch (error) {
      console.error("Wallet error:", error);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchWallet();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchWallet]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "N/A";
    }
  };

  // =========================================================
  // FORMAT DATETIME
  // =========================================================

  const formatDateTime = (date?: string) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "N/A";
    }
  };

  // =========================================================
  // VIEW BOOKING
  // =========================================================

  const viewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    setSelectedBooking(null);
  };

  // =========================================================
  // INVOICE / TICKET
  // =========================================================

  const openInvoice = async (booking: Booking) => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API}/bookings/${booking.id}/invoice`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");

        alert("Session expired. Please login again.");

        router.push("/login");

        return;
      }

      /*
       * Backend may return JSON or HTML/PDF.
       *
       * If it returns JSON, show it in console.
       * Otherwise open the endpoint in a new tab.
       */

      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();

        console.log("INVOICE RESPONSE:", data);

        if (data.success === false) {
          alert(
            data.message ||
              "Unable to generate invoice."
          );

          return;
        }

        alert(
          "Invoice API is working successfully."
        );

        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      console.error("Invoice error:", error);

      /*
       * Fallback:
       * Open invoice endpoint directly.
       */

      window.open(
        `${API}/bookings/${booking.id}/invoice`,
        "_blank"
      );
    }
  };

 
 
  // =========================================================
  // PROFESSIONAL INVOICE / PRINT BOOKING
  // =========================================================

  const printBooking = (booking: Booking) => {
    const flight = booking.flight;

    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

    if (!printWindow) {
      alert("Popup blocked. Please allow popups for this website.");
      return;
    }

    // Safely escape dynamic HTML values
    const esc = (value: unknown) =>
      String(value ?? "N/A").replace(/[&<>"']/g, (char) => {
        const entities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return entities[char];
      });

    const money = (value: string | number) =>
      Number(value || 0).toLocaleString("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const cancelled =
      ["cancelled", "canceled"].includes(
        booking.booking_status?.toLowerCase() || ""
      );

    const refunded =
      booking.payment_status?.toLowerCase() === "refunded";

    const watermark =
      cancelled || refunded
        ? cancelled && refunded
          ? "CANCELLED / REFUNDED"
          : cancelled
          ? "CANCELLED"
          : "REFUNDED"
        : "";

    const invoiceRef = `AFI-${booking.id}-${booking.pnr || "BOOKING"}`;

    const logoUrl =
      "https://raw.githubusercontent.com/airflyintl-ui/airfly-b2b-portal/main/frontend/public/images/logo.jpg";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Air Fly Invoice - ${esc(booking.pnr)}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #263445;
            background: #f1f4f8;
            margin: 0;
            padding: 25px;
          }

          .invoice {
            position: relative;
            max-width: 850px;
            margin: auto;
            padding: 42px;
            background: #fff;
            overflow: hidden;
          }

          .watermark {
            position: absolute;
            top: 44%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 48px;
            font-weight: 900;
            color: rgba(220, 38, 38, 0.12);
            white-space: nowrap;
            z-index: 0;
            pointer-events: none;
          }

          .content {
            position: relative;
            z-index: 1;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 4px solid #123c72;
            padding-bottom: 22px;
            gap: 15px;
          }

          .brand-row {
            display: flex;
            align-items: center;
            gap: 13px;
          }

          .brand-logo {
            width: 115px;
            height: 75px;
            object-fit: contain;
            display: block;
          }

          .brand {
            color: #123c72;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 1px;
            margin-bottom: 7px;
          }

          .brand-sub {
            font-size: 10px;
            letter-spacing: 2px;
            color: #66758a;
          }

          .invoice-title {
            text-align: right;
          }

          .invoice-title h2 {
            color: #123c72;
            margin: 0 0 7px;
            font-size: 25px;
          }

          .invoice-title p {
            margin: 4px 0;
            font-size: 12px;
            color: #65748b;
          }

          .status-row {
            display: flex;
            gap: 10px;
            margin: 22px 0;
          }

          .status {
            padding: 7px 13px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            background: #e8edf3;
          }

          .status.cancelled,
          .status.canceled,
          .status.refunded {
            background: #fee2e2;
            color: #b91c1c;
          }

          .status.confirmed,
          .status.paid {
            background: #dcfce7;
            color: #166534;
          }

          .section {
            margin-top: 25px;
          }

          .section-title {
            background: #123c72;
            color: #fff;
            padding: 10px 13px;
            font-size: 13px;
            font-weight: bold;
            border-radius: 3px;
            margin-bottom: 12px;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 13px 25px;
            padding: 5px 4px;
          }

          .field label {
            display: block;
            color: #78869a;
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }

          .field strong {
            font-size: 13px;
            color: #263445;
            overflow-wrap: anywhere;
          }

          .flight-route {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f1f5fa;
            padding: 20px;
            border-radius: 5px;
            margin-top: 10px;
          }

          .airport {
            font-size: 25px;
            font-weight: 900;
            color: #123c72;
          }

          .route-arrow {
            font-size: 24px;
            color: #8493a7;
          }

          .amount-box {
            margin-top: 25px;
            border: 1px solid #dce3ec;
            border-radius: 5px;
            padding: 18px;
          }

          .amount-line {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            padding: 7px 0;
          }

          .total-line {
            border-top: 2px solid #123c72;
            margin-top: 10px;
            padding-top: 14px;
            font-size: 19px;
            font-weight: bold;
            color: #123c72;
          }

          .note {
            margin-top: 25px;
            padding: 12px;
            background: #f8fafc;
            border-left: 4px solid #64748b;
            font-size: 11px;
            color: #526174;
          }

          .footer {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #dce3ec;
            text-align: center;
            font-size: 10px;
            line-height: 1.8;
            color: #78869a;
          }

          @page {
            size: A4;
            margin: 10mm;
          }

          @media print {
            body {
              background: #fff;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .invoice {
              max-width: none;
              min-height: 0;
              padding: 15px;
              box-shadow: none;
            }

            .section,
            .amount-box,
            .note {
              break-inside: avoid;
            }
          }
        </style>
      </head>

      <body>
        <div class="invoice">

          ${watermark ? `<div class="watermark">${esc(watermark)}</div>` : ""}

          <div class="content">

            <div class="header">

              <div class="brand-row">
                <img
                  id="invoice-logo"
                  class="brand-logo"
                  src="${logoUrl}"
                  alt="Air Fly International Logo"
                />

                <div>
                  <div class="brand">AIR FLY INTERNATIONAL</div>
                  <div class="brand-sub">TRAVEL & TOURISM SERVICES</div>
                </div>
              </div>

              <div class="invoice-title">
                <h2>INVOICE</h2>
                <p>Document Ref: ${esc(invoiceRef)}</p>
                <p>Booking Date: ${esc(formatDate(booking.created_at))}</p>
                <p>PNR: <strong>${esc(booking.pnr)}</strong></p>
              </div>

            </div>

            <div class="status-row">
              <span class="status ${esc(booking.payment_status?.toLowerCase())}">
                Payment: ${esc(booking.payment_status)}
              </span>

              <span class="status ${esc(booking.booking_status?.toLowerCase())}">
                Booking: ${esc(booking.booking_status)}
              </span>
            </div>

            <div class="section">
              <div class="section-title">PASSENGER INFORMATION</div>

              <div class="info-grid">
                <div class="field">
                  <label>Passenger Name</label>
                  <strong>${esc(booking.passenger_name)}</strong>
                </div>

                <div class="field">
                  <label>Passport Number</label>
                  <strong>${esc(booking.passport)}</strong>
                </div>

                <div class="field">
                  <label>Nationality</label>
                  <strong>${esc(booking.nationality)}</strong>
                </div>

                <div class="field">
                  <label>Date of Birth</label>
                  <strong>${esc(formatDate(booking.date_of_birth))}</strong>
                </div>

                <div class="field">
                  <label>Phone</label>
                  <strong>${esc(booking.phone)}</strong>
                </div>

                <div class="field">
                  <label>Email</label>
                  <strong>${esc(booking.email)}</strong>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">FLIGHT INFORMATION</div>

              <div class="flight-route">
                <div>
                  <div class="airport">${esc(flight?.from)}</div>
                  <small>Departure</small>
                </div>

                <div class="route-arrow">✈ →</div>

                <div style="text-align:right">
                  <div class="airport">${esc(flight?.to)}</div>
                  <small>Arrival</small>
                </div>
              </div>

              <div class="info-grid" style="margin-top:15px">
                <div class="field">
                  <label>Flight Number</label>
                  <strong>${esc(flight?.flight_no)}</strong>
                </div>

                <div class="field">
                  <label>Ticket Number</label>
                  <strong>${esc(booking.ticket_number)}</strong>
                </div>

                <div class="field">
                  <label>Departure</label>
                  <strong>${esc(formatDateTime(flight?.departure_time))}</strong>
                </div>

                <div class="field">
                  <label>Arrival</label>
                  <strong>${esc(formatDateTime(flight?.arrival_time))}</strong>
                </div>

                <div class="field">
                  <label>Journey Type</label>
                  <strong>${esc(booking.journey_type)}</strong>
                </div>

                <div class="field">
                  <label>Travel Class</label>
                  <strong>${esc(booking.travel_class)}</strong>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">BOOKING & FARE SUMMARY</div>

              <div class="info-grid">
                <div class="field">
                  <label>Adults</label>
                  <strong>${esc(booking.adults ?? 0)}</strong>
                </div>

                <div class="field">
                  <label>Children</label>
                  <strong>${esc(booking.children ?? 0)}</strong>
                </div>

                <div class="field">
                  <label>Infants</label>
                  <strong>${esc(booking.infants ?? 0)}</strong>
                </div>

                <div class="field">
                  <label>PNR</label>
                  <strong>${esc(booking.pnr)}</strong>
                </div>
              </div>

              <div class="amount-box">
                <div class="amount-line">
                  <span>Booking Amount</span>
                  <strong>৳ ${money(booking.total_amount)}</strong>
                </div>

                <div class="amount-line total-line">
                  <span>TOTAL AMOUNT</span>
                  <span>৳ ${money(booking.total_amount)}</span>
                </div>
              </div>
            </div>

            ${
              watermark
                ? `<div class="note">
                    <strong>IMPORTANT NOTICE:</strong>
                    This booking is ${esc(watermark)}.
                    This document is for booking and payment record purposes only.
                    It is not a valid travel ticket.
                  </div>`
                : `<div class="note">
                    Please verify passenger and flight details before travel.
                    This invoice alone does not confirm ticket issuance.
                  </div>`
            }

            <div class="footer">
              <strong>AIR FLY INTERNATIONAL</strong><br />
              Generated from Air Fly International B2B Portal<br />
              This is a computer-generated document.
            </div>

          </div>
        </div>

        <script>
          window.onload = async function () {
            const logo = document.getElementById("invoice-logo");

            if (logo && !logo.complete) {
              await new Promise((resolve) => {
                logo.onload = resolve;
                logo.onerror = resolve;
                setTimeout(resolve, 3000);
              });
            }

            window.focus();
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = (
    status?: string
  ) => {
    const value =
      status?.toLowerCase() || "";

    if (
      value === "confirmed" ||
      value === "paid" ||
      value === "approved"
    ) {
      return "bg-success";
    }

    if (
      value === "pending" ||
      value === "unpaid"
    ) {
      return "bg-warning text-dark";
    }

    if (
      value === "cancelled" ||
      value === "canceled" ||
      value === "failed"
    ) {
      return "bg-danger";
    }

    return "bg-secondary";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="container py-5">

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          />

          <h5 className="mt-3">
            Loading bookings...
          </h5>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="container-fluid py-4 px-3 px-md-4">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">

        <div>

          <h2 className="fw-bold mb-1">
            My Bookings
          </h2>

          <p className="text-muted mb-0">
            View and manage your flight bookings
          </p>

        </div>

        <div className="d-flex gap-2">

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={fetchBookings}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              router.push("/flight-search")
            }
          >
            + Book Flight
          </button>

        </div>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="row g-3 mb-4">

        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                Total Bookings
              </div>

              <div className="fs-3 fw-bold">
                {bookings.length}
              </div>

            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                Confirmed Bookings
              </div>

              <div className="fs-3 fw-bold text-success">

                {
                  bookings.filter(
                    (booking) =>
                      booking.booking_status?.toLowerCase() ===
                      "confirmed"
                  ).length
                }

              </div>

            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                Wallet Balance
              </div>

              <div className="fs-3 fw-bold text-primary">

                ৳{" "}
                {Number(wallet || 0).toLocaleString()}

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div
          className="alert alert-danger d-flex justify-content-between align-items-center"
          role="alert"
        >

          <span>
            {error}
          </span>

          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={fetchBookings}
          >
            Retry
          </button>

        </div>

      )}


      {/* =====================================================
          BOOKINGS TABLE
      ===================================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white py-3">

          <div className="d-flex justify-content-between align-items-center">

            <h5 className="mb-0 fw-bold">
              Booking History
            </h5>

            <span className="badge bg-primary">
              {bookings.length} Booking
              {bookings.length !== 1 ? "s" : ""}
            </span>

          </div>

        </div>


        <div className="card-body p-0">

          {bookings.length === 0 ? (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: "50px",
                }}
              >
                ✈️
              </div>

              <h5 className="mt-3">
                No bookings found
              </h5>

              <p className="text-muted">
                You haven&apos;t made any bookings yet.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  router.push("/flight-search")
                }
              >
                Search Flights
              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th className="px-3">
                      PNR
                    </th>

                    <th>
                      Passenger
                    </th>

                    <th>
                      Flight
                    </th>

                    <th>
                      Route
                    </th>

                    <th>
                      Departure
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-center">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {bookings.map(
                    (booking) => {

                      const flight =
                        booking.flight;

                      return (

                        <tr
                          key={booking.id}
                        >

                          {/* PNR */}

                          <td className="px-3">

                            <strong className="text-primary">
                              {booking.pnr ||
                                "N/A"}
                            </strong>

                            <div className="small text-muted">
                              #{booking.id}
                            </div>

                          </td>


                          {/* PASSENGER */}

                          <td>

                            <div className="fw-semibold">
                              {
                                booking.passenger_name
                              }
                            </div>

                            <div className="small text-muted">
                              {
                                booking.passport
                              }
                            </div>

                          </td>


                          {/* FLIGHT */}

                          <td>

                            <strong>
                              {flight?.flight_no ||
                                "N/A"}
                            </strong>

                          </td>


                          {/* ROUTE */}

                          <td>

                            <span className="fw-semibold">
                              {flight?.from ||
                                "N/A"}
                            </span>

                            <span className="mx-1 text-muted">
                              →
                            </span>

                            <span className="fw-semibold">
                              {flight?.to ||
                                "N/A"}
                            </span>

                          </td>


                          {/* DEPARTURE */}

                          <td>

                            {formatDate(
                              flight?.departure_time
                            )}

                            <div className="small text-muted">

                              {flight?.departure_time
                                ? new Date(
                                    flight.departure_time
                                  ).toLocaleTimeString(
                                    "en-GB",
                                    {
                                      hour: "2-digit",
                                      minute:
                                        "2-digit",
                                    }
                                  )
                                : "N/A"}

                            </div>

                          </td>


                          {/* AMOUNT */}

                          <td>

                            <strong>
                              ৳{" "}
                              {Number(
                                booking.total_amount ||
                                  0
                              ).toLocaleString()}
                            </strong>

                          </td>


                          {/* PAYMENT */}

                          <td>

                            <span
                              className={`badge ${getStatusBadge(
                                booking.payment_status
                              )}`}
                            >
                              {
                                booking.payment_status ||
                                  "N/A"
                              }
                            </span>

                          </td>


                          {/* BOOKING STATUS */}

                          <td>

                            <span
                              className={`badge ${getStatusBadge(
                                booking.booking_status
                              )}`}
                            >
                              {
                                booking.booking_status ||
                                  "N/A"
                              }
                            </span>

                          </td>


                          {/* ACTION */}

                          <td className="text-center">

                            <div className="btn-group">

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                title="View Booking"
                                onClick={() =>
                                  viewBooking(
                                    booking
                                  )
                                }
                              >
                                View
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                title="Invoice / Ticket"
                                onClick={() =>
                                  openInvoice(
                                    booking
                                  )
                                }
                              >
                                Ticket
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-dark"
                                title="Print Booking"
                                onClick={() =>
                                  printBooking(
                                    booking
                                  )
                                }
                              >
                                Print
                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          VIEW BOOKING MODAL
      ===================================================== */}

      {selectedBooking && (

        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.55)",
          }}
          onClick={closeModal}
        >

          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content">

              {/* MODAL HEADER */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold">
                    Booking Details
                  </h5>

                  <div className="text-muted small">
                    PNR:{" "}
                    <strong>
                      {selectedBooking.pnr}
                    </strong>
                  </div>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                />

              </div>


              {/* MODAL BODY */}

              <div className="modal-body">

                <div className="row g-3">

                  {/* PASSENGER */}

                  <div className="col-md-6">

                    <div className="card bg-light border-0 h-100">

                      <div className="card-body">

                        <h6 className="fw-bold mb-3">
                          Passenger Information
                        </h6>

                        <p className="mb-2">
                          <strong>Name:</strong>{" "}
                          {
                            selectedBooking.passenger_name
                          }
                        </p>

                        <p className="mb-2">
                          <strong>Passport:</strong>{" "}
                          {
                            selectedBooking.passport
                          }
                        </p>

                        <p className="mb-2">
                          <strong>Nationality:</strong>{" "}
                          {
                            selectedBooking.nationality ||
                              "N/A"
                          }
                        </p>

                        <p className="mb-2">
                          <strong>Date of Birth:</strong>{" "}
                          {formatDate(
                            selectedBooking.date_of_birth
                          )}
                        </p>

                        <p className="mb-2">
                          <strong>Gender:</strong>{" "}
                          {
                            selectedBooking.gender ||
                              "N/A"
                          }
                        </p>

                        <p className="mb-2">
                          <strong>Phone:</strong>{" "}
                          {
                            selectedBooking.phone ||
                              "N/A"
                          }
                        </p>

                        <p className="mb-0">
                          <strong>Email:</strong>{" "}
                          {
                            selectedBooking.email ||
                              "N/A"
                          }
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* FLIGHT */}

                  <div className="col-md-6">

                    <div className="card bg-light border-0 h-100">

                      <div className="card-body">

                        <h6 className="fw-bold mb-3">
                          Flight Information
                        </h6>

                        <p className="mb-2">
                          <strong>Flight:</strong>{" "}
                          {
                            selectedBooking.flight
                              ?.flight_no ||
                              "N/A"
                          }
                        </p>

                        <p className="mb-2">
                          <strong>Route:</strong>{" "}
                          {
                            selectedBooking.flight
                              ?.from ||
                              "N/A"
                          }{" "}
                          →{" "}
                          {
                            selectedBooking.flight
                              ?.to ||
                              "N/A"
                          }
                        </p>

                        <p className="mb-2">
                          <strong>Departure:</strong>{" "}
                          {formatDateTime(
                            selectedBooking.flight
                              ?.departure_time
                          )}
                        </p>

                        <p className="mb-2">
                          <strong>Arrival:</strong>{" "}
                          {formatDateTime(
                            selectedBooking.flight
                              ?.arrival_time
                          )}
                        </p>

                        <p className="mb-2">
                          <strong>Journey:</strong>{" "}
                          {
                            selectedBooking.journey_type ||
                              "N/A"
                          }
                        </p>

                        <p className="mb-0">
                          <strong>Class:</strong>{" "}
                          {
                            selectedBooking.travel_class ||
                              "N/A"
                          }
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* BOOKING INFORMATION */}

                  <div className="col-12">

                    <div className="card border-0 bg-light">

                      <div className="card-body">

                        <h6 className="fw-bold mb-3">
                          Booking Information
                        </h6>

                        <div className="row">

                          <div className="col-md-4 mb-3">

                            <div className="text-muted small">
                              PNR
                            </div>

                            <div className="fw-bold text-primary">
                              {
                                selectedBooking.pnr
                              }
                            </div>

                          </div>


                          <div className="col-md-4 mb-3">

                            <div className="text-muted small">
                              Ticket Number
                            </div>

                            <div className="fw-bold">
                              {
                                selectedBooking.ticket_number ||
                                  "N/A"
                              }
                            </div>

                          </div>


                          <div className="col-md-4 mb-3">

                            <div className="text-muted small">
                              Total Amount
                            </div>

                            <div className="fw-bold text-success">
                              ৳{" "}
                              {Number(
                                selectedBooking.total_amount ||
                                  0
                              ).toLocaleString()}
                            </div>

                          </div>


                          <div className="col-md-4">

                            <div className="text-muted small">
                              Adults
                            </div>

                            <div className="fw-bold">
                              {
                                selectedBooking.adults ??
                                  0
                              }
                            </div>

                          </div>


                          <div className="col-md-4">

                            <div className="text-muted small">
                              Children
                            </div>

                            <div className="fw-bold">
                              {
                                selectedBooking.children ??
                                  0
                              }
                            </div>

                          </div>


                          <div className="col-md-4">

                            <div className="text-muted small">
                              Infants
                            </div>

                            <div className="fw-bold">
                              {
                                selectedBooking.infants ??
                                  0
                              }
                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* STATUS */}

                  <div className="col-12">

                    <div className="d-flex flex-wrap gap-2">

                      <span className="fw-semibold">
                        Payment:
                      </span>

                      <span
                        className={`badge ${getStatusBadge(
                          selectedBooking.payment_status
                        )}`}
                      >
                        {
                          selectedBooking.payment_status ||
                            "N/A"
                        }
                      </span>


                      <span className="fw-semibold ms-3">
                        Booking:
                      </span>

                      <span
                        className={`badge ${getStatusBadge(
                          selectedBooking.booking_status
                        )}`}
                      >
                        {
                          selectedBooking.booking_status ||
                            "N/A"
                        }
                      </span>

                    </div>

                  </div>

                </div>

              </div>


              {/* MODAL FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() =>
                    printBooking(
                      selectedBooking
                    )
                  }
                >
                  Print
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() =>
                    openInvoice(
                      selectedBooking
                    )
                  }
                >
                  Ticket / Invoice
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
