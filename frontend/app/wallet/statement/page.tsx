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

async function fetchWalletData(): Promise<WalletResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in. Please login again.");
  }

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

  return data;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState("0.00");
  const [agentId, setAgentId] = useState<number | null>(null);
  const [statement, setStatement] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const applyWalletData = useCallback((data: WalletResponse) => {
    setWallet(String(data.wallet ?? 0));
    setAgentId(data.agent_id ?? null);
    setStatement(
      Array.isArray(data.statement) ? data.statement : []
    );
  }, []);

  useEffect(() => {
    let active = true;

    fetchWalletData()
      .then((data) => {
        if (active) {
          applyWalletData(data);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          console.error("WALLET API ERROR:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to connect with Laravel API."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [applyWalletData]);

  const loadWallet = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchWalletData();
      applyWalletData(data);
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
  };

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
