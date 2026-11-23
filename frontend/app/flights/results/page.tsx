"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

type Flight = {
  airline: string;
  flight_no: string;
  from: string;
  to: string;
  departure_date: string;
  departure: string;
  arrival: string;
  price: number;
};

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getFlightData(): string | null {
  try {
    return localStorage.getItem("flight_results");
  } catch {
    return null;
  }
}

function getServerSnapshot(): null {
  return null;
}

function parseFlights(data: string | null): Flight[] {
  if (!data) {
    return [];
  }

  try {
    const result: unknown = JSON.parse(data);

    if (Array.isArray(result)) {
      return result as Flight[];
    }

    if (
      typeof result === "object" &&
      result !== null &&
      "flights" in result &&
      Array.isArray(result.flights)
    ) {
      return result.flights as Flight[];
    }

    return [];
  } catch {
    return [];
  }
}

export default function FlightResultsPage() {
  const router = useRouter();

  const storedData = useSyncExternalStore(
    subscribeToStorage,
    getFlightData,
    getServerSnapshot
  );

  const flights = useMemo(
    () => parseFlights(storedData),
    [storedData]
  );

  const handleBookNow = (flight: Flight) => {
    const selectedFlight = {
      airline: flight.airline,
      flight_no: flight.flight_no,
      from: flight.from,
      to: flight.to,
      departure_date: flight.departure_date,
      departure: flight.departure,
      arrival: flight.arrival,
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
            key={`${flight.flight_no}-${index}`}
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

                  <small>{flight.departure_date}</small>
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
