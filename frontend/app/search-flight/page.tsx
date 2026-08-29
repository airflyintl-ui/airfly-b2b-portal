"use client";

import { useState } from "react";

export default function SearchFlightPage() {

    const [tripType, setTripType] =
        useState("roundtrip");

    const [from, setFrom] =
        useState("DAC");

    const [to, setTo] =
        useState("DXB");

    const [departureDate, setDepartureDate] =
        useState("");

    const [returnDate, setReturnDate] =
        useState("");

    const [adults, setAdults] =
        useState(1);

    const [children, setChildren] =
        useState(0);

    const [infants, setInfants] =
        useState(0);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [results, setResults] =
        useState<any>(null);


    const searchFlights = async () => {

        setError("");
        setResults(null);

        if (!from || from.length !== 3) {
            setError(
                "Please enter a valid 3-letter origin airport code."
            );
            return;
        }

        if (!to || to.length !== 3) {
            setError(
                "Please enter a valid 3-letter destination airport code."
            );
            return;
        }

        if (!departureDate) {
            setError(
                "Please select departure date."
            );
            return;
        }

        if (
            tripType === "roundtrip"
            && !returnDate
        ) {
            setError(
                "Please select return date."
            );
            return;
        }

        if (from.toUpperCase() === to.toUpperCase()) {
            setError(
                "Origin and destination cannot be the same."
            );
            return;
        }

        if (infants > adults) {
            setError(
                "Infants cannot be more than adults."
            );
            return;
        }

        setLoading(true);

        try {

            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL;

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
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",
                    },

                    body: JSON.stringify({

                        from:
                            from.toUpperCase(),

                        to:
                            to.toUpperCase(),

                        departure_date:
                            departureDate,

                        return_date:
                            tripType === "roundtrip"
                                ? returnDate
                                : null,

                        trip_type:
                            tripType,

                        adults:
                            Number(adults),

                        children:
                            Number(children),

                        infants:
                            Number(infants),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Flight search failed."
                );
            }

            if (!data.success) {

                throw new Error(
                    data.message ||
                    "No flight result received."
                );
            }

            setResults(data);

        } catch (err: any) {

            setError(
                err.message ||
                "Cannot connect to Laravel API."
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="container py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">
                        Search Flight
                    </h2>

                    <p className="text-muted mb-0">
                        Search live flights from Travelport GDS
                    </p>

                </div>

            </div>


            {/* SEARCH BOX */}

            <div className="card shadow-sm border-0">

                <div className="card-body p-4">

                    {/* TRIP TYPE */}

                    <div className="mb-4">

                        <div className="form-check form-check-inline">

                            <input
                                className="form-check-input"
                                type="radio"
                                checked={
                                    tripType === "roundtrip"
                                }
                                onChange={() =>
                                    setTripType(
                                        "roundtrip"
                                    )
                                }
                            />

                            <label className="form-check-label">
                                Round Trip
                            </label>

                        </div>


                        <div className="form-check form-check-inline">

                            <input
                                className="form-check-input"
                                type="radio"
                                checked={
                                    tripType === "oneway"
                                }
                                onChange={() =>
                                    setTripType(
                                        "oneway"
                                    )
                                }
                            />

                            <label className="form-check-label">
                                One Way
                            </label>

                        </div>

                    </div>


                    <div className="row g-3">

                        {/* FROM */}

                        <div className="col-md-3">

                            <label className="form-label fw-semibold">
                                From
                            </label>

                            <input
                                type="text"
                                className="form-control form-control-lg"
                                value={from}
                                maxLength={3}
                                onChange={(e) =>
                                    setFrom(
                                        e.target.value
                                            .toUpperCase()
                                    )
                                }
                                placeholder="DAC"
                            />

                            <small className="text-muted">
                                Airport code
                            </small>

                        </div>


                        {/* TO */}

                        <div className="col-md-3">

                            <label className="form-label fw-semibold">
                                To
                            </label>

                            <input
                                type="text"
                                className="form-control form-control-lg"
                                value={to}
                                maxLength={3}
                                onChange={(e) =>
                                    setTo(
                                        e.target.value
                                            .toUpperCase()
                                    )
                                }
                                placeholder="DXB"
                            />

                            <small className="text-muted">
                                Airport code
                            </small>

                        </div>


                        {/* DEPARTURE */}

                        <div className="col-md-3">

                            <label className="form-label fw-semibold">
                                Departure
                            </label>

                            <input
                                type="date"
                                className="form-control form-control-lg"
                                value={departureDate}
                                onChange={(e) =>
                                    setDepartureDate(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        {/* RETURN */}

                        {tripType === "roundtrip" && (

                            <div className="col-md-3">

                                <label className="form-label fw-semibold">
                                    Return
                                </label>

                                <input
                                    type="date"
                                    className="form-control form-control-lg"
                                    value={returnDate}
                                    onChange={(e) =>
                                        setReturnDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        )}

                    </div>


                    {/* PASSENGERS */}

                    <div className="row g-3 mt-2">

                        <div className="col-md-3">

                            <label className="form-label">
                                Adults
                            </label>

                            <input
                                type="number"
                                min="1"
                                max="9"
                                className="form-control"
                                value={adults}
                                onChange={(e) =>
                                    setAdults(
                                        Number(
                                            e.target.value
                                        )
                                    )
                                }
                            />

                        </div>


                        <div className="col-md-3">

                            <label className="form-label">
                                Children
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="9"
                                className="form-control"
                                value={children}
                                onChange={(e) =>
                                    setChildren(
                                        Number(
                                            e.target.value
                                        )
                                    )
                                }
                            />

                        </div>


                        <div className="col-md-3">

                            <label className="form-label">
                                Infants
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="9"
                                className="form-control"
                                value={infants}
                                onChange={(e) =>
                                    setInfants(
                                        Number(
                                            e.target.value
                                        )
                                    )
                                }
                            />

                        </div>


                        <div className="col-md-3 d-flex align-items-end">

                            <button
                                type="button"
                                className="btn btn-primary btn-lg w-100"
                                onClick={searchFlights}
                                disabled={loading}
                            >

                                {loading
                                    ? "Searching..."
                                    : "Search Flights"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="alert alert-danger mt-4">

                    <strong>
                        Search Error:
                    </strong>{" "}

                    {error}

                </div>

            )}


            {/* RESULTS */}

            {results && (

                <div className="mt-4">

                    <div className="card border-0 shadow-sm">

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
                                        fontSize: "12px"
                                    }}
                                >
                                    {JSON.stringify(
                                        results,
                                        null,
                                        2
                                    )}
                                </pre>

                            </details>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}