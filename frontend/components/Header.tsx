export default function DashboardHeader() {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">

      <div>
        <h2 className="fw-bold">Dashboard</h2>
        <p className="text-muted">
          Welcome back, Agent
        </p>
      </div>

      <div className="d-flex align-items-center">

        <button className="btn btn-light me-3">
          🔔
        </button>

        <img
          src="/images/logo.jpg"
          alt="Profile"
          className="rounded-circle"
          style={{
            width: "45px",
            height: "45px",
            objectFit: "cover",
          }}
        />

      </div>

    </div>
  );
}