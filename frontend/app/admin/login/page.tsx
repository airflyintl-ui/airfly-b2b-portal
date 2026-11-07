"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../../services/api";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        alert(data.message || "Invalid admin email or password.");
        return;
      }

      // Store Admin token separately from Agent token
      localStorage.setItem("admin_token", data.token);

      alert("Admin Login Successful!");

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Admin Login Error:", error);
      alert("Cannot connect to the backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "#f4f7fc",
        padding: "20px",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: "420px",
          maxWidth: "100%",
          borderRadius: "15px",
        }}
      >
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <img
              src="/images/logo.jpg"
              alt="Air Fly International"
              style={{
                width: "120px",
                objectFit: "contain",
                marginBottom: "15px",
              }}
            />

            <h3 className="fw-bold">AIR FLY INTERNATIONAL</h3>
            <p className="text-muted mb-0">Administrator Login</p>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Admin Email
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter admin email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter admin password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={handleLogin}
            disabled={loading}
            style={{
              height: "45px",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {loading ? "Logging in..." : "Admin Login"}
          </button>

          <p className="text-center text-muted mt-4 mb-0">
            AIR FLY INTERNATIONAL B2B Portal
          </p>
        </div>
      </div>
    </div>
  );
}
