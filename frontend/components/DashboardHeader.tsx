"use client";

import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const [agent, setAgent] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("agent");

    if (data) {
      setAgent(JSON.parse(data));
    }
  }, []);

  return (
    <div className="bg-white shadow-sm rounded p-3 mb-4 d-flex justify-content-between align-items-center">
      <div>
        <h3 className="mb-1 fw-bold">Dashboard</h3>
        <small className="text-muted">
          Welcome to AIR FLY INTERNATIONAL B2B Portal
        </small>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-light">🔔</button>

        <div className="text-end">
          <strong>{agent?.owner_name || "Agent"}</strong>
          <br />
          <small className="text-muted">
            {agent?.email || ""}
          </small>
        </div>

        <img
          src="/images/logo.jpg"
          alt="Profile"
          className="rounded-circle border"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
}