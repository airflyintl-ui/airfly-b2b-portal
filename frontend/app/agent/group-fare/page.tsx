"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../services/api";

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
};

type GroupFareRequest = {
  id: number;
  group_fare_offer_id: number;
  passenger_count: number;
  contact_person: string;
  contact_number: string;
  contact_email?: string | null;
  status: string;
  admin_note?: string | null;
  created_at?: string;
  offer?: GroupFareOffer;
};

type FormData = {
  offer_id: string;
  passenger_count: string;
  contact_person: string;
  contact_number: string;
  contact_email: string;
};

export default function AgentGroupFarePage() {
  const router = useRouter();

  const [offers, setOffers] = useState<GroupFareOffer[]>([]);
  const [requests, setRequests] = useState<GroupFareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [document, setDocument] = useState<File | null>(null);

  const [form, setForm] = useState<FormData>({
    offer_id: "",
    passenger_count: "1",
    contact_person: "",
    contact_number: "",
    contact_email: "",
  });

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [offerResponse, requestResponse] = await Promise.all([
        fetch(`${API}/group-fares`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API}/group-fare-requests`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (
        offerResponse.status === 401 ||
        offerResponse.status === 403 ||
        requestResponse.status === 401 ||
        requestResponse.status === 403
      ) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const offerData = await offerResponse.json();
      const requestData = await requestResponse.json();

      if (!offerResponse.ok) {
        throw new Error(
          offerData.message || "Unable to load Group Fare offers."
        );
      }

      if (!requestResponse.ok) {
        throw new Error(
          requestData.message || "Unable to load your requests."
        );
      }

      setOffers(
        Array.isArray(offerData.offers) ? offerData.offers : []
      );

      setRequests(
        Array.isArray(requestData.requests) ? requestData.requests : []
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedOffer = offers.find(
    (offer) => String(offer.id) === form.offer_id
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.offer_id) {
      setError("Please select a Group Fare offer.");
      return;
    }

    if (!form.contact_person.trim() || !form.contact_number.trim()) {
      setError("Contact person and contact number are required.");
      return;
    }

    const passengerCount = Number(form.passenger_count);

    if (!Number.isInteger(passengerCount) || passengerCount < 1) {
      setError("Please enter a valid passenger count.");
      return;
    }

    if (
      selectedOffer &&
      passengerCount > selectedOffer.available_seats
    ) {
      setError(
        `Only ${selectedOffer.available_seats} seats are currently available.`
      );
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const body = new FormData();
      body.append("offer_id", form.offer_id);
      body.append("passenger_count", String(passengerCount));
      body.append("contact_person", form.contact_person.trim());
      body.append("contact_number", form.contact_number.trim());

      if (form.contact_email.trim()) {
        body.append("contact_email", form.contact_email.trim());
      }

      if (document) {
        body.append("document", document);
      }

      const response = await fetch(`${API}/group-fare-requests`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            (data.errors
              ? Object.values(data.errors).flat().join(" ")
              : "Request submission failed.")
        );
      }

      setMessage(data.message || "Group Fare Request submitted successfully.");

      setForm({
        offer_id: "",
        passenger_count: "1",
        contact_person: "",
        contact_number: "",
        contact_email: "",
      });

      setDocument(null);

      const fileInput = window.document.getElementById(
        "groupFareDocument"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";

      await loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Request submission failed."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "-";

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

    return Number.isFinite(amount)
      ? `${amount.toLocaleString("en-US")} ${currency}`
      : `${fare} ${currency}`;
  };

  const statusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-success";
      case "rejected":
        return "bg-danger";
      default:
        return "bg-warning text-dark";
    }
  };

  return (
    <main className="container py-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Group Fare Management</h2>
          <p className="text-muted mb-0">
            View airline group fares and submit your booking requests.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => void loadData()}
          disabled={loading || saving}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-3">Loading Group Fare information...</p>
        </div>
      ) : (
        <>
          <section className="mb-5">
            <h4 className="fw-bold mb-3">Available Group Fare Offers</h4>

            {offers.length === 0 ? (
              <div className="border rounded-3 text-center p-4">
                <h5>No Published Offers Available</h5>
                <p className="text-muted mb-0">
                  Please check again later.
                </p>
              </div>
            ) : (
              <div className="row g-3">
                {offers.map((offer) => (
                  <div
                    className="col-12 col-md-6 col-lg-4"
                    key={offer.id}
                  >
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body p-4">
                        <span className="badge bg-primary mb-3">
                          GROUP FARE
                        </span>

                        <h5 className="fw-bold">
                          {offer.airline_name}
                        </h5>

                        <div className="d-flex justify-content-between align-items-center my-3">
                          <div>
                            <h3 className="fw-bold mb-0">
                              {offer.origin}
                            </h3>
                            <small className="text-muted">Origin</small>
                          </div>

                          <span className="text-primary fs-4">✈</span>

                          <div className="text-end">
                            <h3 className="fw-bold mb-0">
                              {offer.destination}
                            </h3>
                            <small className="text-muted">
                              Destination
                            </small>
                          </div>
                        </div>

                        <hr />

                        <p className="mb-2">
                          <small className="text-muted">Departure:</small>{" "}
                          <strong>
                            {formatDate(offer.departure_date)}
                          </strong>
                        </p>

                        {offer.return_date && (
                          <p className="mb-2">
                            <small className="text-muted">Return:</small>{" "}
                            <strong>
                              {formatDate(offer.return_date)}
                            </strong>
                          </p>
                        )}

                        <p className="mb-3">
                          <small className="text-muted">Seats:</small>{" "}
                          <strong>
                            {offer.available_seats} / {offer.total_seats}
                          </strong>
                        </p>

                        <div className="bg-light rounded-3 p-3">
                          <small className="text-muted">Group Fare</small>
                          <h4 className="fw-bold text-primary mb-0">
                            {formatFare(offer.fare, offer.currency)}
                          </h4>
                        </div>

                        {offer.description && (
                          <p className="small text-muted mt-3 mb-0">
                            {offer.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card shadow-sm border-0 mb-5">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-3">Submit Group Fare Request</h4>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Select Group Fare Offer *
                  </label>

                  <select
                    className="form-select"
                    value={form.offer_id}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        offer_id: event.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Choose an offer</option>
                    {offers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.airline_name} | {offer.origin} -{" "}
                        {offer.destination} |{" "}
                        {formatFare(offer.fare, offer.currency)} |{" "}
                        {offer.available_seats} seats
                      </option>
                    ))}
                  </select>
                </div>

                {selectedOffer && (
                  <div className="alert alert-info">
                    <strong>
                      {selectedOffer.airline_name}: {selectedOffer.origin} -{" "}
                      {selectedOffer.destination}
                    </strong>
                    <br />
                    Departure: {formatDate(selectedOffer.departure_date)}
                    <br />
                    Fare: {formatFare(
                      selectedOffer.fare,
                      selectedOffer.currency
                    )}
                    <br />
                    Available seats: {selectedOffer.available_seats}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Number of Passengers *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max={selectedOffer?.available_seats || undefined}
                      value={form.passenger_count}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          passenger_count: event.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.contact_person}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          contact_person: event.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={form.contact_number}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          contact_number: event.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.contact_email}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          contact_email: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Supporting Document (Optional)
                    </label>
                    <input
                      id="groupFareDocument"
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) =>
                        setDocument(event.target.files?.[0] || null)
                      }
                    />
                    <small className="text-muted">
                      PDF, JPG, JPEG or PNG. Maximum 5 MB.
                    </small>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary mt-4"
                  disabled={saving || offers.length === 0}
                >
                  {saving ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </div>
          </section>

          <section>
            <h4 className="fw-bold mb-3">My Group Fare Requests</h4>

            {requests.length === 0 ? (
              <div className="border rounded-3 text-center p-4">
                <p className="text-muted mb-0">
                  You have not submitted any Group Fare requests yet.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Request ID</th>
                      <th>Airline / Sector</th>
                      <th>Passengers</th>
                      <th>Request Date</th>
                      <th>Status</th>
                      <th>Admin Note</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>#{request.id}</td>
                        <td>
                          {request.offer?.airline_name || "Group Fare"}
                          <br />
                          <small className="text-muted">
                            {request.offer?.origin || ""} -{" "}
                            {request.offer?.destination || ""}
                          </small>
                        </td>
                        <td>{request.passenger_count}</td>
                        <td>{formatDate(request.created_at)}</td>
                        <td>
                          <span
                            className={`badge ${statusClass(request.status)}`}
                          >
                            {request.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{request.admin_note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
