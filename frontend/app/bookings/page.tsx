"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8090/api";

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

  const fetchBookings = async () => {
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
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchBookings();
  }, []);

  // =========================================================
  // FETCH WALLET
  // =========================================================

  const fetchWallet = async () => {
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
  };

  useEffect(() => {
    fetchWallet();
  }, []);

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
  // PRINT BOOKING
  // =========================================================

  const printBooking = (booking: Booking) => {
    const flight = booking.flight;

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!printWindow) {
      alert(
        "Popup blocked. Please allow popups for this website."
      );

      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>

        <title>
          Booking ${booking.pnr}
        </title>

        <style>

          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #222;
          }

          .header {
            text-align: center;
            margin-bottom: 30px;
          }

          .header h1 {
            margin-bottom: 5px;
          }

          .pnr {
            font-size: 22px;
            font-weight: bold;
            color: #198754;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th,
          td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f5f5f5;
          }

          .status {
            font-weight: bold;
          }

          .footer {
            margin-top: 40px;
            text-align: center;
            color: #777;
          }

        </style>

      </head>

      <body>

        <div class="header">

          <h1>
            AIR FLY INTERNATIONAL
          </h1>

          <div>
            Booking Confirmation
          </div>

          <div class="pnr">
            PNR: ${booking.pnr || "N/A"}
          </div>

        </div>

        <table>

          <tr>
            <th>Passenger Name</th>
            <td>${booking.passenger_name || "N/A"}</td>
          </tr>

          <tr>
            <th>Passport</th>
            <td>${booking.passport || "N/A"}</td>
          </tr>

          <tr>
            <th>Nationality</th>
            <td>${booking.nationality || "N/A"}</td>
          </tr>

          <tr>
            <th>Flight</th>
            <td>${flight?.flight_no || "N/A"}</td>
          </tr>

          <tr>
            <th>Route</th>
            <td>
              ${flight?.from || "N/A"}
              →
              ${flight?.to || "N/A"}
            </td>
          </tr>

          <tr>
            <th>Departure</th>
            <td>
              ${formatDateTime(
                flight?.departure_time
              )}
            </td>
          </tr>

          <tr>
            <th>Arrival</th>
            <td>
              ${formatDateTime(
                flight?.arrival_time
              )}
            </td>
          </tr>

          <tr>
            <th>Travel Class</th>
            <td>
              ${booking.travel_class || "N/A"}
            </td>
          </tr>

          <tr>
            <th>Journey Type</th>
            <td>
              ${booking.journey_type || "N/A"}
            </td>
          </tr>

          <tr>
            <th>Ticket Number</th>
            <td>
              ${booking.ticket_number || "N/A"}
            </td>
          </tr>

          <tr>
            <th>Total Amount</th>
            <td>
              ৳ ${Number(
                booking.total_amount || 0
              ).toLocaleString()}
            </td>
          </tr>

          <tr>
            <th>Payment Status</th>
            <td class="status">
              ${booking.payment_status || "N/A"}
            </td>
          </tr>

          <tr>
            <th>Booking Status</th>
            <td class="status">
              ${booking.booking_status || "N/A"}
            </td>
          </tr>

        </table>

        <div class="footer">

          <p>
            Generated from Air Fly International B2B Portal
          </p>

        </div>

        <script>
          window.onload = function () {
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
                You haven't made any bookings yet.
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