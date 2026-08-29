"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingConfirmationPage() {
  const router = useRouter();

  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("booking_confirmation");

    if (!data) {
      router.push("/bookings");
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      setBookingData(parsedData);
    } catch (error) {
      console.error("Invalid booking data:", error);
      router.push("/bookings");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const printTicket = () => {
    window.print();
  };

  const goToBookings = () => {
    router.push("/bookings");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" />
        <p className="mt-3">Loading booking confirmation...</p>
      </div>
    );
  }

  if (!bookingData) {
    return null;
  }

  const booking = bookingData.booking;
  const flight = booking?.flight;

  return (
    <>
      {/* ========================================== */}
      {/* PRINT STYLE */}
      {/* ========================================== */}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-area {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>

      <div className="container py-5 print-area">

        {/* ========================================== */}
        {/* SUCCESS MESSAGE */}
        {/* ========================================== */}

        <div className="text-center mb-4">

          <div
            className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center"
            style={{
              width: "75px",
              height: "75px",
              fontSize: "40px",
            }}
          >
            ✓
          </div>

          <h2 className="text-success mt-3">
            Booking Confirmed
          </h2>

          <p className="text-muted">
            Your booking has been successfully confirmed.
          </p>

        </div>


        {/* ========================================== */}
        {/* PNR / TICKET */}
        {/* ========================================== */}

        <div className="row justify-content-center mb-4">

          <div className="col-lg-10">

            <div className="card shadow-sm">

              <div className="card-body">

                <div className="row text-center">

                  {/* PNR */}

                  <div className="col-md-6 border-end">

                    <small className="text-muted">
                      PNR
                    </small>

                    <h2 className="fw-bold text-primary">
                      {booking?.pnr || "-"}
                    </h2>

                  </div>


                  {/* TICKET */}

                  <div className="col-md-6">

                    <small className="text-muted">
                      Ticket Number
                    </small>

                    <h5 className="fw-bold text-dark mt-2">
                      {booking?.ticket_number || "-"}
                    </h5>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ========================================== */}
        {/* FLIGHT DETAILS */}
        {/* ========================================== */}

        <div className="row justify-content-center">

          <div className="col-lg-10">

            <div className="card shadow-sm mb-4">

              <div className="card-header bg-primary text-white">

                <h5 className="mb-0">
                  Flight Details
                </h5>

              </div>

              <div className="card-body">

                <div className="row">

                  <div className="col-md-3 mb-3">

                    <small className="text-muted">
                      Flight
                    </small>

                    <div className="fw-bold">
                      {flight?.flight_no || "-"}
                    </div>

                  </div>


                  <div className="col-md-3 mb-3">

                    <small className="text-muted">
                      From
                    </small>

                    <div className="fw-bold">
                      {flight?.from || "-"}
                    </div>

                  </div>


                  <div className="col-md-3 mb-3">

                    <small className="text-muted">
                      To
                    </small>

                    <div className="fw-bold">
                      {flight?.to || "-"}
                    </div>

                  </div>


                  <div className="col-md-3 mb-3">

                    <small className="text-muted">
                      Airline ID
                    </small>

                    <div className="fw-bold">
                      {flight?.airline_id || "-"}
                    </div>

                  </div>

                </div>


                <hr />


                <div className="row">

                  <div className="col-md-6">

                    <small className="text-muted">
                      Departure
                    </small>

                    <div className="fw-bold">

                      {flight?.departure_time
                        ? new Date(
                            flight.departure_time
                          ).toLocaleString()
                        : "-"}

                    </div>

                  </div>


                  <div className="col-md-6">

                    <small className="text-muted">
                      Arrival
                    </small>

                    <div className="fw-bold">

                      {flight?.arrival_time
                        ? new Date(
                            flight.arrival_time
                          ).toLocaleString()
                        : "-"}

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* ====================================== */}
            {/* PASSENGER DETAILS */}
            {/* ====================================== */}

            <div className="card shadow-sm mb-4">

              <div className="card-header bg-success text-white">

                <h5 className="mb-0">
                  Passenger Information
                </h5>

              </div>

              <div className="card-body">

                <div className="row">

                  <div className="col-md-6 mb-3">

                    <small className="text-muted">
                      Passenger Name
                    </small>

                    <div className="fw-bold">
                      {booking?.passenger_name || "-"}
                    </div>

                  </div>


                  <div className="col-md-6 mb-3">

                    <small className="text-muted">
                      Passport
                    </small>

                    <div className="fw-bold">
                      {booking?.passport || "-"}
                    </div>

                  </div>


                  <div className="col-md-4 mb-3">

                    <small className="text-muted">
                      Nationality
                    </small>

                    <div className="fw-bold">
                      {booking?.nationality || "-"}
                    </div>

                  </div>


                  <div className="col-md-4 mb-3">

                    <small className="text-muted">
                      Date of Birth
                    </small>

                    <div className="fw-bold">

                      {booking?.date_of_birth
                        ? new Date(
                            booking.date_of_birth
                          ).toLocaleDateString()
                        : "-"}

                    </div>

                  </div>


                  <div className="col-md-4 mb-3">

                    <small className="text-muted">
                      Gender
                    </small>

                    <div className="fw-bold">
                      {booking?.gender || "-"}
                    </div>

                  </div>


                  <div className="col-md-6 mb-3">

                    <small className="text-muted">
                      Phone
                    </small>

                    <div className="fw-bold">
                      {booking?.phone || "-"}
                    </div>

                  </div>


                  <div className="col-md-6 mb-3">

                    <small className="text-muted">
                      Email
                    </small>

                    <div className="fw-bold">
                      {booking?.email || "-"}
                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* ====================================== */}
            {/* BOOKING DETAILS */}
            {/* ====================================== */}

            <div className="card shadow-sm mb-4">

              <div className="card-header">

                <h5 className="mb-0">
                  Booking Details
                </h5>

              </div>

              <div className="card-body">

                <div className="row">

                  <div className="col-md-4 mb-3">

                    <small className="text-muted">
                      Journey Type
                    </small>

                    <div className="fw-bold">
                      {booking?.journey_type || "-"}
                    </div>

                  </div>


                  <div className="col-md-4 mb-3">

                    <small className="text-muted">
                      Travel Class
                    </small>

                    <div className="fw-bold">
                      {booking?.travel_class || "-"}
                    </div>

                  </div>


                  <div className="col-md-4 mb-3">

                    <small className="text-muted">
                      Booking Status
                    </small>

                    <div>

                      <span className="badge bg-success">
                        {booking?.booking_status ||
                          "Confirmed"}
                      </span>

                    </div>

                  </div>


                  <div className="col-md-4 mb-3">

                    <small className="text-muted">
                      Adults
                    </small>

                    <div className="fw-bold">
                      {booking?.adults ?? 0}
                    </div>

                  </div>


                  <div className="col-md-4 mb-3">

                    <small className="text-muted">
                      Children
                    </small>

                    <div className="fw-bold">
                      {booking?.children ?? 0}
                    </div>

                  </div>


                  <div className="col-md-4 mb-3">

                    <small className="text-muted">
                      Infants
                    </small>

                    <div className="fw-bold">
                      {booking?.infants ?? 0}
                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* ====================================== */}
            {/* PAYMENT */}
            {/* ====================================== */}

            <div className="card shadow-sm mb-4">

              <div className="card-header bg-dark text-white">

                <h5 className="mb-0">
                  Payment Information
                </h5>

              </div>

              <div className="card-body">

                <div className="row">

                  <div className="col-md-6 mb-3">

                    <small className="text-muted">
                      Total Amount
                    </small>

                    <h4 className="text-success fw-bold">
                      ৳{" "}
                      {Number(
                        booking?.total_amount || 0
                      ).toLocaleString()}
                    </h4>

                  </div>


                  <div className="col-md-6 mb-3">

                    <small className="text-muted">
                      Payment Status
                    </small>

                    <div>

                      <span className="badge bg-success fs-6">
                        {booking?.payment_status ||
                          "Paid"}
                      </span>

                    </div>

                  </div>

                </div>

                {bookingData.wallet_balance && (
                  <div className="alert alert-info mb-0">

                    Remaining Wallet Balance:{" "}

                    <strong>
                      ৳{" "}
                      {Number(
                        bookingData.wallet_balance
                      ).toLocaleString()}
                    </strong>

                  </div>
                )}

              </div>

            </div>


            {/* ====================================== */}
            {/* ACTION BUTTONS */}
            {/* ====================================== */}

            <div className="d-flex gap-2 justify-content-center no-print">

              <button
                type="button"
                className="btn btn-primary"
                onClick={printTicket}
              >
                🖨 Print Ticket
              </button>


              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={goToBookings}
              >
                My Bookings
              </button>


              <button
                type="button"
                className="btn btn-outline-success"
                onClick={goToDashboard}
              >
                Dashboard
              </button>

            </div>


            {/* ====================================== */}
            {/* FOOTER */}
            {/* ====================================== */}

            <div className="text-center text-muted mt-5">

              <small>
                Air Fly International
              </small>

              <br />

              <small>
                Please keep your PNR and ticket
                number for future reference.
              </small>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}