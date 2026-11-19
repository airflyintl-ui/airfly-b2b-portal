"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../services/api";

type Agent = {
  id: number;
  agency_name: string;
  owner_name: string;
  email: string;
  mobile: string;
  wallet: string | number;
  status: string;
};

type Transaction = {
  id: number;
  type: "Credit" | "Debit";
  amount: string | number;
  balance_after: string | number;
  reference: string | null;
  remarks: string | null;
  created_at: string;
};

export default function AdminWallets() {
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [modalType, setModalType] = useState<"Credit" | "Debit" | null>(null);

  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [reference, setReference] = useState("");

  const [saving, setSaving] = useState(false);

  const [historyAgent, setHistoryAgent] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const getToken = () => localStorage.getItem("admin_token");

  const formatMoney = (value: string | number) => {
    return Number(value || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const loadAgents = useCallback(async (page = 1) => {
    const token = getToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/admin/agents/wallets?page=${page}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        setError("Admin authorization failed. Please login again.");
        return;
      }

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to load agent wallets.");
        return;
      }

      const pagination = data.agents;

      setAgents(pagination?.data || []);
      setCurrentPage(pagination?.current_page || 1);
      setLastPage(pagination?.last_page || 1);
    } catch (err) {
      console.error(err);
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const openAdjustment = (
    agent: Agent,
    type: "Credit" | "Debit"
  ) => {
    setSelectedAgent(agent);
    setModalType(type);
    setAmount("");
    setRemarks("");
    setReference("");
  };

  const closeAdjustment = () => {
    if (saving) return;

    setSelectedAgent(null);
    setModalType(null);
  };

  const submitAdjustment = async () => {
    if (!selectedAgent || !modalType) return;

    const numericAmount = Number(amount);

    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      alert("Maximum 2 decimal places are allowed.");
      return;
    }

    if (modalType === "Debit" && !remarks.trim()) {
      alert("Please enter the reason for deduction.");
      return;
    }

    const token = getToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const confirmed = window.confirm(
      `${modalType === "Credit" ? "Add" : "Deduct"} ৳${amount} ${
        modalType === "Credit" ? "to" : "from"
      } ${selectedAgent.agency_name}'s wallet?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const response = await fetch(
        `${API}/admin/agents/${selectedAgent.id}/wallet-adjustments`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: modalType,
            amount,
            remarks: remarks.trim() || null,
            reference: reference.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        const validationError = data.errors
          ? Object.values(data.errors).flat()[0]
          : null;

        alert(
          String(validationError || data.message || "Wallet adjustment failed.")
        );
        return;
      }

      alert(
        `${modalType} successful! New Wallet Balance: ৳${formatMoney(
          data.data.wallet
        )}`
      );

      setSelectedAgent(null);
      setModalType(null);

      await loadAgents(currentPage);
    } catch (err) {
      console.error(err);
      alert("Cannot connect to backend.");
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async (agent: Agent) => {
    const token = getToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setHistoryAgent(agent);
      setHistoryLoading(true);
      setTransactions([]);

      const response = await fetch(
        `${API}/admin/agents/${agent.id}/wallet-transactions`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to load wallet history.");
        setHistoryAgent(null);
        return;
      }

      setHistoryAgent(data.agent);
      setTransactions(data.transactions?.data || []);
    } catch (err) {
      console.error(err);
      alert("Cannot connect to backend.");
      setHistoryAgent(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Loading Agent Wallets...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold">Agent Wallet Management</h2>
          <p className="text-muted mb-0">
            AIR FLY INTERNATIONAL - Wallet Control
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => loadAgents(currentPage)}
          >
            ↻ Refresh
          </button>

          <button
            className="btn btn-outline-secondary"
            onClick={() => router.push("/admin/dashboard")}
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn btn-sm btn-primary ms-3"
            onClick={() => loadAgents(currentPage)}
          >
            Retry
          </button>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">All Agent Wallets</h5>
            <span className="badge bg-primary">
              Agents: {agents.length}
            </span>
          </div>

          {agents.length === 0 ? (
            <div className="text-center text-muted py-5">
              No agents found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Agency</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Wallet Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      <td>{agent.id}</td>
                      <td className="fw-semibold">
                        {agent.agency_name}
                      </td>
                      <td>{agent.owner_name}</td>
                      <td>{agent.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            agent.status === "approved"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {agent.status}
                        </span>
                      </td>
                      <td className="fw-bold text-success">
                        ৳{formatMoney(agent.wallet)}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              openAdjustment(agent, "Credit")
                            }
                          >
                            + Add Money
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              openAdjustment(agent, "Debit")
                            }
                          >
                            − Deduct
                          </button>

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => loadHistory(agent)}
                          >
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {lastPage > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage <= 1}
                onClick={() => loadAgents(currentPage - 1)}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {lastPage}
              </span>

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage >= lastPage}
                onClick={() => loadAgents(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedAgent && modalType && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {modalType === "Credit"
                    ? "Add Money to Wallet"
                    : "Deduct Money from Wallet"}
                </h5>

                <button
                  className="btn-close"
                  disabled={saving}
                  onClick={closeAdjustment}
                />
              </div>

              <div className="modal-body">
                <p>
                  Agency: <strong>{selectedAgent.agency_name}</strong>
                </p>

                <p>
                  Current Balance:{" "}
                  <strong className="text-success">
                    ৳{formatMoney(selectedAgent.wallet)}
                  </strong>
                </p>

                <label className="form-label fw-semibold">
                  Amount (BDT)
                </label>

                <input
                  type="number"
                  className="form-control mb-3"
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <label className="form-label fw-semibold">
                  Reason / Remarks{" "}
                  {modalType === "Debit" && (
                    <span className="text-danger">*</span>
                  )}
                </label>

                <textarea
                  className="form-control mb-3"
                  rows={3}
                  placeholder={
                    modalType === "Credit"
                      ? "Optional note"
                      : "Why are you deducting money?"
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  maxLength={255}
                />

                <label className="form-label fw-semibold">
                  Reference Number (Optional)
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter reference number"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  maxLength={255}
                />

                <div className="alert alert-info mt-3 mb-0">
                  {modalType === "Credit"
                    ? "This will be recorded as Admin Credit, not Recharge."
                    : "The amount will be deducted only if sufficient balance is available."}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  disabled={saving}
                  onClick={closeAdjustment}
                >
                  Cancel
                </button>

                <button
                  className={`btn ${
                    modalType === "Credit"
                      ? "btn-success"
                      : "btn-danger"
                  }`}
                  disabled={
                    saving ||
                    !amount ||
                    Number(amount) <= 0 ||
                    (modalType === "Debit" && !remarks.trim())
                  }
                  onClick={submitAdjustment}
                >
                  {saving
                    ? "Processing..."
                    : modalType === "Credit"
                    ? "Confirm Add Money"
                    : "Confirm Deduction"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {historyAgent && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    Wallet Transaction History
                  </h5>
                  <small className="text-muted">
                    {historyAgent.agency_name} | Current Balance: ৳
                    {formatMoney(historyAgent.wallet)}
                  </small>
                </div>

                <button
                  className="btn-close"
                  onClick={() => setHistoryAgent(null)}
                />
              </div>

              <div className="modal-body">
                {historyLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" />
                    <p className="mt-2">Loading Transactions...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    No wallet transactions found.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Balance After</th>
                          <th>Reference</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>

                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td>{transaction.id}</td>
                            <td>
                              {new Date(
                                transaction.created_at
                              ).toLocaleString()}
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
                            <td
                              className={
                                transaction.type === "Credit"
                                  ? "text-success fw-bold"
                                  : "text-danger fw-bold"
                              }
                            >
                              ৳{formatMoney(transaction.amount)}
                            </td>
                            <td>
                              ৳{formatMoney(transaction.balance_after)}
                            </td>
                            <td>{transaction.reference || "-"}</td>
                            <td>{transaction.remarks || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setHistoryAgent(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
