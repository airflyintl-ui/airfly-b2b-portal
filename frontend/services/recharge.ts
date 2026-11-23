import API from "./api";

type RechargeData = {
  [key: string]: unknown;
};

export async function rechargeWallet(data: RechargeData) {
  const res = await fetch(`${API}/recharges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function walletStatement(agentId: number) {
  const res = await fetch(
    `${API}/wallet/statement?agent_id=${agentId}`
  );

  return await res.json();
}
