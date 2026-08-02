"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const router = useRouter();

  const [flight, setFlight] = useState<any>(null);

  const [passengerName, setPassengerName] = useState("");
  const [passport, setPassport] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("selected_flight");

    if (!data) {
      router.push("/flight-search");
      return;
    }

    setFlight(JSON.parse(data));
  }, [router]);

  const confirmBooking = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
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
            airline: flight.airline,
            flight_no: flight.flight_no,
            from: flight.from,
            to: flight.to,
            departure_date: new Date().toISOString().slice(0, 10),
            passenger_name: passengerName,
            passport: passport,
            amount: flight.fare,
            phone: phone,
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Booking Successful");

        localStorage.removeItem("selected_flight");

        router.push("/bookings");
      } else {
        alert(data.message || "Booking Failed");
      }
    } catch (err) {
      console.log(err);
      alert("Laravel API Error");
    }

    setLoading(false);
  };

  if (!flight) return null;

  return (
    <div className="container py-5">

      <div className="row">

        <div className="col-lg-4">

          <div className="card shadow">

            <div className="card-header bg-primary text-white">
              Flight Information
            </div>

            <div className="card-body">

              <h5>{flight.airline}</h5>

              <p>
                Flight: <strong>{flight.flight_no}</strong>
              </p>

              <p>
                Route: {flight.from} → {flight.to}
              </p>

              <p>
                Fare:
                <span className="fw-bold text-success">
                  {" "}
                  ৳ {flight.fare}
                </span>
              </p>

            </div>

          </div>

        </div>

        <div className="col-lg-8">

          <div className="card shadow">

            <div className="card-header bg-success text-white">
              Passenger Information
            </div>

            <div className="card-body">

              <div className="mb-3">

                <label>Passenger Name</label>

                <input
                  className="form-control"
                  value={passengerName}
                  onChange={(e) =>
                    setPassengerName(e.target.value)
                  }
                />

              </div>

              <div className="mb-3">

                <label>Passport No</label>

                <input
                  className="form-control"
                  value={passport}
                  onChange={(e) =>
                    setPassport(e.target.value)
                  }
                />

              </div>

              <div className="mb-3">

                <label>Phone</label>

                <input
                  className="form-control"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />

              </div>

              <div className="mb-3">

                <label>Email</label>

                <input
                  className="form-control"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

              </div>

              <button
                className="btn btn-success w-100"
                disabled={loading}
                onClick={confirmBooking}
              >
                {loading
                  ? "Booking..."
                  : "Confirm Booking"}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}