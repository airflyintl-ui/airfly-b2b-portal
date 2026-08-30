"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";

export default function Dashboard() {
  const router = useRouter();

  const [agent, setAgent] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const response = await fetch(`${API}/dashboard`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        console.log("Dashboard API:", data);

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("agent");

          router.push("/login");
          return;
        }

        if (!response.ok || !data.success) {
          alert(data.message || "Unable to load dashboard");
          return;
        }

        setAgent(data.agent);
        setDashboard(data);
      } catch (error) {
        console.error("Dashboard Error:", error);

        alert(
          "Cannot connect to Laravel API.\n\nPlease check the backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        Loading dashboard...
      </div>
    );
  }

  if (!agent || !dashboard) {
    return null;
  }

  const cards = dashboard.cards || {};

  return (
    <div className="container py-5">

      {/* HEADER */}

      <div className="mb-4">
        <h2 className="fw-bold">
          Welcome, {agent.owner_name}
        </h2>

        <p className="text-muted mb-0">
          {agent.agency_name}
        </p>
      </div>


      {/* DASHBOARD CARDS */}

      <div className="row">

        {/* WALLET */}

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <h6 className="text-muted">
                Wallet Balance
              </h6>

              <h3 className="fw-bold text-success">
                ৳ {cards.wallet_balance || "0.00"}
              </h3>

            </div>
          </div>
        </div>


        {/* BOOKINGS */}

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <h6 className="text-muted">
                My Bookings
              </h6>

              <h3 className="fw-bold">
                {cards.total_bookings || 0}
              </h3>

            </div>
          </div>
        </div>


        {/* PENDING RECHARGES */}

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <h6 className="text-muted">
                Pending Recharge
              </h6>

              <h3 className="fw-bold text-warning">
                {cards.pending_recharges || 0}
              </h3>

            </div>
          </div>
        </div>


        {/* APPROVED RECHARGES */}

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <h6 className="text-muted">
                Approved Recharge
              </h6>

              <h3 className="fw-bold text-primary">
                {cards.approved_recharges || 0}
              </h3>

            </div>
          </div>
        </div>

      </div>


      {/* AGENT INFORMATION */}

      <div className="card shadow-sm border-0 mt-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Agency Information
          </h5>

          <div className="row">

            <div className="col-md-6 mb-2">
              <strong>Agency:</strong>{" "}
              {agent.agency_name}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Owner:</strong>{" "}
              {agent.owner_name}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Email:</strong>{" "}
              {agent.email}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Phone:</strong>{" "}
              {agent.phone}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Status:</strong>{" "}

              <span className="badge bg-success">
                {agent.status}
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ACTION BUTTONS */}

      <div className="mt-4 d-flex gap-3 flex-wrap">

        <button
          className="btn btn-primary"
          onClick={() => router.push("/search-flight")}
        >
          Search Flight
        </button>

        <button
          className="btn btn-success"
          onClick={() => router.push("/bookings")}
        >
          My Bookings
        </button>

        <button
          className="btn btn-warning"
          onClick={() => router.push("/wallet/statement")}
        >
          Wallet
        </button>

        <button
          className="btn btn-info"
          onClick={() => router.push("/recharge")}
        >
          Recharge
        </button>

      </div>


      {/* LATEST BOOKINGS */}

      <div className="card shadow-sm border-0 mt-5">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Latest Bookings
          </h5>

          {dashboard.latest_bookings?.length === 0 ? (

            <p className="text-muted mb-0">
              No bookings found.
            </p>

          ) : (

            <div className="table-responsive">

              <table className="table table-bordered">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>PNR</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>

                  {dashboard.latest_bookings.map(
                    (booking: any) => (
                      <tr key={booking.id}>

                        <td>
                          {booking.id}
                        </td>

                        <td>
                          {booking.pnr || "-"}
                        </td>

                        <td>
                          {booking.status || "-"}
                        </td>

                        <td>
                          ৳ {booking.amount || "0.00"}
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

          <h5 className="fw-bold mb-3">
            Latest Recharges
          </h5>

          {dashboard.latest_recharges?.length === 0 ? (

            <p className="text-muted mb-0">
              No recharge found.
            </p>

          ) : (

            <div className="table-responsive">

              <table className="table table-bordered">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {dashboard.latest_recharges.map(
                    (recharge: any) => (
                      <tr key={recharge.id}>

                        <td>
                          {recharge.id}
                        </td>

                        <td>
                          ৳ {recharge.amount || "0.00"}
                        </td>

                        <td>
                          {recharge.status || "-"}
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