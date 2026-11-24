"use client";

type AirlineOption = {
  id: number | string;
  name: string;
};

type Props = {
  show: boolean;
  airlines: AirlineOption[];
  onClose: () => void;
  onUpdate: () => void;

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
};

export default function EditFlightModal({
  show,
  airlines,
  onClose,
  onUpdate,
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
}: Props) {
  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        background: "rgba(0,0,0,.5)",
      }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Flight</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Airline</label>
                <select
                  className="form-select"
                  value={airlineId}
                  onChange={(e) => setAirlineId(e.target.value)}
                >
                  {airlines.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Flight No</label>
                <input
                  className="form-control"
                  value={flightNo}
                  onChange={(e) => setFlightNo(e.target.value)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">From</label>
                <input
                  className="form-control"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">To</label>
                <input
                  className="form-control"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Departure</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Arrival</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Economy Fare</label>
                <input
                  type="number"
                  className="form-control"
                  value={economyFare}
                  onChange={(e) => setEconomyFare(e.target.value)}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Business Fare</label>
                <input
                  type="number"
                  className="form-control"
                  value={businessFare}
                  onChange={(e) => setBusinessFare(e.target.value)}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Available Seats</label>
                <input
                  type="number"
                  className="form-control"
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={onUpdate}
            >
              Update Flight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
