"use client";

type Props = {
  airlines: any[];

  airlineId: string;
  setAirlineId: (v: string) => void;

  flightNo: string;
  setFlightNo: (v: string) => void;

  from: string;
  setFrom: (v: string) => void;

  to: string;
  setTo: (v: string) => void;

  departureTime: string;
  setDepartureTime: (v: string) => void;

  arrivalTime: string;
  setArrivalTime: (v: string) => void;

  economyFare: string;
  setEconomyFare: (v: string) => void;

  businessFare: string;
  setBusinessFare: (v: string) => void;

  availableSeats: string;
  setAvailableSeats: (v: string) => void;

  saveFlight: (e: React.FormEvent) => void;
};

export default function FlightForm({
  airlines,

  airlineId,
  setAirlineId,

  flightNo,
  setFlightNo,

  from,
  setFrom,

  to,
  setTo,

  departureTime,
  setDepartureTime,

  arrivalTime,
  setArrivalTime,

  economyFare,
  setEconomyFare,

  businessFare,
  setBusinessFare,

  availableSeats,
  setAvailableSeats,

  saveFlight,
}: Props) {
  return (
    <div className="card shadow">

      <div className="card-header bg-primary text-white">
        Add Flight
      </div>

      <div className="card-body">

        <form onSubmit={saveFlight}>

          <div className="mb-3">

            <label>Airline</label>

            <select
              className="form-select"
              value={airlineId}
              onChange={(e) => setAirlineId(e.target.value)}
              required
            >
              <option value="">Select Airline</option>

              {airlines.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}

            </select>

          </div>

          <div className="mb-3">

            <label>Flight No</label>

            <input
              className="form-control"
              value={flightNo}
              onChange={(e) => setFlightNo(e.target.value)}
              required
            />

          </div>

          <div className="row">

            <div className="col-6">

              <label>From</label>

              <input
                className="form-control"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />

            </div>

            <div className="col-6">

              <label>To</label>

              <input
                className="form-control"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />

            </div>

          </div>

          <div className="mt-3">

            <label>Departure</label>

            <input
              type="datetime-local"
              className="form-control"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              required
            />

          </div>

          <div className="mt-3">

            <label>Arrival</label>

            <input
              type="datetime-local"
              className="form-control"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              required
            />

          </div>

          <div className="row mt-3">

            <div className="col-6">

              <label>Economy Fare</label>

              <input
                type="number"
                className="form-control"
                value={economyFare}
                onChange={(e) => setEconomyFare(e.target.value)}
                required
              />

            </div>

            <div className="col-6">

              <label>Business Fare</label>

              <input
                type="number"
                className="form-control"
                value={businessFare}
                onChange={(e) => setBusinessFare(e.target.value)}
                required
              />

            </div>

          </div>

          <div className="mt-3">

            <label>Available Seats</label>

            <input
              type="number"
              className="form-control"
              value={availableSeats}
              onChange={(e) => setAvailableSeats(e.target.value)}
              required
            />

          </div>

          <button
            className="btn btn-success w-100 mt-4"
          >
            Save Flight
          </button>

        </form>

      </div>

    </div>
  );
}