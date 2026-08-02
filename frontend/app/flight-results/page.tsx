"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FlightResultsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("flight_results");

    if (data) {
      const result = JSON.parse(data);

      // Laravel API যদি flights পাঠায়
      if (result.flights) {
        setFlights(result.flights);
      }
      // Demo fallback
      else {
        setFlights([
          {
            airline: "Biman Bangladesh",
            logo: "/images/airlines/biman.png",
            flight_no: "BG147",
            from: "DAC",
            to: "DXB",
            departure: "09:15",
            arrival: "13:30",
            duration: "5h 15m",
            fare: 28500,
          },
          {
            airline: "US-Bangla",
            logo: "/images/airlines/usbangla.png",
            flight_no: "BS341",
            from: "DAC",
            to: "DXB",
            departure: "11:00",
            arrival: "15:20",
            duration: "5h 20m",
            fare: 29900,
          },
          {
            airline: "Emirates",
            logo: "/images/airlines/emirates.png",
            flight_no: "EK585",
            from: "DAC",
            to: "DXB",
            departure: "19:30",
            arrival: "23:10",
            duration: "4h 40m",
            fare: 43800,
          },
        ]);
      }
    }
  }, []);

  const bookFlight = (flight: any) => {
    localStorage.setItem("selected_flight", JSON.stringify(flight));
    router.push("/booking");
  };

  return (
    <div className="container py-5">

      <h2 className="fw-bold mb-4">
        ✈ Flight Results
      </h2>

      {flights.length === 0 ? (
        <div className="alert alert-warning">
          No Flight Found
        </div>
      ) : (
        flights.map((flight, index) => (
          <div className="card shadow border-0 mb-3" key={index}>

            <div className="card-body">

              <div className="row align-items-center">

                <div className="col-md-2 text-center">
                  <img
                    src={flight.logo}
                    alt={flight.airline}
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "contain",
                    }}
                  />

                  <div className="fw-bold mt-2">
                    {flight.airline}
                  </div>

                  <small>{flight.flight_no}</small>
                </div>

                <div className="col-md-3 text-center">

                  <h4>{flight.departure}</h4>

                  <div>{flight.from}</div>

                </div>

                <div className="col-md-2 text-center">

                  <div>{flight.duration}</div>

                  <hr />

                  <small>Non Stop</small>

                </div>

                <div className="col-md-3 text-center">

                  <h4>{flight.arrival}</h4>

                  <div>{flight.to}</div>

                </div>

                <div className="col-md-2 text-center">

                  <h4 className="text-success">
                    ৳ {flight.fare}
                  </h4>

                  <button
                    className="btn btn-primary w-100"
                    onClick={() => bookFlight(flight)}
                  >
                    Book Now
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