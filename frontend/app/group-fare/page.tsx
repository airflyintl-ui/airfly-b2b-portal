"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import API from "../../services/api";

type GroupFareOffer = {
  id: number;
  airline_name: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string | null;
  fare: number | string;
  currency: string;
  total_seats: number;
  available_seats: number;
  description?: string | null;
  terms_conditions?: string | null;
  status: string;
};

type ApiResponse = {
  success?: boolean;
  offers?: GroupFareOffer[];
  message?: string;
};

export default function PublicGroupFarePage() {
  const [offers, setOffers] = useState<GroupFareOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/public/group-fares`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load Group Fare offers.");
      }

      setOffers(Array.isArray(data.offers) ? data.offers : []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const formatDate = (date: string) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatFare = (fare: number | string, currency: string) => {
    const amount = Number(fare);

    if (!Number.isFinite(amount)) return `${fare} ${currency}`;

    return `${amount.toLocaleString("en-US")} ${currency}`;
  };

  return (
    <main className="container py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold mb-2">Group Fare Offers</h1>
        <p className="text-muted mb-0">
          Explore special airline group fares and request your seats.
        </p>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1">Available Group Fares</h4>
          <p className="text-muted mb-0">
            Special offers from Air Fly International
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => void loadOffers()}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Offers"}
        </button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            aria-label="Loading"
          />
          <p className="text-muted mt-3">Loading Group Fare offers...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">
          <strong>Unable to load offers.</strong>
          <p className="mb-2">{error}</p>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => void loadOffers()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && offers.length === 0 && (
        <div className="text-center border rounded-3 p-5">
          <h5 className="fw-bold">No Group Fare Offers Available</h5>
          <p className="text-muted mb-0">
            There are currently no published Group Fare offers.
            Please check again later.
          </p>
        </div>
      )}

      {!loading && !error && offers.length > 0 && (
        <div className="row g-4">
          {offers.map((offer) => (
            <div className="col-12 col-md-6 col-lg-4" key={offer.id}>
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <span className="badge bg-primary">
                      GROUP FARE
                    </span>
                    <span className="badge bg-success">
                      {offer.available_seats} Seats Available
                    </span>
                  </div>

                  <h5 className="fw-bold mb-3">
                    {offer.airline_name}
                  </h5>

                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h3 className="fw-bold mb-0">{offer.origin}</h3>
                      <small className="text-muted">Origin</small>
                    </div>

                    <div className="text-primary fs-4">✈</div>

                    <div className="text-end">
                      <h3 className="fw-bold mb-0">{offer.destination}</h3>
                      <small className="text-muted">Destination</small>
                    </div>
                  </div>

                  <hr />

                  <div className="mb-3">
                    <small className="text-muted d-block">
                      Departure Date
                    </small>
                    <strong>{formatDate(offer.departure_date)}</strong>
                  </div>

                  {offer.return_date && (
                    <div className="mb-3">
                      <small className="text-muted d-block">
                        Return Date
                      </small>
                      <strong>{formatDate(offer.return_date)}</strong>
                    </div>
                  )}

                  <div className="mb-3">
                    <small className="text-muted d-block">
                      Available Seats
                    </small>
                    <strong>
                      {offer.available_seats} / {offer.total_seats}
                    </strong>
                  </div>

                  <div className="bg-light rounded-3 p-3 mb-3">
                    <small className="text-muted d-block">
                      Group Fare
                    </small>
                    <h3 className="fw-bold text-primary mb-0">
                      {formatFare(offer.fare, offer.currency)}
                    </h3>
                  </div>

                  {offer.description && (
                    <p className="text-muted small mb-3">
                      {offer.description}
                    </p>
                  )}

                  {offer.terms_conditions && (
                    <details className="small mb-3">
                      <summary className="fw-semibold">
                        Terms & Conditions
                      </summary>
                      <p className="text-muted mt-2 mb-0">
                        {offer.terms_conditions}
                      </p>
                    </details>
                  )}

                  <Link
                    href="/login"
                    className="btn btn-primary w-100"
                  >
                    Agent Login to Request
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-5">
        <p className="text-muted small mb-0">
          Air Fly International | B2B Travel Portal
        </p>
      </div>
    </main>
  );
}
