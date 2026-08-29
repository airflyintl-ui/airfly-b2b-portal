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
  updated_at?: string;
};

type WalletResponse = {
  success: boolean;
  agent_id: number;
  wallet: string | number;
  statement: WalletTransaction[];
  message?: string;
};

type Agent = {
  id?: number;
  agency_name?: string;
  owner_name?: string;
  email?: string;
  phone?: string;
};

export default function WalletPage() {
  const [wallet, setWallet] = useState("0.00");
  const [agentId, setAgentId] = useState<number | null>(null);
  const [statement, setStatement] = useState<WalletTransaction[]>([]);
  const [agent, setAgent] = useState<Agent>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadWallet = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in. Please login first.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API}/wallet/statement`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();

      let data: WalletResponse;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid response from Laravel API. HTTP Status: ${response.status}`
        );
      }

      console.log("Wallet API Status:", response.status);
      console.log("Wallet API Response:", data);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("agent");

        setError("Your login session has expired. Please login again.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load wallet information."
        );
      }

      setWallet(String(data.wallet ?? "0.00"));
      setAgentId(data.agent_id);
      setStatement(data.statement || []);

      const savedAgent = localStorage.getItem("agent");

      if (savedAgent) {
        try {
          setAgent(JSON.parse(savedAgent));
        } catch {
          setAgent({});
        }
      }
    } catch (err) {
      console.error("WALLET API ERROR:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load wallet information.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWallet();
  };

  const formatAmount = (amount: string | number) => {
    const value = Number(amount || 0);

    return value.toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionType = (transaction: WalletTransaction) => {
    return transaction.type || "Transaction";
  };

  const getTransactionClass = (type: string) => {
    return type.toLowerCase() === "credit"
      ? "bg-success"
      : "bg-danger";
  };

  const getAmountClass = (type: string) => {
    return type.toLowerCase() === "credit"
      ? "text-success"
      : "text-danger";
  };

  const getAmountPrefix = (type: string) => {
    return type.toLowerCase() === "credit" ? "+" : "-";
  };

  const totalCredit = statement
    .filter(
      (transaction) =>
        transaction.type?.toLowerCase() === "credit"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  const totalDebit = statement
    .filter(
      (transaction) =>
        transaction.type?.toLowerCase() === "debit"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  return (
    <div
      className="container-fluid py-4 px-4"
      style={{
        background: "#f5f6fa",
        minHeight: "100vh",
      }}
    >
      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Wallet Statement
          </h2>

          <p className="text-muted mb-0">
            View your wallet balance and transaction history
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* ========================================= */}
      {/* LOADING */}
      {/* ========================================= */}

      {loading && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            />

            <p className="text-muted mt-3 mb-0">
              Loading wallet information...
            </p>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* ERROR */}
      {/* ========================================= */}

      {!loading && error && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div
              className="text-danger"
              style={{ fontSize: "48px" }}
            >
              ⚠
            </div>

            <h5 className="fw-bold mt-3">
              Unable to Load Wallet
            </h5>

            <p className="text-muted">
              {error}
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRefresh}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* WALLET CONTENT */}
      {/* ========================================= */}

      {!loading && !error && (
        <>
          {/* ========================================= */}
          {/* SUMMARY CARDS */}
          {/* ========================================= */}

          <div className="row g-4 mb-4">

            {/* WALLET BALANCE */}

            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">

                  <div className="text-muted mb-2">
                    Current Wallet Balance
                  </div>

                  <h2 className="fw-bold text-primary mb-0">
                    ৳ {formatAmount(wallet)}
                  </h2>

                  <div className="text-success mt-2">
                    ● Available Balance
                  </div>

                </div>
              </div>
            </div>

            {/* AGENT */}

            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">

                  <div className="text-muted mb-2">
                    Agent ID
                  </div>

                  <h3 className="fw-bold mb-0">
                    #{agentId ?? agent.id ?? "-"}
                  </h3>

                  <div className="text-muted mt-2">
                    {agent.agency_name ||
                      "Air Fly International Agent"}
                  </div>

                </div>
              </div>
            </div>

            {/* TOTAL CREDIT */}

            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">

                  <div className="text-muted mb-2">
                    Total Credit
                  </div>

                  <h3 className="fw-bold text-success mb-0">
                    + ৳ {formatAmount(totalCredit)}
                  </h3>

                  <div className="text-muted mt-2">
                    Money added to wallet
                  </div>

                </div>
              </div>
            </div>

            {/* TOTAL DEBIT */}

            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">

                  <div className="text-muted mb-2">
                    Total Debit
                  </div>

                  <h3 className="fw-bold text-danger mb-0">
                    - ৳ {formatAmount(totalDebit)}
                  </h3>

                  <div className="text-muted mt-2">
                    Money deducted from wallet
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* ========================================= */}
          {/* AGENT INFORMATION */}
          {/* ========================================= */}

          <div className="card border-0 shadow-sm mb-4">

            <div className="card-body p-4">

              <div className="row">

                <div className="col-md-4 mb-3 mb-md-0">
                  <small className="text-muted">
                    Agency Name
                  </small>

                  <div className="fw-semibold mt-1">
                    {agent.agency_name || "-"}
                  </div>
                </div>

                <div className="col-md-4 mb-3 mb-md-0">
                  <small className="text-muted">
                    Owner / Authorized Person
                  </small>

                  <div className="fw-semibold mt-1">
                    {agent.owner_name || "-"}
                  </div>
                </div>

                <div className="col-md-4">
                  <small className="text-muted">
                    Email
                  </small>

                  <div className="fw-semibold mt-1">
                    {agent.email || "-"}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ========================================= */}
          {/* TRANSACTION HISTORY */}
          {/* ========================================= */}

          <div className="card border-0 shadow-sm">

            <div className="card-header bg-white py-3">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <h5 className="fw-bold mb-1">
                    Transaction History
                  </h5>

                  <small className="text-muted">
                    {statement.length} transaction
                    {statement.length !== 1 ? "s" : ""}
                  </small>
                </div>

                <div>
                  <span className="badge bg-light text-dark border">
                    Wallet Ledger
                  </span>
                </div>

              </div>

            </div>

            <div className="card-body p-0">

              {statement.length === 0 ? (

                <div className="text-center py-5">

                  <div
                    style={{
                      fontSize: "52px",
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

                        <th className="px-4">
                          ID
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Type
                        </th>

                        <th>
                          Description
                        </th>

                        <th>
                          Reference
                        </th>

                        <th className="text-end">
                          Amount
                        </th>

                        <th className="text-end px-4">
                          Balance After
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {statement.map((transaction) => {

                        const type =
                          getTransactionType(transaction);

                        const isCredit =
                          type.toLowerCase() === "credit";

                        return (
                          <tr
                            key={transaction.id}
                          >

                            {/* ID */}

                            <td className="px-4">
                              <strong>
                                #{transaction.id}
                              </strong>
                            </td>

                            {/* DATE */}

                            <td>
                              <small>
                                {formatDate(
                                  transaction.created_at
                                )}
                              </small>
                            </td>

                            {/* TYPE */}

                            <td>
                              <span
                                className={`badge ${getTransactionClass(
                                  type
                                )}`}
                              >
                                {type}
                              </span>
                            </td>

                            {/* DESCRIPTION */}

                            <td>
                              <div className="fw-semibold">
                                {transaction.remarks ||
                                  "Wallet Transaction"}
                              </div>
                            </td>

                            {/* REFERENCE */}

                            <td>
                              {transaction.reference ? (
                                <code>
                                  {transaction.reference}
                                </code>
                              ) : (
                                "-"
                              )}
                            </td>

                            {/* AMOUNT */}

                            <td
                              className={`text-end fw-bold ${getAmountClass(
                                type
                              )}`}
                            >
                              {getAmountPrefix(type)} ৳{" "}
                              {formatAmount(
                                transaction.amount
                              )}
                            </td>

                            {/* BALANCE AFTER */}

                            <td className="text-end px-4">

                              <strong>
                                ৳{" "}
                                {formatAmount(
                                  transaction.balance_after
                                )}
                              </strong>

                            </td>

                          </tr>
                        );
                      })}

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