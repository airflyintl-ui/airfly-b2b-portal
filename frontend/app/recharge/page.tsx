"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";

const banks = [
  {
    name: "One Bank",
    account: "0743000000701",
    branch: "Station Road",
    holder: "AIR FLY INTERNATIONAL",
  },
  {
    name: "Pubali Bank",
    account: "0902901061625",
    branch: "Reazuddin Bazar",
    holder: "M/S AIR FLY INTERNATIONAL",
  },
  {
    name: "Jamuna Bank",
    account: "3001000027792",
    branch: "Jubilee Road",
    holder: "AIR FLY INTERNATIONAL",
  },
  {
    name: "Islami Bank",
    account: "20501670100435600",
    branch: "Station Road",
    holder: "AIR FLY INTERNATIONAL",
  },
  {
    name: "BRAC Bank",
    account: "1114202902113001",
    branch: "Jubilee Road",
    holder: "AIR FLY INTERNATIONAL",
  },
  {
    name: "Midland Bank",
    account: "5511-1050000015",
    branch: "Jubilee Road",
    holder: "M/S. AIR FLY INTERNATIONAL",
  },
];

export default function RechargePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [slip, setSlip] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedBankData = banks.find(
    (bank) => bank.name === selectedBank
  );

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in. Please login first.");
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

    if (paymentMethod === "Bank Transfer" && !selectedBankData) {
      setError("Please select a bank account.");
      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter Transaction ID.");
      return;
    }

    if (slip && !slip.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    const formData = new FormData();

    formData.append("amount", amount);

    const finalPaymentMethod =
      paymentMethod === "Bank Transfer"
        ? `Bank Transfer - ${selectedBank}`
        : paymentMethod;

    formData.append("payment_method", finalPaymentMethod);
    formData.append("transaction_id", transactionId.trim());

    if (slip) {
      formData.append("slip", slip);
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/recharges`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid API response. HTTP Status: ${response.status}`
        );
      }

      console.log("Recharge API Status:", response.status);
      console.log("Recharge API Response:", data);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("agent");

        setError("Your login session has expired. Please login again.");
        return;
      }

      if (response.ok && data.success) {
        setMessage(
          data.message || "Recharge Request Submitted Successfully"
        );

        setAmount("");
        setPaymentMethod("");
        setSelectedBank("");
        setTransactionId("");
        setSlip(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        return;
      }

      if (data.errors) {
        const validationMessages = Object.values(data.errors)
          .flat()
          .join("\n");

        setError(validationMessages);
      } else {
        setError(data.message || "Recharge request failed.");
      }
    } catch (err) {
      console.error("RECHARGE ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Cannot connect to Laravel API."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyAccount = async (account: string) => {
    try {
      await navigator.clipboard.writeText(account);
      setMessage("Account number copied successfully.");
      setError("");
    } catch {
      setError("Could not copy account number.");
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
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Wallet Recharge</h2>
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
              {message && (
                <div className="alert alert-success">
                  <strong>Success!</strong>
                  <br />
                  {message}
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  <strong>Error!</strong>
                  <br />
                  <div style={{ whiteSpace: "pre-line" }}>
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
                    <span className="input-group-text">৳</span>

                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter amount"
                      min="1"
                      step="0.01"
                      value={amount}
                      disabled={loading}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
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
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setSelectedBank("");
                    }}
                    required
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Cash Deposit">Cash Deposit</option>
                  </select>
                </div>

                {/* BANK SELECTION */}

                {paymentMethod === "Bank Transfer" && (
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Select Bank Account
                    </label>

                    <select
                      className="form-select"
                      value={selectedBank}
                      disabled={loading}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      required
                    >
                      <option value="">Choose Your Bank</option>

                      {banks.map((bank) => (
                        <option key={bank.name} value={bank.name}>
                          {bank.name}
                        </option>
                      ))}
                    </select>

                    {selectedBankData && (
                      <div className="card border-primary mt-3">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            <div
                              className="rounded bg-primary text-white d-flex align-items-center justify-content-center fw-bold me-3"
                              style={{
                                width: 48,
                                height: 48,
                                fontSize: 15,
                              }}
                            >
                              {selectedBankData.name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 3)}
                            </div>

                            <div>
                              <h6 className="fw-bold mb-0">
                                {selectedBankData.name}
                              </h6>
                              <small className="text-muted">
                                AIR FLY INTERNATIONAL
                              </small>
                            </div>
                          </div>

                          <hr />

                          <div className="mb-2">
                            <small className="text-muted">
                              Account Name
                            </small>
                            <div className="fw-semibold">
                              {selectedBankData.holder}
                            </div>
                          </div>

                          <div className="mb-2">
                            <small className="text-muted">
                              Account Number
                            </small>

                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                              <strong className="fs-5">
                                {selectedBankData.account}
                              </strong>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  copyAccount(selectedBankData.account)
                                }
                              >
                                Copy Number
                              </button>
                            </div>
                          </div>

                          <div>
                            <small className="text-muted">Branch</small>
                            <div className="fw-semibold">
                              {selectedBankData.branch}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                      setTransactionId(e.target.value)
                    }
                    required
                  />

                  <small className="text-muted">
                    Enter your bank transaction reference or payment
                    transaction ID.
                  </small>
                </div>

                {/* PAYMENT SLIP UPLOAD */}

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Payment Slip Upload
                    <span className="text-muted fw-normal">
                      {" "}(Optional)
                    </span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={loading}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;

                      if (file && file.size > 5 * 1024 * 1024) {
                        setError("Image size must be 5 MB or less.");
                        e.target.value = "";
                        setSlip(null);
                        return;
                      }

                      setError("");
                      setSlip(file);
                    }}
                  />

                  <small className="text-muted">
                    JPG, PNG or WEBP. Maximum file size 5 MB.
                  </small>

                  {slip && (
                    <div className="alert alert-info mt-2 mb-0">
                      Selected file: <strong>{slip.name}</strong>
                    </div>
                  )}
                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                  style={{
                    height: 48,
                    fontWeight: 600,
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
              <h5 className="fw-bold mb-0">Recharge Process</h5>
            </div>

            <div className="card-body">
              {[
                {
                  number: "1",
                  title: "Make Payment",
                  description:
                    "Deposit money using your selected payment method.",
                },
                {
                  number: "2",
                  title: "Submit Request",
                  description:
                    "Enter payment details and upload your payment slip.",
                },
                {
                  number: "3",
                  title: "Admin Verification",
                  description:
                    "Admin will review and approve your recharge.",
                },
                {
                  number: "4",
                  title: "Wallet Updated",
                  description:
                    "After approval, the amount will be added to your wallet.",
                },
              ].map((step, index) => (
                <div
                  className="d-flex mb-3"
                  key={step.number}
                >
                  <div
                    className={`rounded-circle ${
                      index === 3 ? "bg-success" : "bg-primary"
                    } text-white d-flex align-items-center justify-content-center me-3`}
                    style={{
                      width: 35,
                      height: 35,
                      minWidth: 35,
                    }}
                  >
                    {step.number}
                  </div>

                  <div>
                    <strong>{step.title}</strong>
                    <p className="text-muted mb-0 small">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="alert alert-warning border-0 shadow-sm">
            <h6 className="fw-bold">⚠ Important</h6>
            <p className="mb-0 small">
              Please make sure your Transaction ID and payment
              information are correct. Recharge requests are subject
              to admin verification.
            </p>
          </div>

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
