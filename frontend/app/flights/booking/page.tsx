"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const router = useRouter();

  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [passenger, setPassenger] = useState({
    first_name: "",
    last_name: "",
    passport: "",
    nationality: "",
    dob: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("selected_flight");

    if (!data) {
      router.push("/flights");
      return;
    }

    setFlight(JSON.parse(data));
  }, [router]);

  const handleBooking = async () => {
    if (
      passenger.first_name === "" ||
      passenger.last_name === "" ||
      passenger.passport === ""
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please Login First");
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
            flight_no: flight.flight_no || "N/A",
            from: flight.from,
            to: flight.to,
            departure_date:
              flight.departure_date || flight.departure,

            passenger_name:
              passenger.first_name + " " + passenger.last_name,

            passport: passenger.passport,

            amount: flight.price,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (response.ok && data.success) {
        localStorage.setItem(
          "booking",
          JSON.stringify(data.booking)
        );

        alert("Booking Successful");

        router.push("/booking-success");
      } else {
        alert(data.message || "Booking Failed");
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to Laravel API");
    }

    setLoading(false);
  };

  if (!flight) {
    return (
      <div className="container py-5 text-center">
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <div className="card shadow-lg border-0">

        <div className="card-header bg-success text-white">
          <h3>Passenger Information</h3>
        </div>

        <div className="card-body">

          <div className="alert alert-info">

            <h5>{flight.airline}</h5>

            <strong>
              {flight.from} → {flight.to}
            </strong>

            <br />

            Departure :
            {" "}
            {flight.departure}

            <br />

            Arrival :
            {" "}
            {flight.arrival}

            <br />

            <h4 className="mt-2">
              Price : ৳ {flight.price}
            </h4>

          </div>

          <div className="row">

            <div className="col-md-6 mb-3">
              <label>First Name</label>

              <input
                className="form-control"
                value={passenger.first_name}
                onChange={(e) =>
                  setPassenger({
                    ...passenger,
                    first_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Last Name</label>

              <input
                className="form-control"
                value={passenger.last_name}
                onChange={(e) =>
                  setPassenger({
                    ...passenger,
                    last_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Passport No</label>

              <input
                className="form-control"
                value={passenger.passport}
                onChange={(e) =>
                  setPassenger({
                    ...passenger,
                    passport: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Nationality</label>

              <input
                className="form-control"
                value={passenger.nationality}
                onChange={(e) =>
                  setPassenger({
                    ...passenger,
                    nationality: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Date of Birth</label>

              <input
                type="date"
                className="form-control"
                value={passenger.dob}
                onChange={(e) =>
                  setPassenger({
                    ...passenger,
                    dob: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Phone</label>

              <input
                className="form-control"
                value={passenger.phone}
                onChange={(e) =>
                  setPassenger({
                    ...passenger,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-12 mb-4">
              <label>Email</label>

              <input
                type="email"
                className="form-control"
                value={passenger.email}
                onChange={(e) =>
                  setPassenger({
                    ...passenger,
                    email: e.target.value,
                  })
                }
              />
            </div>

          </div>

          <button
            className="btn btn-success btn-lg w-100"
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>

        </div>

      </div>

    </div>
  );
}