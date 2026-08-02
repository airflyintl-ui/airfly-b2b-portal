"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";

interface Booking {
  id: number;
  pnr: string;
  passenger_name: string;
  airline: string;
  amount: number;
  status: string;
}

interface DashboardData {
  success: boolean;
  wallet: number;
  total_agents: number;
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  pending_recharge: number;
  recent_bookings: Booking[];
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState<DashboardData>({
    success: false,
    wallet: 0,
    total_agents: 0,
    total_bookings: 0,
    confirmed_bookings: 0,
    cancelled_bookings: 0,
    pending_recharge: 0,
    recent_bookings: [],
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token = localStorage.getItem("token");

    console.log("========== ADMIN DASHBOARD ==========");
    console.log("TOKEN:", token);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/dashboard",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("STATUS:", response.status);

      const data = await response.json();

      console.log("API RESPONSE:", data);

      if (response.ok && data.success) {
        setDashboard(data);
      } else {
        alert(data.message || "Dashboard Load Failed");
      }
    } catch (error) {
      console.error("FETCH ERROR:", error);
      alert("Unable to connect API");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <AdminSidebar />

      <div
        className="flex-grow-1"
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
          background: "#f5f6fa",
        }}
      >
        <AdminNavbar />

        <div className="container-fluid p-4">
          <h2 className="fw-bold mb-4">Admin Dashboard</h2>

          <div className="row g-4">
            <div className="col-lg-2 col-md-4">
              <div className="card bg-primary text-white shadow border-0">
                <div className="card-body text-center">
                  <h6>Total Wallet</h6>
                  <h3>৳ {dashboard.wallet}</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4">
              <div className="card bg-success text-white shadow border-0">
                <div className="card-body text-center">
                  <h6>Total Agents</h6>
                  <h3>{dashboard.total_agents}</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4">
              <div className="card bg-warning shadow border-0">
                <div className="card-body text-center">
                  <h6>Bookings</h6>
                  <h3>{dashboard.total_bookings}</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4">
              <div className="card bg-info text-white shadow border-0">
                <div className="card-body text-center">
                  <h6>Confirmed</h6>
                  <h3>{dashboard.confirmed_bookings}</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4">
              <div className="card bg-danger text-white shadow border-0">
                <div className="card-body text-center">
                  <h6>Cancelled</h6>
                  <h3>{dashboard.cancelled_bookings}</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4">
              <div className="card bg-secondary text-white shadow border-0">
                <div className="card-body text-center">
                  <h6>Recharge</h6>
                  <h3>{dashboard.pending_recharge}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow border-0 mt-4">
            <div className="card-header d-flex justify-content-between">
              <h5 className="mb-0">Recent Bookings</h5>

              <button
                className="btn btn-primary btn-sm"
                onClick={loadDashboard}
              >
                Refresh
              </button>
            </div>

            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>PNR</th>
                    <th>Passenger</th>
                    <th>Airline</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.recent_bookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        No Booking Found
                      </td>
                    </tr>
                  ) : (
                    dashboard.recent_bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.pnr}</td>
                        <td>{booking.passenger_name}</td>
                        <td>{booking.airline}</td>
                        <td>৳ {booking.amount}</td>
                        <td>
                          <span
                            className={
                              booking.status === "Confirmed"
                                ? "badge bg-success"
                                : "badge bg-danger"
                            }
                          >
                            {booking.status}
                          </span>
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
    </div>
  );
}