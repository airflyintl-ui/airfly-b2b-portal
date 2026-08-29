"use client";

import { useEffect, useState } from "react";

export default function WalletStatementPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8090";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Login token not found. Please login again.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/wallet/statement?agent_id=1`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Failed to load wallet statement");
        }

        return result;
      })
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">Wallet Statement</h1>
          <p className="text-muted mb-0">
            View your wallet transactions and balance history
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={() => window.location.reload()}
        >
          🔄 Refresh
        </button>
      </div>

      {loading && (
        <div className="alert alert-info">
          Loading wallet statement...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <small className="text-muted">
                    Current Wallet Balance
                  </small>

                  <h2 className="fw-bold text-primary mt-2">
                    ৳ {Number(data.wallet_balance ?? 205000).toLocaleString()}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <small className="text-muted">
                    Total Transactions
                  </small>

                  <h2 className="fw-bold mt-2">
                    {data.transactions?.length ?? 0}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <small className="text-muted">
                    Last Transaction
                  </small>

                  <h6 className="fw-bold mt-3">
                    {data.transactions?.length
                      ? data.transactions[0].type
                      : "No transaction"}
                  </h6>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white">
              <h5 className="mb-0 fw-bold">Transaction History</h5>
            </div>

            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Remarks</th>
                    <th className="text-end">Amount</th>
                    <th className="text-end">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {!data.transactions ||
                  data.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        No wallet transactions found.
                      </td>
                    </tr>
                  ) : (
                    data.transactions.map(
                      (transaction: any, index: number) => (
                        <tr key={transaction.id ?? index}>
                          <td>
                            {transaction.created_at
                              ? new Date(
                                  transaction.created_at
                                ).toLocaleString()
                              : "-"}
                          </td>

                          <td>{transaction.type ?? "-"}</td>

                          <td>
                            {transaction.reference ?? "-"}
                          </td>

                          <td>
                            {transaction.remarks ?? "-"}
                          </td>

                          <td className="text-end">
                            ৳{" "}
                            {Number(
                              transaction.amount ?? 0
                            ).toLocaleString()}
                          </td>

                          <td className="text-end">
                            ৳{" "}
                            {Number(
                              transaction.balance ?? 0
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}