"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8090/api";

export default function BookingPage() {
  const router = useRouter();

  const [flight, setFlight] = useState<any>(null);

  const [passengerName, setPassengerName] = useState("");
  const [passport, setPassport] = useState("");
  const [nationality, setNationality] = useState("Bangladeshi");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [journeyType, setJourneyType] = useState("One Way");
  const [travelClass, setTravelClass] = useState("Economy");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("selected_flight");

    if (!data) {
      router.push("/flight-search");
      return;
    }

    try {
      const parsedFlight = JSON.parse(data);
      setFlight(parsedFlight);
    } catch (error) {
      console.error("Invalid selected flight:", error);
      localStorage.removeItem("selected_flight");
      router.push("/flight-search");
    }
  }, [router]);

  // --------------------------------------------------
  // GET WALLET BALANCE
  // --------------------------------------------------

  useEffect(() => {
    const loadWallet = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const response = await fetch(`${API}/wallet/statement`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setWalletBalance(Number(data.wallet));
        }
      } catch (error) {
        console.error("Wallet error:", error);
      }
    };

    loadWallet();
  }, []);

  // --------------------------------------------------
  // CALCULATE TOTAL
  // --------------------------------------------------

  const getFare = () => {
    if (!flight) return 0;

    if (travelClass === "Business") {
      return Number(
        flight.business_fare ??
          flight.businessFare ??
          flight.fare ??
          0
      );
    }

    return Number(
      flight.economy_fare ??
        flight.economyFare ??
        flight.fare ??
        0
    );
  };

  const fare = getFare();

  const totalPassengers = adults + children + infants;

  const totalAmount = fare * adults;

  // --------------------------------------------------
  // CONFIRM BOOKING
  // --------------------------------------------------

  const confirmBooking = async () => {
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      router.push("/login");
      return;
    }

    // Validation
    if (!passengerName.trim()) {
      setError("Passenger name is required.");
      return;
    }

    if (!passport.trim()) {
      setError("Passport number is required.");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!dateOfBirth) {
      setError("Date of birth is required.");
      return;
    }

    if (!flight?.id) {
      setError("Flight information is missing.");
      return;
    }

    if (adults < 1) {
      setError("At least 1 adult passenger is required.");
      return;
    }

    if (
      walletBalance !== null &&
      walletBalance < totalAmount
    ) {
      setError(
        `Insufficient wallet balance. Required ৳${totalAmount.toLocaleString()}, available ৳${walletBalance.toLocaleString()}.`
      );
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        flight_id: Number(flight.id),

        passenger_name: passengerName.trim(),

        passport: passport.trim(),

        nationality: nationality,

        date_of_birth: dateOfBirth,

        gender: gender,

        phone: phone.trim(),

        email: email.trim(),

        journey_type: journeyType,

        travel_class: travelClass,

        adults: Number(adults),

        children: Number(children),

        infants: Number(infants),
      };

      console.log("BOOKING REQUEST:", bookingData);

      const response = await fetch(`${API}/bookings`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      console.log("BOOKING RESPONSE:", data);

      if (response.ok && data.success) {
        // Save booking confirmation for confirmation page
        localStorage.setItem(
          "booking_confirmation",
          JSON.stringify(data)
        );

        // Remove selected flight
        localStorage.removeItem("selected_flight");

        // Go to confirmation page
        router.push("/booking-confirmation");
      } else {
        // Laravel validation errors
        if (data.errors) {
          const messages = Object.values(data.errors)
            .flat()
            .join("\n");

          setError(messages);
        } else {
          setError(
            data.message || "Booking failed. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Booking API Error:", error);

      setError(
        "Unable to connect to Laravel API. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (!flight) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Loading flight...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <div className="row g-4">

        {/* ========================================= */}
        {/* FLIGHT INFORMATION */}
        {/* ========================================= */}

        <div className="col-lg-4">

          <div className="card shadow-sm">

            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                Flight Information
              </h5>
            </div>

            <div className="card-body">

              <h5 className="mb-3">
                {flight.airline || "Airline"}
              </h5>

              <p className="mb-2">
                <strong>Flight:</strong>{" "}
                {flight.flight_no || flight.flightNo}
              </p>

              <p className="mb-2">
                <strong>Route:</strong>{" "}
                {flight.from} → {flight.to}
              </p>

              {flight.departure_time && (
                <p className="mb-2">
                  <strong>Departure:</strong>{" "}
                  {new Date(
                    flight.departure_time
                  ).toLocaleString()}
                </p>
              )}

              {flight.arrival_time && (
                <p className="mb-2">
                  <strong>Arrival:</strong>{" "}
                  {new Date(
                    flight.arrival_time
                  ).toLocaleString()}
                </p>
              )}

              <hr />

              <p className="mb-2">
                <strong>Travel Class:</strong>{" "}
                {travelClass}
              </p>

              <p className="mb-0">
                <strong>Fare:</strong>{" "}
                <span className="fw-bold text-success fs-5">
                  ৳ {fare.toLocaleString()}
                </span>
              </p>

            </div>

          </div>


          {/* WALLET */}

          <div className="card shadow-sm mt-4">

            <div className="card-body">

              <h6 className="text-muted">
                Wallet Balance
              </h6>

              <h3 className="text-success mb-0">
                {walletBalance !== null
                  ? `৳ ${walletBalance.toLocaleString()}`
                  : "Loading..."}
              </h3>

            </div>

          </div>


          {/* TOTAL */}

          <div className="card shadow-sm mt-4">

            <div className="card-header">
              Booking Summary
            </div>

            <div className="card-body">

              <div className="d-flex justify-content-between">
                <span>Adult</span>
                <span>{adults}</span>
              </div>

              <div className="d-flex justify-content-between">
                <span>Children</span>
                <span>{children}</span>
              </div>

              <div className="d-flex justify-content-between">
                <span>Infants</span>
                <span>{infants}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <strong>Total Passengers</strong>
                <strong>{totalPassengers}</strong>
              </div>

              <div className="d-flex justify-content-between mt-2">
                <strong>Total Amount</strong>

                <strong className="text-success">
                  ৳ {totalAmount.toLocaleString()}
                </strong>
              </div>

            </div>

          </div>

        </div>


        {/* ========================================= */}
        {/* PASSENGER INFORMATION */}
        {/* ========================================= */}

        <div className="col-lg-8">

          <div className="card shadow-sm">

            <div className="card-header bg-success text-white">

              <h5 className="mb-0">
                Passenger Information
              </h5>

            </div>


            <div className="card-body">

              {/* ERROR */}

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}


              {/* PASSENGER NAME */}

              <div className="mb-3">

                <label className="form-label">
                  Passenger Name *
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter passenger full name"
                  value={passengerName}
                  onChange={(e) =>
                    setPassengerName(e.target.value)
                  }
                />

              </div>


              <div className="row">


                {/* PASSPORT */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Passport No *
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. BG1234567"
                    value={passport}
                    onChange={(e) =>
                      setPassport(e.target.value)
                    }
                  />

                </div>


                {/* NATIONALITY */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Nationality
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={nationality}
                    onChange={(e) =>
                      setNationality(e.target.value)
                    }
                  />

                </div>

              </div>


              <div className="row">


                {/* DOB */}

                <div className="col-md-4 mb-3">

                  <label className="form-label">
                    Date of Birth *
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={dateOfBirth}
                    onChange={(e) =>
                      setDateOfBirth(e.target.value)
                    }
                  />

                </div>


                {/* GENDER */}

                <div className="col-md-4 mb-3">

                  <label className="form-label">
                    Gender
                  </label>

                  <select
                    className="form-select"
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value)
                    }
                  >
                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                  </select>

                </div>


                {/* JOURNEY */}

                <div className="col-md-4 mb-3">

                  <label className="form-label">
                    Journey Type
                  </label>

                  <select
                    className="form-select"
                    value={journeyType}
                    onChange={(e) =>
                      setJourneyType(e.target.value)
                    }
                  >

                    <option value="One Way">
                      One Way
                    </option>

                    <option value="Round Trip">
                      Round Trip
                    </option>

                  </select>

                </div>

              </div>


              <div className="row">


                {/* PHONE */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Phone *
                  </label>

                  <input
                    type="tel"
                    className="form-control"
                    placeholder="01700000000"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                  />

                </div>


                {/* EMAIL */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Email *
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />

                </div>

              </div>


              {/* TRAVEL CLASS */}

              <div className="mb-3">

                <label className="form-label">
                  Travel Class
                </label>

                <select
                  className="form-select"
                  value={travelClass}
                  onChange={(e) =>
                    setTravelClass(e.target.value)
                  }
                >

                  <option value="Economy">
                    Economy
                  </option>

                  <option value="Business">
                    Business
                  </option>

                </select>

              </div>


              {/* PASSENGERS */}

              <div className="row">

                <div className="col-md-4 mb-3">

                  <label className="form-label">
                    Adults
                  </label>

                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={adults}
                    onChange={(e) =>
                      setAdults(
                        Math.max(
                          1,
                          Number(e.target.value)
                        )
                      )
                    }
                  />

                </div>


                <div className="col-md-4 mb-3">

                  <label className="form-label">
                    Children
                  </label>

                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={children}
                    onChange={(e) =>
                      setChildren(
                        Math.max(
                          0,
                          Number(e.target.value)
                        )
                      )
                    }
                  />

                </div>


                <div className="col-md-4 mb-3">

                  <label className="form-label">
                    Infants
                  </label>

                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={infants}
                    onChange={(e) =>
                      setInfants(
                        Math.max(
                          0,
                          Number(e.target.value)
                        )
                      )
                    }
                  />

                </div>

              </div>


              <hr />


              {/* CONFIRM */}

              <button
                type="button"
                className="btn btn-success btn-lg w-100"
                disabled={loading}
                onClick={confirmBooking}
              >

                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                    />

                    Booking...
                  </>
                ) : (
                  <>
                    Confirm Booking — ৳{" "}
                    {totalAmount.toLocaleString()}
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}