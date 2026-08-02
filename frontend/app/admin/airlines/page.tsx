"use client";

import { useEffect, useState } from "react";

export default function AirlinesPage() {

  const [airlines, setAirlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [logo, setLogo] = useState<File | null>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  useEffect(() => {
    loadAirlines();
  }, []);

  async function loadAirlines() {

    const token = localStorage.getItem("token");

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/airlines",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setAirlines(data.airlines);
      }

    } catch (err) {
      console.log(err);
    }

    setLoading(false);

  }

  async function saveAirline(e: React.FormEvent) {

    e.preventDefault();

    const token = localStorage.getItem("token");

    const form = new FormData();

    form.append("name", name);
    form.append("code", code);

    if (logo) {
      form.append("logo", logo);
    }

    const res = await fetch(
      "http://127.0.0.1:8000/api/airlines",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      }
    );

    const data = await res.json();

    alert(data.message);

    if (data.success) {

      setName("");
      setCode("");
      setLogo(null);

      loadAirlines();

    }

  }

  async function deleteAirline(id: number) {

    if (!confirm("Delete this airline?")) return;

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://127.0.0.1:8000/api/airlines/${id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    alert(data.message);

    if (data.success) {

      loadAirlines();

    }

  }

  function openEdit(item: any) {

    setEditId(item.id);

    setEditName(item.name);

    setEditCode(item.code);

  }

  async function updateAirline() {

    if (!editId) return;

    const token = localStorage.getItem("token");

    const form = new FormData();

    form.append("name", editName);
    form.append("code", editCode);

    const res = await fetch(
      `http://127.0.0.1:8000/api/airlines/${editId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      }
    );

    const data = await res.json();

    alert(data.message);

    if (data.success) {

      setEditId(null);

      loadAirlines();

    }

  }

  const filteredAirlines = airlines.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.code.toLowerCase().includes(search.toLowerCase())
  );

  return (<div className="container-fluid py-4">

  <div className="d-flex justify-content-between align-items-center mb-4">

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

    {/* Add Airline */}

    <div className="col-lg-4">

      <div className="card shadow">

        <div className="card-header bg-primary text-white">
          Add Airline
        </div>

        <div className="card-body">

          <form onSubmit={saveAirline}>

            <div className="mb-3">

              <label className="form-label">
                Airline Name
              </label>

              <input
                className="form-control"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                required
              />

            </div>

            <div className="mb-3">

              <label className="form-label">
                IATA Code
              </label>

              <input
                className="form-control"
                value={code}
                onChange={(e)=>setCode(e.target.value)}
                required
              />

            </div>

            <div className="mb-3">

              <label className="form-label">
                Logo
              </label>

              <input
                type="file"
                className="form-control"
                onChange={(e)=>setLogo(e.target.files?.[0] || null)}
              />

            </div>

            <button
              className="btn btn-success w-100"
            >
              Save Airline
            </button>

          </form>

        </div>

      </div>

    </div>

    {/* Airline Table */}

    <div className="col-lg-8">

      <div className="card shadow">

        <div className="card-header bg-dark text-white">
          Airline List
        </div>

        <div className="card-body p-0">

          <table className="table table-hover table-bordered mb-0">

            <thead className="table-dark">

              <tr>

                <th>ID</th>
                <th>Name</th>
                <th>Code</th>
                <th>Logo</th>
                <th>Status</th>
                <th style={{ width: '180px' }}>Action</th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={6}
                    className="text-center"
                  >
                    Loading...
                  </td>

                </tr>

              ) : filteredAirlines.length===0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="text-center"
                  >
                    No Airline Found
                  </td>

                </tr>

              ) : (

                filteredAirlines.map((item:any)=>(

                  <tr key={item.id}>

                    <td>{item.id}</td>

                    <td>{item.name}</td>

                    <td>{item.code}</td>

                    <td>

                      {item.logo ? (

                        <img
                          src={`http://127.0.0.1:8000/uploads/airlines/${item.logo}`}
                          width={50}
                          alt=""
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
                        className="btn btn-primary btn-sm me-2"
                        onClick={()=>openEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={()=>deleteAirline(item.id)}
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

  </div>      {/* Edit Airline Modal */}

      {editId && (
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

                <h5>Edit Airline</h5>

                <button
                  className="btn-close"
                  onClick={() => setEditId(null)}
                ></button>

              </div>

              <div className="modal-body">

                <div className="mb-3">

                  <label className="form-label">
                    Airline Name
                  </label>

                  <input
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />

                </div>

                <div className="mb-3">

                  <label className="form-label">
                    IATA Code
                  </label>

                  <input
                    className="form-control"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                  />

                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() => setEditId(null)}
                >
                  Close
                </button>

                <button
                  className="btn btn-success"
                  onClick={updateAirline}
                >
                  Update Airline
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}