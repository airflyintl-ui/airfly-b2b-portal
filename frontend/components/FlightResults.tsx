"use client";

import { useState, type ChangeEvent } from "react";

type TripType = "oneway" | "roundtrip" | "multicity";

type FlightSegment = {
  from: string;
  to: string;
  departure_date: string;
};

type SelectedOffers = Record<number, string>;

type Passenger = {
  firstName: string;
  lastName: string;
};

type ContactDetails = {
  email: string;
  phone: string;
};

type ReviewStep =
  | "closed"
  | "details"
  | "confirmation"
  | "completed";

type SearchForm = {
  from: string;
  to: string;
  departure_date: string;
  return_date: string;
  adults: number | string;
  children: number | string;
  infants: number | string;
};

type FlightSegmentData = {
  flight_no?: string | null;
  airline_name?: string | null;
  airline?: string | null;
  origin?: string | null;
  destination?: string | null;
  departure?: string | null;
  arrival?: string | null;
  duration_seconds?: number | string | null;
  cabin_class?: string | null;
  aircraft?: string | null;
};

type FlightItinerary = {
  segments?: FlightSegmentData[];
  total_duration_seconds?: number | string | null;
  stopovers?: number | null;
};

type FlightOffer = {
  id: string;
  offer_id?: string;
  price?: number | string | null;
  airfly_price_bdt?: number | string | null;
  owner_airline?: string | null;
  outbound?: FlightItinerary;
  inbound?: FlightItinerary;
  bags_price?: Record<string, number | string | null> | null;
  conditions?: {
    refundable?: string;
    changeable?: string;
  };
  availability_seats?: number | string | null;
};

type MultiCitySegment = {
  segment_number?: number;
  from: string;
  to: string;
  departure_date: string;
  offers?: FlightOffer[];
};

type FlightSearchResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  search?: {
    trip_type?: TripType;
    from?: string;
    to?: string;
  };
  data?: {
    offers?: FlightOffer[];
    segments?: MultiCitySegment[];
  };
  pricing?: {
    exchange_rate?: number | string;
    service_charge?: number | string;
  };
};

type FlightSearchRequest = Record<string, unknown>;

