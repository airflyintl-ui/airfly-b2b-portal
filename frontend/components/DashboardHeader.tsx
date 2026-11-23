"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

type Agent = {
  owner_name?: string;
  email?: string;
};

function subscribeToAgent(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getAgentSnapshot() {
  return localStorage.getItem("agent");
}

function getServerAgentSnapshot() {
  return null;
}

export default function DashboardHeader() {
  const agentData = useSyncExternalStore(
    subscribeToAgent,
    getAgentSnapshot,
    getServerAgentSnapshot
  );

  let agent: Agent | null = null;

  try {
    agent = agentData ? (JSON.parse(agentData) as Agent) : null;
  } catch {
    agent = null;
  }

  return (
    <div className="bg-white shadow-sm rounded p-3 mb-4 d-flex justify-content-between align-items-center">
      <div>
        <h3 className="mb-1 fw-bold">Dashboard</h3>
        <small className="text-muted">
          Welcome to AIR FLY INTERNATIONAL B2B Portal
        </small>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-light" type="button">
          🔔
        </button>

        <div className="text-end">
          <strong>{agent?.owner_name || "Agent"}</strong>
          <br />
          <small className="text-muted">{agent?.email || ""}</small>
        </div>

        <Image
          src="/images/logo.jpg"
          alt="Profile"
          width={50}
          height={50}
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
