"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/services/api";

type WalletTransaction = {
  id: number;
  agent_id: number;
  type?: string;
  transaction_type?: string;
  amount: string | number;
  description?: string;
  remarks?: string;
  reference?: string;
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
        data = JSON.parse(responseText) as WalletResponse;
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
    } catch (err: unknown) {
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
    const timer = window.setTimeout(() => {
      void loadWallet();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
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

  return (
    <div className="container-fluid py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Wallet Statement</h2>
          <p className="text-muted mb-0">
            View your wallet balance and transaction history
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={() => void loadWallet()}
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
              onClick={() => void loadWallet()}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="text-muted mb-2">
                    Current Wallet Balance
                  </div>

                  <h1 className="fw-bold mb-0">
                    ৳ {formatAmount(wallet)}
                  </h1>

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
                    Agent ID
                  </div>

                  <h3 className="fw-bold mb-0">
                    {agentId !== null ? `#${agentId}` : "-"}
                  </h3>

                  <div className="text-muted mt-2">
                    Air Fly International
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="text-muted mb-2">
                    Transactions
                  </div>

                  <h3 className="fw-bold mb-0">
                    {statement.length}
                  </h3>

                  <div className="text-muted mt-2">
                    Total wallet transactions
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                        <th>Description</th>
                        <th>Reference</th>
                        <th className="text-end">Amount</th>
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
                            <span className="badge bg-primary">
                              {transaction.transaction_type ||
                                transaction.type ||
                                "Transaction"}
                            </span>
                          </td>

                          <td>
                            {transaction.description ||
                              transaction.remarks ||
                              "-"}
                          </td>

                          <td>
                            {transaction.reference || "-"}
                          </td>

                          <td className="text-end fw-bold">
                            ৳ {formatAmount(transaction.amount)}
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
