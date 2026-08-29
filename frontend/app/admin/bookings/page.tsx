"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8090/api";

type Flight = {
  id: number;
  flight_no?: string;
  from?: string;
  to?: string;
  departure_time?: string;
  arrival_time?: string;
  economy_fare?: string | number;
  business_fare?: string | number;
  available_seats?: number;
  status?: boolean;
};

type Booking = {
  id: number;
  agent_id: number;
  flight_id: number;
  pnr: string;
  passenger_name: string;
  passport: string;
  nationality: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  journey_type: string;
  travel_class: string;
  adults: number;
  children: number;
  infants: number;
  total_amount: string | number;
  ticket_number: string;
  payment_status: string;
  booking_status: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
  flight?: Flight;
};

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wallet, setWallet] = useState("0.00");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        router.push("/login");
        return;
      }

      if (response.ok && data.success) {
        setBookings(data.bookings || []);
      } else {
        setError(data.message || "Unable to load bookings.");
      }
    } catch (err) {
      console.error("Bookings error:", err);

      setError(
        "Cannot connect to Laravel API. Please make sure backend is running on port 8090."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchWallet = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await fetch(`${API}/wallet/statement`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      console.log("WALLET RESPONSE:", data);

      if (response.ok && data.success) {
        setWallet(data.wallet || "0.00");
      }
    } catch (err) {
      console.error("Wallet error:", err);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchWallet();
  }, [fetchBookings, fetchWallet]);

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  };

  const formatMoney = (amount?: string | number) => {
    const number = Number(amount || 0);

    return number.toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusClass = (status?: string) => {
    if (!status) return "bg-secondary";

    const value = status.toLowerCase();

    if (
      value === "confirmed" ||
      value === "paid" ||
      value === "approved"
    ) {
      return "bg-success";
    }

    if (
      value === "pending" ||
      value === "processing"
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

  const viewBooking = (booking: Booking) => {
    localStorage.setItem(
      "selected_booking",
      JSON.stringify(booking)
    );

    router.push(`/bookings/${booking.id}`);
  };

  const printTicket = (booking: Booking) => {
    localStorage.setItem(
      "selected_booking",
      JSON.stringify(booking)
    );

    router.push(`/bookings/${booking.id}?print=true`);
  };

  const searchFlights = () => {
    router.push("/flight-search");
  };

  const bookFlight = () => {
    router.push("/flight-search");
  };

  const confirmedBookings = bookings.filter(
    (booking) =>
      booking.booking_status?.toLowerCase() === "confirmed"
  ).length;

  return (
    <div
      className="container-fluid py-4"
      style={{ background: "#f8f9fa", minHeight: "100vh" }}
    >
      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">
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
            onClick={() => {
              fetchBookings();
              fetchWallet();
            }}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={bookFlight}
          >
            + Book Flight
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Total Bookings
              </small>

              <h3 className="fw-bold mt-2 mb-0">
                {bookings.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Confirmed Bookings
              </small>

              <h3 className="fw-bold text-success mt-2 mb-0">
                {confirmedBookings}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Wallet Balance
              </small>

              <h3 className="fw-bold text-primary mt-2 mb-0">
                ৳ {formatMoney(wallet)}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div
          className="alert alert-danger d-flex justify-content-between align-items-center"
          role="alert"
        >
          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={fetchBookings}
          >
            Try Again
          </button>
        </div>
      )}

      {/* BOOKING HISTORY */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">

          <div>
            <h5 className="fw-bold mb-0">
              Booking History
            </h5>
          </div>

          <span className="badge bg-primary">
            {bookings.length} Booking
            {bookings.length !== 1 ? "s" : ""}
          </span>

        </div>

        <div className="card-body p-0">

          {/* LOADING */}

          {loading && (
            <div className="text-center py-5">

              <div
                className="spinner-border text-primary mb-3"
                role="status"
              />

              <p className="text-muted mb-0">
                Loading bookings...
              </p>

            </div>
          )}

          {/* NO BOOKINGS */}

          {!loading && bookings.length === 0 && !error && (
            <div className="text-center py-5">

              <div
                style={{
                  fontSize: "55px",
                  lineHeight: "1",
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
                onClick={searchFlights}
              >
                Search Flights
              </button>

            </div>
          )}

          {/* BOOKINGS */}

          {!loading && bookings.length > 0 && (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th className="px-3">
                      Booking
                    </th>

                    <th>
                      Passenger
                    </th>

                    <th>
                      Flight
                    </th>

                    <th>
                      Journey
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

                  {bookings.map((booking) => (

                    <tr key={booking.id}>

                      {/* BOOKING */}

                      <td className="px-3">

                        <div className="fw-bold">
                          PNR: {booking.pnr}
                        </div>

                        <small className="text-muted">
                          ID #{booking.id}
                        </small>

                        <br />

                        <small className="text-muted">
                          {formatDate(booking.created_at)}
                        </small>

                      </td>

                      {/* PASSENGER */}

                      <td>

                        <div className="fw-semibold">
                          {booking.passenger_name}
                        </div>

                        <small className="text-muted">
                          {booking.passport}
                        </small>

                        <br />

                        <small className="text-muted">
                          {booking.phone}
                        </small>

                      </td>

                      {/* FLIGHT */}

                      <td>

                        <div className="fw-bold">

                          {booking.flight?.flight_no ||
                            "N/A"}

                        </div>

                        <div>
                          {booking.flight?.from ||
                            "N/A"}{" "}
                          →{" "}
                          {booking.flight?.to ||
                            "N/A"}
                        </div>

                        <small className="text-muted">

                          {booking.flight
                            ?.departure_time
                            ? formatDate(
                                booking.flight
                                  .departure_time
                              )
                            : "N/A"}

                        </small>

                      </td>

                      {/* JOURNEY */}

                      <td>

                        <span className="badge bg-light text-dark border">
                          {booking.journey_type}
                        </span>

                        <br />

                        <small className="text-muted">
                          {booking.travel_class}
                        </small>

                        <br />

                        <small className="text-muted">
                          A: {booking.adults} | C:{" "}
                          {booking.children} | I:{" "}
                          {booking.infants}
                        </small>

                      </td>

                      {/* AMOUNT */}

                      <td>

                        <div className="fw-bold text-success">
                          ৳{" "}
                          {formatMoney(
                            booking.total_amount
                          )}
                        </div>

                        {booking.ticket_number && (
                          <small className="text-muted">
                            Ticket:{" "}
                            {booking.ticket_number}
                          </small>
                        )}

                      </td>

                      {/* PAYMENT */}

                      <td>

                        <span
                          className={`badge ${getStatusClass(
                            booking.payment_status
                          )}`}
                        >
                          {booking.payment_status}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`badge ${getStatusClass(
                            booking.booking_status
                          )}`}
                        >
                          {booking.booking_status}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="text-center">

                        <div className="d-flex justify-content-center gap-1">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              viewBooking(booking)
                            }
                            title="View Booking"
                          >
                            👁 View
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark"
                            onClick={() =>
                              printTicket(booking)
                            }
                            title="Print Ticket"
                          >
                            🖨 Print
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}