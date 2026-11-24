"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../services/api";

type Agent = {
  id: number;
  agency_name?: string | null;
  owner_name?: string | null;
  email?: string | null;
  mobile?: string | null;
  trade_license?: string | null;
  status?: string | null;
};

type AgentsResponse = {
  success?: boolean;
  message?: string;
  agents?: Agent[];
};

type AgentUpdateResponse = {
  success?: boolean;
  message?: string;
  agent?: Agent;
};

type PasswordResetResponse = {
  success?: boolean;
  message?: string;
  errors?: { password?: string[] };
};

export default function AdminAgents() {
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  const [resetAgent, setResetAgent] = useState<Agent | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const loadAgents = useCallback(async () => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/agents`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = (await response.json()) as AgentsResponse;

      if (response.status === 401 || response.status === 403) {
        setError("Admin authorization failed. Please login again.");
        return;
      }

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to load agents.");
        return;
      }

      setAgents(data.agents || []);
    } catch (err) {
      console.error(err);
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAgents();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAgents]);

  const updateStatus = async (
    id: number,
    status: "approved" | "pending" | "rejected"
  ) => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to change this agent status to ${status}?`
    );

    if (!confirmed) return;

    try {
      setUpdating(id);

      const response = await fetch(`${API}/agents/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = (await response.json()) as AgentUpdateResponse;

      if (!response.ok || !data.success || !data.agent) {
        alert(data.message || "Unable to update agent.");
        return;
      }

      setAgents((previous) =>
        previous.map((agent) =>
          agent.id === id
            ? { ...agent, status: data.agent?.status }
            : agent
        )
      );

      alert("Agent status updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Cannot connect to backend.");
    } finally {
      setUpdating(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetAgent) return;

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reset password for ${resetAgent.email}?`
    );

    if (!confirmed) return;

    try {
      setResetting(true);

      const response = await fetch(
        `${API}/agents/${resetAgent.id}/reset-password`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: newPassword,
            password_confirmation: confirmPassword,
          }),
        }
      );

      const data = (await response.json()) as PasswordResetResponse;

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            data.errors?.password?.[0] ||
            "Unable to reset password."
        );
        return;
      }

      alert("Agent password reset successfully.");

      setResetAgent(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      alert("Cannot connect to backend.");
    } finally {
      setResetting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "approved") return "badge bg-success";
    if (status === "rejected") return "badge bg-danger";
    return "badge bg-warning text-dark";
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Loading Agents...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold">Agent Management</h2>
          <p className="text-muted mb-0">
            AIR FLY INTERNATIONAL - B2B Agents
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() => router.push("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn btn-sm btn-primary ms-3"
            onClick={() => void loadAgents()}
          >
            Retry
          </button>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">All Agents</h5>
            <span className="badge bg-primary">Total: {agents.length}</span>
          </div>

          {agents.length === 0 ? (
            <div className="text-center text-muted py-5">
              No agents found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Agency</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Trade License</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      <td>{agent.id}</td>
                      <td>{agent.agency_name || "-"}</td>
                      <td>{agent.owner_name || "-"}</td>
                      <td>{agent.email || "-"}</td>
                      <td>{agent.mobile || "-"}</td>
                      <td>{agent.trade_license || "-"}</td>
                      <td>
                        <span className={statusBadge(agent.status || "pending")}>
                          {agent.status || "pending"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            disabled={updating === agent.id || agent.status === "approved"}
                            onClick={() => updateStatus(agent.id, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            disabled={updating === agent.id || agent.status === "pending"}
                            onClick={() => updateStatus(agent.id, "pending")}
                          >
                            Pending
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            disabled={updating === agent.id || agent.status === "rejected"}
                            onClick={() => updateStatus(agent.id, "rejected")}
                          >
                            Reject
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setResetAgent(agent);
                              setNewPassword("");
                              setConfirmPassword("");
                            }}
                          >
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {resetAgent && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Reset Agent Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  disabled={resetting}
                  onClick={() => setResetAgent(null)}
                />
              </div>

              <div className="modal-body">
                <p>
                  Agent: <strong>{resetAgent.agency_name || "-"}</strong>
                </p>
                <p>
                  Email: <strong>{resetAgent.email || "-"}</strong>
                </p>

                <label className="form-label fw-semibold">New Password</label>
                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Enter new password (minimum 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                />

                <label className="form-label fw-semibold">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                />

                <small className="text-muted d-block mt-2">
                  Password must contain at least 8 characters.
                </small>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  disabled={resetting}
                  onClick={() => setResetAgent(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={
                    resetting ||
                    newPassword.length < 8 ||
                    newPassword !== confirmPassword
                  }
                  onClick={handleResetPassword}
                >
                  {resetting ? "Resetting..." : "Save New Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
