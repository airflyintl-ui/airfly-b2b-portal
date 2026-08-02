import API from "./api";

export async function rechargeWallet(data: any) {
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