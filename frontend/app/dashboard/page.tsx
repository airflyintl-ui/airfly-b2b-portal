"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";

type Agent = {
  id?: number;
  agency_name?: string;
  owner_name?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  status?: string;
};

type DashboardBooking = {
  id: number | string;
  pnr?: string | null;
  booking_status?: string | null;
  payment_status?: string | null;
  total_amount?: number | string | null;
};

type DashboardRecharge = {
  id: number | string;
  amount?: number | string | null;
  status?: string | null;
  created_at?: string | null;
};

type DashboardCards = {
  wallet_balance?: number | string | null;
  total_bookings?: number | string | null;
  pending_recharges?: number | string | null;
  approved_recharges?: number | string | null;
};

type DashboardResponse = {
  success?: boolean;
  message?: string;
  agent?: Agent;
  cards?: DashboardCards;
  latest_bookings?: DashboardBooking[];
  latest_recharges?: DashboardRecharge[];
};

export default function Dashboard() {
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // LOGOUT FUNCTION
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(`${API}/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("agent");
      router.replace("/login");
    }
  };

  // LOAD DASHBOARD
  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API}/dashboard`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data =
          (await response.json()) as DashboardResponse;

        console.log("Dashboard API:", data);

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("agent");
          router.replace("/login");
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load dashboard"
          );
        }

        const savedAgent = JSON.parse(
          localStorage.getItem("agent") || "null"
        ) as Agent | null;

        const agentData: Agent = {
          ...savedAgent,
          ...data.agent,
          mobile:
            data.agent?.mobile ||
            data.agent?.phone ||
            savedAgent?.mobile ||
            savedAgent?.phone ||
            "",
        };

        if (isMounted) {
          setAgent(agentData);
          setDashboard(data);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);

        if (isMounted) {
          alert(
            error instanceof Error
              ? error.message
              : "Cannot connect to Laravel API. Please check the backend."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
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
  const latestBookings = dashboard.latest_bookings || [];
  const latestRecharges = dashboard.latest_recharges || [];

  return (
    <div className="container py-5">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold">
            Welcome, {agent.owner_name}
          </h2>

          <p className="text-muted mb-0">
            {agent.agency_name}
          </p>
        </div>

        <button
          className="btn btn-danger"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
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
                ৳ {cards.wallet_balance ?? "0.00"}
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
                {cards.total_bookings ?? 0}
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
                {cards.pending_recharges ?? 0}
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
                {cards.approved_recharges ?? 0}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* AGENCY INFORMATION */}

      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            Agency Information
          </h5>

          <div className="row">
            <div className="col-md-6 mb-2">
              <strong>Agency:</strong>{" "}
              {agent.agency_name || "-"}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Owner:</strong>{" "}
              {agent.owner_name || "-"}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Email:</strong>{" "}
              {agent.email || "-"}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Phone:</strong>{" "}
              {agent.mobile || agent.phone || "-"}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Status:</strong>{" "}
              <span className="badge bg-success">
                {agent.status || "-"}
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

          {latestBookings.length === 0 ? (
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
                    <th>Booking Status</th>
                    <th>Payment Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {latestBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.pnr || "-"}</td>
                      <td>
                        {booking.booking_status || "-"}
                      </td>
                      <td>
                        {booking.payment_status || "-"}
                      </td>
                      <td>
                        ৳ {booking.total_amount ?? "0.00"}
                      </td>
                    </tr>
                  ))}
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

          {latestRecharges.length === 0 ? (
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
                  {latestRecharges.map((recharge) => (
                    <tr key={recharge.id}>
                      <td>{recharge.id}</td>

                      <td>
                        ৳ {recharge.amount ?? "0.00"}
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
