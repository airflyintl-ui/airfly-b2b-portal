"use client";

export default function Topbar() {

  const agent =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("agent") || "{}")
      : {};

  return (
    <div className="bg-white shadow-sm p-3 mb-4 rounded">

      <div className="d-flex justify-content-between align-items-center">

        <h4 className="mb-0">
          Admin Dashboard
        </h4>

        <div>

          <strong>
            {agent.agency_name}
          </strong>

          <div className="text-muted">
            {agent.email}
          </div>

        </div>

      </div>

    </div>
  );
}