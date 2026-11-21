"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/services/api";

type WalletTransaction = {
  id: number;
  agent_id: number;
  type: "Credit" | "Debit" | string;
  amount: string | number;
  balance_after: string | number;
  reference?: string | null;
  remarks?: string | null;
  created_at: string;
};

type WalletResponse = {
  success: boolean;
  agent_id: number;
  wallet: string | number;
  statement: WalletTransaction[];
  message?: string;
};

export default function WalletPage() {
  const [wallet, setWallet] = useState("0.00");
  const [agentId, setAgentId] = useState<number | null>(null);
  const [statement, setStatement] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWallet = useCallback(async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/wallet/statement`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const responseText = await response.text();

      let data: WalletResponse;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid API response. HTTP Status: ${response.status}`
        );
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("agent");
        throw new Error("Your session expired. Please login again.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load wallet.");
      }

      setWallet(String(data.wallet ?? 0));
      setAgentId(data.agent_id ?? null);
      setStatement(
        Array.isArray(data.statement) ? data.statement : []
      );
    } catch (err) {
      console.error("WALLET API ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect with Laravel API."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const formatAmount = (amount: string | number) => {
    return Number(amount || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const lastTransaction =
    statement.length > 0 ? statement[0] : null;

  return (
    <div className="container-fluid py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Wallet Statement</h2>
          <p className="text-muted mb-0">
            View your wallet transactions and balance history
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadWallet}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {loading && (
        <div className="alert alert-info">
          Loading wallet information...
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">
          <strong>Wallet Error:</strong>
          <br />
          {error}

          <div className="mt-3">
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={loadWallet}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Wallet Summary */}
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="text-muted mb-2">
                    Current Wallet Balance
                  </div>

                  <h2 className="fw-bold mb-0">
                    ৳ {formatAmount(wallet)}
                  </h2>

                  <div className="text-success mt-2">
                    ● Available Balance
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="text-muted mb-2">
                    Total Transactions
                  </div>

                  <h2 className="fw-bold mb-0">
                    {statement.length}
                  </h2>

                  <div className="text-muted mt-2">
                    Wallet transaction records
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="text-muted mb-2">
                    Last Transaction
                  </div>

                  {lastTransaction ? (
                    <>
                      <h5
                        className={`fw-bold mb-1 ${
                          lastTransaction.type === "Credit"
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {lastTransaction.type === "Credit"
                          ? "+"
                          : "-"}{" "}
                        ৳ {formatAmount(lastTransaction.amount)}
                      </h5>

                      <div className="text-muted small">
                        {formatDate(lastTransaction.created_at)}
                      </div>

                      <div className="mt-2">
                        <span
                          className={`badge ${
                            lastTransaction.type === "Credit"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {lastTransaction.type}
                        </span>
                      </div>
                    </>
                  ) : (
                    <h5 className="text-muted mb-0">
                      No transaction
                    </h5>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Agent Information */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body py-3">
              <strong>Agent ID:</strong>{" "}
              {agentId !== null ? `#${agentId}` : "-"}
            </div>
          </div>

          {/* Transaction History */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">
                Transaction History
              </h5>
            </div>

            <div className="card-body p-0">
              {statement.length === 0 ? (
                <div className="text-center py-5">
                  <div
                    style={{
                      fontSize: "48px",
                      marginBottom: "15px",
                    }}
                  >
                    💳
                  </div>

                  <h5 className="fw-bold">
                    No Transactions Yet
                  </h5>

                  <p className="text-muted mb-0">
                    Your wallet transactions will appear here.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Reference</th>
                        <th>Remarks</th>
                        <th className="text-end">Amount</th>
                        <th className="text-end">Balance After</th>
                      </tr>
                    </thead>

                    <tbody>
                      {statement.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>#{transaction.id}</td>

                          <td className="text-nowrap">
                            {formatDate(transaction.created_at)}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                transaction.type === "Credit"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>

                          <td>
                            {transaction.reference || "-"}
                          </td>

                          <td>
                            {transaction.remarks || "-"}
                          </td>

                          <td
                            className={`text-end fw-bold ${
                              transaction.type === "Credit"
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            {transaction.type === "Credit"
                              ? "+"
                              : "-"}{" "}
                            ৳ {formatAmount(transaction.amount)}
                          </td>

                          <td className="text-end fw-bold">
                            ৳ {formatAmount(transaction.balance_after)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
