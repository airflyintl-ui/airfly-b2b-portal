"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    loadBooking();
  }, []);

  async function loadBooking() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:8000/api/admin/bookings/${params.id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setBooking(data.booking);
      } else {
        alert(data.message || "Booking not found");
      }
    } catch (e) {
      console.log(e);
      alert("API Error");
    }

    setLoading(false);
  }

  async function cancelBooking() {
    if (!confirm("Cancel this booking?")) return;

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://127.0.0.1:8000/api/admin/bookings/${params.id}/cancel`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    alert(data.message);

    if (data.success) {
      loadBooking();
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h3>Loading...</h3>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5">
        <h3>Booking Not Found</h3>
      </div>
    );
  }

  return (
    <div className="container py-4">

      <div className="card shadow">

        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">

          <h3 className="mb-0">
            Booking Details
          </h3>

          <button
            className="btn btn-light"
            onClick={() => router.back()}
          >
            Back
          </button>

        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-6">

              <table className="table">

                <tbody>

                  <tr>
                    <th>PNR</th>
                    <td>{booking.pnr}</td>
                  </tr>

                  <tr>
                    <th>Passenger</th>
                    <td>{booking.passenger_name}</td>
                  </tr>

                  <tr>
                    <th>Passport</th>
                    <td>{booking.passport}</td>
                  </tr>

                  <tr>
                    <th>Airline</th>
                    <td>{booking.airline}</td>
                  </tr>

                  <tr>
                    <th>Flight</th>
                    <td>{booking.flight_no}</td>
                  </tr>

                </tbody>

              </table>

            </div>

            <div className="col-md-6">

              <table className="table">

                <tbody>

                  <tr>
                    <th>Route</th>
                    <td>
                      {booking.from} → {booking.to}
                    </td>
                  </tr>

                  <tr>
                    <th>Departure</th>
                    <td>{booking.departure_date}</td>
                  </tr>

                  <tr>
                    <th>Amount</th>
                    <td>৳ {booking.amount}</td>
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

                  <tr>
                    <th>Booking Date</th>
                    <td>{booking.created_at}</td>
                  </tr>

                </tbody>

              </table>

            </div>

          </div>

          <hr />

          <div className="d-flex gap-2">

            <a
              href={`/bookings/${booking.id}/invoice`}
              target="_blank"
              className="btn btn-warning"
            >
              Invoice
            </a>

            {booking.status === "Confirmed" && (

              <button
                className="btn btn-danger"
                onClick={cancelBooking}
              >
                Cancel Booking
              </button>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}