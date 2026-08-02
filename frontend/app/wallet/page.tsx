"use client";

import { useEffect, useState } from "react";

export default function WalletPage() {
  const [wallet, setWallet] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://127.0.0.1:8000/api/wallet/statement",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();

    if (data.success) {
      setWallet(data.wallet);
      setTransactions(data.transactions);
    }
  }

  return (
    <div className="container py-4">

      <div className="card shadow mb-4">

        <div className="card-body">

          <h2>Wallet Balance</h2>

          <h1 className="text-success">
            ৳ {wallet}
          </h1>

        </div>

      </div>

      <div className="card shadow">

        <div className="card-header">
          Wallet Statement
        </div>

        <div className="card-body">

          <table className="table table-bordered">

            <thead>

              <tr>

                <th>Date</th>

                <th>Type</th>

                <th>Reference</th>

                <th>Amount</th>

                <th>Balance</th>

                <th>Remarks</th>

              </tr>

            </thead>

            <tbody>

              {transactions.map((item) => (

                <tr key={item.id}>

                  <td>{item.created_at}</td>

                  <td>

                    {item.type === "Credit" ? (

                      <span className="badge bg-success">
                        Credit
                      </span>

                    ) : (

                      <span className="badge bg-danger">
                        Debit
                      </span>

                    )}

                  </td>

                  <td>{item.reference}</td>

                  <td>৳ {item.amount}</td>

                  <td>৳ {item.balance_after}</td>

                  <td>{item.remarks}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}