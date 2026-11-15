"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../services/api";

export default function AdminAgents() {
  const router = useRouter();

  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  const loadAgents = async () => {
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

      const data = await response.json();

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
  };

  useEffect(() => {
    loadAgents();
  }, []);

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

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to update agent.");
        return;
      }

      setAgents((previous) =>
        previous.map((agent) =>
          agent.id === id
            ? { ...agent, status: data.agent.status }
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

  const statusBadge = (status: string) => {
    if (status === "approved") {
      return "badge bg-success";
    }

    if (status === "rejected") {
      return "badge bg-danger";
    }

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
            onClick={loadAgents}
          >
            Retry
          </button>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">All Agents</h5>
            <span className="badge bg-primary">
              Total: {agents.length}
            </span>
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
                        <span className={statusBadge(agent.status)}>
                          {agent.status || "pending"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            disabled={
                              updating === agent.id ||
                              agent.status === "approved"
                            }
                            onClick={() =>
                              updateStatus(agent.id, "approved")
                            }
                          >
                            Approve
                          </button>

                          <button
                            className="btn btn-sm btn-warning"
                            disabled={
                              updating === agent.id ||
                              agent.status === "pending"
                            }
                            onClick={() =>
                              updateStatus(agent.id, "pending")
                            }
                          >
                            Pending
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            disabled={
                              updating === agent.id ||
                              agent.status === "rejected"
                            }
                            onClick={() =>
                              updateStatus(agent.id, "rejected")
                            }
                          >
                            Reject
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
    </div>
  );
}
