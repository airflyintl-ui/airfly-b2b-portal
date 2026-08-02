"use client";

import { useState } from "react";

export default function FlightSearch() {
  const [form, setForm] = useState({
    from: "",
    to: "",
    departure_date: "",
    trip_type: "oneway",
    passengers: 1,
    cabin: "Economy",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const searchFlight = () => {
    console.log(form);

    alert("Searching Flights...");
  };

  return (
    <div className="card border-0 shadow-lg">

      <div className="card-header bg-primary text-white">
        <h4 className="mb-0">Flight Search</h4>
      </div>

      <div className="card-body">

        <div className="row g-3">

          <div className="col-md-3">
            <label className="form-label">From</label>

            <input
              type="text"
              name="from"
              className="form-control"
              placeholder="DAC"
              value={form.from}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">To</label>

            <input
              type="text"
              name="to"
              className="form-control"
              placeholder="DXB"
              value={form.to}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">
              Departure
            </label>

            <input
              type="date"
              name="departure_date"
              className="form-control"
              value={form.departure_date}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">
              Passengers
            </label>

            <input
              type="number"
              min="1"
              name="passengers"
              className="form-control"
              value={form.passengers}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">
              Cabin
            </label>

            <select
              name="cabin"
              className="form-select"
              value={form.cabin}
              onChange={handleChange}
            >
              <option>Economy</option>
              <option>Premium Economy</option>
              <option>Business</option>
              <option>First</option>
            </select>
          </div>

        </div>

        <div className="row mt-3">

          <div className="col-md-3">

            <select
              name="trip_type"
              className="form-select"
              value={form.trip_type}
              onChange={handleChange}
            >
              <option value="oneway">
                One Way
              </option>

              <option value="roundtrip">
                Round Trip
              </option>
            </select>

          </div>

          <div className="col-md-9 text-end">

            <button
              className="btn btn-primary px-5"
              onClick={searchFlight}
            >
              🔍 Search Flight
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}