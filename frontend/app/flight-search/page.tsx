"use client";

import FlightSearch from "@/components/FlightSearch";

export default function FlightSearchPage() {
  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="mb-4">
        <h2 className="fw-bold">Flight Search</h2>
        <p className="text-muted">
          Search flights from all available airlines.
        </p>
      </div>

      <FlightSearch />
    </div>
  );
}
