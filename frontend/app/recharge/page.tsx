"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";

export default function RechargePage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [slip, setSlip] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");
    const agentData = localStorage.getItem("agent");

    if (!token) {
      setError("You are not logged in. Please login first.");
      return;
    }

    if (!agentData) {
      setError("Agent information not found. Please login again.");
      return;
    }

    let agent;

    try {
      agent = JSON.parse(agentData);
    } catch {
      setError("Invalid agent information. Please login again.");
      return;
    }

    if (!agent?.id) {
      setError("Agent ID not found. Please login again.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid recharge amount.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter Transaction ID.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/recharges`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          agent_id: agent.id,
          amount: Number(amount),
          payment_method: paymentMethod,
          transaction_id: transactionId.trim(),
          slip: slip.trim() || null,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid response from Laravel API. HTTP Status: ${response.status}`
        );
      }

      console.log("Recharge API Status:", response.status);
      console.log("Recharge API Response:", data);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("agent");

        setError(
          "Your login session has expired. Please login again."
        );

        return;
      }

      if (response.ok && data.success) {
        setMessage(
          data.message ||
            "Recharge Request Submitted Successfully"
        );

        setAmount("");
        setPaymentMethod("");
        setTransactionId("");
        setSlip("");

        return;
      }

      if (data.errors) {
        const validationMessages = Object.values(
          data.errors
        )
          .flat()
          .join("\n");

        setError(validationMessages);
      } else {
        setError(
          data.message ||
            "Recharge request failed."
        );
      }
    } catch (err) {
      console.error("RECHARGE ERROR:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Cannot connect to Laravel API."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid py-4"
      style={{
        minHeight: "100vh",
        background: "#f5f6fa",
      }}
    >
      {/* HEADER */}

      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Wallet Recharge
        </h2>

        <p className="text-muted mb-0">
          Submit a request to add money to your wallet
        </p>
      </div>

      <div className="row g-4">

        {/* RECHARGE FORM */}

        <div className="col-lg-7">

          <div className="card border-0 shadow-sm">

            <div className="card-header bg-primary text-white py-3">
              <h5 className="mb-0 fw-bold">
                Submit Recharge Request
              </h5>
            </div>

            <div className="card-body p-4">

              {/* SUCCESS */}

              {message && (
                <div
                  className="alert alert-success"
                  role="alert"
                >
                  <strong>Success!</strong>
                  <br />
                  {message}
                </div>
              )}

              {/* ERROR */}

              {error && (
                <div
                  className="alert alert-danger"
                  role="alert"
                >
                  <strong>Error!</strong>
                  <br />

                  <div
                    style={{
                      whiteSpace: "pre-line",
                    }}
                  >
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* AMOUNT */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Recharge Amount
                  </label>

                  <div className="input-group">

                    <span className="input-group-text">
                      ৳
                    </span>

                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter amount"
                      min="1"
                      step="0.01"
                      value={amount}
                      disabled={loading}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                      required
                    />

                  </div>

                  <small className="text-muted">
                    Enter the amount you deposited.
                  </small>

                </div>

                {/* PAYMENT METHOD */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Payment Method
                  </label>

                  <select
                    className="form-select"
                    value={paymentMethod}
                    disabled={loading}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      Select Payment Method
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                    <option value="bKash">
                      bKash
                    </option>

                    <option value="Nagad">
                      Nagad
                    </option>

                    <option value="Rocket">
                      Rocket
                    </option>

                    <option value="Cash Deposit">
                      Cash Deposit
                    </option>

                  </select>

                </div>

                {/* TRANSACTION ID */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Transaction ID
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Transaction ID"
                    value={transactionId}
                    disabled={loading}
                    onChange={(e) =>
                      setTransactionId(
                        e.target.value
                      )
                    }
                    required
                  />

                  <small className="text-muted">
                    Example: TXN123456789
                  </small>

                </div>

                {/* SLIP */}

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Payment Slip / Reference
                    <span className="text-muted fw-normal">
                      {" "}
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter slip/reference information"
                    value={slip}
                    disabled={loading}
                    onChange={(e) =>
                      setSlip(e.target.value)
                    }
                  />

                  <small className="text-muted">
                    Currently you can enter the slip
                    reference. File upload can be added
                    later.
                  </small>

                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                  style={{
                    height: "48px",
                    fontWeight: "600",
                  }}
                >
                  {loading
                    ? "Submitting Recharge..."
                    : "Submit Recharge Request"}
                </button>

              </form>

            </div>
          </div>
        </div>

        {/* INFORMATION */}

        <div className="col-lg-5">

          <div className="card border-0 shadow-sm mb-4">

            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">
                Recharge Process
              </h5>
            </div>

            <div className="card-body">

              <div className="d-flex mb-3">

                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "35px",
                    height: "35px",
                    minWidth: "35px",
                  }}
                >
                  1
                </div>

                <div>
                  <strong>
                    Make Payment
                  </strong>

                  <p className="text-muted mb-0 small">
                    Deposit money using your selected
                    payment method.
                  </p>
                </div>

              </div>

              <div className="d-flex mb-3">

                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "35px",
                    height: "35px",
                    minWidth: "35px",
                  }}
                >
                  2
                </div>

                <div>
                  <strong>
                    Submit Request
                  </strong>

                  <p className="text-muted mb-0 small">
                    Enter the payment details and submit
                    your recharge request.
                  </p>
                </div>

              </div>

              <div className="d-flex mb-3">

                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "35px",
                    height: "35px",
                    minWidth: "35px",
                  }}
                >
                  3
                </div>

                <div>
                  <strong>
                    Admin Verification
                  </strong>

                  <p className="text-muted mb-0 small">
                    Admin will review and approve your
                    recharge.
                  </p>
                </div>

              </div>

              <div className="d-flex">

                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "35px",
                    height: "35px",
                    minWidth: "35px",
                  }}
                >
                  4
                </div>

                <div>
                  <strong>
                    Wallet Updated
                  </strong>

                  <p className="text-muted mb-0 small">
                    After approval, the amount will be
                    added to your wallet automatically.
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* IMPORTANT NOTICE */}

          <div className="alert alert-warning border-0 shadow-sm">

            <h6 className="fw-bold">
              ⚠ Important
            </h6>

            <p className="mb-0 small">
              Please make sure your Transaction ID
              and payment information are correct.
              Recharge requests are subject to admin
              verification.
            </p>

          </div>

          {/* GO TO WALLET */}

          <button
            type="button"
            className="btn btn-outline-primary w-100"
            onClick={() => router.push("/wallet")}
          >
            View Wallet Statement
          </button>

        </div>
      </div>
    </div>
  );
}