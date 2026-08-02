"use client";

const flights = [
  {
    id: 1,
    airline: "Emirates",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg",
    flight: "EK 585",
    from: "DAC",
    to: "DXB",
    departure: "19:40",
    arrival: "23:15",
    duration: "5h 35m",
    stops: "Non Stop",
    baggage: "30 KG",
    fare: 48500,
  },
  {
    id: 2,
    airline: "Qatar Airways",
    logo: "https://upload.wikimedia.org/wikipedia/en/9/9b/Qatar_Airways_Logo.svg",
    flight: "QR 639",
    from: "DAC",
    to: "DOH",
    departure: "03:15",
    arrival: "05:40",
    duration: "5h 25m",
    stops: "Non Stop",
    baggage: "35 KG",
    fare: 46200,
  },
  {
    id: 3,
    airline: "Biman Bangladesh",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/58/Biman_Bangladesh_Airlines_Logo.svg",
    flight: "BG 147",
    from: "DAC",
    to: "DXB",
    departure: "18:30",
    arrival: "22:15",
    duration: "5h 45m",
    stops: "Non Stop",
    baggage: "30 KG",
    fare: 43200,
  },
  {
    id: 4,
    airline: "SalamAir",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/58/SalamAir_logo.png",
    flight: "OV 396",
    from: "DAC",
    to: "MCT",
    departure: "01:20",
    arrival: "04:55",
    duration: "5h 35m",
    stops: "Non Stop",
    baggage: "25 KG",
    fare: 34900,
  },
];

export default function FlightResults() {
  return (
    <>
      <h4 className="mt-5 mb-3 fw-bold">
        Available Flights
      </h4>

      {flights.map((flight) => (
        <div
          key={flight.id}
          className="card border-0 shadow mb-3"
        >
          <div className="card-body">

            <div className="row align-items-center">

              <div className="col-lg-2 text-center">
                <img
                  src={flight.logo}
                  alt={flight.airline}
                  style={{
                    width: 100,
                    height: 50,
                    objectFit: "contain",
                  }}
                />

                <h6 className="mt-2">
                  {flight.airline}
                </h6>

                <small>{flight.flight}</small>
              </div>

              <div className="col-lg-2 text-center">
                <h3>{flight.departure}</h3>
                <small>{flight.from}</small>
              </div>

              <div className="col-lg-3 text-center">
                <h6>{flight.duration}</h6>
                <hr />
                <small>{flight.stops}</small>
              </div>

              <div className="col-lg-2 text-center">
                <h3>{flight.arrival}</h3>
                <small>{flight.to}</small>
              </div>

              <div className="col-lg-1 text-center">
                <strong>{flight.baggage}</strong>
                <br />
                <small>Baggage</small>
              </div>

              <div className="col-lg-2 text-center">

                <h3 className="text-success">
                  ৳ {flight.fare.toLocaleString()}
                </h3>

                <button className="btn btn-primary w-100">
                  Book Now
                </button>

              </div>

            </div>

          </div>
        </div>
      ))}
    </>
  );
}