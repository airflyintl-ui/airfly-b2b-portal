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

const formatMoney = (value?: number | string | null) => {
  const amount = Number(value ?? 0);

  return `৳ ${Number.isFinite(amount)
    ? amount.toLocaleString("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00"}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusClass = (status?: string | null) => {
  const value = (status || "").toLowerCase();

  if (
    value.includes("approved") ||
    value.includes("refunded") ||
    value === "success" ||
    value === "paid"
  ) {
    return "status-success";
  }

  if (
    value.includes("pending") ||
    value.includes("processing")
  ) {
    return "status-warning";
  }

  if (
    value.includes("cancelled") ||
    value.includes("rejected") ||
    value.includes("failed")
  ) {
    return "status-danger";
  }

  return "status-neutral";
};

export default function Dashboard() {
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // LOGOUT
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
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading your dashboard...</p>
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
    <main className="airfly-dashboard">
      <div className="dashboard-container">

        {/* HEADER */}
        <header className="dashboard-header">
          <div className="brand-area">
            <div className="brand-logo">A</div>
            <div>
              <h2>AIRFLY <span>INTERNATIONAL</span></h2>
              <p>B2B AGENT PORTAL</p>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "↪ Logout"}
          </button>
        </header>

       {/* WELCOME */}
<section className="welcome-section">
  <div>
    <p className="welcome-label">AGENT DASHBOARD</p>
    <h1>Welcome, {agent.owner_name || "Agent"}!</h1>
    <p className="welcome-subtitle">
      Here&apos;s your agency&apos;s latest activity and overview.
    </p>
  </div>

  <div className="agency-chip">
    <span className="online-dot" />
    {agent.agency_name || "Your Agency"}
  </div>
</section>

        {/* SUMMARY CARDS */}
        <section className="summary-grid">

          <div className="summary-card wallet-card">
            <div className="summary-top">
              <span>Wallet Balance</span>
              <div className="summary-icon">৳</div>
            </div>
            <h2>{formatMoney(cards.wallet_balance)}</h2>
            <p>Available wallet balance</p>
          </div>

          <div className="summary-card booking-card">
            <div className="summary-top">
              <span>My Bookings</span>
              <div className="summary-icon">✈</div>
            </div>
            <h2>{cards.total_bookings ?? 0}</h2>
            <p>Total bookings</p>
          </div>

          <div className="summary-card pending-card">
            <div className="summary-top">
              <span>Pending Recharge</span>
              <div className="summary-icon">◷</div>
            </div>
            <h2>{cards.pending_recharges ?? 0}</h2>
            <p>Awaiting approval</p>
          </div>

          <div className="summary-card approved-card">
            <div className="summary-top">
              <span>Approved Recharge</span>
              <div className="summary-icon">✓</div>
            </div>
            <h2>{cards.approved_recharges ?? 0}</h2>
            <p>Successfully approved</p>
          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="dashboard-panel quick-panel">
          <div className="section-heading">
            <div>
              <h3>Quick Actions</h3>
              <p>Access your frequently used services</p>
            </div>
          </div>

          <div className="quick-actions">
            <button
              className="quick-action flight-action"
              onClick={() => router.push("/search-flight")}
            >
              <span className="action-icon">✈</span>
              <span>
                <strong>Search Flights</strong>
                <small>Find your next flight</small>
              </span>
              <span className="action-arrow">›</span>
            </button>

            <button
              className="quick-action booking-action"
              onClick={() => router.push("/bookings")}
            >
              <span className="action-icon">▣</span>
              <span>
                <strong>My Bookings</strong>
                <small>View booking history</small>
              </span>
              <span className="action-arrow">›</span>
            </button>

            <button
              className="quick-action wallet-action"
              onClick={() => router.push("/wallet/statement")}
            >
              <span className="action-icon">৳</span>
              <span>
                <strong>Wallet Statement</strong>
                <small>Check transactions</small>
              </span>
              <span className="action-arrow">›</span>
            </button>

            <button
              className="quick-action recharge-action"
              onClick={() => router.push("/recharge")}
            >
              <span className="action-icon">＋</span>
              <span>
                <strong>Add Recharge</strong>
                <small>Request wallet recharge</small>
              </span>
              <span className="action-arrow">›</span>
            </button>
          </div>
        </section>

        {/* AGENCY INFORMATION */}
        <section className="dashboard-panel agency-panel">
          <div className="section-heading">
            <div>
              <h3>Agency Information</h3>
              <p>Your registered agency details</p>
            </div>

            <span className={`status-badge ${statusClass(agent.status)}`}>
              {agent.status || "Unknown"}
            </span>
          </div>

          <div className="agency-details">
            <div className="detail-item">
              <span>Agency Name</span>
              <strong>{agent.agency_name || "-"}</strong>
            </div>

            <div className="detail-item">
              <span>Owner Name</span>
              <strong>{agent.owner_name || "-"}</strong>
            </div>

            <div className="detail-item">
              <span>Email Address</span>
              <strong>{agent.email || "-"}</strong>
            </div>

            <div className="detail-item">
              <span>Phone Number</span>
              <strong>{agent.mobile || agent.phone || "-"}</strong>
            </div>
          </div>
        </section>

        {/* LATEST BOOKINGS */}
        <section className="dashboard-panel">
          <div className="section-heading">
            <div>
              <h3>Latest Bookings</h3>
              <p>Your recent flight booking activity</p>
            </div>

            <button
              className="view-all-button"
              onClick={() => router.push("/bookings")}
            >
              View All →
            </button>
          </div>

          {latestBookings.length === 0 ? (
            <div className="empty-state">
              <span>✈</span>
              <p>No bookings found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>PNR</th>
                    <th>Booking Status</th>
                    <th>Payment Status</th>
                    <th className="amount-cell">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {latestBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>
                        <strong className="pnr-text">
                          {booking.pnr || "-"}
                        </strong>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass(booking.booking_status)}`}>
                          {booking.booking_status || "-"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass(booking.payment_status)}`}>
                          {booking.payment_status || "-"}
                        </span>
                      </td>
                      <td className="amount-cell">
                        <strong>{formatMoney(booking.total_amount)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* LATEST RECHARGES */}
        <section className="dashboard-panel">
          <div className="section-heading">
            <div>
              <h3>Latest Recharges</h3>
              <p>Your recent wallet recharge requests</p>
            </div>

            <button
              className="view-all-button"
              onClick={() => router.push("/recharge")}
            >
              Recharge Now →
            </button>
          </div>

          {latestRecharges.length === 0 ? (
            <div className="empty-state">
              <span>৳</span>
              <p>No recharge found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="dashboard-table">
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
                      <td>#{recharge.id}</td>
                      <td>
                        <strong>{formatMoney(recharge.amount)}</strong>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass(recharge.status)}`}>
                          {recharge.status || "-"}
                        </span>
                      </td>
                      <td>{formatDate(recharge.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="dashboard-footer">
          <strong>AIRFLY INTERNATIONAL</strong>
          <span>Agent Portal · Your Travel Business Partner</span>
        </footer>

      </div>

      <style jsx>{`
        .airfly-dashboard {
          min-height: 100vh;
          background: #f3f6fb;
          padding: 28px 16px 45px;
          color: #172b4d;
        }

        .dashboard-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(20, 45, 80, 0.05);
        }

        .brand-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #ffffff;
          background: linear-gradient(135deg, #0754a5, #19a4df);
          font-size: 25px;
          font-weight: 800;
        }

        .brand-area h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 850;
          letter-spacing: 0.5px;
          color: #073b75;
        }

        .brand-area h2 span {
          color: #1596d0;
        }

        .brand-area p {
          margin: 3px 0 0;
          color: #8795a9;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .logout-button {
          background: #fff1f1;
          border: 1px solid #ffd9d9;
          color: #d83a48;
          border-radius: 9px;
          padding: 10px 17px;
          font-weight: 700;
          cursor: pointer;
        }

        .logout-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .welcome-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin: 34px 2px 25px;
        }

        .welcome-label {
          margin: 0 0 7px;
          color: #1596d0;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .welcome-section h1 {
          margin: 0;
          color: #12345a;
          font-size: clamp(25px, 4vw, 34px);
          font-weight: 800;
        }

        .welcome-subtitle {
          margin: 8px 0 0;
          color: #8290a3;
          font-size: 14px;
        }

        .agency-chip {
          display: flex;
          align-items: center;
          gap: 9px;
          background: #ffffff;
          padding: 11px 16px;
          border-radius: 30px;
          color: #315273;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 3px 12px rgba(20, 45, 80, 0.05);
        }

        .online-dot {
          width: 9px;
          height: 9px;
          background: #20b879;
          border-radius: 50%;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 17px;
        }

        .summary-card {
          padding: 21px;
          border-radius: 15px;
          background: #ffffff;
          border: 1px solid #e9eef5;
          box-shadow: 0 5px 18px rgba(20, 45, 80, 0.045);
          min-width: 0;
        }

        .summary-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          color: #718198;
          font-size: 13px;
          font-weight: 700;
        }

        .summary-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          font-size: 20px;
          font-weight: 800;
          background: #eaf4ff;
          color: #1672bd;
        }

        .summary-card h2 {
          margin: 17px 0 5px;
          color: #173b63;
          font-size: clamp(22px, 2.5vw, 29px);
          font-weight: 850;
          overflow-wrap: anywhere;
        }

        .summary-card p {
          margin: 0;
          color: #9aa6b5;
          font-size: 12px;
        }

        .wallet-card {
          border-top: 4px solid #17a875;
        }

        .wallet-card h2 {
          color: #159b6b;
        }

        .wallet-card .summary-icon {
          background: #e6f8f0;
          color: #159b6b;
        }

        .booking-card {
          border-top: 4px solid #2588d8;
        }

        .pending-card {
          border-top: 4px solid #e8a52e;
        }

        .pending-card .summary-icon {
          background: #fff5df;
          color: #d99519;
        }

        .approved-card {
          border-top: 4px solid #755bd6;
        }

        .approved-card .summary-icon {
          background: #f0edff;
          color: #755bd6;
        }

        .dashboard-panel {
          margin-top: 23px;
          padding: 23px;
          background: #ffffff;
          border: 1px solid #e9eef5;
          border-radius: 15px;
          box-shadow: 0 5px 18px rgba(20, 45, 80, 0.04);
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .section-heading h3 {
          margin: 0;
          color: #173b63;
          font-size: 18px;
          font-weight: 800;
        }

        .section-heading p {
          margin: 5px 0 0;
          color: #94a0af;
          font-size: 12px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
        }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 11px;
          text-align: left;
          padding: 15px 12px;
          border: 1px solid #edf1f6;
          border-radius: 12px;
          background: #ffffff;
          cursor: pointer;
          min-width: 0;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .quick-action:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 18px rgba(20, 45, 80, 0.09);
        }

        .action-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #eaf4ff;
          color: #1478c5;
          font-size: 20px;
          font-weight: 800;
        }

        .quick-action strong,
        .quick-action small {
          display: block;
        }

        .quick-action strong {
          color: #234364;
          font-size: 12px;
          font-weight: 800;
        }

        .quick-action small {
          margin-top: 4px;
          color: #96a2b1;
          font-size: 10px;
        }

        .action-arrow {
          margin-left: auto;
          color: #9aa9b9;
          font-size: 22px;
        }

        .booking-action .action-icon {
          background: #e9f8f2;
          color: #159b6b;
        }

        .wallet-action .action-icon {
          background: #fff5df;
          color: #d99519;
        }

        .recharge-action .action-icon {
          background: #f0edff;
          color: #755bd6;
        }

        .agency-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0 30px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px 0;
          border-bottom: 1px solid #edf1f6;
          min-width: 0;
        }

        .detail-item span {
          color: #93a0af;
          font-size: 12px;
        }

        .detail-item strong {
          color: #294765;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .status-badge {
          display: inline-block;
          width: fit-content;
          padding: 6px 10px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 800;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .status-success {
          background: #e5f8ef;
          color: #138454;
        }

        .status-warning {
          background: #fff4dc;
          color: #b77a0b;
        }

        .status-danger {
          background: #ffeded;
          color: #cc3e4c;
        }

        .status-neutral {
          background: #edf1f5;
          color: #64748b;
        }

        .view-all-button {
          border: 0;
          background: #edf6ff;
          color: #1476bd;
          border-radius: 8px;
          padding: 9px 13px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 650px;
        }

        .dashboard-table thead {
          background: #f5f8fc;
        }

        .dashboard-table th {
          padding: 13px 14px;
          color: #75869b;
          font-size: 11px;
          font-weight: 800;
          text-align: left;
          white-space: nowrap;
        }

        .dashboard-table td {
          padding: 15px 14px;
          border-bottom: 1px solid #edf1f6;
          color: #50647b;
          font-size: 12px;
          vertical-align: middle;
        }

        .dashboard-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .pnr-text {
          color: #176fb4;
          letter-spacing: 0.5px;
        }

        .amount-cell {
          text-align: right !important;
          white-space: nowrap;
        }

        .amount-cell strong {
          color: #214568;
        }

        .empty-state {
          padding: 35px 15px;
          text-align: center;
          color: #91a0b0;
        }

        .empty-state span {
          display: block;
          margin-bottom: 8px;
          color: #a6c8e5;
          font-size: 32px;
        }

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }

        .dashboard-footer {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          padding: 25px 5px 0;
          color: #9aa7b6;
          font-size: 11px;
        }

        .dashboard-footer strong {
          color: #66809c;
          letter-spacing: 1px;
        }

        .dashboard-loading {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #61758d;
        }

        .loading-spinner {
          width: 35px;
          height: 35px;
          border: 4px solid #dce9f5;
          border-top-color: #1685ca;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .quick-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 576px) {
          .airfly-dashboard {
            padding: 14px 10px 30px;
          }

          .dashboard-header {
            padding: 13px;
          }

          .brand-logo {
            width: 39px;
            height: 39px;
          }

          .brand-area h2 {
            font-size: 14px;
          }

          .brand-area p {
            font-size: 8px;
          }

          .logout-button {
            padding: 8px 10px;
            font-size: 11px;
          }

          .welcome-section {
            margin: 25px 2px 20px;
          }

          .agency-chip {
            font-size: 11px;
          }

          .summary-grid {
            gap: 10px;
          }

          .summary-card {
            padding: 14px;
          }

          .summary-top {
            font-size: 11px;
          }

          .summary-icon {
            width: 32px;
            height: 32px;
          }

          .summary-card h2 {
            font-size: 20px;
          }

          .summary-card p {
            font-size: 10px;
          }

          .dashboard-panel {
            padding: 16px 12px;
            margin-top: 16px;
          }

          .section-heading h3 {
            font-size: 16px;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }

          .agency-details {
            grid-template-columns: 1fr;
          }

          .view-all-button {
            padding: 8px;
            font-size: 10px;
          }

          .dashboard-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
