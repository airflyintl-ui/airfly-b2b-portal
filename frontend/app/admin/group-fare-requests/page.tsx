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
  available_seats: number;
  total_seats: number;
};

type GroupFareRequest = {
  id: number;
  group_fare_offer_id: number;
  agent_id: number;
  passenger_count: number;
  contact_person: string;
  contact_number: string;
  contact_email?: string | null;
  document_path?: string | null;
  status: string;
  admin_note?: string | null;
  created_at?: string;
  updated_at?: string;
  offer?: GroupFareOffer;
  agent?: {
    id: number;
    name?: string;
    agency_name?: string;
    email?: string;
    phone?: string;
  };
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  requests?: GroupFareRequest[];
  request?: GroupFareRequest;
};

export default function AdminGroupFareRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<GroupFareRequest[]>([]);
  const [selected, setSelected] = useState<GroupFareRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch(`${API}/admin/group-fare-requests`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load Group Fare Requests.");
      }

      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading requests."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const formatDate = (date?: string | null) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatFare = (fare?: number | string, currency?: string) => {
    if (fare === undefined || fare === null) return "-";

    const amount = Number(fare);

    return Number.isFinite(amount)
      ? `${amount.toLocaleString("en-US")} ${currency || ""}`.trim()
      : `${fare} ${currency || ""}`.trim();
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

  const updateRequest = async (status: "approved" | "rejected") => {
    if (!selected) return;

    const actionLabel = status === "approved" ? "approve" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} Request #${selected.id}?`
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch(
        `${API}/admin/group-fare-requests/${selected.id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            admin_note: adminNote.trim() || null,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to ${actionLabel} this request.`
        );
      }

      setMessage(
        data.message ||
          `Group Fare Request #${selected.id} ${status} successfully.`
      );

      setSelected(null);
      setAdminNote("");

      await loadRequests();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update this request."
      );
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter(
          (request) => request.status.toLowerCase() === filter
        );

  const pendingCount = requests.filter(
    (request) => request.status.toLowerCase() === "pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status.toLowerCase() === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status.toLowerCase() === "rejected"
  ).length;

  return (
    <main className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Group Fare Requests</h2>
          <p className="text-muted mb-0">
            Review and manage agent Group Fare booking requests.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => router.push("/admin/group-fares")}
          >
            Manage Offers
          </button>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => void loadRequests()}
            disabled={loading || processing}
          >
            Refresh
          </button>
        </div>
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

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Total Requests</small>
              <h3 className="fw-bold mb-0">{requests.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Pending</small>
              <h3 className="fw-bold text-warning mb-0">{pendingCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Approved</small>
              <h3 className="fw-bold text-success mb-0">{approvedCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Rejected</small>
              <h3 className="fw-bold text-danger mb-0">{rejectedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h5 className="fw-bold mb-0">All Agent Requests</h5>

            <select
              className="form-select"
              style={{ maxWidth: "200px" }}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter requests by status"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="text-muted mt-3">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-5">
              <h6 className="fw-bold">No Group Fare Requests Found</h6>
              <p className="text-muted mb-0">
                No requests are available for this filter.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Request ID</th>
                    <th>Agent</th>
                    <th>Airline / Sector</th>
                    <th>Passengers</th>
                    <th>Fare</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="fw-semibold">#{request.id}</td>

                      <td>
                        <strong>
                          {request.agent?.agency_name ||
                            request.agent?.name ||
                            `Agent #${request.agent_id}`}
                        </strong>
                        {request.agent?.email && (
                          <small className="d-block text-muted">
                            {request.agent.email}
                          </small>
                        )}
                      </td>

                      <td>
                        <strong>
                          {request.offer?.airline_name || "Group Fare"}
                        </strong>
                        <small className="d-block text-muted">
                          {request.offer?.origin || "-"} -{" "}
                          {request.offer?.destination || "-"}
                        </small>
                      </td>

                      <td>{request.passenger_count}</td>

                      <td>
                        {formatFare(
                          request.offer?.fare,
                          request.offer?.currency
                        )}
                      </td>

                      <td>{formatDate(request.created_at)}</td>

                      <td>
                        <span
                          className={`badge ${statusClass(request.status)}`}
                        >
                          {request.status.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelected(request);
                            setAdminNote(request.admin_note || "");
                            setError("");
                            setMessage("");
                          }}
                        >
                          View / Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          aria-labelledby="requestDetailsTitle"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5
                  className="modal-title fw-bold"
                  id="requestDetailsTitle"
                >
                  Request Details #{selected.id}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setSelected(null)}
                />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <small className="text-muted">Agent / Agency</small>
                    <p className="fw-semibold mb-0">
                      {selected.agent?.agency_name ||
                        selected.agent?.name ||
                        `Agent #${selected.agent_id}`}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Agent Email</small>
                    <p className="fw-semibold mb-0">
                      {selected.agent?.email || "-"}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Airline</small>
                    <p className="fw-semibold mb-0">
                      {selected.offer?.airline_name || "Group Fare"}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Route</small>
                    <p className="fw-semibold mb-0">
                      {selected.offer?.origin || "-"} →{" "}
                      {selected.offer?.destination || "-"}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Departure Date</small>
                    <p className="fw-semibold mb-0">
                      {formatDate(selected.offer?.departure_date)}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Group Fare</small>
                    <p className="fw-semibold mb-0">
                      {formatFare(
                        selected.offer?.fare,
                        selected.offer?.currency
                      )}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Passenger Count</small>
                    <p className="fw-semibold mb-0">
                      {selected.passenger_count}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Request Date</small>
                    <p className="fw-semibold mb-0">
                      {formatDate(selected.created_at)}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Contact Person</small>
                    <p className="fw-semibold mb-0">
                      {selected.contact_person}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Contact Number</small>
                    <p className="fw-semibold mb-0">
                      {selected.contact_number}
                    </p>
                  </div>

                  <div className="col-12">
                    <small className="text-muted">Contact Email</small>
                    <p className="fw-semibold mb-0">
                      {selected.contact_email || "-"}
                    </p>
                  </div>

                  <div className="col-12">
                    <small className="text-muted">Current Status</small>
                    <p>
                      <span
                        className={`badge ${statusClass(selected.status)}`}
                      >
                        {selected.status.toUpperCase()}
                      </span>
                    </p>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Admin Note
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={adminNote}
                      onChange={(event) => setAdminNote(event.target.value)}
                      placeholder="Enter an optional note for this request"
                      disabled={
                        selected.status.toLowerCase() !== "pending" ||
                        processing
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelected(null)}
                  disabled={processing}
                >
                  Close
                </button>

                {selected.status.toLowerCase() === "pending" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => void updateRequest("rejected")}
                      disabled={processing}
                    >
                      {processing ? "Processing..." : "Reject Request"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => void updateRequest("approved")}
                      disabled={processing}
                    >
                      {processing ? "Processing..." : "Approve Request"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
