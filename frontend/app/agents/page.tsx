"use client";

import { useEffect, useState } from "react";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    agency_name: "",
    owner_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const loadAgents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/api/agents", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAgents(data.agents);
      } else {
        alert(data.message || "Cannot load agents");
      }
    } catch (error) {
      console.log(error);
      alert("API Error");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const createAgent = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Agent Created Successfully");

        setShowModal(false);

        setForm({
          agency_name: "",
          owner_name: "",
          email: "",
          phone: "",
          password: "",
        });

        loadAgents();
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      console.log(err);
      alert("API Error");
    }
  };

  const filteredAgents = agents.filter((agent) => {
    return (
      agent.agency_name.toLowerCase().includes(search.toLowerCase()) ||
      agent.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      agent.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-3">

        <h2>Agent Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Agent
        </button>

      </div>

      <input
        className="form-control mb-3"
        placeholder="Search Agent..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="table table-bordered table-hover">

        <thead className="table-dark">

          <tr>
            <th>ID</th>
            <th>Agency</th>
            <th>Owner</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Wallet</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {loading ? (
            <tr>
              <td colSpan={7}>Loading...</td>
            </tr>
          ) : filteredAgents.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">
                No Agent Found
              </td>
            </tr>
          ) : (
            filteredAgents.map((agent) => (
              <tr key={agent.id}>
                <td>{agent.id}</td>
                <td>{agent.agency_name}</td>
                <td>{agent.owner_name}</td>
                <td>{agent.email}</td>
                <td>{agent.phone}</td>
                <td>৳ {agent.wallet}</td>
                <td>
                  <span
                    className={`badge ${
                      agent.status === "active"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {agent.status}
                  </span>
                </td>
              </tr>
            ))
          )}

        </tbody>

      </table>

      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,.5)" }}
        >
          <div className="modal-dialog">

            <div className="modal-content">

              <div className="modal-header">

                <h5>Add New Agent</h5>

                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>

              </div>

              <div className="modal-body">

                <input
                  className="form-control mb-2"
                  placeholder="Agency Name"
                  value={form.agency_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      agency_name: e.target.value,
                    })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Owner Name"
                  value={form.owner_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      owner_name: e.target.value,
                    })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />

                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                />

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>

                <button
                  className="btn btn-primary"
                  onClick={createAgent}
                >
                  Save Agent
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}