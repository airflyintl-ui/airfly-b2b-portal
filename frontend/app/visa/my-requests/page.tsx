"use client";

import { useCallback, useEffect, useState } from "react";
import API from "../../../services/api";

type VisaDocument = {
  url?: string;
  public_id?: string;
};

type VisaRequest = {
  id: number;
  destination_country: string;
  visa_type: string;
  passenger_name: string;
  passport_number: string;
  email: string;
  mobile: string;
  remarks: string | null;
  documents: VisaDocument[] | null;
  visa_fee: string | number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: VisaRequest[] | VisaRequest;
};

export default function MyVisaRequestsPage() {
  const [requests, setRequests] = useState<VisaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<VisaRequest | null>(null);

  const [statusFilter, setStatusFilter] = useState("all");

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");

    return {
      Accept: "application/json",
      Authorization: `Bearer ${token || ""}`,
    };
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/visa-requests`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load your Visa Requests."
        );
      }

      const list = Array.isArray(result.data)
        ? result.data
        : result.data
          ? [result.data]
          : [];

      setRequests(list);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const filteredRequests = requests.filter((request) => {
    if (statusFilter === "all") return true;

    return request.status === statusFilter;
  });

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status: string) => {
    if (status === "approved") return "bg-success";

    if (status === "rejected") return "bg-danger";

    return "bg-warning text-dark";
  };

  const pendingCount = requests.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedCount = requests.filter(
    (item) => item.status === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (item) => item.status === "rejected"
  ).length;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            My Visa Requests
          </h2>

          <p className="text-muted mb-0">
            Track your submitted China Visa Applications.
          </p>
        </div>

        <a
          href="/visa"
          className="btn btn-success"
        >
          + New Visa Application
        </a>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted">
                Pending Requests
              </div>
              <h3 className="fw-bold text-warning mb-0">
                {pendingCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted">
                Approved Requests
              </div>
              <h3 className="fw-bold text-success mb-0">
                {approvedCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted">
                Rejected Requests
              </div>
              <h3 className="fw-bold text-danger mb-0">
                {rejectedCount}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-dark text-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0">
            My Applications
          </h5>

          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={() => void loadRequests()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Filter by Status
              </label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              Loading your Visa Requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="alert alert-info mb-0">
              No Visa Requests found.
              <div className="mt-3">
                <a
                  href="/visa"
                  className="btn btn-primary btn-sm"
                >
                  Submit Visa Application
                </a>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Request ID</th>
                    <th>Passenger Name</th>
                    <th>Passport</th>
                    <th>Visa Type</th>
                    <th>Visa Fee</th>
                    <th>Status</th>
                    <th>Submitted Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="fw-semibold">
                        #{request.id}
                      </td>

                      <td>{request.passenger_name}</td>

                      <td>{request.passport_number}</td>

                      <td>{request.visa_type}</td>

                      <td>
                        {request.currency}{" "}
                        {Number(request.visa_fee).toFixed(2)}
                      </td>

                      <td>
                        <span
                          className={`badge ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {request.status.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        {formatDate(request.created_at)}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            setSelectedRequest(request)
                          }
                        >
                          View Details
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

      {selectedRequest && (
        <div
          className="modal show d-block"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  Visa Request #{selectedRequest.id}
                </h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setSelectedRequest(null)}
                />
              </div>

              <div className="modal-body">
                <h6 className="fw-bold text-primary mb-3">
                  Application Information
                </h6>

                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>Passenger Name</strong>
                    <div>{selectedRequest.passenger_name}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Passport Number</strong>
                    <div>{selectedRequest.passport_number}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Email</strong>
                    <div>{selectedRequest.email}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Mobile</strong>
                    <div>{selectedRequest.mobile}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Destination</strong>
                    <div>{selectedRequest.destination_country}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Visa Type</strong>
                    <div>{selectedRequest.visa_type}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Visa Fee</strong>
                    <div>
                      {selectedRequest.currency}{" "}
                      {Number(selectedRequest.visa_fee).toFixed(2)}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Submitted Date</strong>
                    <div>
                      {formatDate(selectedRequest.created_at)}
                    </div>
                  </div>
                </div>

                <hr />

                <h6 className="fw-bold text-primary">
                  Application Status
                </h6>

                <span
                  className={`badge fs-6 ${getStatusClass(
                    selectedRequest.status
                  )}`}
                >
                  {selectedRequest.status.toUpperCase()}
                </span>

                {selectedRequest.reviewed_at && (
                  <p className="mt-2 mb-0">
                    <strong>Reviewed At:</strong>{" "}
                    {formatDate(selectedRequest.reviewed_at)}
                  </p>
                )}

                <hr />

                <h6 className="fw-bold text-primary">
                  Admin Note
                </h6>

                <div className="alert alert-info">
                  {selectedRequest.admin_note ||
                    "No Admin Note available yet."}
                </div>

                <hr />

                <h6 className="fw-bold text-primary">
                  Remarks
                </h6>

                <p>
                  {selectedRequest.remarks ||
                    "No remarks provided."}
                </p>

                <hr />

                <h6 className="fw-bold text-primary mb-3">
                  Uploaded Documents
                </h6>

                {Array.isArray(selectedRequest.documents) &&
                selectedRequest.documents.length > 0 ? (
                  <div className="list-group">
                    {selectedRequest.documents.map(
                      (document, index) => (
                        <div
                          key={`${document.public_id || "document"}-${index}`}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span>
                            Document {index + 1}
                          </span>

                          {document.url ? (
                            <a
                              href={document.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary"
                            >
                              View Document
                            </a>
                          ) : (
                            <span className="text-muted">
                              Unavailable
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted">
                    No documents available.
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
