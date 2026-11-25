"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../services/api";

type RecentBooking = {
  id: number;
  pnr?: string | null;
  passenger_name?: string | null;
  ticket_number?: string | null;
  total_amount?: number | string | null;
  payment_status?: string | null;
  booking_status?: string | null;
  created_at?: string | null;
};

type DashboardResponse = {
  success?: boolean;
  message?: string;
  wallet?: number | string | null;
  total_agents?: number;
  total_bookings?: number;
  confirmed_bookings?: number;
  cancelled_bookings?: number;
  pending_recharge?: number;
  recent_bookings?: RecentBooking[];
};

type GroupFareOffer = {
  id: number;
};

type GroupFareRequest = {
  id: number;
  status?: string | null;
};

type GroupFareStats = {
  totalOffers: number;
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
};

type DashboardCard = {
  title: string;
  value: string | number;
  icon: string;
  color: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [groupFareStats, setGroupFareStats] = useState<GroupFareStats>({
    totalOffers: 0,
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const response = await fetch(`${API}/admin/dashboard`, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        const data = (await response.json()) as DashboardResponse;

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("admin_token");
          router.replace("/admin/login");
          return;
        }

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load Admin Dashboard.");
          return;
        }

        setDashboard(data);

        // Load Group Fare Offers and Requests
        try {
          const [offersResponse, requestsResponse] = await Promise.all([
            fetch(`${API}/admin/group-fares`, {
              method: "GET",
              headers,
              cache: "no-store",
            }),
            fetch(`${API}/admin/group-fare-requests`, {
              method: "GET",
              headers,
              cache: "no-store",
            }),
          ]);

          const offersData = offersResponse.ok
            ? await offersResponse.json()
            : {};

          const requestsData = requestsResponse.ok
            ? await requestsResponse.json()
            : {};

          const offers: GroupFareOffer[] = Array.isArray(offersData.offers)
            ? offersData.offers
            : [];

          const requests: GroupFareRequest[] = Array.isArray(
            requestsData.requests
          )
            ? requestsData.requests
            : [];

          setGroupFareStats({
            totalOffers: offers.length,
            totalRequests: requests.length,
            pending: requests.filter(
              (item) => item.status?.toLowerCase() === "pending"
            ).length,
            approved: requests.filter(
              (item) => item.status?.toLowerCase() === "approved"
            ).length,
            rejected: requests.filter(
              (item) => item.status?.toLowerCase() === "rejected"
            ).length,
          });
        } catch (groupFareError) {
          console.error("Group Fare Dashboard Error:", groupFareError);
        }
      } catch (err) {
        console.error("Admin Dashboard Error:", err);
        setError("Cannot connect to the backend. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    const token = localStorage.getItem("admin_token");

    try {
      if (token) {
        await fetch(`${API}/admin/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Admin Logout Error:", err);
    } finally {
      localStorage.removeItem("admin_token");
      router.replace("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h5>Dashboard Error</h5>
          <p>{error}</p>
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

  if (!dashboard) return null;

  const cards: DashboardCard[] = [
    {
      title: "Total Wallet",
      value: `৳ ${Number(dashboard.wallet || 0).toLocaleString("en-BD")}`,
      icon: "💰",
      color: "success",
    },
    {
      title: "Total Agents",
      value: dashboard.total_agents ?? 0,
      icon: "👥",
      color: "primary",
    },
    {
      title: "Total Bookings",
      value: dashboard.total_bookings ?? 0,
      icon: "✈️",
      color: "info",
    },
    {
      title: "Confirmed Bookings",
      value: dashboard.confirmed_bookings ?? 0,
      icon: "✅",
      color: "success",
    },
    {
      title: "Cancelled Bookings",
      value: dashboard.cancelled_bookings ?? 0,
      icon: "❌",
      color: "danger",
    },
    {
      title: "Pending Recharge",
      value: dashboard.pending_recharge ?? 0,
      icon: "⏳",
      color: "warning",
    },
  ];

  const recentBookings = dashboard.recent_bookings || [];

  const groupFareCards: DashboardCard[] = [
    {
      title: "Total Group Fare Offers",
      value: groupFareStats.totalOffers,
      icon: "✈️",
      color: "primary",
    },
    {
      title: "Total Group Fare Requests",
      value: groupFareStats.totalRequests,
      icon: "📋",
      color: "info",
    },
    {
      title: "Pending Requests",
      value: groupFareStats.pending,
      icon: "⏳",
      color: "warning",
    },
    {
      title: "Approved Requests",
      value: groupFareStats.approved,
      icon: "✅",
      color: "success",
    },
    {
      title: "Rejected Requests",
      value: groupFareStats.rejected,
      icon: "❌",
      color: "danger",
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Admin Dashboard</h2>
          <p className="text-muted mb-0">
            AIR FLY INTERNATIONAL - B2B Management
          </p>
        </div>

        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Dashboard Cards */}
      <div className="row g-3">
        {cards.map((card) => (
          <div className="col-xl-4 col-md-6" key={card.title}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">{card.title}</h6>
                    <h3 className={`fw-bold text-${card.color} mb-0`}>
                      {card.value}
                    </h3>
                  </div>
                  <div className="fs-1">{card.icon}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Group Fare Summary */}
      <div className="mt-5 mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h4 className="fw-bold mb-1">Group Fare Management</h4>
            <p className="text-muted mb-0">
              Group Fare offers and agent booking requests overview.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {groupFareCards.map((card) => (
          <div className="col-xl-4 col-md-6" key={card.title}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">{card.title}</h6>
                    <h3 className={`fw-bold text-${card.color} mb-0`}>
                      {card.value}
                    </h3>
                  </div>
                  <div className="fs-1">{card.icon}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Group Fare Navigation */}
      <div className="row g-3 mt-2">
        <div className="col-md-6">
          <button
            className="btn btn-outline-primary w-100 py-3"
            onClick={() => router.push("/admin/group-fares")}
          >
            ✈️ Manage Group Fare Offers
          </button>
        </div>

        <div className="col-md-6">
          <button
            className="btn btn-outline-success w-100 py-3"
            onClick={() => router.push("/admin/group-fare-requests")}
          >
            📋 Manage Group Fare Requests
          </button>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Recent Bookings</h5>
            <span className="badge bg-primary">
              {recentBookings.length} Bookings
            </span>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No bookings found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>PNR</th>
                    <th>Passenger</th>
                    <th>Ticket Number</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Booking Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td className="fw-semibold">{booking.pnr || "-"}</td>
                      <td>{booking.passenger_name || "-"}</td>
                      <td>{booking.ticket_number || "-"}</td>
                      <td>
                        ৳{" "}
                        {Number(booking.total_amount || 0).toLocaleString(
                          "en-BD"
                        )}
                      </td>
                      <td>{booking.payment_status || "-"}</td>
                      <td>
                        <span
                          className={
                            booking.booking_status === "Confirmed"
                              ? "badge bg-success"
                              : booking.booking_status === "Cancelled"
                                ? "badge bg-danger"
                                : "badge bg-warning text-dark"
                          }
                        >
                          {booking.booking_status || "-"}
                        </span>
                      </td>
                      <td>
                        {booking.created_at
                          ? new Date(booking.created_at).toLocaleDateString()
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

      {/* Admin Navigation */}
      <div className="row g-3 mt-3">
        <div className="col-md-4 col-lg">
          <button
            className="btn btn-outline-primary w-100"
            onClick={() => router.push("/admin/agents")}
          >
            👥 Agents
          </button>
        </div>

        <div className="col-md-4 col-lg">
          <button
            className="btn btn-outline-primary w-100"
            onClick={() => router.push("/admin/airlines")}
          >
            ✈️ Airlines
          </button>
        </div>

        <div className="col-md-4 col-lg">
          <button
            className="btn btn-outline-primary w-100"
            onClick={() => router.push("/admin/flights")}
          >
            🛫 Flights
          </button>
        </div>

        <div className="col-md-4 col-lg">
          <button
            className="btn btn-outline-primary w-100"
            onClick={() => router.push("/admin/bookings")}
          >
            📋 Bookings
          </button>
        </div>

        <div className="col-md-4 col-lg">
          <button
            className="btn btn-outline-primary w-100"
            onClick={() => router.push("/admin/recharges")}
          >
            💳 Recharges
          </button>
        </div>  
      </div>
    </div>
  );
}
