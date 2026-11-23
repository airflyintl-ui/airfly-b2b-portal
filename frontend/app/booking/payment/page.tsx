"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../services/api";

type Passenger = {
  title?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  passport?: string;
  nationality?: string;
};

type BookingResponse = {
  success: boolean;
  message?: string;
  booking?: {
    id: number | string;
    pnr: string;
  };
};

export default function PaymentPage() {
  const router = useRouter();

  const [passenger, setPassenger] = useState<Passenger | null>(null);
  const [loading, setLoading] = useState(false);

  // Demo Fare (পরে Flight Search থেকে আসবে)
  const fare = {
    baseFare: 8000,
    tax: 1200,
    serviceCharge: 300,
    total: 9500,
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const data = localStorage.getItem("passenger");

      if (!data) {
        router.push("/booking/passenger");
        return;
      }

      try {
        const parsedData: Passenger = JSON.parse(data);

        if (
          !parsedData.first_name ||
          !parsedData.last_name
        ) {
          router.push("/booking/passenger");
          return;
        }

        setPassenger(parsedData);
      } catch (error) {
        console.error("Invalid passenger data:", error);
        router.push("/booking/passenger");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  async function confirmBooking() {
    if (!passenger || loading) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passenger_name: `${passenger.first_name} ${passenger.last_name}`,
          passport: passenger.passport,
          airline: "Biman Bangladesh",
          flight_no: "BG-148",
          from: "DAC",
          to: "CXB",
          departure_date: "2026-08-20",
          amount: fare.total,
        }),
      });

      const data: BookingResponse = await response.json();

      if (response.ok && data.success && data.booking) {
        alert("Booking Successful");

        router.push(
          `/booking/success?id=${data.booking.id}&pnr=${encodeURIComponent(data.booking.pnr)}`
        );
      } else {
        alert(data.message || "Booking Failed");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("API Connection Failed");
    } finally {
      setLoading(false);
    }
  }

  if (!passenger) {
    return (
      <div className="container py-5 text-center">
        <h3>Loading Passenger Information...</h3>
      </div>
    );
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
                    <td>{passenger.email || "-"}</td>
                  </tr>

                  <tr>
                    <th>Phone</th>
                    <td>{passenger.phone || "-"}</td>
                  </tr>

                  <tr>
                    <th>Passport</th>
                    <td>{passenger.passport || "-"}</td>
                  </tr>

                  <tr>
                    <th>Nationality</th>
                    <td>{passenger.nationality || "-"}</td>
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
                {loading ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
