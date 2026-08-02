"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("agent", JSON.stringify(data.agent));

        alert("Login Successful");

        router.push("/dashboard");
      } else {
        alert(data.message || "Invalid Login");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to Laravel API");
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
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: "420px",
          borderRadius: "15px",
        }}
      >
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <img src="/images/logo.jpg" width="90" alt="Logo" />

            <h3 className="mt-3 fw-bold">
              AIR FLY INTERNATIONAL
            </h3>

            <p className="text-muted">
              Agent Login Portal
            </p>
          </div>

          <div className="mb-3">
            <label>Email</label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Password</label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary w-100"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center mt-3 text-muted">
            AIR FLY INTERNATIONAL B2B Portal
          </p>
        </div>
      </div>
    </div>
  );
}