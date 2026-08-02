export default function WalletCard() {
  return (
    <div className="card shadow border-0 mt-4">

      <div className="card-header bg-success text-white">
        Agent Wallet
      </div>

      <div className="card-body">

        <h2 className="text-success">
          ৳ 250,000
        </h2>

        <p className="text-muted">
          Available Balance
        </p>

        <hr />

        <button className="btn btn-success w-100">
          Pay From Wallet
        </button>

      </div>

    </div>
  );
}