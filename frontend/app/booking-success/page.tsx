"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function BookingSuccessContent() {
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("id");
  const pnr = searchParams.get("pnr");

  return (
    <div className="container py-5">
      <div
        className="card shadow-lg border-0 mx-auto"
        style={{ maxWidth: 700 }}
      >
        <div className="card-body text-center p-5">
          <div
            className="mx-auto mb-4 rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
            style={{
              width: 90,
              height: 90,
              fontSize: 45,
            }}
          >
            ✓
          </div>

          <h2 className="fw-bold text-success">
            Booking Successful
          </h2>

          <p className="text-muted mt-3">
            Your flight booking has been completed successfully.
          </p>

          <hr />

          <h4 className="mt-3">PNR</h4>

          <h2 className="text-primary fw-bold">
            {pnr || "N/A"}
          </h2>

          <div className="row mt-5">
            <div className="col-md-6 mb-3">
              {bookingId ? (
                <Link
                  href={`/bookings/${bookingId}/invoice`}
                  className="btn btn-warning w-100"
                >
                  Download Invoice
                </Link>
              ) : (
                <button
                  className="btn btn-warning w-100"
                  disabled
                >
                  Invoice Not Available
                </button>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <Link
                href="/dashboard"
                className="btn btn-primary w-100"
              >
                Go Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading...</p>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}