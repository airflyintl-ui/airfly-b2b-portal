"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";
import FlightSearch from "@/components/FlightSearch";
import FlightResults from "@/components/FlightResults";
export default function FlightSearchPage() {
  return (
    <div className="d-flex">
      <AdminSidebar />

      <div
        className="flex-grow-1"
        style={{
          marginLeft: "250px",
          background: "#f4f6f9",
          minHeight: "100vh",
        }}
      >
        <AdminNavbar />

        <div className="container-fluid p-4">

          <div className="mb-4">
            <h2 className="fw-bold">Flight Search</h2>
            <p className="text-muted">
              Search flights from all available airlines.
            </p>
          </div>

          <FlightSearch />

        </div>
      </div>
    </div>
  );
}