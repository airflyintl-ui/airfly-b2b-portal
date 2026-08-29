"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import API from "../../../services/api";

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

const emptyDashboard: DashboardData = {
  success: false,
  wallet: 0,
  total_agents: 0,
  total_bookings: 0,
  confirmed_bookings: 0,
  cancelled_bookings: 0,
  pending_recharge: 0,
  recent_bookings: [],
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [dashboard, setDashboard] =
    useState<DashboardData>(emptyDashboard);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setError("");

      if (!loading) {
        setRefreshing(true);
      }

      const token = localStorage.getItem("token");

      console.log("========== ADMIN DASHBOARD ==========");
      console.log("API:", `${API}/admin/dashboard`);
      console.log("TOKEN:", token ? "Available" : "Not Found");

      const headers: HeadersInit = {
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API}/admin/dashboard`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      console.log("STATUS:", response.status);

      const data = await response.json();

      console.log("API RESPONSE:", data);

      if (response.ok && data.success) {
        setDashboard({
          success: true,
          wallet: Number(data.wallet || 0),
          total_agents: Number(data.total_agents || 0),
          total_bookings: Number(data.total_bookings || 0),
          confirmed_bookings: Number(
            data.confirmed_bookings || 0
          ),
          cancelled_bookings: Number(
            data.cancelled_bookings || 0
          ),
          pending_recharge: Number(
            data.pending_recharge || 0
          ),
          recent_bookings: data.recent_bookings || [],
        });
      } else {
        setError(
          data.message || "Dashboard Load Failed"
        );
      }
    } catch (error) {
      console.error("FETCH ERROR:", error);

      setError(
        "Unable to connect to Laravel API."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const formatMoney = (amount: number) => {
    return Number(amount || 0).toLocaleString(
      "en-BD",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background: "#f5f6fa",
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="mt-3 text-muted">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        background: "#f5f6fa",
      }}
    >
      <div
        className="flex-grow-1"
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
        }}
      >
        <AdminNavbar />

        <div className="container-fluid p-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">
                Admin Dashboard
              </h2>

              <p className="text-muted mb-0">
                Air Fly International B2B Portal
              </p>
            </div>

            <button
              className="btn btn-outline-primary"
              onClick={loadDashboard}
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "🔄 Refresh"}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div
              className="alert alert-danger d-flex justify-content-between align-items-center"
              role="alert"
            >
              <span>{error}</span>

              <button
                className="btn btn-sm btn-danger"
                onClick={loadDashboard}
              >
                Retry
              </button>
            </div>
          )}

          {/* SUMMARY CARDS */}
          <div className="row g-4">

            {/* WALLET */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">
                    Total Wallet
                  </div>

                  <h3 className="fw-bold text-primary mt-2 mb-0">
                    ৳{" "}
                    {formatMoney(
                      dashboard.wallet
                    )}
                  </h3>
                </div>
              </div>
            </div>

            {/* AGENTS */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">
                    Total Agents
                  </div>

                  <h3 className="fw-bold text-success mt-2 mb-0">
                    {dashboard.total_agents}
                  </h3>
                </div>
              </div>
            </div>

            {/* BOOKINGS */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">
                    Total Bookings
                  </div>

                  <h3 className="fw-bold text-warning mt-2 mb-0">
                    {dashboard.total_bookings}
                  </h3>
                </div>
              </div>
            </div>

            {/* CONFIRMED */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">
                    Confirmed
                  </div>

                  <h3 className="fw-bold text-info mt-2 mb-0">
                    {dashboard.confirmed_bookings}
                  </h3>
                </div>
              </div>
            </div>

            {/* CANCELLED */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">
                    Cancelled
                  </div>

                  <h3 className="fw-bold text-danger mt-2 mb-0">
                    {dashboard.cancelled_bookings}
                  </h3>
                </div>
              </div>
            </div>

            {/* RECHARGE */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">
                    Pending Recharge
                  </div>

                  <h3 className="fw-bold text-secondary mt-2 mb-0">
                    {dashboard.pending_recharge}
                  </h3>
                </div>
              </div>
            </div>

          </div>

          {/* RECENT BOOKINGS */}
          <div className="card border-0 shadow-sm mt-4">

            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <div>
                <h5 className="fw-bold mb-0">
                  Recent Bookings
                </h5>

                <small className="text-muted">
                  Latest booking activity
                </small>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={loadDashboard}
                disabled={refreshing}
              >
                {refreshing
                  ? "Loading..."
                  : "Refresh"}
              </button>
            </div>

            <div className="card-body p-0">

              {dashboard.recent_bookings.length ===
              0 ? (
                <div className="text-center py-5">
                  <div
                    style={{
                      fontSize: "45px",
                    }}
                  >
                    ✈️
                  </div>

                  <h5 className="mt-3">
                    No Booking Found
                  </h5>

                  <p className="text-muted mb-0">
                    Recent bookings will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">

                  <table className="table table-hover align-middle mb-0">

                    <thead className="table-light">
                      <tr>
                        <th className="px-4">
                          PNR
                        </th>

                        <th>
                          Passenger
                        </th>

                        <th>
                          Airline
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboard.recent_bookings.map(
                        (booking) => (
                          <tr key={booking.id}>

                            <td className="px-4">
                              <strong>
                                {booking.pnr}
                              </strong>
                            </td>

                            <td>
                              {booking.passenger_name}
                            </td>

                            <td>
                              {booking.airline}
                            </td>

                            <td>
                              <strong>
                                ৳{" "}
                                {formatMoney(
                                  booking.amount
                                )}
                              </strong>
                            </td>

                            <td>
                              <span
                                className={`badge ${
                                  booking.status ===
                                  "Confirmed"
                                    ? "bg-success"
                                    : booking.status ===
                                      "Cancelled"
                                    ? "bg-danger"
                                    : "bg-warning text-dark"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </td>

                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}