"use client";

import { useEffect, useState } from "react";

type WalletTransaction = {
  id: number;
  agent_id: number;
  type?: string;
  transaction_type?: string;
  amount: string | number;
  description?: string;
  reference?: string;
  created_at: string;
};

type WalletResponse = {
  success: boolean;
  agent_id: number;
  wallet: string | number;
  statement: WalletTransaction[];
};

export default function WalletPage() {
  const [wallet, setWallet] = useState("0.00");
  const [statement, setStatement] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8090";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/wallet/statement`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load wallet");
        }

        return data;
      })
      .then((data: WalletResponse) => {
        if (data.success) {
          setWallet(String(data.wallet));
          setStatement(data.statement || []);
        } else {
          setError("Unable to load wallet information.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Something went wrong.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatAmount = (amount: string | number) => {
    return Number(amount).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container-fluid py-4 px-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Wallet Statement</h2>
          <p className="text-muted mb-0">
            View your wallet balance and transaction history
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={() => window.location.reload()}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="alert alert-info">
          Loading wallet information...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Wallet Balance */}
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
                    #{statement.length > 0
                      ? statement[0].agent_id
                      : "3"}
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

          {/* Statement */}
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
                        <th className="text-end">
                          Amount
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {statement.map((transaction) => (

                        <tr key={transaction.id}>

                          <td>
                            #{transaction.id}
                          </td>

                          <td>
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
                            {transaction.description || "-"}
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