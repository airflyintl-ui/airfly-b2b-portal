"use client";

import { useState } from "react";

export default function RechargePage() {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitRecharge(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/recharges",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount,
            payment_reference: reference,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Recharge Request Submitted Successfully");

        setAmount("");
        setReference("");
      } else {
        alert(data.message || "Recharge Failed");
      }
    } catch (err) {
      console.error(err);
      alert("API Error");
    }

    setLoading(false);
  }

  return (
    <div className="container py-4">

      <div className="card shadow mx-auto" style={{ maxWidth: 600 }}>

        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Wallet Recharge</h3>
        </div>

        <div className="card-body">

          <form onSubmit={submitRecharge}>

            <div className="mb-3">
              <label>Recharge Amount</label>

              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label>Payment Reference / Transaction ID</label>

              <input
                className="form-control"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
              />
            </div>

            <button
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Recharge"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}