export default function FlightSearch() {
  const [tripType, setTripType] = useState<TripType>("oneway");

  const [form, setForm] = useState<SearchForm>({
    from: "DAC",
    to: "DXB",
    departure_date: "",
    return_date: "",
    adults: 1,
    children: 0,
    infants: 0,
  });

  const [segments, setSegments] = useState<FlightSegment[]>([
    { from: "DAC", to: "DXB", departure_date: "" },
    { from: "DXB", to: "BKK", departure_date: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] =
    useState<FlightSearchResponse | null>(null);

  const [selectedOffers, setSelectedOffers] =
    useState<SelectedOffers>({});

  const [reviewStep, setReviewStep] =
    useState<ReviewStep>("closed");

  const [contact, setContact] = useState<ContactDetails>({
    email: "",
    phone: "",
  });

  const [passengerDetails, setPassengerDetails] =
    useState<Record<number, Passenger>>({});

  const today = new Date().toLocaleDateString("en-CA");

  /*
   * BASIC HELPERS
   */

  const validateAirport = (code: string) =>
    /^[A-Z]{3}$/.test(code.trim());

  const formatDate = (
    value: string | number | null | undefined
  ) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (
    seconds: number | string | null | undefined
  ) => {
    const total = Number(seconds);

    if (!Number.isFinite(total) || total < 0) {
      return "Not available";
    }

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  const formatBDT = (amount: number) =>
    `৳${amount.toLocaleString("en-BD", {
      maximumFractionDigits: 2,
    })}`;

  const getBaggage = (
    bagsPrice:
      | Record<string, number | string | null>
      | null
      | undefined
  ) => {
    if (!bagsPrice || typeof bagsPrice !== "object") {
      return "Not specified";
    }

    const oneBag = bagsPrice["1_bag"];

    if (oneBag === undefined || oneBag === null) {
      return "Not specified";
    }

    return `1 bag: $${Number(oneBag).toFixed(2)} (estimated)`;
  };

  /*
   * FORM HANDLERS
   */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "from" || name === "to"
          ? value.toUpperCase().slice(0, 3)
          : ["adults", "children", "infants"].includes(name)
            ? value === ""
              ? ""
              : name === "adults"
                ? Math.min(9, Math.max(1, Number(value)))
                : Math.min(9, Math.max(0, Number(value)))
            : value,
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

    setSelectedOffers({});
    setResults(null);
    setReviewStep("closed");
  };

  const addSegment = () => {
    if (segments.length >= 6) return;

    setSegments((prev) => [
      ...prev,
      {
        from: prev[prev.length - 1]?.to || "",
        to: "",
        departure_date: "",
      },
    ]);

    setResults(null);
    setSelectedOffers({});
    setReviewStep("closed");
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 2) return;

    setSegments((prev) => prev.filter((_, i) => i !== index));

    setSelectedOffers({});
    setResults(null);
    setReviewStep("closed");
  };

  const changeTripType = (type: TripType) => {
    setTripType(type);
    setError("");
    setResults(null);
    setSelectedOffers({});
    setReviewStep("closed");
  };

  /*
   * ITINERARY DISPLAY
   */

  const renderItinerary = (
    itinerary: FlightItinerary | undefined,
    title: string
  ) => {
    if (!itinerary || !itinerary.segments?.length) {
  return null;
}

const flightSegments = itinerary.segments;
    return (
      <div className="mt-3">
        <h6 className="fw-bold mb-3">{title}</h6>

        {flightSegments.map((segment, index) => (
          <div
            key={`${segment.flight_no || "segment"}-${index}`}
            className="border rounded p-3 mb-2 bg-light"
          >
            <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
              <strong>
                {segment.airline_name ||
                  segment.airline ||
                  "Airline"}
              </strong>

              <span className="badge bg-secondary">
                {segment.flight_no || "Flight number unavailable"}
              </span>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="small text-muted">From</div>
                <div className="fw-bold">
                  {segment.origin || "N/A"}
                </div>
                <div className="small">
                  {formatDate(segment.departure)}
                </div>
              </div>

              <div className="col-md-4">
                <div className="small text-muted">To</div>
                <div className="fw-bold">
                  {segment.destination || "N/A"}
                </div>
                <div className="small">
                  {formatDate(segment.arrival)}
                </div>
              </div>

              <div className="col-md-4">
                <div className="small text-muted">Duration</div>
                <div className="fw-semibold">
                  {formatDuration(segment.duration_seconds)}
                </div>
                <div className="small text-muted">
                  {segment.cabin_class || "Cabin not specified"}
                  {segment.aircraft ? ` · ${segment.aircraft}` : ""}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="small text-muted mt-2">
          Total duration:{" "}
          <strong>
            {formatDuration(itinerary.total_duration_seconds)}
          </strong>
          {" · "}
          Stops:{" "}
          <strong>
            {itinerary.stopovers ??
              Math.max(0, flightSegments.length - 1)}
          </strong>
        </div>
      </div>
    );
  };

  /*
   * MULTI-CITY PRICING
   */

  const multiSegments = results?.data?.segments || [];

  const selectedMultiOffers = multiSegments.map(
    (segment, index) => {
      const offerId = selectedOffers[index];

      return (segment.offers || []).find(
        (offer) => offer.id === offerId
      );
    }
  );

  const selectedCount =
    selectedMultiOffers.filter(Boolean).length;

  const allSegmentsSelected =
    multiSegments.length > 0 &&
    selectedCount === multiSegments.length;

  const totalSupplierUSD = selectedMultiOffers.reduce(
    (total, offer) =>
      total + (offer ? Number(offer.price || 0) : 0),
    0
  );

  const exchangeRate = Number(
    results?.pricing?.exchange_rate || 0
  );

  const serviceCharge = Number(
    results?.pricing?.service_charge || 0
  );

  const subtotalBDT = totalSupplierUSD * exchangeRate;

  const totalAirFlyPrice = allSegmentsSelected
    ? subtotalBDT + serviceCharge
    : null;

  /*
   * PASSENGER DETAILS
   */

  const passengerCount =
    Number(form.adults) +
    Number(form.children) +
    Number(form.infants);

  const getPassengerType = (index: number) => {
    if (index < Number(form.adults)) {
      return "Adult";
    }

    if (
      index <
      Number(form.adults) + Number(form.children)
    ) {
      return "Child";
    }

    return "Infant";
  };

  const updatePassenger = (
    index: number,
    field: keyof Passenger,
    value: string
  ) => {
    setPassengerDetails((prev) => ({
      ...prev,
      [index]: {
        firstName: prev[index]?.firstName || "",
        lastName: prev[index]?.lastName || "",
        [field]: value,
      },
    }));
  };

  /*
   * REVIEW FLOW
   */

  const continueToPassengerDetails = () => {
    if (!allSegmentsSelected) {
      setError(
        "Please select one flight from every segment."
      );
      return;
    }

    setError("");
    setReviewStep("details");
  };

  const continueToConfirmation = () => {
    if (!contact.email.trim()) {
      setError("Please enter contact email.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!contact.phone.trim()) {
      setError("Please enter contact phone number.");
      return;
    }

    for (let i = 0; i < passengerCount; i++) {
      if (!passengerDetails[i]?.firstName.trim()) {
        setError(
          `Please enter first name for Passenger ${i + 1}.`
        );
        return;
      }

      if (!passengerDetails[i]?.lastName.trim()) {
        setError(
          `Please enter last name for Passenger ${i + 1}.`
        );
        return;
      }
    }

    setError("");
    setReviewStep("confirmation");
  };

  /*
   * SEARCH FLIGHTS
   */

  const searchFlight = async () => {
    setError("");
    setResults(null);
    setSelectedOffers({});
    setReviewStep("closed");

    if (Number(form.adults) < 1) {
      setError("At least one adult passenger is required.");
      return;
    }

    if (Number(form.infants) > Number(form.adults)) {
      setError("Infants cannot exceed adults.");
      return;
    }

    let searchData: FlightSearchRequest;

    if (tripType === "multicity") {
      if (segments.length < 2 || segments.length > 6) {
        setError(
          "Multi-City requires 2 to 6 flight segments."
        );
        return;
      }

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        const from = segment.from.trim().toUpperCase();
        const to = segment.to.trim().toUpperCase();

        if (
          !validateAirport(from) ||
          !validateAirport(to)
        ) {
          setError(
            `Please enter valid airport codes for Flight ${i + 1}.`
          );
          return;
        }

        if (from === to) {
          setError(
            `Origin and destination cannot be the same in Flight ${i + 1}.`
          );
          return;
        }

        if (!segment.departure_date) {
          setError(
            `Please select departure date for Flight ${i + 1}.`
          );
          return;
        }

        if (segment.departure_date < today) {
          setError(
            `Flight ${i + 1} date cannot be in the past.`
          );
          return;
        }

        if (i > 0) {
          const previous = segments[i - 1];

          if (
            from !== previous.to.trim().toUpperCase()
          ) {
            setError(
              `Flight ${i + 1} must start from the previous flight's destination (${previous.to.toUpperCase()}).`
            );
            return;
          }

          if (
            segment.departure_date <
            previous.departure_date
          ) {
            setError(
              "Multi-City flight dates must be in chronological order."
            );
            return;
          }
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

      if (
        !validateAirport(from) ||
        !validateAirport(to)
      ) {
        setError(
          "Please enter valid 3-letter airport codes."
        );
        return;
      }

      if (from === to) {
        setError(
          "Origin and destination cannot be the same."
        );
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
          setError(
            "Return date cannot be before departure date."
          );
          return;
        }
      }

      searchData = {
        trip_type: tripType,
        from,
        to,
        departure_date: form.departure_date,
        return_date:
          tripType === "roundtrip"
            ? form.return_date
            : null,
        adults: Number(form.adults),
        children: Number(form.children),
        infants: Number(form.infants),
      };
    }

    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL?.replace(
          /\/+$/,
          ""
        );

      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured."
        );
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

      const data =
        (await response.json()) as FlightSearchResponse;

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
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Cannot connect to Laravel API."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * NORMAL ONE WAY / ROUND TRIP OFFERS
   */

  const offers = results?.data?.offers || [];

  /*
   * SELECT MULTI-CITY OFFER
   */

  const selectMultiOffer = (
    segmentIndex: number,
    offerId: string
  ) => {
    setSelectedOffers((prev) => ({
      ...prev,
      [segmentIndex]: offerId,
    }));

    setReviewStep("closed");
    setError("");
  };

  /*
   * FINAL SANDBOX REVIEW
   */

  const confirmSandboxReview = () => {
    if (!allSegmentsSelected || totalAirFlyPrice === null) {
      setError(
        "Please select all flight segments before confirmation."
      );
      return;
    }

    setError("");
    setReviewStep("completed");
  };

  return (
    <div className="card border-0 shadow-lg">
      <div className="card-header bg-primary text-white p-3">
        <h4 className="mb-0">✈ Flight Search</h4>
        <small>
          Search flights using LetsFG Sandbox API
        </small>
      </div>

      <div className="card-body p-4">

        {/* TRIP TYPE */}

        <div className="d-flex flex-wrap gap-4 mb-4">
          {(
            ["oneway", "roundtrip", "multicity"] as TripType[]
          ).map((type) => (
            <label className="form-check" key={type}>
              <input
                className="form-check-input"
                type="radio"
                checked={tripType === type}
                onChange={() => changeTripType(type)}
              />

              <span className="form-check-label fw-semibold">
                {type === "oneway"
                  ? "One Way"
                  : type === "roundtrip"
                    ? "Round Trip"
                    : "Multi-City"}
              </span>
            </label>
          ))}
        </div>

        {/* ONE WAY / ROUND TRIP FORM */}

        {tripType !== "multicity" && (
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                From
              </label>

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
              <label className="form-label fw-semibold">
                To
              </label>

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

        {/* MULTI-CITY FORM */}

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
                    <label className="form-label">
                      From
                    </label>

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
                    <label className="form-label">
                      To
                    </label>

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

        {/* PASSENGER COUNTS */}

        <div className="row g-3 mt-2">
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Adults
            </label>

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
            <label className="form-label fw-semibold">
              Children
            </label>

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
            <label className="form-label fw-semibold">
              Infants
            </label>

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

        {/* SEARCH BUTTON */}

        <div className="mt-4">
          <button
            type="button"
            className="btn btn-primary btn-lg w-100"
            onClick={searchFlight}
            disabled={loading}
          >
            {loading
              ? "Searching LetsFG Sandbox..."
              : "🔍 Search Flights"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="alert alert-danger mt-4 mb-0">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* RESULTS */}

        {results && (
          <div className="mt-4">

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1">
                  Flight Search Results
                </h5>

                <small className="text-muted">
                  {results.search?.trip_type === "multicity"
                    ? `${multiSegments.length} Multi-City Segments`
                    : `${results.search?.from || form.from} → ${
                        results.search?.to || form.to
                      }`}
                </small>
              </div>

              <span className="badge bg-warning text-dark">
                SANDBOX TEST ONLY
              </span>
            </div>

            <div className="alert alert-warning">
              <strong>Important:</strong> These are simulated
              sandbox results. They are not live airline
              inventory and cannot be booked.
            </div>

            <div className="alert alert-info">
              <div>
                Exchange Rate:{" "}
                <strong>
                  {results.pricing?.exchange_rate ?? "N/A"}
                </strong>
              </div>

              <div>
                Service Charge:{" "}
                <strong>
                  {formatBDT(
                    Number(
                      results.pricing?.service_charge || 0
                    )
                  )}
                </strong>
              </div>

              {results.search?.trip_type !== "multicity" && (
                <div>
                  Total Offers:{" "}
                  <strong>{offers.length}</strong>
                </div>
              )}
            </div>

            {/* MULTI-CITY RESULTS */}

            {results.search?.trip_type === "multicity" && (
              <div>
                <div className="alert alert-primary">
                  <h5 className="fw-bold mb-1">
                    Multi-City Flight Selection
                  </h5>

                  <div>
                    Selected Flights:{" "}
                    <strong>
                      {selectedCount} / {multiSegments.length}
                    </strong>
                  </div>

                  <small>
                    Select one flight from each segment to
                    calculate your complete itinerary price.
                  </small>
                </div>

                {multiSegments.map(
                  (segment, index) => {
                    const segmentOffers =
                      segment.offers || [];

                    const selectedId = selectedOffers[index];

                    return (
                      <div
                        key={`${segment.from}-${segment.to}-${index}`}
                        className="card border shadow-sm mb-4"
                      >
                        <div className="card-header bg-light p-3">
                          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <h5 className="fw-bold mb-0">
                              Flight {segment.segment_number}:{" "}
                              {segment.from} → {segment.to}
                            </h5>

                            <span className="badge bg-primary">
                              {segment.departure_date}
                            </span>
                          </div>

                          <small className="text-muted">
                            {segmentOffers.length} offers found
                          </small>
                        </div>

                        <div className="card-body p-3">
                          {segmentOffers.length === 0 && (
                            <div className="alert alert-secondary mb-0">
                              No offers found for this segment.
                            </div>
                          )}

                          {segmentOffers.map(
                            (offer, offerIndex) => {
                              const outbound = offer.outbound;

                              const flightParts =
                                outbound?.segments || [];

                              const firstSegment =
                                flightParts[0];

                              const lastSegment =
                                flightParts[
                                  flightParts.length - 1
                                ];

                              const airline =
                                firstSegment?.airline_name ||
                                firstSegment?.airline ||
                                offer.owner_airline ||
                                "Airline";

                              const flightNumbers =
                                flightParts
                                  .map(
                                    (item) => item.flight_no
                                  )
                                  .filter(Boolean)
                                  .join(", ");

                              const supplierPrice = Number(
                                offer.price
                              );

                              const estimatedBDT =
                                supplierPrice * exchangeRate;

                              const isSelected =
                                selectedId === offer.id;

                              return (
                                <div
                                  key={
                                    offer.id || offerIndex
                                  }
                                  className={`card mb-3 ${
                                    isSelected
                                      ? "border-primary border-2"
                                      : "border"
                                  }`}
                                >
                                  <div className="card-body p-3">
                                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                                      <div>
                                        <h6 className="fw-bold mb-1">
                                          {airline}
                                        </h6>

                                        <div className="small text-muted">
                                          Flight:{" "}
                                          {flightNumbers ||
                                            "Not available"}
                                        </div>
                                      </div>

                                      {isSelected && (
                                        <span className="badge bg-success">
                                          Selected
                                        </span>
                                      )}
                                    </div>

                                    <div className="row g-3 mt-1">
                                      <div className="col-md-4">
                                        <div className="small text-muted">
                                          Departure
                                        </div>

                                        <strong>
                                          {firstSegment?.origin ||
                                            segment.from}
                                        </strong>

                                        <div className="small">
                                          {formatDate(
                                            firstSegment?.departure
                                          )}
                                        </div>
                                      </div>

                                      <div className="col-md-4">
                                        <div className="small text-muted">
                                          Arrival
                                        </div>

                                        <strong>
                                          {lastSegment?.destination ||
                                            segment.to}
                                        </strong>

                                        <div className="small">
                                          {formatDate(
                                            lastSegment?.arrival
                                          )}
                                        </div>
                                      </div>

                                      <div className="col-md-4">
                                        <div className="small text-muted">
                                          Duration
                                        </div>

                                        <strong>
                                          {formatDuration(
                                            outbound?.total_duration_seconds
                                          )}
                                        </strong>

                                        <div className="small text-muted">
                                          Stops:{" "}
                                          {outbound?.stopovers ?? 0}
                                        </div>
                                      </div>
                                    </div>

                                    {renderItinerary(
                                      outbound,
                                      "Flight Itinerary"
                                    )}

                                    <div className="row align-items-center mt-3 g-2">
                                      <div className="col-md-6">
                                        <div className="small text-muted">
                                          Supplier Fare
                                        </div>

                                        <strong>
                                          $
                                          {Number.isFinite(
                                            supplierPrice
                                          )
                                            ? supplierPrice.toFixed(2)
                                            : "N/A"}{" "}
                                          USD
                                        </strong>

                                        <div className="small text-muted">
                                          Estimated BDT before
                                          service charge:{" "}
                                          {formatBDT(estimatedBDT)}
                                        </div>

                                        <div className="small text-muted mt-1">
                                          Baggage:{" "}
                                          {getBaggage(
                                            offer.bags_price
                                          )}
                                        </div>

                                        <div className="small text-muted">
                                          {offer.conditions
                                            ?.refundable ||
                                            "Refundability not specified"}
                                        </div>
                                      </div>

                                      <div className="col-md-6 text-md-end">
                                        <button
                                          type="button"
                                          className={`btn ${
                                            isSelected
                                              ? "btn-success"
                                              : "btn-outline-primary"
                                          }`}
                                          onClick={() =>
                                            selectMultiOffer(
                                              index,
                                              offer.id
                                            )
                                          }
                                        >
                                          {isSelected
                                            ? "✓ Selected"
                                            : "Select This Flight"}
                                        </button>
                                      </div>
                                    </div>

                                    <div className="small text-muted mt-2">
                                      Offer ID: {offer.id}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  }
                )}

                {/* MULTI-CITY PRICE SUMMARY */}

                <div className="card border-primary shadow-sm mt-4">
                  <div className="card-header bg-primary text-white p-3">
                    <h5 className="fw-bold mb-0">
                      Multi-City Price Summary
                    </h5>
                  </div>

                  <div className="card-body p-3 p-md-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Selected Segments</span>

                      <strong>
                        {selectedCount} / {multiSegments.length}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Supplier Fare</span>

                      <strong>
                        ${totalSupplierUSD.toFixed(2)} USD
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Exchange Rate</span>
                      <strong>{exchangeRate}</strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Supplier Fare in BDT</span>
                      <strong>
                        {formatBDT(subtotalBDT)}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                      <span>
                        Service Charge (once per itinerary)
                      </span>

                      <strong>
                        {allSegmentsSelected
                          ? formatBDT(serviceCharge)
                          : "Added after all selections"}
                      </strong>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <h5 className="fw-bold mb-0">
                        Total AirFly Price
                      </h5>

                      <h4 className="fw-bold text-primary mb-0">
                        {totalAirFlyPrice !== null
                          ? formatBDT(totalAirFlyPrice)
                          : "Pending"}
                      </h4>
                    </div>

                    {!allSegmentsSelected && (
                      <div className="alert alert-info mt-3 mb-0">
                        Please select one flight from every
                        segment to calculate the final AirFly
                        price.
                      </div>
                    )}

                    {allSegmentsSelected && (
                      <>
                        <div className="alert alert-success mt-3 mb-3">
                          All segments selected. Total itinerary
                          price calculated successfully.
                        </div>

                        <button
                          type="button"
                          className="btn btn-success btn-lg w-100"
                          onClick={continueToPassengerDetails}
                        >
                          Review & Passenger Details →
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* REVIEW AND BOOKING FLOW */}

                {allSegmentsSelected && (
                  <div className="card border shadow-sm mt-4">
                    <div className="card-header bg-dark text-white p-3">
                      <h5 className="fw-bold mb-0">
                        Review & Passenger Details
                      </h5>
                    </div>

                    <div className="card-body p-3 p-md-4">

                      {/* STEP 1 */}

                      {reviewStep === "closed" && (
                        <>
                          <p className="text-muted">
                            All flight segments are selected.
                            Continue to review your itinerary
                            and enter passenger information.
                          </p>

                          <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={
                              continueToPassengerDetails
                            }
                          >
                            Continue to Passenger Details
                          </button>
                        </>
                      )}

                      {/* STEP 2 */}

                      {reviewStep === "details" && (
                        <>
                          <h6 className="fw-bold mb-3">
                            Contact Information
                          </h6>

                          <div className="row g-3 mb-4">
                            <div className="col-md-6">
                              <label className="form-label">
                                Contact Email
                              </label>

                              <input
                                type="email"
                                className="form-control"
                                placeholder="example@email.com"
                                value={contact.email}
                                onChange={(e) =>
                                  setContact((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }
                              />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label">
                                Contact Phone
                              </label>

                              <input
                                type="tel"
                                className="form-control"
                                placeholder="+8801XXXXXXXXX"
                                value={contact.phone}
                                onChange={(e) =>
                                  setContact((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>

                          <hr />

                          <h6 className="fw-bold mb-3">
                            Passenger Information
                          </h6>

                          {Array.from(
                            { length: passengerCount },
                            (_, index) => (
                              <div
                                key={index}
                                className="border rounded p-3 mb-3"
                              >
                                <div className="d-flex justify-content-between mb-3">
                                  <strong>
                                    Passenger {index + 1}
                                  </strong>

                                  <span className="badge bg-secondary">
                                    {getPassengerType(index)}
                                  </span>
                                </div>

                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <label className="form-label">
                                      First Name
                                    </label>

                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="First name"
                                      value={
                                        passengerDetails[index]
                                          ?.firstName || ""
                                      }
                                      onChange={(e) =>
                                        updatePassenger(
                                          index,
                                          "firstName",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="col-md-6">
                                    <label className="form-label">
                                      Last Name
                                    </label>

                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Last name"
                                      value={
                                        passengerDetails[index]
                                          ?.lastName || ""
                                      }
                                      onChange={(e) =>
                                        updatePassenger(
                                          index,
                                          "lastName",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          )}

                          <div className="d-flex flex-wrap gap-2 mt-4">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                setReviewStep("closed")
                              }
                            >
                              Back
                            </button>

                            <button
                              type="button"
                              className="btn btn-primary flex-grow-1"
                              onClick={
                                continueToConfirmation
                              }
                            >
                              Continue to Final Review
                            </button>
                          </div>
                        </>
                      )}

                      {/* STEP 3 */}

                      {reviewStep === "confirmation" && (
                        <>
                          <h6 className="fw-bold mb-3">
                            Final Itinerary Review
                          </h6>

                          {selectedMultiOffers.map(
                            (offer, index) => {
                              if (!offer) return null;

                              const flightParts =
                                offer.outbound?.segments || [];

                              const first = flightParts[0];

                              const last =
                                flightParts[
                                  flightParts.length - 1
                                ];

                              return (
                                <div
                                  key={offer.id}
                                  className="border rounded p-3 mb-3"
                                >
                                  <div className="fw-bold">
                                    Flight {index + 1}:{" "}
                                    {first?.origin ||
                                      multiSegments[index]?.from}
                                    {" → "}
                                    {last?.destination ||
                                      multiSegments[index]?.to}
                                  </div>

                                  <div className="small text-muted mt-1">
                                    {first?.airline_name ||
                                      first?.airline ||
                                      "Airline"}
                                  </div>

                                  <div className="small mt-1">
                                    Departure:{" "}
                                    {formatDate(first?.departure)}
                                  </div>

                                  <div className="small">
                                    Arrival:{" "}
                                    {formatDate(last?.arrival)}
                                  </div>

                                  <div className="small mt-1">
                                    Supplier Fare: $
                                    {Number(offer.price).toFixed(2)}{" "}
                                    USD
                                  </div>

                                  <div className="small text-muted">
                                    Offer ID: {offer.id}
                                  </div>
                                </div>
                              );
                            }
                          )}

                          <hr />

                          <h6 className="fw-bold">
                            Passenger Summary
                          </h6>

                          {Array.from(
                            { length: passengerCount },
                            (_, index) => (
                              <div
                                key={index}
                                className="small mb-2"
                              >
                                <strong>
                                  Passenger {index + 1} (
                                  {getPassengerType(index)}):
                                </strong>{" "}
                                {
                                  passengerDetails[index]
                                    ?.firstName
                                }{" "}
                                {
                                  passengerDetails[index]
                                    ?.lastName
                                }
                              </div>
                            )
                          )}

                          <div className="small mt-3">
                            <strong>Contact Email:</strong>{" "}
                            {contact.email}
                          </div>

                          <div className="small">
                            <strong>Contact Phone:</strong>{" "}
                            {contact.phone}
                          </div>

                          <hr />

                          <div className="d-flex justify-content-between mb-2">
                            <span>Supplier Fare</span>

                            <strong>
                              {formatBDT(subtotalBDT)}
                            </strong>
                          </div>

                          <div className="d-flex justify-content-between mb-2">
                            <span>Service Charge</span>

                            <strong>
                              {formatBDT(serviceCharge)}
                            </strong>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">
                              Total AirFly Price
                            </h5>

                            <h4 className="fw-bold text-primary mb-0">
                              {formatBDT(
                                totalAirFlyPrice || 0
                              )}
                            </h4>
                          </div>

                          <div className="alert alert-warning mt-4">
                            <strong>Sandbox Notice:</strong>{" "}
                            This is a test review only. No
                            ticket has been booked, no payment
                            has been collected, and no airline
                            reservation has been created.
                          </div>

                          <div className="d-flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                setReviewStep("details")
                              }
                            >
                              Back to Passenger Details
                            </button>

                            <button
                              type="button"
                              className="btn btn-success flex-grow-1"
                              onClick={confirmSandboxReview}
                            >
                              Confirm Sandbox Review
                            </button>
                          </div>
                        </>
                      )}

                      {/* STEP 4 */}

                      {reviewStep === "completed" && (
                        <div className="text-center py-4">
                          <div className="display-4 text-success mb-3">
                            ✓
                          </div>

                          <h5 className="fw-bold">
                            Sandbox Review Completed
                          </h5>

                          <p className="text-muted">
                            Your Multi-City itinerary and
                            passenger information have been
                            reviewed.
                          </p>

                          <h4 className="fw-bold text-primary">
                            {formatBDT(
                              totalAirFlyPrice || 0
                            )}
                          </h4>

                          <div className="alert alert-warning mt-3">
                            This is not a booking confirmation.
                            No PNR or ticket has been generated.
                          </div>

                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() =>
                              setReviewStep("details")
                            }
                          >
                            Back to Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ONE WAY / ROUND TRIP RESULTS */}

            {results.search?.trip_type !== "multicity" && (
              <>
                {offers.length === 0 && (
                  <div className="alert alert-secondary">
                    No flight offers found for this search.
                  </div>
                )}

                {offers.map((offer, index) => {
                  const outbound = offer.outbound;

                  const firstSegment =
                    outbound?.segments?.[0];

                  const airline =
                    firstSegment?.airline_name ||
                    firstSegment?.airline ||
                    offer.owner_airline ||
                    "Airline";

                  const flightNumbers = (
                    outbound?.segments || []
                  )
                    .map((segment) => segment.flight_no)
                    .filter(Boolean)
                    .join(", ");

                  const price = Number(
                    offer.airfly_price_bdt
                  );

                  const supplierPrice = Number(offer.price);

                  const refundable =
                    offer.conditions?.refundable ||
                    "Not specified";

                  const changeable =
                    offer.conditions?.changeable ||
                    "Not specified";

                  const seats = offer.availability_seats;

                  return (
                    <div
                      key={
                        offer.id || offer.offer_id || index
                      }
                      className="card border shadow-sm mb-3"
                    >
                      <div className="card-body p-3 p-md-4">
                        <div className="row align-items-center g-3">
                          <div className="col-md-4">
                            <h5 className="fw-bold mb-1">
                              {airline}
                            </h5>

                            <div className="text-muted small">
                              Flight:{" "}
                              {flightNumbers || "Not available"}
                            </div>

                            <div className="mt-2">
                              <span className="badge bg-light text-dark border">
                                {refundable}
                              </span>
                            </div>

                            <div className="small text-muted mt-2">
                              Change: {changeable}
                            </div>
                          </div>

                          <div className="col-md-4">
                            <div className="fw-bold">
                              {firstSegment?.origin ||
                                results.search?.from ||
                                form.from}
                              {" → "}
                              {outbound?.segments?.[
                                (outbound.segments?.length || 1) - 1
                              ]?.destination ||
                                results.search?.to ||
                                form.to}
                            </div>

                            <div className="small text-muted mt-2">
                              <div>
                                <strong>Departure:</strong>{" "}
                                {formatDate(
                                  firstSegment?.departure
                                )}
                              </div>

                              <div>
                                <strong>Arrival:</strong>{" "}
                                {formatDate(
                                  outbound?.segments?.[
                                    (outbound.segments?.length || 1) - 1
                                  ]?.arrival
                                )}
                              </div>

                              <div>
                                <strong>Duration:</strong>{" "}
                                {formatDuration(
                                  outbound?.total_duration_seconds
                                )}
                              </div>

                              <div>
                                <strong>Stops:</strong>{" "}
                                {outbound?.stopovers ??
                                  Math.max(
                                    0,
                                    (outbound?.segments?.length ||
                                      1) - 1
                                  )}
                              </div>
                            </div>
                          </div>

                          <div className="col-md-4 text-md-end">
                            <div className="text-muted small">
                              AirFly Selling Price
                            </div>

                            <h4 className="text-primary fw-bold mb-1">
                              {Number.isFinite(price)
                                ? formatBDT(price)
                                : "Price unavailable"}
                            </h4>

                            <div className="small text-muted">
                              {Number.isFinite(supplierPrice)
                                ? `Supplier Fare: $${supplierPrice.toFixed(
                                    2
                                  )} USD`
                                : ""}
                            </div>

                            <div className="small mt-2">
                              <strong>Baggage:</strong>{" "}
                              {getBaggage(offer.bags_price)}
                            </div>

                            <div className="small text-muted mt-1">
                              Availability:{" "}
                              {seats != null
                                ? `${seats} seats`
                                : "Not specified"}
                            </div>

                            <div className="small text-muted mt-1">
                              Cabin:{" "}
                              {firstSegment?.cabin_class ||
                                "Not specified"}
                            </div>
                          </div>
                        </div>

                        {renderItinerary(
                          outbound,
                          "Outbound Flight"
                        )}

                        {offer.inbound &&
                          renderItinerary(
                            offer.inbound,
                            "Return Flight"
                          )}

                        <div className="small text-muted mt-3">
                          Offer ID:{" "}
                          {offer.id || "Not available"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* RAW API RESPONSE */}

            <details className="mt-3">
              <summary className="fw-semibold">
                View Raw Sandbox API Response
              </summary>

              <pre
                className="bg-light p-3 mt-3 rounded"
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
        )}
      </div>
    </div>
  );
}
