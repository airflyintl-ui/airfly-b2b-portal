"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FlightResultsPage() {
  const router = useRouter();

  const [flights, setFlights] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("flight_results");

    if (!data) {
      router.push("/flights");
      return;
    }

    setFlights(JSON.parse(data));
  }, [router]);

  const handleBookNow = (flight: any) => {
    // Booking page এর জন্য প্রয়োজনীয় তথ্য Save
    const selectedFlight = {
      airline: flight.airline,
      flight_no: flight.flight_no,
      from: flight.from,
      to: flight.to,

      // Database এর জন্য Date
      departure_date: flight.departure_date,

      // UI এর জন্য Time
      departure: flight.departure,
      arrival: flight.arrival,

      // Price
      amount: flight.price,
      price: flight.price,
    };

    localStorage.setItem(
      "selected_flight",
      JSON.stringify(selectedFlight)
    );

    router.push("/booking");
  };

  return (
    <div className="container py-5">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold">
          ✈ Available Flights
        </h2>

        <button
          className="btn btn-secondary"
          onClick={() => router.push("/flights")}
        >
          ← New Search
        </button>

      </div>

      {flights.length === 0 ? (

        <div className="alert alert-warning text-center">
          No Flight Found
        </div>

      ) : (

        flights.map((flight, index) => (

          <div
            key={index}
            className="card shadow border-0 mb-4"
          >

            <div className="card-body">

              <div className="row align-items-center">

                <div className="col-md-3">

                  <h5 className="fw-bold mb-1">
                    {flight.airline}
                  </h5>

                  <small className="text-muted">
                    Flight No: {flight.flight_no}
                  </small>

                </div>

                <div className="col-md-2 text-center">

                  <strong>{flight.from}</strong>

                  <br />

                  <small>{flight.departure}</small>

                </div>

                <div className="col-md-1 text-center">

                  <h4>→</h4>

                </div>

                <div className="col-md-2 text-center">

                  <strong>{flight.to}</strong>

                  <br />

                  <small>{flight.arrival}</small>

                </div>

                <div className="col-md-2 text-center">

                  <div className="fw-bold text-primary">
                    Journey Date
                  </div>

                  <small>
                    {flight.departure_date}
                  </small>

                </div>

                <div className="col-md-1 text-center">

                  <h5 className="text-success">
                    ৳ {flight.price}
                  </h5>

                </div>

                <div className="col-md-1">

                  <button
                    className="btn btn-primary w-100"
                    onClick={() => handleBookNow(flight)}
                  >
                    Book
                  </button>

                </div>

              </div>

            </div>

          </div>

        ))

      )}

    </div>
  );
}