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
    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!password) {
      alert("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const loginURL = `${API}/login`;

      console.log("Laravel API:", API);
      console.log("Login URL:", loginURL);

      const response = await fetch(loginURL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      console.log("HTTP Status:", response.status);

      const responseText = await response.text();

      console.log("Laravel Response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Invalid JSON response:", jsonError);

        alert(
          `Laravel API returned an invalid response.\nHTTP Status: ${response.status}`
        );

        return;
      }

      // Login successful
      if (response.ok && data.success) {
        // Save authentication token
        localStorage.setItem("token", data.token || "");

        // Save agent information
        localStorage.setItem(
          "agent",
          JSON.stringify(data.agent || {})
        );

        alert("Login Successful");

        router.push("/dashboard");

        return;
      }

      // Laravel returned an error
      alert(
        data.message ||
          "Invalid email or password"
      );
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      alert(
        "Cannot connect to Laravel API.\n\nPlease make sure Laravel backend is running."
      );
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

          {/* =========================
              LOGO / HEADER
          ========================= */}

          <div className="text-center mb-4">

            <img
              src="/images/logo.jpg"
              alt="Air Fly International"
              style={{
                width: "120px",
                height: "auto",
                objectFit: "contain",
                marginBottom: "15px",
              }}
            />

            <h3 className="fw-bold mb-1">
              AIR FLY INTERNATIONAL
            </h3>

            <p className="text-muted mb-0">
              Agent Login Portal
            </p>

          </div>


          {/* =========================
              EMAIL
          ========================= */}

          <div className="mb-3">

            <label className="form-label fw-semibold">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter Email"
              value={email}
              disabled={loading}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />

          </div>


          {/* =========================
              PASSWORD
          ========================= */}

          <div className="mb-3">

            <label className="form-label fw-semibold">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter Password"
              value={password}
              disabled={loading}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />

          </div>


          {/* =========================
              LOGIN BUTTON
          ========================= */}

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
            {loading
              ? "Logging in..."
              : "Login"}
          </button>


          {/* =========================
              REGISTER NEW AGENCY
          ========================= */}

          <div className="text-center mt-3">

            <span className="text-muted">
              Don't have an agency account?
            </span>

            <br />

            <button
              type="button"
              className="btn btn-link fw-semibold p-0 mt-1"
              onClick={() => router.push("/register")}
              disabled={loading}
            >
              Register New Agency
            </button>

          </div>


          {/* =========================
              FOOTER
          ========================= */}

          <p className="text-center mt-4 mb-0 text-muted">
            AIR FLY INTERNATIONAL B2B Portal
          </p>

        </div>
      </div>
    </div>
  );
}