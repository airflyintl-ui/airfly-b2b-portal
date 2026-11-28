"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import API from "../../../services/api";

type Airline = {
  id: number;
  name: string;
  code: string;
  logo?: string | null;
  status: boolean | number;
};

type AirlinesResponse = {
  success?: boolean;
  message?: string;
  airlines?: Airline[];
  data?: Airline[];
};

type ApiResponse = {
  success?: boolean;
  message?: string;
};

const API_URL = API.replace(/\/+$/, "");
const BACKEND_URL = API_URL.replace(/\/api$/, "");

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("admin_token") ||
    localStorage.getItem("token")
  );
}

async function getResponseData<T>(res: Response): Promise<T> {
  const text = await res.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Server returned an invalid response. HTTP ${res.status}`
    );
  }
}

export default function AirlinesPage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [logo, setLogo] = useState<File | null>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const getHeaders = useCallback(() => {
    const token = getToken();

    if (!token) {
      throw new Error("Admin login required. Please login again.");
    }

    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const loadAirlines = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/airlines`, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await getResponseData<AirlinesResponse>(res);

      if (!res.ok) {
        throw new Error(
          data.message || `Failed to load airlines. HTTP ${res.status}`
        );
      }

      const list = data.airlines || data.data || [];

      if (data.success === false) {
        throw new Error(data.message || "Unable to load airlines.");
      }

      setAirlines(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load airlines error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load airlines."
      );
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    void loadAirlines();
  }, [loadAirlines]);

  async function saveAirline(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    if (!name.trim() || !code.trim()) {
      alert("Please enter Airline Name and IATA Code.");
      return;
    }

    setSaving(true);

    const form = new FormData();
    form.append("name", name.trim());
    form.append("code", code.trim().toUpperCase());

    if (logo) {
      form.append("logo", logo);
    }

    try {
      const res = await fetch(`${API_URL}/airlines`, {
        method: "POST",
        headers: getHeaders(),
        body: form,
      });

      const data = await getResponseData<ApiResponse>(res);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || `Failed to save airline. HTTP ${res.status}`
        );
      }

      alert(data.message || "Airline saved successfully.");

      setName("");
      setCode("");
      setLogo(null);

      const fileInput = document.getElementById(
        "airline-logo"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";

      await loadAirlines();
    } catch (error) {
      console.error("Save airline error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save airline."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAirline(id: number) {
    if (!window.confirm("Delete this airline?")) return;

    try {
      const res = await fetch(`${API_URL}/airlines/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await getResponseData<ApiResponse>(res);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || `Failed to delete airline. HTTP ${res.status}`
        );
      }

      alert(data.message || "Airline deleted successfully.");

      await loadAirlines();
    } catch (error) {
      console.error("Delete airline error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete airline."
      );
    }
  }

  function openEdit(item: Airline) {
    setEditId(item.id);
    setEditName(item.name);
    setEditCode(item.code);
  }

  async function updateAirline() {
    if (editId === null || updating) return;

    if (!editName.trim() || !editCode.trim()) {
      alert("Please enter Airline Name and IATA Code.");
      return;
    }

    setUpdating(true);

    const form = new FormData();
    form.append("name", editName.trim());
    form.append("code", editCode.trim().toUpperCase());

    try {
      const res = await fetch(`${API_URL}/airlines/${editId}`, {
        method: "POST",
        headers: getHeaders(),
        body: form,
      });

      const data = await getResponseData<ApiResponse>(res);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || `Failed to update airline. HTTP ${res.status}`
        );
      }

      alert(data.message || "Airline updated successfully.");

      setEditId(null);
      await loadAirlines();
    } catch (error) {
      console.error("Update airline error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update airline."
      );
    } finally {
      setUpdating(false);
    }
  }

  const filteredAirlines = airlines.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fw-bold">Airline Management</h2>

        <input
          type="text"
          className="form-control"
          style={{ width: "280px" }}
          placeholder="Search Airline..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              Add Airline
            </div>

            <div className="card-body">
              <form onSubmit={saveAirline}>
                <div className="mb-3">
                  <label className="form-label">Airline Name</label>

                  <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Example: Air Arabia"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">IATA Code</label>

                  <input
                    className="form-control text-uppercase"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.toUpperCase())
                    }
                    placeholder="Example: G9"
                    maxLength={3}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Logo</label>

                  <input
                    id="airline-logo"
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) =>
                      setLogo(e.target.files?.[0] || null)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Airline"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-dark text-white">
              Airline List
            </div>

            <div className="card-body p-0 table-responsive">
              <table className="table table-hover table-bordered mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Logo</th>
                    <th>Status</th>
                    <th style={{ width: "180px" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredAirlines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No Airline Found
                      </td>
                    </tr>
                  ) : (
                    filteredAirlines.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.code}</td>

                        <td>
                          {item.logo ? (
                            <img
                              src={`${BACKEND_URL}/uploads/airlines/${item.logo}`}
                              width={50}
                              alt={`${item.name} logo`}
                            />
                          ) : (
                            "No Logo"
                          )}
                        </td>

                        <td>
                          {item.status ? (
                            <span className="badge bg-success">
                              Active
                            </span>
                          ) : (
                            <span className="badge bg-danger">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => openEdit(item)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteAirline(item.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {editId !== null && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            background: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Airline</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditId(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Airline Name</label>

                  <input
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">IATA Code</label>

                  <input
                    className="form-control"
                    value={editCode}
                    onChange={(e) =>
                      setEditCode(e.target.value.toUpperCase())
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditId(null)}
                  disabled={updating}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={updateAirline}
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update Airline"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
