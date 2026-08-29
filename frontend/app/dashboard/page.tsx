"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";

export default function Dashboard() {
  const router = useRouter();

  const [agent, setAgent] = useState<any>(null);
  const [cards, setCards] = useState<any>(null);
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
          alert(
            data.message || "Unable to load dashboard"
          );
          return;
        }

        setAgent(data.agent);
        setCards(data.cards);

        // Update localStorage with latest agent data
        localStorage.setItem(
          "agent",
          JSON.stringify(data.agent)
        );
      } catch (error) {
        console.error(
          "DASHBOARD ERROR:",
          error
        );

        alert(
          "Cannot connect to Laravel API."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h5>Loading Dashboard...</h5>
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="container py-5">

      {/* =========================
          HEADER
      ========================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Welcome, {agent.owner_name}
          </h2>

          <p className="text-muted mb-0">
            {agent.agency_name}
          </p>
        </div>

        <button
          className="btn btn-outline-danger"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("agent");

            router.push("/login");
          }}
        >
          Logout
        </button>

      </div>


      {/* =========================
          DASHBOARD CARDS
      ========================= */}

      <div className="row">

        {/* WALLET */}

        <div className="col-md-4 mb-3">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Wallet Balance
              </h6>

              <h3 className="fw-bold">
                ৳ {Number(
                  cards?.wallet_balance || 0
                ).toLocaleString()}
              </h3>

            </div>

          </div>

        </div>


        {/* BOOKINGS */}

        <div className="col-md-4 mb-3">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                My Bookings
              </h6>

              <h3 className="fw-bold">
                {cards?.total_bookings || 0}
              </h3>

            </div>

          </div>

        </div>


        {/* PENDING RECHARGES */}

        <div className="col-md-4 mb-3">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Pending Recharge
              </h6>

              <h3 className="fw-bold">
                {cards?.pending_recharges || 0}
              </h3>

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          ACTION BUTTONS
      ========================= */}

      <div className="mt-4 d-flex gap-3 flex-wrap">

        <button
          className="btn btn-primary"
          onClick={() =>
            router.push("/search-flight")
          }
        >
          ✈ Search Flight
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
          💰 Wallet
        </button>


        <button
          className="btn btn-info"
          onClick={() =>
            router.push("/recharge")
          }
        >
          ➕ Recharge
        </button>

      </div>


      {/* =========================
          ACCOUNT INFORMATION
      ========================= */}

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

              <span
                className={
                  agent.status
                    ? "badge bg-success"
                    : "badge bg-danger"
                }
              >
                {agent.status
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}