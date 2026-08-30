"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";

export default function Dashboard() {
  const router = useRouter();

  const [agent, setAgent] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/dashboard`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await response.json();

        console.log("Dashboard API Response:", data);

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("agent");

          router.push("/login");
          return;
        }

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load dashboard.");
          return;
        }

        if (data.agent) {
          setAgent(data.agent);

          localStorage.setItem(
            "agent",
            JSON.stringify(data.agent)
          );
        }

        setDashboard(data);
      } catch (error) {
        console.error("Dashboard Error:", error);

        setError(
          "Cannot connect to Laravel API. Please check the backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-3">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h5 className="fw-bold">
            Dashboard Error
          </h5>

          <p className="mb-3">
            {error}
          </p>

          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!agent || !dashboard) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          No dashboard data found.
        </div>
      </div>
    );
  }

  const cards = dashboard.cards || {};

  const latestBookings =
    dashboard.latest_bookings || [];

  const latestRecharges =
    dashboard.latest_recharges || [];

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Welcome, {agent.owner_name || "Agent"}
          </h2>

          <p className="text-muted mb-0">
            {agent.agency_name || "-"}
          </p>
        </div>

        <div>
          <span className="badge bg-success px-3 py-2 text-capitalize">
            {agent.status || "active"}
          </span>
        </div>

      </div>


      {/* DASHBOARD CARDS */}

      <div className="row g-3">

        {/* WALLET */}

        <div className="col-xl-3 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>
                  <h6 className="text-muted mb-2">
                    Wallet Balance
                  </h6>

                  <h3 className="fw-bold text-success mb-0">
                    ৳ {cards.wallet_balance ?? "0.00"}
                  </h3>
                </div>

                <div className="fs-2">
                  💰
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* BOOKINGS */}

        <div className="col-xl-3 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>
                  <h6 className="text-muted mb-2">
                    My Bookings
                  </h6>

                  <h3 className="fw-bold mb-0">
                    {cards.total_bookings ?? 0}
                  </h3>
                </div>

                <div className="fs-2">
                  ✈️
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* PENDING RECHARGES */}

        <div className="col-xl-3 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>
                  <h6 className="text-muted mb-2">
                    Pending Recharge
                  </h6>

                  <h3 className="fw-bold text-warning mb-0">
                    {cards.pending_recharges ?? 0}
                  </h3>
                </div>

                <div className="fs-2">
                  ⏳
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* APPROVED RECHARGES */}

        <div className="col-xl-3 col-md-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>
                  <h6 className="text-muted mb-2">
                    Approved Recharge
                  </h6>

                  <h3 className="fw-bold text-primary mb-0">
                    {cards.approved_recharges ?? 0}
                  </h3>
                </div>

                <div className="fs-2">
                  ✅
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* AGENCY INFORMATION */}

      <div className="card shadow-sm border-0 mt-4">

        <div className="card-body">

          <h5 className="fw-bold mb-4">
            Agency Information
          </h5>

          <div className="row">

            <div className="col-md-6 col-lg-3 mb-3">
              <small className="text-muted">
                Agency Name
              </small>

              <div className="fw-semibold">
                {agent.agency_name || "-"}
              </div>
            </div>


            <div className="col-md-6 col-lg-3 mb-3">
              <small className="text-muted">
                Owner Name
              </small>

              <div className="fw-semibold">
                {agent.owner_name || "-"}
              </div>
            </div>


            <div className="col-md-6 col-lg-3 mb-3">
              <small className="text-muted">
                Email
              </small>

              <div className="fw-semibold">
                {agent.email || "-"}
              </div>
            </div>


            <div className="col-md-6 col-lg-3 mb-3">
              <small className="text-muted">
                Phone
              </small>

              <div className="fw-semibold">
                {agent.phone || "-"}
              </div>
            </div>


            <div className="col-md-6 col-lg-3">

              <small className="text-muted">
                Account Status
              </small>

              <div>
                <span className="badge bg-success text-capitalize">
                  {agent.status || "-"}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ACTION BUTTONS */}

      <div className="mt-4 d-flex gap-2 flex-wrap">

        <button
          className="btn btn-primary"
          onClick={() =>
            router.push("/search-flight")
          }
        >
          ✈️ Search Flight
        </button>


        <button
          className="btn btn-success"
          onClick={() =>
            router.push("/bookings")
          }
        >
          📋 My Bookings
        </button>


        <button
          className="btn btn-warning"
          onClick={() =>
            router.push("/wallet/statement")
          }
        >
          💰 Wallet Statement
        </button>


        <button
          className="btn btn-info text-white"
          onClick={() =>
            router.push("/recharge")
          }
        >
          💳 Recharge
        </button>

      </div>


      {/* LATEST BOOKINGS */}

      <div className="card shadow-sm border-0 mt-5">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h5 className="fw-bold mb-0">
              Latest Bookings
            </h5>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() =>
                router.push("/bookings")
              }
            >
              View All
            </button>

          </div>


          {latestBookings.length === 0 ? (

            <div className="text-center py-4">

              <p className="text-muted mb-0">
                No bookings found.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>
                    <th>ID</th>
                    <th>PNR</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>

                </thead>

                <tbody>

                  {latestBookings.map(
                    (booking: any) => (

                      <tr key={booking.id}>

                        <td>
                          {booking.id}
                        </td>

                        <td className="fw-semibold">
                          {booking.pnr || "-"}
                        </td>

                        <td>

                          <span className="badge bg-secondary">
                            {booking.status || "-"}
                          </span>

                        </td>

                        <td>
                          ৳ {booking.amount ?? "0.00"}
                        </td>

                        <td>

                          {booking.created_at
                            ? new Date(
                                booking.created_at
                              ).toLocaleDateString()
                            : "-"}

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


      {/* LATEST RECHARGES */}

      <div className="card shadow-sm border-0 mt-4">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h5 className="fw-bold mb-0">
              Latest Recharges
            </h5>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() =>
                router.push("/recharge")
              }
            >
              View All
            </button>

          </div>


          {latestRecharges.length === 0 ? (

            <div className="text-center py-4">

              <p className="text-muted mb-0">
                No recharge found.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>

                </thead>

                <tbody>

                  {latestRecharges.map(
                    (recharge: any) => (

                      <tr key={recharge.id}>

                        <td>
                          {recharge.id}
                        </td>

                        <td className="fw-semibold">
                          ৳ {recharge.amount ?? "0.00"}
                        </td>

                        <td>

                          <span
                            className={
                              recharge.status ===
                              "Approved"
                                ? "badge bg-success"
                                : recharge.status ===
                                  "Pending"
                                ? "badge bg-warning text-dark"
                                : "badge bg-secondary"
                            }
                          >
                            {recharge.status || "-"}
                          </span>

                        </td>

                        <td>

                          {recharge.created_at
                            ? new Date(
                                recharge.created_at
                              ).toLocaleDateString()
                            : "-"}

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
  );
}