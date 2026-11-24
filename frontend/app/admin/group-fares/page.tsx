"use client";

import { useRouter } from "next/navigation";

export default function AdminGroupFaresPage() {
  const router = useRouter();

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Group Fare Management</h2>
          <p className="text-muted mb-0">
            Manage airline, sector, travel dates, fare and availability.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={() => router.push("/admin/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Group Fare Offers</h5>

          <div className="alert alert-info">
            Group Fare Offer Management API is being prepared.
            After backend integration, you will be able to add, edit,
            publish and manage all offers here.
          </div>

          <button
            className="btn btn-primary"
            disabled
          >
            + Add New Group Fare
          </button>
        </div>
      </div>
    </div>
  );
}
