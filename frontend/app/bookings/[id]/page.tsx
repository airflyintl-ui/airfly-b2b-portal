"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function BookingDetailsPage() {
  const params = useParams();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      loadBooking();
    }
  }, []);

  const loadBooking = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/bookings/${params.id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setBooking(data.booking);
      } else {
        alert(data.message || "Booking not found");
      }
    } catch (error) {
      console.error(error);
      alert("API Error");
    } finally {
      setLoading(false);
    }
  };

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
    <div
      className="container py-5"
      style={{ maxWidth: "900px" }}
    >
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
                <td>{booking.pnr}</td>
              </tr>

              <tr>
                <th>Passenger Name</th>
                <td>{booking.passenger_name}</td>
              </tr>

              <tr>
                <th>Passport No</th>
                <td>{booking.passport}</td>
              </tr>

              <tr>
                <th>Airline</th>
                <td>{booking.airline}</td>
              </tr>

              <tr>
                <th>Flight Number</th>
                <td>{booking.flight_no}</td>
              </tr>

              <tr>
                <th>Route</th>
                <td>
                  {booking.from} → {booking.to}
                </td>
              </tr>

              <tr>
                <th>Departure Date</th>
                <td>{booking.departure_date}</td>
              </tr>

              <tr>
                <th>Amount</th>
                <td>
                  <strong>৳ {booking.amount}</strong>
                </td>
              </tr>

              <tr>
                <th>Status</th>
                <td>
                  {booking.status === "Confirmed" ? (
                    <span className="badge bg-success">
                      Confirmed
                    </span>
                  ) : (
                    <span className="badge bg-danger">
                      Cancelled
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
              onClick={() => history.back()}
            >
              ← Back
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}