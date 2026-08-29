"use client";

import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

type Agent = {
  id: number;
  agency_name: string;
  owner_name: string;
  email: string;
  phone: string;
  wallet: string | number;
  status: "active" | "inactive";
  created_at?: string;
};

const PER_PAGE = 10;

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [form, setForm] = useState({
    agency_name: "",
    owner_name: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
  });

  // =====================================================
  // LOAD AGENTS
  // =====================================================

  const loadAgents = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/agents`, {
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAgents(data.agents || []);
      } else {
        alert(data.message || "Unable to load agents");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to Laravel API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredAgents = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return agents;
    }

    return agents.filter((agent) => {
      return (
        agent.agency_name?.toLowerCase().includes(keyword) ||
        agent.owner_name?.toLowerCase().includes(keyword) ||
        agent.email?.toLowerCase().includes(keyword) ||
        agent.phone?.toLowerCase().includes(keyword) ||
        String(agent.id).includes(keyword)
      );
    });
  }, [agents, search]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAgents.length / PER_PAGE)
  );

  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // =====================================================
  // FORM
  // =====================================================

  const openAddModal = () => {
    setEditingAgent(null);

    setForm({
      agency_name: "",
      owner_name: "",
      email: "",
      phone: "",
      password: "",
      status: "active",
    });

    setShowModal(true);
  };

  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent);

    setForm({
      agency_name: agent.agency_name || "",
      owner_name: agent.owner_name || "",
      email: agent.email || "",
      phone: agent.phone || "",
      password: "",
      status: agent.status || "active",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      setEditingAgent(null);
    }
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // ADD / UPDATE
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.agency_name.trim()) {
      alert("Agency name is required");
      return;
    }

    if (!form.owner_name.trim()) {
      alert("Owner name is required");
      return;
    }

    if (!form.email.trim()) {
      alert("Email is required");
      return;
    }

    if (!form.phone.trim()) {
      alert("Phone is required");
      return;
    }

    if (!editingAgent && !form.password) {
      alert("Password is required");
      return;
    }

    try {
      setSaving(true);

      const url = editingAgent
        ? `${API}/agents/${editingAgent.id}`
        : `${API}/agents`;

      const method = editingAgent ? "PUT" : "POST";

      const body: Record<string, string> = {
        agency_name: form.agency_name,
        owner_name: form.owner_name,
        email: form.email,
        phone: form.phone,
        status: form.status,
      };

      if (form.password) {
        body.password = form.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(
          editingAgent
            ? "Agent Updated Successfully"
            : "Agent Created Successfully"
        );

        setShowModal(false);
        setEditingAgent(null);

        setForm({
          agency_name: "",
          owner_name: "",
          email: "",
          phone: "",
          password: "",
          status: "active",
        });

        await loadAgents();
      } else {
        if (data.errors) {
          const messages = Object.values(data.errors)
            .flat()
            .join("\n");

          alert(messages);
        } else {
          alert(data.message || "Operation failed");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to Laravel API");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this agent?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API}/agents/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Agent Deleted Successfully");
        await loadAgents();
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to Laravel API");
    }
  };

  // =====================================================
  // STATUS TOGGLE
  // =====================================================

  const toggleStatus = async (agent: Agent) => {
    const newStatus =
      agent.status === "active" ? "inactive" : "active";

    try {
      const response = await fetch(`${API}/agents/${agent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          agency_name: agent.agency_name,
          owner_name: agent.owner_name,
          email: agent.email,
          phone: agent.phone,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadAgents();
      } else {
        alert(data.message || "Status update failed");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to Laravel API");
    }
  };

  // =====================================================
  // WALLET TOTAL
  // =====================================================

  const totalWallet = agents.reduce(
    (total, agent) => total + Number(agent.wallet || 0),
    0
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Agent Management
          </h2>

          <p className="text-muted mb-0">
            Manage your B2B travel agents
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={loadAgents}
            disabled={loading}
          >
            🔄 Refresh
          </button>

          <button
            className="btn btn-primary"
            onClick={openAddModal}
          >
            + Add Agent
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Total Agents
              </small>

              <h3 className="fw-bold mt-2 mb-0">
                {agents.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Active Agents
              </small>

              <h3 className="fw-bold text-success mt-2 mb-0">
                {
                  agents.filter(
                    (agent) => agent.status === "active"
                  ).length
                }
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Total Agent Wallet
              </small>

              <h3 className="fw-bold text-primary mt-2 mb-0">
                ৳{" "}
                {totalWallet.toLocaleString("en-BD", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <div className="row align-items-center">

            <div className="col-md-8">
              <div className="input-group">

                <span className="input-group-text">
                  🔍
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by agency, owner, email, phone or ID..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>
            </div>

            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <span className="text-muted">
                Showing{" "}
                <strong>
                  {paginatedAgents.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {filteredAgents.length}
                </strong>{" "}
                agents
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

              <p className="mt-3 text-muted">
                Loading agents...
              </p>
            </div>
          ) : paginatedAgents.length === 0 ? (
            <div className="text-center py-5">

              <div
                style={{
                  fontSize: "50px",
                }}
              >
                👤
              </div>

              <h5 className="mt-3">
                No agents found
              </h5>

              <p className="text-muted">
                Try another search or add a new agent.
              </p>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>
                    <th className="px-4">
                      ID
                    </th>

                    <th>
                      Agency
                    </th>

                    <th>
                      Owner
                    </th>

                    <th>
                      Contact
                    </th>

                    <th>
                      Wallet
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-end px-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {paginatedAgents.map((agent) => (

                    <tr key={agent.id}>

                      <td className="px-4">
                        <strong>
                          #{agent.id}
                        </strong>
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {agent.agency_name}
                        </div>
                      </td>

                      <td>
                        {agent.owner_name}
                      </td>

                      <td>
                        <div>
                          {agent.email}
                        </div>

                        <small className="text-muted">
                          {agent.phone}
                        </small>
                      </td>

                      <td>
                        <strong className="text-primary">
                          ৳{" "}
                          {Number(
                            agent.wallet || 0
                          ).toLocaleString("en-BD", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </td>

                      <td>

                        <button
                          type="button"
                          className={`badge border-0 ${
                            agent.status === "active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                          onClick={() =>
                            toggleStatus(agent)
                          }
                        >
                          {agent.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </button>

                      </td>

                      <td className="text-end px-4">

                        <div className="btn-group">

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              openEditModal(agent)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(agent.id)
                            }
                          >
                            Delete
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

        {/* PAGINATION */}
        {!loading &&
          filteredAgents.length > PER_PAGE && (

            <div className="card-footer bg-white">

              <div className="d-flex justify-content-between align-items-center">

                <small className="text-muted">
                  Page {currentPage} of {totalPages}
                </small>

                <div className="btn-group">

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(1, page - 1)
                      )
                    }
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (

                    <button
                      key={page}
                      className={`btn btn-sm ${
                        currentPage === page
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() =>
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>

                  ))}

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                      )
                    }
                  >
                    Next
                  </button>

                </div>

              </div>

            </div>

          )}

      </div>

      {/* ================================================= */}
      {/* ADD / EDIT MODAL */}
      {/* ================================================= */}

      {showModal && (

        <div
          className="modal d-block"
          tabIndex={-1}
          style={{
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content border-0 shadow">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">

                  {editingAgent
                    ? "Edit Agent"
                    : "Add New Agent"}

                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={saving}
                />

              </div>

              <form onSubmit={handleSubmit}>

                <div className="modal-body">

                  <div className="row g-3">

                    {/* AGENCY */}
                    <div className="col-md-6">

                      <label className="form-label">
                        Agency Name
                      </label>

                      <input
                        type="text"
                        name="agency_name"
                        className="form-control"
                        value={form.agency_name}
                        onChange={handleChange}
                        placeholder="Agency name"
                        required
                      />

                    </div>

                    {/* OWNER */}
                    <div className="col-md-6">

                      <label className="form-label">
                        Owner Name
                      </label>

                      <input
                        type="text"
                        name="owner_name"
                        className="form-control"
                        value={form.owner_name}
                        onChange={handleChange}
                        placeholder="Owner name"
                        required
                      />

                    </div>

                    {/* EMAIL */}
                    <div className="col-md-6">

                      <label className="form-label">
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="agent@example.com"
                        required
                      />

                    </div>

                    {/* PHONE */}
                    <div className="col-md-6">

                      <label className="form-label">
                        Phone
                      </label>

                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="01XXXXXXXXX"
                        required
                      />

                    </div>

                    {/* PASSWORD */}
                    <div className="col-md-6">

                      <label className="form-label">

                        Password

                        {editingAgent && (
                          <small className="text-muted ms-2">
                            Leave blank to keep current password
                          </small>
                        )}

                      </label>

                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={form.password}
                        onChange={handleChange}
                        placeholder={
                          editingAgent
                            ? "New password"
                            : "Password"
                        }
                        required={!editingAgent}
                      />

                    </div>

                    {/* STATUS */}
                    <div className="col-md-6">

                      <label className="form-label">
                        Status
                      </label>

                      <select
                        name="status"
                        className="form-select"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="active">
                          Active
                        </option>

                        <option value="inactive">
                          Inactive
                        </option>
                      </select>

                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingAgent
                      ? "Update Agent"
                      : "Create Agent"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}