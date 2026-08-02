"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [agent, setAgent] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const agentData = localStorage.getItem("agent");

    if (!token || !agentData) {
      router.push("/login");
      return;
    }

    setAgent(JSON.parse(agentData));
  }, [router]);

  if (!agent) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">
        Welcome, {agent.owner_name}
      </h2>

      <div className="row">

        <div className="col-md-4 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h5>Agency</h5>
              <p>{agent.agency_name}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h5>Wallet</h5>
              <h3>৳ {agent.wallet}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h5>Status</h5>
              <span className="badge bg-success">
                {agent.status}
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-4 d-flex gap-3 flex-wrap">
        <button
          className="btn btn-primary"
          onClick={() => router.push("/flight-search")}
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
          onClick={() => router.push("/wallet")}
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
    </div>
  );
}