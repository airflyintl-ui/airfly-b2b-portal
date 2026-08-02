"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function InvoicePage() {
  const params = useParams();

  const invoiceRef = useRef<HTMLDivElement>(null);

  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    loadInvoice();
  }, []);

  async function loadInvoice() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:8000/api/bookings/${params.id}/invoice`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setInvoice(data.invoice);
      } else {
        alert("Invoice not found");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect API");
    }
  }

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current);

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 190;
    const pageHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, pageWidth, pageHeight);

    pdf.save(`Invoice-${invoice.pnr}.pdf`);
  };

  if (!invoice) {
    return (
      <div className="container py-5 text-center">
        <h3>Loading Invoice...</h3>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <div
        ref={invoiceRef}
        className="card shadow-lg border-0"
      >

        <div className="card-header bg-primary text-white">

          <h2 className="mb-0">
            ✈ AIR FLY INTERNATIONAL
          </h2>

          <small>Booking Invoice</small>

        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-6">

              <p><b>Invoice No :</b> {invoice.pnr}</p>

              <p><b>Booking ID :</b> {invoice.booking_id}</p>

              <p><b>Passenger :</b> {invoice.passenger_name}</p>

              <p><b>Passport :</b> {invoice.passport}</p>

            </div>

            <div className="col-md-6">

              <p><b>Airline :</b> {invoice.airline}</p>

              <p><b>Flight :</b> {invoice.flight_no}</p>

              <p><b>Route :</b> {invoice.from} → {invoice.to}</p>

              <p><b>Departure :</b> {invoice.departure_date}</p>

            </div>

          </div>

          <hr />

          <h4>
            Amount :
            <span className="text-success ms-2">
              ৳ {invoice.amount}
            </span>
          </h4>

          <h5 className="mt-3">
            Status :
            <span
              className={
                invoice.status === "Confirmed"
                  ? "badge bg-success ms-2"
                  : "badge bg-danger ms-2"
              }
            >
              {invoice.status}
            </span>
          </h5>

          <hr />

        </div>

      </div>

      <div className="text-center mt-4">

        <button
          className="btn btn-primary me-2"
          onClick={() => window.print()}
        >
          🖨 Print Invoice
        </button>

        <button
          className="btn btn-success"
          onClick={downloadPDF}
        >
          📄 Download PDF
        </button>

      </div>

    </div>
  );
}