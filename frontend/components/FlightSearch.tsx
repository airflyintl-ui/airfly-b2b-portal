"use client";

import API from "../services/api";
import { useState, type ChangeEvent } from "react";

type TripType = "oneway" | "roundtrip" | "multicity";

type FlightSegment = {
  from: string;
  to: string;
  departure_date: string;
};

type PassengerType = "Adult" | "Child" | "Infant";

type Passenger = {
  type: PassengerType;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
};

type ContactDetails = {
  email: string;
  phone: string;
};

type SelectedOffers = Record<number, string>;

const emptyPassenger = (type: PassengerType): Passenger => ({
  type,
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Bangladeshi",
  passportNumber: "",
  passportExpiry: "",
});

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
    { from: "DAC", to: "DXB", departure_date: "" },
    { from: "DXB", to: "BKK", departure_date: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any>(null);

  const [selectedOffers, setSelectedOffers] =
    useState<SelectedOffers>({});

  const [selectedNormalOffer, setSelectedNormalOffer] =
    useState<any>(null);

  const [reviewStep, setReviewStep] = useState<
    "closed" | "details" | "confirmation" | "completed"
  >("closed");

  const [passengers, setPassengers] = useState<Passenger[]>([
    emptyPassenger("Adult"),
  ]);

  const [contact, setContact] = useState<ContactDetails>({
    email: "",
    phone: "",
  });

  const today = new Date().toLocaleDateString("en-CA");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "from" || name === "to"
          ? value.toUpperCase().slice(0, 3)
          : ["adults", "children", "infants"].includes(name)
          ? value === ""
            ? 0
            : name === "adults"
            ? Math.min(9, Math.max(1, Number(value)))
            : Math.min(9, Math.max(0, Number(value)))
          : value,
    }));

    setResults(null);
    setSelectedOffers({});
    setSelectedNormalOffer(null);
    setReviewStep("closed");
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

    setResults(null);
    setSelectedOffers({});
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
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 2) return;

    setSegments((prev) => prev.filter((_, i) => i !== index));
    setSelectedOffers({});
    setResults(null);
    setReviewStep("closed");
  };

  const validateAirport = (code: string) =>
    /^[A-Z]{3}$/.test(code.trim());

  const formatDate = (value: any) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: any) => {
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

  const getBaggage = (bagsPrice: any) => {
    if (!bagsPrice || typeof bagsPrice !== "object") {
      return "Not specified";
    }

    const oneBag = bagsPrice["1_bag"];

    if (oneBag === undefined || oneBag === null) {
      return "Not specified";
    }

    return `1 bag: $${Number(oneBag).toFixed(2)} (estimated)`;
  };

  const renderItinerary = (itinerary: any, title: string) => {
    const flightSegments = itinerary?.segments || [];

    if (!flightSegments.length) return null;

    return (
      <div className="mt-3">
        <h6 className="fw-bold mb-3">{title}</h6>

        {flightSegments.map((segment: any, index: number) => (
          <div
            key={`${segment.flight_no || "segment"}-${index}`}
            className="border rounded p-3 mb-2 bg-light"
          >
            <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
              <strong>
                {segment.airline_name || segment.airline || "Airline"}
              </strong>

              <span className="badge bg-secondary">
                {segment.flight_no || "Flight number unavailable"}
              </span>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="small text-muted">From</div>
                <div className="fw-bold">{segment.origin || "N/A"}</div>
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
          {" · "}Stops:{" "}
          <strong>
            {itinerary.stopovers ??
              Math.max(0, flightSegments.length - 1)}
          </strong>
        </div>
      </div>
    );
  };

  // Search result data

  const offers = results?.data?.offers || [];
  const multiSegments = results?.data?.segments || [];

  const exchangeRate = Number(
    results?.pricing?.exchange_rate || 0
  );

  const serviceCharge = Number(
    results?.pricing?.service_charge || 0
  );

  // Multi-City selected offers

  const selectedMultiOffers = multiSegments.map(
    (segment: any, index: number) => {
      const offerId = selectedOffers[index];

      return (segment.offers || []).find(
        (offer: any) => String(offer.id) === offerId
      );
    }
  );

  const selectedCount = selectedMultiOffers.filter(Boolean).length;

  const allSegmentsSelected =
    multiSegments.length > 0 &&
    selectedCount === multiSegments.length;

  const totalSupplierUSD = selectedMultiOffers.reduce(
    (total: number, offer: any) =>
      total + (offer ? Number(offer.price || 0) : 0),
    0
  );

  const subtotalBDT = totalSupplierUSD * exchangeRate;

  const totalAirFlyPrice = allSegmentsSelected
    ? subtotalBDT + serviceCharge
    : null;

  // Normal One Way / Round Trip price

  const normalSupplierUSD = Number(
    selectedNormalOffer?.price || 0
  );

  const normalCalculatedPrice =
    normalSupplierUSD * exchangeRate + serviceCharge;

  const normalBackendPrice = selectedNormalOffer?.airfly_price_bdt;

  const normalAirFlyPrice = selectedNormalOffer
    ? normalBackendPrice !== null &&
      normalBackendPrice !== undefined &&
      normalBackendPrice !== "" &&
      Number.isFinite(Number(normalBackendPrice))
      ? Number(normalBackendPrice)
      : normalCalculatedPrice
    : 0;

  const isMultiCity = results?.search?.trip_type === "multicity";

  const finalPrice = isMultiCity
    ? Number(totalAirFlyPrice || 0)
    : normalAirFlyPrice;

  const selectedFlightSummary = isMultiCity
    ? selectedMultiOffers.filter(Boolean)
    : selectedNormalOffer
    ? [selectedNormalOffer]
    : [];

  // Create passenger forms based on passenger count

  const preparePassengers = () => {
    const passengerTypes: PassengerType[] = [
      ...Array(Number(form.adults)).fill("Adult"),
      ...Array(Number(form.children)).fill("Child"),
      ...Array(Number(form.infants)).fill("Infant"),
    ];

    const updatedPassengers = passengerTypes.map((type, index) => {
      const existing = passengers[index];

      if (existing && existing.type === type) {
        return existing;
      }

      return emptyPassenger(type);
    });

    setPassengers(updatedPassengers);
    return updatedPassengers;
  };

  const updatePassenger = (
    index: number,
    field: keyof Passenger,
    value: string
  ) => {
    setPassengers((prev) =>
      prev.map((passenger, i) =>
        i === index
          ? { ...passenger, [field]: value }
          : passenger
      )
    );
  };

  const selectMultiOffer = (
    segmentIndex: number,
    offerId: string | number
  ) => {
    setSelectedOffers((prev) => ({
      ...prev,
      [segmentIndex]: String(offerId),
    }));

    setReviewStep("closed");
    setError("");
  };

  const selectNormalOffer = (offer: any) => {
    setSelectedNormalOffer(offer);
    setReviewStep("closed");
    setError("");
  };

  // Review flow

  const continueToPassengerDetails = () => {
    if (isMultiCity && !allSegmentsSelected) {
      setError("Please select one flight from every segment.");
      return;
    }

    if (!isMultiCity && !selectedNormalOffer) {
      setError("Please select a flight first.");
      return;
    }

    setError("");
    preparePassengers();
    setReviewStep("details");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const continueToConfirmation = () => {
    const expectedCount =
      Number(form.adults) +
      Number(form.children) +
      Number(form.infants);

    if (passengers.length !== expectedCount) {
      setError("Passenger information is incomplete.");
      return;
    }

    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];

      if (
        !passenger.firstName.trim() ||
        !passenger.lastName.trim() ||
        !passenger.dateOfBirth ||
        !passenger.gender ||
        !passenger.nationality.trim()
      ) {
        setError(
          `Please complete all required information for Passenger ${i + 1}.`
        );
        return;
      }
    }

    if (!contact.email.trim() || !contact.phone.trim()) {
      setError("Please enter contact email and phone number.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(contact.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (finalPrice <= 0 || !Number.isFinite(finalPrice)) {
      setError("Flight price is unavailable. Please select a flight again.");
      return;
    }

    setError("");
    setReviewStep("confirmation");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDetails = () => {
    setReviewStep("completed");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Search flights

  const searchFlight = async () => {
    setError("");
    setResults(null);
    setSelectedOffers({});
    setSelectedNormalOffer(null);
    setReviewStep("closed");

    if (Number(form.adults) < 1) {
      setError("At least one adult passenger is required.");
      return;
    }

    if (Number(form.infants) > Number(form.adults)) {
      setError("Infants cannot exceed adults.");
      return;
    }

    let searchData: any;

    if (tripType === "multicity") {
      if (segments.length < 2 || segments.length > 6) {
        setError("Multi-City requires 2 to 6 flight segments.");
        return;
      }

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        const from = segment.from.trim().toUpperCase();
        const to = segment.to.trim().toUpperCase();

        if (!validateAirport(from) || !validateAirport(to)) {
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
          setError(`Flight ${i + 1} date cannot be in the past.`);
          return;
        }

        if (i > 0) {
          const previous = segments[i - 1];

          if (from !== previous.to.trim().toUpperCase()) {
            setError(
              `Flight ${i + 1} must start from the previous flight's destination (${previous.to.toUpperCase()}).`
            );
            return;
          }

          if (segment.departure_date < previous.departure_date) {
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
      const apiUrl = API.replace(/\/+$/, "");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Agent login required. Please login before searching flights."
        );
      }

      const response = await fetch(
        `${apiUrl}/sandbox/search-flight`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
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
      setError(err.message || "Cannot connect to Laravel API.");
    } finally {
      setLoading(false);
    }
  };

  // Passenger and confirmation screens

  if (reviewStep !== "closed") {
    return (
      <div className="card border-0 shadow-lg">
        <div className="card-header bg-primary text-white p-3">
          <h4 className="mb-0">✈ Flight Review</h4>
          <small>LetsFG Sandbox · Test Only</small>
        </div>

        <div className="card-body p-4">
          {reviewStep === "details" && (
            <>
              <h4 className="fw-bold mb-2">Passenger Details</h4>
              <p className="text-muted">
                Please enter the details of every passenger.
              </p>

              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="border rounded p-3 mb-4"
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">
                      Passenger {index + 1}
                    </h5>

                    <span className="badge bg-primary">
                      {passenger.type}
                    </span>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        First Name *
                      </label>
                      <input
                        className="form-control"
                        value={passenger.firstName}
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            "firstName",
                            e.target.value
                          )
                        }
                        placeholder="First name as in passport"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Last Name *
                      </label>
                      <input
                        className="form-control"
                        value={passenger.lastName}
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            "lastName",
                            e.target.value
                          )
                        }
                        placeholder="Last name as in passport"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        max={today}
                        value={passenger.dateOfBirth}
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            "dateOfBirth",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Gender *</label>
                      <select
                        className="form-select"
                        value={passenger.gender}
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            "gender",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        Nationality *
                      </label>
                      <input
                        className="form-control"
                        value={passenger.nationality}
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            "nationality",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Passport Number
                      </label>
                      <input
                        className="form-control"
                        value={passenger.passportNumber}
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            "passportNumber",
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="Passport number"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Passport Expiry Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        min={today}
                        value={passenger.passportExpiry}
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            "passportExpiry",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <h4 className="fw-bold mb-3">
                Contact Information
              </h4>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={contact.email}
                    onChange={(e) =>
                      setContact((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="example@email.com"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    value={contact.phone}
                    onChange={(e) =>
                      setContact((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
              </div>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setReviewStep("closed")}
                >
                  ← Back to Flight Results
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={continueToConfirmation}
                >
                  Continue to Confirmation →
                </button>
              </div>
            </>
          )}

          {reviewStep === "confirmation" && (
            <>
              <h4 className="fw-bold mb-3">
                Review & Confirm Details
              </h4>

              <div className="alert alert-warning">
                <strong>Sandbox Test Only:</strong> This screen
                confirms the details entered for review. It does not
                create a real booking or issue a ticket.
              </div>

              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h5 className="fw-bold mb-0">Selected Flight</h5>
                </div>

                <div className="card-body">
                  {selectedFlightSummary.map(
                    (offer: any, index: number) => (
                      <div
                        key={offer.id || index}
                        className="border rounded p-3 mb-3"
                      >
                        <strong>
                          {offer.outbound?.segments?.[0]
                            ?.airline_name ||
                            offer.outbound?.segments?.[0]?.airline ||
                            offer.owner_airline ||
                            "Airline"}
                        </strong>

                        <div className="small text-muted mt-1">
                          Offer ID: {offer.id || "N/A"}
                        </div>

                        {renderItinerary(
                          offer.outbound,
                          "Outbound Flight"
                        )}

                        {offer.inbound &&
                          renderItinerary(
                            offer.inbound,
                            "Return Flight"
                          )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h5 className="fw-bold mb-0">
                    Passenger Information
                  </h5>
                </div>

                <div className="card-body">
                  {passengers.map((passenger, index) => (
                    <div
                      key={index}
                      className="border-bottom pb-3 mb-3"
                    >
                      <div className="fw-bold">
                        Passenger {index + 1} — {passenger.type}
                      </div>

                      <div>
                        Name: {passenger.firstName}{" "}
                        {passenger.lastName}
                      </div>

                      <div>
                        Date of Birth: {passenger.dateOfBirth}
                      </div>

                      <div>Gender: {passenger.gender}</div>
                      <div>Nationality: {passenger.nationality}</div>

                      <div>
                        Passport:{" "}
                        {passenger.passportNumber || "Not provided"}
                      </div>

                      <div>
                        Passport Expiry:{" "}
                        {passenger.passportExpiry || "Not provided"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h5 className="fw-bold mb-0">
                    Contact Information
                  </h5>
                </div>

                <div className="card-body">
                  <div>Email: {contact.email}</div>
                  <div>Phone: {contact.phone}</div>
                </div>
              </div>

              <div className="card border-primary mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="fw-bold mb-0">Price Summary</h5>
                </div>

                <div className="card-body">
                  {isMultiCity && (
                    <>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Supplier Fare</span>
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
                        <strong>{formatBDT(subtotalBDT)}</strong>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Service Charge</span>
                        <strong>{formatBDT(serviceCharge)}</strong>
                      </div>
                    </>
                  )}

                  {!isMultiCity && (
                    <>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Supplier Fare</span>
                        <strong>
                          ${normalSupplierUSD.toFixed(2)} USD
                        </strong>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Exchange Rate</span>
                        <strong>{exchangeRate}</strong>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Service Charge</span>
                        <strong>{formatBDT(serviceCharge)}</strong>
                      </div>
                    </>
                  )}

                  <hr />

                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">
                      Total AirFly Price
                    </h5>

                    <h4 className="fw-bold text-primary mb-0">
                      {formatBDT(finalPrice)}
                    </h4>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setReviewStep("details")}
                >
                  ← Edit Passenger Details
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={confirmDetails}
                >
                  Confirm Details
                </button>
              </div>
            </>
          )}

          {reviewStep === "completed" && (
            <div className="text-center py-4">
              <div className="display-4 text-success mb-3">✓</div>

              <h3 className="fw-bold text-success">
                Details Confirmed
              </h3>

              <p className="text-muted">
                Your passenger and contact details have been reviewed
                successfully.
              </p>

              <div className="alert alert-warning text-start">
                This is a Sandbox confirmation only. No real booking,
                payment, PNR or ticket has been created.
              </div>

              <h4 className="fw-bold text-primary mb-4">
                Total: {formatBDT(finalPrice)}
              </h4>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setReviewStep("closed");
                  setResults(null);
                  setSelectedOffers({});
                  setSelectedNormalOffer(null);
                  setPassengers([emptyPassenger("Adult")]);
                  setContact({ email: "", phone: "" });
                  setError("");
                }}
              >
                Start New Flight Search
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main flight search screen

  return (
    <div className="card border-0 shadow-lg">
      <div className="card-header bg-primary text-white p-3">
        <h4 className="mb-0">✈ Flight Search</h4>
        <small>Search flights using LetsFG Sandbox API</small>
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
                    setSelectedOffers({});
                    setSelectedNormalOffer(null);
                    setReviewStep("closed");
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

        {/* Multi-City Search Form */}

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
            {loading
              ? "Searching LetsFG Sandbox..."
              : "🔍 Search Flights"}
          </button>
        </div>

        {/* Error */}

        {error && (
          <div className="alert alert-danger mt-4 mb-0">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}

        {results && (
          <div className="mt-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1">
                  Flight Search Results
                </h5>

                <small className="text-muted">
                  {isMultiCity
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
              <strong>Important:</strong> These are simulated sandbox
              results. They are not live airline inventory and cannot
              be booked.
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
                    Number(results.pricing?.service_charge || 0)
                  )}
                </strong>
              </div>

              {!isMultiCity && (
                <div>
                  Total Offers: <strong>{offers.length}</strong>
                </div>
              )}
            </div>

            {/* MULTI-CITY RESULTS */}

            {isMultiCity && (
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
                    Select one flight from each segment to calculate
                    your complete itinerary price.
                  </small>
                </div>

                {multiSegments.map((segment: any, index: number) => {
                  const segmentOffers = segment.offers || [];
                  const selectedId = selectedOffers[index];

                  return (
                    <div
                      key={`${segment.from}-${segment.to}-${index}`}
                      className="card border shadow-sm mb-4"
                    >
                      <div className="card-header bg-light p-3">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                          <h5 className="fw-bold mb-0">
                            Flight {segment.segment_number || index + 1}:{" "}
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
                          (offer: any, offerIndex: number) => {
                            const outbound = offer.outbound;
                            const flightParts = outbound?.segments || [];
                            const firstSegment = flightParts[0];
                            const lastSegment =
                              flightParts[flightParts.length - 1];

                            const airline =
                              firstSegment?.airline_name ||
                              firstSegment?.airline ||
                              offer.owner_airline ||
                              "Airline";

                            const flightNumbers = flightParts
                              .map((item: any) => item.flight_no)
                              .filter(Boolean)
                              .join(", ");

                            const supplierPrice = Number(offer.price || 0);
                            const estimatedBDT =
                              supplierPrice * exchangeRate;

                            const isSelected =
                              selectedId === String(offer.id);

                            return (
                              <div
                                key={offer.id || offerIndex}
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
                                        {flightNumbers || "Not available"}
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
                                        {formatDate(lastSegment?.arrival)}
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
                                        Stops: {outbound?.stopovers ?? 0}
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
                                        ${supplierPrice.toFixed(2)} USD
                                      </strong>

                                      <div className="small text-muted">
                                        Estimated BDT before service
                                        charge: {formatBDT(estimatedBDT)}
                                      </div>

                                      <div className="small text-muted mt-1">
                                        Baggage:{" "}
                                        {getBaggage(offer.bags_price)}
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
                })}

                {/* Multi-City Price Summary */}

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
                      <strong>{formatBDT(subtotalBDT)}</strong>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                      <span>Service Charge (once per itinerary)</span>
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

                    {allSegmentsSelected && (
                      <>
                        <div className="alert alert-success mt-3 mb-3">
                          All segments selected. Total itinerary price
                          calculated successfully.
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
              </div>
            )}

            {/* ONE WAY / ROUND TRIP RESULTS */}

            {!isMultiCity && (
              <>
                {offers.length === 0 && (
                  <div className="alert alert-secondary">
                    No flight offers found for this search.
                  </div>
                )}

                {offers.map((offer: any, index: number) => {
                  const outbound = offer.outbound;
                  const firstSegment = outbound?.segments?.[0];

                  const airline =
                    firstSegment?.airline_name ||
                    firstSegment?.airline ||
                    offer.owner_airline ||
                    "Airline";

                  const flightNumbers = (outbound?.segments || [])
                    .map((segment: any) => segment.flight_no)
                    .filter(Boolean)
                    .join(", ");

                  const backendPrice = offer.airfly_price_bdt;

                  const price =
                    backendPrice !== null &&
                    backendPrice !== undefined &&
                    backendPrice !== "" &&
                    Number.isFinite(Number(backendPrice))
                      ? Number(backendPrice)
                      : Number(offer.price || 0) * exchangeRate + serviceCharge;

                  const supplierPrice = Number(offer.price || 0);

                  const refundable =
                    offer.conditions?.refundable || "Not specified";

                  const changeable =
                    offer.conditions?.changeable || "Not specified";

                  const seats = offer.availability_seats;

                  const isSelected =
                    selectedNormalOffer?.id === offer.id;

                  return (
                    <div
                      key={offer.id || offer.offer_id || index}
                      className={`card shadow-sm mb-3 ${
                        isSelected
                          ? "border-primary border-2"
                          : "border"
                      }`}
                    >
                      <div className="card-body p-3 p-md-4">
                        <div className="row align-items-center g-3">
                          <div className="col-md-4">
                            <h5 className="fw-bold mb-1">
                              {airline}
                            </h5>

                            <div className="text-muted small">
                              Flight: {flightNumbers || "Not available"}
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
                                (outbound?.segments?.length || 1) - 1
                              ]?.destination ||
                                results.search?.to ||
                                form.to}
                            </div>

                            <div className="small text-muted mt-2">
                              <div>
                                <strong>Departure:</strong>{" "}
                                {formatDate(firstSegment?.departure)}
                              </div>

                              <div>
                                <strong>Arrival:</strong>{" "}
                                {formatDate(
                                  outbound?.segments?.[
                                    (outbound?.segments?.length || 1) - 1
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
                                    (outbound?.segments?.length || 1) - 1
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
                                ? `Supplier Fare: $${supplierPrice.toFixed(2)} USD`
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

                            <button
                              type="button"
                              className={`btn mt-3 ${
                                isSelected
                                  ? "btn-success"
                                  : "btn-outline-primary"
                              }`}
                              onClick={() => selectNormalOffer(offer)}
                            >
                              {isSelected
                                ? "✓ Selected"
                                : "Select This Flight"}
                            </button>
                          </div>
                        </div>

                        {renderItinerary(outbound, "Outbound Flight")}

                        {offer.inbound &&
                          renderItinerary(
                            offer.inbound,
                            "Return Flight"
                          )}

                        <div className="small text-muted mt-3">
                          Offer ID: {offer.id || "Not available"}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {selectedNormalOffer && (
                  <div className="card border-primary shadow-sm mt-4">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <h5 className="fw-bold mb-0">
                          Selected Flight Price
                        </h5>

                        <h4 className="fw-bold text-primary mb-0">
                          {formatBDT(normalAirFlyPrice)}
                        </h4>
                      </div>

                      <button
                        type="button"
                        className="btn btn-success btn-lg w-100 mt-3"
                        onClick={continueToPassengerDetails}
                      >
                        Review & Passenger Details →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Raw API Response */}

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
