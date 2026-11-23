"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "../../../services/api";

type Booking = {
  id?: number;
  pnr?: string | null;
  passenger_name?: string | null;
  passport?: string | null;
  airline?: string | null;
  flight_no?: string | null;
  from?: string | null;
  to?: string | null;
  departure_date?: string | null;
  amount?: string | number | null;
  status?: string | null;
};

type BookingResponse = {
  success: boolean;
  message?: string;
  booking?: Booking;
};

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params?.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBooking = useCallback(async (id: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      alert("Please login first.");
      return;
    }

    try {
      const response = await fetch(`${API}/bookings/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as BookingResponse;

      if (response.ok && data.success && data.booking) {
        setBooking(data.booking);
      } else {
        alert(data.message || "Booking not found");
      }
    } catch (error) {
      console.error("Booking API Error:", error);
      alert("API Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!bookingId) return;

    const timer = window.setTimeout(() => {
      void loadBooking(bookingId);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [bookingId, loadBooking]);

  if (!bookingId) {
    return (
      <div className="container py-5">
        <h4>Booking Not Found</h4>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5">
        <h4>Loading...</h4>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5">
        <h4>Booking Not Found</h4>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <div className="card shadow-lg border-0">
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <img
              src="/images/logo.jpg"
              alt="Logo"
              width={90}
            />

            <h2 className="fw-bold mt-3">
              AIR FLY INTERNATIONAL
            </h2>

            <p className="text-muted">
              Flight Booking Invoice
            </p>
          </div>

          <table className="table table-bordered">
            <tbody>
              <tr>
                <th style={{ width: "220px" }}>PNR</th>
                <td>{booking.pnr || "N/A"}</td>
              </tr>

              <tr>
                <th>Passenger Name</th>
                <td>{booking.passenger_name || "N/A"}</td>
              </tr>

              <tr>
                <th>Passport No</th>
                <td>{booking.passport || "N/A"}</td>
              </tr>

              <tr>
                <th>Airline</th>
                <td>{booking.airline || "N/A"}</td>
              </tr>

              <tr>
                <th>Flight Number</th>
                <td>{booking.flight_no || "N/A"}</td>
              </tr>

              <tr>
                <th>Route</th>
                <td>
                  {booking.from || "N/A"} → {booking.to || "N/A"}
                </td>
              </tr>

              <tr>
                <th>Departure Date</th>
                <td>{booking.departure_date || "N/A"}</td>
              </tr>

              <tr>
                <th>Amount</th>
                <td>
                  <strong>
                    ৳ {booking.amount ?? "0"}
                  </strong>
                </td>
              </tr>

              <tr>
                <th>Status</th>
                <td>
                  {booking.status?.toLowerCase() === "confirmed" ? (
                    <span className="badge bg-success">
                      Confirmed
                    </span>
                  ) : (
                    <span className="badge bg-danger">
                      {booking.status || "Cancelled"}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-center mt-4">
            <button
              className="btn btn-primary me-2"
              onClick={() => window.print()}
            >
              🖨 Print Invoice
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => window.history.back()}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
