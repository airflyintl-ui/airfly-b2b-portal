"use client";

import { useState } from "react";

type TripType = "oneway" | "roundtrip" | "multicity";

type FlightSegment = {
  from: string;
  to: string;
  departure_date: string;
};

export default function FlightSearch() {
  const [tripType, setTripType] = useState<TripType>("oneway");

  const [form, setForm] = useState({
    from: "",
    to: "",
    departure_date: "",
    return_date: "",
    passengers: 1,
    cabin: "Economy",
  });

  const [segments, setSegments] = useState<FlightSegment[]>([
    { from: "", to: "", departure_date: "" },
    { from: "", to: "", departure_date: "" },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "passengers" ? Math.max(1, Number(value)) : value,
    }));
  };

  const handleSegmentChange = (
    index: number,
    field: keyof FlightSegment,
    value: string
  ) => {
    setSegments((prev) =>
      prev.map((segment, i) =>
        i === index ? { ...segment, [field]: value } : segment
      )
    );
  };

  const addSegment = () => {
    if (segments.length >= 6) {
      alert("Maximum 6 flight segments allowed.");
      return;
    }

    setSegments((prev) => [
      ...prev,
      { from: "", to: "", departure_date: "" },
    ]);
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 2) {
      alert("Multi-City requires at least 2 flights.");
      return;
    }

    setSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const searchFlight = () => {
    let searchData;

    if (tripType === "multicity") {
      const invalid = segments.some(
        (s) => !s.from.trim() || !s.to.trim() || !s.departure_date
      );

      if (invalid) {
        alert("Please complete all Multi-City flight details.");
        return;
      }

      searchData = {
        trip_type: "multicity",
        segments,
        passengers: form.passengers,
        cabin: form.cabin,
      };
    } else {
      if (
        !form.from.trim() ||
        !form.to.trim() ||
        !form.departure_date
      ) {
        alert("Please enter From, To and Departure Date.");
        return;
      }

      if (tripType === "roundtrip" && !form.return_date) {
        alert("Please select Return Date.");
        return;
      }

      if (
        tripType === "roundtrip" &&
        form.return_date < form.departure_date
      ) {
        alert("Return Date cannot be before Departure Date.");
        return;
      }

      searchData = {
        trip_type: tripType,
        from: form.from.trim().toUpperCase(),
        to: form.to.trim().toUpperCase(),
        departure_date: form.departure_date,
        ...(tripType === "roundtrip" && {
          return_date: form.return_date,
        }),
        passengers: form.passengers,
        cabin: form.cabin,
      };
    }

    console.log("Flight Search Request:", searchData);

    alert(
      "Flight Search details are ready. API connection is required for live flight results."
    );
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="card border-0 shadow-lg">

      <div className="card-header bg-primary text-white p-3">
        <h4 className="mb-0">✈ Flight Search</h4>
      </div>

      <div className="card-body p-4">

        {/* Trip Type */}

        <div className="d-flex flex-wrap gap-3 mb-4">

          <label className="form-check">
            <input
              type="radio"
              className="form-check-input"
              checked={tripType === "oneway"}
              onChange={() => setTripType("oneway")}
            />
            <span className="form-check-label fw-semibold">
              One Way
            </span>
          </label>

          <label className="form-check">
            <input
              type="radio"
              className="form-check-input"
              checked={tripType === "roundtrip"}
              onChange={() => setTripType("roundtrip")}
            />
            <span className="form-check-label fw-semibold">
              Round Trip
            </span>
          </label>

          <label className="form-check">
            <input
              type="radio"
              className="form-check-input"
              checked={tripType === "multicity"}
              onChange={() => setTripType("multicity")}
            />
            <span className="form-check-label fw-semibold">
              Multi-City
            </span>
          </label>

        </div>

        {/* One Way and Round Trip */}

        {tripType !== "multicity" && (

          <div className="row g-3">

            <div className="col-md-3">
              <label className="form-label fw-semibold">From</label>
              <input
                type="text"
                name="from"
                className="form-control"
                placeholder="Airport code (DAC)"
                maxLength={3}
                value={form.from}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">To</label>
              <input
                type="text"
                name="to"
                className="form-control"
                placeholder="Airport code (DXB)"
                maxLength={3}
                value={form.to}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Departure Date
              </label>
              <input
                type="date"
                name="departure_date"
                min={today}
                className="form-control"
                value={form.departure_date}
                onChange={handleChange}
              />
            </div>

            {tripType === "roundtrip" && (
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Return Date
                </label>
                <input
                  type="date"
                  name="return_date"
                  min={form.departure_date || today}
                  className="form-control"
                  value={form.return_date}
                  onChange={handleChange}
                />
              </div>
            )}

          </div>
        )}

        {/* Multi-City */}

        {tripType === "multicity" && (

          <div className="mb-4">

            <h5 className="fw-bold mb-3">
              Multi-City Flight Details
            </h5>

            {segments.map((segment, index) => (

              <div
                key={index}
                className="border rounded p-3 mb-3 bg-light"
              >

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">
                    Flight {index + 1}
                  </h6>

                  {segments.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeSegment(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="row g-3">

                  <div className="col-md-4">
                    <label className="form-label">From</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="DAC"
                      maxLength={3}
                      value={segment.from}
                      onChange={(e) =>
                        handleSegmentChange(
                          index,
                          "from",
                          e.target.value.toUpperCase()
                        )
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">To</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="DXB"
                      maxLength={3}
                      value={segment.to}
                      onChange={(e) =>
                        handleSegmentChange(
                          index,
                          "to",
                          e.target.value.toUpperCase()
                        )
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      className="form-control"
                      value={segment.departure_date}
                      onChange={(e) =>
                        handleSegmentChange(
                          index,
                          "departure_date",
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>
              </div>

            ))}

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={addSegment}
            >
              + Add Another Flight
            </button>

            <p className="text-muted small mt-2 mb-0">
              You can add up to 6 flight segments.
            </p>

          </div>
        )}

        {/* Passengers and Cabin */}

        <div className="row g-3 mt-2">

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Adults / Passengers
            </label>

            <input
              type="number"
              min="1"
              max="9"
              name="passengers"
              className="form-control"
              value={form.passengers}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Cabin Class
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

          <div className="col-md-4 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-primary w-100 py-2"
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
