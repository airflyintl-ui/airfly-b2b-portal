"use client";

import { useState, type ChangeEvent } from "react";

type TripType = "oneway" | "roundtrip" | "multicity";

type FlightSegment = {
  from: string;
  to: string;
  departure_date: string;
};

export default function FlightSearch() {
  const [tripType, setTripType] = useState<TripType>("oneway");

  const [form, setForm] = useState({
    from: "DAC",
    to: "DXB",
    departure_date: "",
    return_date: "",
    adults: 1,
    children: 0,
    infants: 0,
  });

  const [segments, setSegments] = useState<FlightSegment[]>([
    { from: "", to: "", departure_date: "" },
    { from: "", to: "", departure_date: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any>(null);

  const today = new Date().toLocaleDateString("en-CA");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "from" || name === "to"
        ? value.toUpperCase().slice(0, 3)
        : Number.isNaN(Number(value)) || value === ""
        ? value
        : name === "adults"
        ? Math.min(9, Math.max(1, Number(value)))
        : Math.min(9, Math.max(0, Number(value))),
    }));
  };

  const handleSegmentChange = (
    index: number,
    field: keyof FlightSegment,
    value: string
  ) => {
    setSegments((prev) =>
      prev.map((segment, i) =>
        i === index
          ? {
              ...segment,
              [field]:
                field === "from" || field === "to"
                  ? value.toUpperCase().slice(0, 3)
                  : value,
            }
          : segment
      )
    );
  };

  const addSegment = () => {
    if (segments.length >= 6) return;

    setSegments((prev) => [
      ...prev,
      { from: "", to: "", departure_date: "" },
    ]);
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 2) return;

    setSegments((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const validateAirport = (code: string) =>
    /^[A-Z]{3}$/.test(code.trim());

  const searchFlight = async () => {
    setError("");
    setResults(null);

    if (form.adults < 1) {
      setError("At least one adult passenger is required.");
      return;
    }

    if (form.infants > form.adults) {
      setError("Infants cannot exceed adults.");
      return;
    }

    let searchData: any;

    if (tripType === "multicity") {
      if (segments.length < 2 || segments.length > 6) {
        setError("Multi-City requires 2 to 6 segments.");
        return;
      }

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        if (
          !validateAirport(segment.from) ||
          !validateAirport(segment.to)
        ) {
          setError(`Please enter valid airport codes for Flight ${i + 1}.`);
          return;
        }

        if (segment.from === segment.to) {
          setError(`From and To cannot be the same in Flight ${i + 1}.`);
          return;
        }

        if (!segment.departure_date) {
          setError(`Please select departure date for Flight ${i + 1}.`);
          return;
        }

        if (segment.departure_date < today) {
          setError(`Flight ${i + 1} date cannot be in the past.`);
          return;
        }

        if (
          i > 0 &&
          segment.departure_date < segments[i - 1].departure_date
        ) {
          setError("Multi-City dates must be in chronological order.");
          return;
        }
      }

      searchData = {
        trip_type: "multicity",
        segments: segments.map((segment) => ({
          from: segment.from.trim().toUpperCase(),
          to: segment.to.trim().toUpperCase(),
          departure_date: segment.departure_date,
        })),
        adults: Number(form.adults),
        children: Number(form.children),
        infants: Number(form.infants),
      };
    } else {
      const from = form.from.trim().toUpperCase();
      const to = form.to.trim().toUpperCase();

      if (!validateAirport(from) || !validateAirport(to)) {
        setError("Please enter valid 3-letter airport codes.");
        return;
      }

      if (from === to) {
        setError("Origin and destination cannot be the same.");
        return;
      }

      if (!form.departure_date) {
        setError("Please select departure date.");
        return;
      }

      if (form.departure_date < today) {
        setError("Departure date cannot be in the past.");
        return;
      }

      if (tripType === "roundtrip") {
        if (!form.return_date) {
          setError("Please select return date.");
          return;
        }

        if (form.return_date < form.departure_date) {
          setError("Return date cannot be before departure date.");
          return;
        }
      }

      searchData = {
        trip_type: tripType,
        from,
        to,
        departure_date: form.departure_date,
        return_date:
          tripType === "roundtrip" ? form.return_date : null,
        adults: Number(form.adults),
        children: Number(form.children),
        infants: Number(form.infants),
      };
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(
        `${apiUrl}/api/search-flight`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(searchData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        const validationErrors = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : "";

        throw new Error(
          validationErrors ||
          data.message ||
          "Flight search failed."
        );
      }

      setResults(data);
    } catch (err: any) {
      setError(
        err.message || "Cannot connect to Laravel API."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-lg">
      <div className="card-header bg-primary text-white p-3">
        <h4 className="mb-0">✈ Flight Search</h4>
        <small>Search flights from Travelport GDS</small>
      </div>

      <div className="card-body p-4">
        {/* Trip Type */}

        <div className="d-flex flex-wrap gap-4 mb-4">
          {(["oneway", "roundtrip", "multicity"] as TripType[]).map(
            (type) => (
              <label className="form-check" key={type}>
                <input
                  className="form-check-input"
                  type="radio"
                  checked={tripType === type}
                  onChange={() => {
                    setTripType(type);
                    setError("");
                    setResults(null);
                  }}
                />
                <span className="form-check-label fw-semibold">
                  {type === "oneway"
                    ? "One Way"
                    : type === "roundtrip"
                    ? "Round Trip"
                    : "Multi-City"}
                </span>
              </label>
            )
          )}
        </div>

        {/* One Way and Round Trip */}

        {tripType !== "multicity" && (
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">From</label>
              <input
                className="form-control"
                name="from"
                value={form.from}
                maxLength={3}
                placeholder="DAC"
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">To</label>
              <input
                className="form-control"
                name="to"
                value={form.to}
                maxLength={3}
                placeholder="DXB"
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Departure Date
              </label>
              <input
                type="date"
                className="form-control"
                name="departure_date"
                min={today}
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
                  className="form-control"
                  name="return_date"
                  min={form.departure_date || today}
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
                      className="form-control"
                      placeholder="DAC"
                      maxLength={3}
                      value={segment.from}
                      onChange={(e) =>
                        handleSegmentChange(
                          index,
                          "from",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">To</label>
                    <input
                      className="form-control"
                      placeholder="DXB"
                      maxLength={3}
                      value={segment.to}
                      onChange={(e) =>
                        handleSegmentChange(
                          index,
                          "to",
                          e.target.value
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
                      className="form-control"
                      min={today}
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
              disabled={segments.length >= 6}
            >
              + Add Another Flight
            </button>

            <p className="text-muted small mt-2">
              You can add up to 6 flight segments.
            </p>
          </div>
        )}

        {/* Passenger Counts */}

        <div className="row g-3 mt-2">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Adults</label>
            <input
              type="number"
              min="1"
              max="9"
              name="adults"
              className="form-control"
              value={form.adults}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Children</label>
            <input
              type="number"
              min="0"
              max="9"
              name="children"
              className="form-control"
              value={form.children}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Infants</label>
            <input
              type="number"
              min="0"
              max="9"
              name="infants"
              className="form-control"
              value={form.infants}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Search Button */}

        <div className="mt-4">
          <button
            type="button"
            className="btn btn-primary btn-lg w-100"
            onClick={searchFlight}
            disabled={loading}
          >
            {loading ? "Searching Travelport..." : "🔍 Search Flights"}
          </button>
        </div>

        {/* Error */}

        {error && (
          <div className="alert alert-danger mt-4 mb-0">
            <strong>Search Error:</strong> {error}
          </div>
        )}

        {/* Results */}

        {results && (
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                Travelport Flight Results
              </h5>
            </div>

            <div className="card-body">
              <div className="alert alert-success">
                Travelport GDS response received successfully.
              </div>

              <details>
                <summary className="fw-semibold">
                  View Raw Travelport Response
                </summary>

                <pre
                  className="bg-light p-3 mt-3"
                  style={{
                    maxHeight: "600px",
                    overflow: "auto",
                    fontSize: "12px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
