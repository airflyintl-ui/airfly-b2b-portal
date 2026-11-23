"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import API from "../../../../../services/api";

type Invoice = {
  pnr?: string | null;
  booking_id?: number | string | null;
  passenger_name?: string | null;
  passport?: string | null;
  airline?: string | null;
  flight_no?: string | null;
  from?: string | null;
  to?: string | null;
  departure_date?: string | null;
  amount?: number | string | null;
  status?: string | null;
};

type InvoiceResponse = {
  success: boolean;
  message?: string;
  invoice?: Invoice;
};

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const bookingId = params?.id;

  const invoiceRef = useRef<HTMLDivElement>(null);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const loadInvoice = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const res = await fetch(`${API}/bookings/${id}/invoice`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await res.json()) as InvoiceResponse;

      if (res.ok && data.success && data.invoice) {
        setInvoice(data.invoice);
      } else {
        alert(data.message || "Invoice not found");
      }
    } catch (error) {
      console.error("Invoice API Error:", error);
      alert("Failed to connect API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!bookingId) return;

    const timer = window.setTimeout(() => {
      void loadInvoice(bookingId);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [bookingId, loadInvoice]);

  const downloadPDF = async () => {
    const element = invoiceRef.current;

    if (!element || !invoice || downloading) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 190;
      const pageHeight = (canvas.height * pageWidth) / canvas.width;

      const pdfPageHeight = 277;

      let heightLeft = pageHeight;
      let position = 10;

      pdf.addImage(
        imgData,
        "PNG",
        10,
        position,
        pageWidth,
        pageHeight
      );

      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pageHeight + 10;
        pdf.addPage();

        pdf.addImage(
          imgData,
          "PNG",
          10,
          position,
          pageWidth,
          pageHeight
        );

        heightLeft -= pdfPageHeight;
      }

      pdf.save(`Invoice-${invoice.pnr || bookingId}.pdf`);
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (!bookingId) {
    return (
      <div className="container py-5 text-center">
        <h3>Booking ID not found</h3>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h3>Loading Invoice...</h3>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container py-5 text-center">
        <h3>Invoice Not Found</h3>
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
              <p>
                <b>Invoice No :</b> {invoice.pnr || "N/A"}
              </p>

              <p>
                <b>Booking ID :</b> {invoice.booking_id || bookingId}
              </p>

              <p>
                <b>Passenger :</b> {invoice.passenger_name || "N/A"}
              </p>

              <p>
                <b>Passport :</b> {invoice.passport || "N/A"}
              </p>
            </div>

            <div className="col-md-6">
              <p>
                <b>Airline :</b> {invoice.airline || "N/A"}
              </p>

              <p>
                <b>Flight :</b> {invoice.flight_no || "N/A"}
              </p>

              <p>
                <b>Route :</b> {invoice.from || "N/A"} → {invoice.to || "N/A"}
              </p>

              <p>
                <b>Departure :</b> {invoice.departure_date || "N/A"}
              </p>
            </div>
          </div>

          <hr />

          <h4>
            Amount :
            <span className="text-success ms-2">
              ৳ {invoice.amount ?? "0"}
            </span>
          </h4>

          <h5 className="mt-3">
            Status :
            <span
              className={
                invoice.status?.toLowerCase() === "confirmed"
                  ? "badge bg-success ms-2"
                  : "badge bg-danger ms-2"
              }
            >
              {invoice.status || "Unknown"}
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
          disabled={downloading}
        >
          {downloading ? "Generating PDF..." : "📄 Download PDF"}
        </button>
      </div>
    </div>
  );
}
