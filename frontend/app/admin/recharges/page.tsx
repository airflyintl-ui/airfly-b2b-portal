"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";

type Agent = {
  id: number;
  agency_name: string;
  owner_name: string;
  email: string;
  mobile?: string;
  address?: string;
};

type Recharge = {
  id: number;
  agent_id: number;
  amount: string | number;
  payment_method: string;
  transaction_id: string;
  slip?: string | null;
  status: "Pending" | "Approved" | "Rejected";
  created_at?: string;
  agent?: Agent;
};

export default function AdminRechargesPage() {
  const router = useRouter();

  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ADMIN AUTH HEADER
  const getAdminHeaders = () => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.replace("/admin/login");
      throw new Error("Admin session expired. Please login again.");
    }

    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // CHECK ADMIN AUTHORIZATION
  const handleAuthFailure = (status: number) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem("admin_token");
      router.replace("/admin/login");
      return true;
    }

    return false;
  };

  // LOAD RECHARGES
  const loadRecharges = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/admin/recharges`, {
        method: "GET",
        headers: getAdminHeaders(),
        cache: "no-store",
      });

      const data = await response.json();

      if (handleAuthFailure(response.status)) {
        return;
      }

      if (response.ok && data.success) {
        setRecharges(data.recharges || []);
      } else {
        console.error("Recharge API Error:", data);

        alert(
          data.message ||
            `Unable to load recharges. HTTP ${response.status}`
        );
      }
    } catch (error) {
      console.error("LOAD RECHARGES ERROR:", error);

      if (
        error instanceof Error &&
        error.message.includes("Admin session expired")
      ) {
        return;
      }

      alert(
        error instanceof Error
          ? error.message
          : "Cannot connect to Laravel API"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadRecharges();
  }, [loadRecharges]);

  // FILTER
  const filteredRecharges = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return recharges.filter((recharge) => {
      const matchesStatus =
        statusFilter === "All" ||
        recharge.status === statusFilter;

      if (!matchesStatus) return false;
      if (!keyword) return true;

      return (
        String(recharge.id).includes(keyword) ||
        String(recharge.agent_id).includes(keyword) ||
        recharge.transaction_id?.toLowerCase().includes(keyword) ||
        recharge.payment_method?.toLowerCase().includes(keyword) ||
        recharge.agent?.agency_name?.toLowerCase().includes(keyword) ||
        recharge.agent?.owner_name?.toLowerCase().includes(keyword) ||
        recharge.agent?.email?.toLowerCase().includes(keyword) ||
        recharge.agent?.mobile?.toLowerCase().includes(keyword)
      );
    });
  }, [recharges, search, statusFilter]);

  // SUMMARY
  const pendingRecharges = recharges.filter(
    (item) => item.status === "Pending"
  );

  const approvedRecharges = recharges.filter(
    (item) => item.status === "Approved"
  );

  const rejectedRecharges = recharges.filter(
    (item) => item.status === "Rejected"
  );

  const pendingAmount = pendingRecharges.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const approvedAmount = approvedRecharges.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  // APPROVE
  const approveRecharge = async (id: number) => {
    if (!confirm("Are you sure you want to approve this recharge?")) {
      return;
    }

    try {
      setProcessingId(id);

      const response = await fetch(
        `${API}/recharges/${id}/approve`,
        {
          method: "POST",
          headers: getAdminHeaders(),
        }
      );

      const data = await response.json();

      if (handleAuthFailure(response.status)) {
        return;
      }

      if (response.ok && data.success) {
        alert(data.message || "Recharge Approved Successfully");
        await loadRecharges();
      } else {
        alert(
          data.message ||
            `Recharge approval failed. HTTP ${response.status}`
        );
      }
    } catch (error) {
      console.error("APPROVE ERROR:", error);

      if (
        error instanceof Error &&
        error.message.includes("Admin session expired")
      ) {
        return;
      }

      alert(
        error instanceof Error
          ? error.message
          : "Cannot connect to Laravel API"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // REJECT
  const rejectRecharge = async (id: number) => {
    if (!confirm("Are you sure you want to reject this recharge?")) {
      return;
    }

    try {
      setProcessingId(id);

      const response = await fetch(
        `${API}/recharges/${id}/reject`,
        {
          method: "POST",
          headers: getAdminHeaders(),
        }
      );

      const data = await response.json();

      if (handleAuthFailure(response.status)) {
        return;
      }

      if (response.ok && data.success) {
        alert(data.message || "Recharge Rejected Successfully");
        await loadRecharges();
      } else {
        alert(
          data.message ||
            `Recharge rejection failed. HTTP ${response.status}`
        );
      }
    } catch (error) {
      console.error("REJECT ERROR:", error);

      if (
        error instanceof Error &&
        error.message.includes("Admin session expired")
      ) {
        return;
      }

      alert(
        error instanceof Error
          ? error.message
          : "Cannot connect to Laravel API"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // DATE FORMAT
  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // STATUS BADGE
  const statusBadge = (status: Recharge["status"]) => {
    if (status === "Approved") {
      return <span className="badge bg-success">Approved</span>;
    }

    if (status === "Rejected") {
      return <span className="badge bg-danger">Rejected</span>;
    }

    return (
      <span className="badge bg-warning text-dark">
        Pending
      </span>
    );
  };

  // UI
  return (
    <div
      className="flex-grow-1"
      style={{
        marginLeft: "250px",
        minHeight: "100vh",
        background: "#f5f6fa",
      }}
    >
      <div className="container-fluid p-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              Recharge Management
            </h2>

            <p className="text-muted mb-0">
              Review and manage agent wallet recharge requests
            </p>
          </div>

          <button
            className="btn btn-outline-primary"
            onClick={loadRecharges}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="row g-3 mb-4">

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <small className="text-muted">Total Requests</small>
                <h3 className="fw-bold mt-2 mb-0">
                  {recharges.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <small className="text-muted">Pending Requests</small>
                <h3 className="fw-bold text-warning mt-2 mb-0">
                  {pendingRecharges.length}
                </h3>
                <small className="text-muted">
                  ৳{" "}
                  {pendingAmount.toLocaleString("en-BD", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <small className="text-muted">Approved</small>
                <h3 className="fw-bold text-success mt-2 mb-0">
                  {approvedRecharges.length}
                </h3>
                <small className="text-muted">
                  ৳{" "}
                  {approvedAmount.toLocaleString("en-BD", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <small className="text-muted">Rejected</small>
                <h3 className="fw-bold text-danger mt-2 mb-0">
                  {rejectedRecharges.length}
                </h3>
              </div>
            </div>
          </div>

        </div>

        {/* FILTER */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-center">

              <div className="col-lg-7">
                <div className="input-group">
                  <span className="input-group-text">🔍</span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search agency, owner, email, transaction ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-lg-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="col-lg-2 text-lg-end">
                <span className="text-muted">
                  {filteredRecharges.length} result
                  {filteredRecharges.length !== 1 ? "s" : ""}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">

            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                />

                <p className="text-muted mt-3 mb-0">
                  Loading recharge requests...
                </p>
              </div>
            ) : filteredRecharges.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: "50px" }}>💳</div>

                <h5 className="mt-3">
                  No recharge requests found
                </h5>

                <p className="text-muted mb-0">
                  There are no recharge requests matching your search.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light">
                    <tr>
                      <th className="px-4">ID</th>
                      <th>Agent</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Transaction ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-end px-4">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecharges.map((recharge) => (
                      <tr key={recharge.id}>

                        <td className="px-4">
                          <strong>#{recharge.id}</strong>
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {recharge.agent?.agency_name ||
                              `Agent #${recharge.agent_id}`}
                          </div>

                          <small className="text-muted">
                            {recharge.agent?.owner_name || ""}
                          </small>

                          <br />

                          <small className="text-muted">
                            {recharge.agent?.email || ""}
                          </small>

                          <br />

                          <small className="text-muted">
                            {recharge.agent?.mobile || ""}
                          </small>
                        </td>

                        <td>
                          <strong className="text-primary">
                            ৳{" "}
                            {Number(recharge.amount).toLocaleString(
                              "en-BD",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </strong>
                        </td>

                        <td>{recharge.payment_method}</td>

                        <td>
                          <code>{recharge.transaction_id}</code>
                        </td>

                        <td>
                          <small>
                            {formatDate(recharge.created_at)}
                          </small>
                        </td>

                        <td>{statusBadge(recharge.status)}</td>

                        <td className="text-end px-4">
                          {recharge.status === "Pending" ? (
                            <div className="btn-group">

                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                disabled={processingId !== null}
                                onClick={() =>
                                  approveRecharge(recharge.id)
                                }
                              >
                                {processingId === recharge.id
                                  ? "Processing..."
                                  : "Approve"}
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                disabled={processingId !== null}
                                onClick={() =>
                                  rejectRecharge(recharge.id)
                                }
                              >
                                Reject
                              </button>

                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
