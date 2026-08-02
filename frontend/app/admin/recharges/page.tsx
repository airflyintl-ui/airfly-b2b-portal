"use client";

import { useEffect, useState } from "react";

export default function AdminRechargePage() {
  const [recharges, setRecharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecharges();
  }, []);

  async function loadRecharges() {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/admin/recharges",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setRecharges(data.recharges);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  async function approve(id: number) {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://127.0.0.1:8000/api/recharges/${id}/approve`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    alert(data.message);

    if (data.success) {
      loadRecharges();
    }
  }

  async function reject(id: number) {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://127.0.0.1:8000/api/recharges/${id}/reject`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    alert(data.message);

    if (data.success) {
      loadRecharges();
    }
  }

  return (
    <div className="container py-4">

      <h2 className="mb-4 fw-bold">
        Recharge Management
      </h2>

      <div className="card shadow">

        <div className="card-body">

          <table className="table table-bordered table-hover">

            <thead className="table-dark">

              <tr>
                <th>ID</th>
                <th>Agent ID</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Date</th>
              <th style={{ width: "240px" }}>Action</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan={7} className="text-center">
                    Loading...
                  </td>
                </tr>

              ) : recharges.length === 0 ? (

                <tr>
                  <td colSpan={7} className="text-center">
                    No Recharge Found
                  </td>
                </tr>

              ) : (

                recharges.map((item) => (

                  <tr key={item.id}>

                    <td>{item.id}</td>

                    <td>{item.agent_id}</td>

                    <td>৳ {item.amount}</td>

                    <td>{item.payment_reference}</td>

                    <td>

                      {item.status === "Pending" && (
                        <span className="badge bg-warning text-dark">
                          Pending
                        </span>
                      )}

                      {item.status === "Approved" && (
                        <span className="badge bg-success">
                          Approved
                        </span>
                      )}

                      {item.status === "Rejected" && (
                        <span className="badge bg-danger">
                          Rejected
                        </span>
                      )}

                    </td>

                    <td>{item.created_at}</td>

                    <td>

                      {item.status === "Pending" ? (

                        <div className="d-flex gap-2">

                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => approve(item.id)}
                          >
                            Approve
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => reject(item.id)}
                          >
                            Reject
                          </button>

                        </div>

                      ) : (

                        "-"
                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}