"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();

  const [passenger, setPassenger] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Demo Fare (পরে Flight Search থেকে আসবে)
  const fare = {
    baseFare: 8000,
    tax: 1200,
    serviceCharge: 300,
    total: 9500,
  };

  useEffect(() => {
    const data = localStorage.getItem("passenger");

    if (data) {
      setPassenger(JSON.parse(data));
    } else {
      router.push("/booking/passenger");
    }
  }, [router]);

  async function confirmBooking() {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            passenger_name:
              passenger.first_name + " " + passenger.last_name,

            passport: passenger.passport,

            airline: "Biman Bangladesh",

            flight_no: "BG-148",

            from: "DAC",

            to: "CXB",

            departure_date: "2026-08-20",

            amount: fare.total,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Booking Successful");

        router.push(
  `/booking/success?id=${data.booking.id}&pnr=${data.booking.pnr}`
);
      } else {
        alert(data.message || "Booking Failed");
      }
    } catch (error) {
      console.log(error);
      alert("API Connection Failed");
    }

    setLoading(false);
  }

  if (!passenger) {
    return null;
  }

  return (
    <div className="container py-4">

      <div className="row">

        <div className="col-lg-8">

          <div className="card shadow">

            <div className="card-header bg-primary text-white">
              <h3>Passenger Information</h3>
            </div>

            <div className="card-body">

              <table className="table">

                <tbody>

                  <tr>
                    <th>Name</th>
                    <td>
                      {passenger.title}{" "}
                      {passenger.first_name}{" "}
                      {passenger.last_name}
                    </td>
                  </tr>

                  <tr>
                    <th>Email</th>
                    <td>{passenger.email}</td>
                  </tr>

                  <tr>
                    <th>Phone</th>
                    <td>{passenger.phone}</td>
                  </tr>

                  <tr>
                    <th>Passport</th>
                    <td>{passenger.passport}</td>
                  </tr>

                  <tr>
                    <th>Nationality</th>
                    <td>{passenger.nationality}</td>
                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

        <div className="col-lg-4">

          <div className="card shadow">

            <div className="card-header bg-success text-white">
              <h4>Payment Summary</h4>
            </div>

            <div className="card-body">

              <table className="table">

                <tbody>

                  <tr>
                    <td>Base Fare</td>
                    <td>৳ {fare.baseFare}</td>
                  </tr>

                  <tr>
                    <td>Tax</td>
                    <td>৳ {fare.tax}</td>
                  </tr>

                  <tr>
                    <td>Service Charge</td>
                    <td>৳ {fare.serviceCharge}</td>
                  </tr>

                  <tr className="fw-bold">
                    <td>Total</td>
                    <td>৳ {fare.total}</td>
                  </tr>

                </tbody>

              </table>

              <button
                className="btn btn-success w-100"
                disabled={loading}
                onClick={confirmBooking}
              >
                {loading
                  ? "Processing..."
                  : "Confirm Booking"}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}