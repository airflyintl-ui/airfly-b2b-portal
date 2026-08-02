"use client";

import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("agent");

    router.push("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg bg-white shadow-sm px-4"
      style={{
        height: "70px",
        marginLeft: "260px",
      }}
    >
      <div className="container-fluid">

        <div>

          <h4 className="mb-0 fw-bold">
            Dashboard
          </h4>

          <small className="text-muted">
            Welcome to AirFly International
          </small>

        </div>

        <div className="d-flex align-items-center gap-3">

          <button
            className="btn btn-light position-relative"
            title="Notifications"
          >
            🔔

            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            >
              3
            </span>

          </button>

          <button
            className="btn btn-light"
            title="Dark Mode"
          >
            🌙
          </button>

          <div className="dropdown">

            <button
              className="btn btn-outline-primary dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              👤 Admin
            </button>

            <ul className="dropdown-menu dropdown-menu-end">

              <li>
                <button className="dropdown-item">
                  Profile
                </button>
              </li>

              <li>
                <button className="dropdown-item">
                  Settings
                </button>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={logout}
                >
                  Logout
                </button>
              </li>

            </ul>

          </div>

        </div>

      </div>
    </nav>
  );
}