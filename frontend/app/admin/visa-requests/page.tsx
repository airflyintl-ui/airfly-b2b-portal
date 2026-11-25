"use client";

import { useCallback, useEffect, useState } from "react";
import API from "../../../services/api";

type VisaDocument = {
  url?: string;
  public_id?: string;
  resource_type?: string;
};

type VisaRequest = {
  id: number;
  agent_id: number;
  visa_information_id: number | null;
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

type PaginationData = {
  data?: VisaRequest[];
  current_page?: number;
  last_page?: number;
  total?: number;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: VisaRequest[] | PaginationData | VisaRequest;
  current_page?: number;
  last_page?: number;
  total?: number;
};

export default function AdminVisaRequestsPage() {
  const [requests, setRequests] = useState<VisaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedRequest, setSelectedRequest] =
    useState<VisaRequest | null>(null);

  const [adminNote, setAdminNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("admin_token");

    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    };
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
      });

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `${API}/admin/visa-requests?${params.toString()}`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load Visa Requests."
        );
      }

      /*
       * Laravel pagination can return:
       *
       * result.data.data
       * result.data.current_page
       * result.data.last_page
       * result.data.total
       *
       * Some APIs may return a direct array instead.
       */

      const payload = result.data;

      let rows: VisaRequest[] = [];
      let pagination: PaginationData = {};

      if (Array.isArray(payload)) {
      rows = payload;

      pagination = {
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
      };
    }
      } else if (
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray(payload.data)
      ) {
        rows = payload.data;
        pagination = payload;
      } else if (
        payload &&
        typeof payload === "object" &&
        "id" in payload
      ) {
        rows = [payload as VisaRequest];
        pagination = result;
      }

      setRequests(rows);

      setLastPage(
        Number(
          pagination.last_page ??
          result.last_page ??
          1
        )
      );

      setTotal(
        Number(
          pagination.total ??
          result.total ??
          rows.length
        )
      );
    } catch (err) {
      setRequests([]);
      setTotal(0);
      setLastPage(1);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, getHeaders]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleSearch = () => {
    setPage(1);
    setMessage("");
    setError("");
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("pending");
    setPage(1);
    setSelectedRequest(null);
    setAdminNote("");
    setMessage("");
    setError("");
  };

  const handleView = (request: VisaRequest) => {
    setSelectedRequest(request);
    setAdminNote(request.admin_note || "");
    setError("");
  };

  const handleReview = async (
    status: "approved" | "rejected"
  ) => {
    if (!selectedRequest) return;

    if (
      status === "rejected" &&
      !adminNote.trim()
    ) {
      setError("Please enter a reason for rejection.");
      return;
    }

    const confirmed = window.confirm(
      status === "approved"
        ? "Are you sure you want to approve this Visa Request?"
        : "Are you sure you want to reject this Visa Request?"
    );

    if (!confirmed) return;

    try {
      setUpdatingId(selectedRequest.id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API}/admin/visa-requests/${selectedRequest.id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            status,
            admin_note: adminNote.trim(),
          }),
        }
      );

      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update Visa Request."
        );
      }

      setMessage(
        status === "approved"
          ? "Visa Request Approved Successfully."
          : "Visa Request Rejected Successfully."
      );

      setSelectedRequest(null);
      setAdminNote("");

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFee = (
    fee: string | number,
    currency: string
  ) => {
    const amount = Number(fee);

    if (!Number.isFinite(amount)) {
      return `${currency} 0.00`;
    }

    return `${currency} ${amount.toFixed(2)}`;
  };

  const statusBadge = (status: string) => {
    if (status === "approved") {
      return "bg-success";
    }

    if (status === "rejected") {
      return "bg-danger";
    }

    return "bg-warning text-dark";
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            Visa Request Management
          </h2>

          <p className="text-muted mb-0">
            Review Agent Visa Applications and Documents
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          All Destinations
        </span>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Search Request
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Passenger, Passport or Mobile"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Request Status
              </label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Requests</option>
              </select>
            </div>

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>

            <div className="col-md-3">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handleReset}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted">
                Total Matching Requests
              </div>

              <h3 className="fw-bold mb-0">{total}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted">
                Current Page
              </div>

              <h3 className="fw-bold mb-0">{page}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted">
                Total Pages
              </div>

              <h3 className="fw-bold mb-0">{lastPage}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Visa Applications
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
          {loading ? (
            <div className="text-center py-5">
              Loading Visa Requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="alert alert-info mb-0">
              No Visa Requests found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Passenger</th>
                    <th>Destination</th>
                    <th>Passport</th>
                    <th>Visa Type</th>
                    <th>Mobile</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>#{request.id}</td>

                      <td className="fw-semibold">
                        {request.passenger_name}
                      </td>

                      <td>
                        {request.destination_country || "-"}
                      </td>

                      <td>
                        {request.passport_number || "-"}
                      </td>

                      <td>
                        {request.visa_type || "-"}
                      </td>

                      <td>
                        {request.mobile || "-"}
                      </td>

                      <td>
                        {formatFee(
                          request.visa_fee,
                          request.currency
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge ${statusBadge(
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
                          onClick={() => handleView(request)}
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

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((previous) => previous - 1)
              }
            >
              Previous
            </button>

            <span className="text-muted">
              Page {page} of {lastPage}
            </span>

            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={page >= lastPage || loading}
              onClick={() =>
                setPage((previous) => previous + 1)
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
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
                  Passenger Information
                </h6>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <strong>Passenger Name</strong>
                    <div>
                      {selectedRequest.passenger_name || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Passport Number</strong>
                    <div>
                      {selectedRequest.passport_number || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Email</strong>
                    <div>
                      {selectedRequest.email || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Mobile</strong>
                    <div>
                      {selectedRequest.mobile || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Destination</strong>
                    <div>
                      {selectedRequest.destination_country || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Visa Type</strong>
                    <div>
                      {selectedRequest.visa_type || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Visa Fee</strong>
                    <div>
                      {formatFee(
                        selectedRequest.visa_fee,
                        selectedRequest.currency
                      )}
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

                <h6 className="fw-bold text-primary mb-2">
                  Passenger Remarks
                </h6>

                <p className="text-muted">
                  {selectedRequest.remarks || "No remarks provided."}
                </p>

                <hr />

                <h6 className="fw-bold text-primary mb-3">
                  Uploaded Documents
                </h6>

                {Array.isArray(selectedRequest.documents) &&
                selectedRequest.documents.length > 0 ? (
                  <div className="list-group mb-4">
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
                              Document URL unavailable
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    No documents uploaded.
                  </div>
                )}

                <hr />

                <h6 className="fw-bold text-primary mb-2">
                  Admin Review
                </h6>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Admin Note / Rejection Reason
                  </label>

                  <textarea
                    className="form-control"
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Write admin note or rejection reason..."
                    disabled={
                      selectedRequest.status !== "pending"
                    }
                  />
                </div>

                {selectedRequest.status !== "pending" && (
                  <div className="alert alert-info">
                    This request has already been reviewed.
                    <br />

                    <strong>Status:</strong>{" "}
                    {selectedRequest.status.toUpperCase()}
                    <br />

                    <strong>Admin Note:</strong>{" "}
                    {selectedRequest.admin_note || "No note"}
                    <br />

                    <strong>Reviewed At:</strong>{" "}
                    {selectedRequest.reviewed_at
                      ? formatDate(selectedRequest.reviewed_at)
                      : "-"}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                  disabled={updatingId !== null}
                >
                  Close
                </button>

                {selectedRequest.status === "pending" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() =>
                        void handleReview("rejected")
                      }
                      disabled={updatingId !== null}
                    >
                      {updatingId === selectedRequest.id
                        ? "Processing..."
                        : "Reject Request"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() =>
                        void handleReview("approved")
                      }
                      disabled={updatingId !== null}
                    >
                      {updatingId === selectedRequest.id
                        ? "Processing..."
                        : "Approve Request"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
