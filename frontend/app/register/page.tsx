"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";

export default function Register() {
  const router = useRouter();

  const [agencyName, setAgencyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [tradeLicense, setTradeLicense] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!agencyName.trim()) {
      alert("Please enter agency name");
      return;
    }

    if (!ownerName.trim()) {
      alert("Please enter owner name");
      return;
    }

    if (!email.trim()) {
      alert("Please enter email");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter phone number");
      return;
    }

    if (!address.trim()) {
      alert("Please enter agency address");
      return;
    }

    if (!tradeLicense.trim()) {
      alert("Please enter trade license number");
      return;
    }

    if (!password) {
      alert("Please enter password");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (!passwordConfirmation) {
      alert("Please confirm your password");
      return;
    }

    if (password !== passwordConfirmation) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const registerURL = `${API}/register`;

      console.log("Laravel API:", API);
      console.log("Register URL:", registerURL);

      const response = await fetch(registerURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          agency_name: agencyName.trim(),
          owner_name: ownerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          trade_license: tradeLicense.trim(),
          password: password,
          password_confirmation: passwordConfirmation,
        }),
      });

      console.log("HTTP Status:", response.status);

      const responseText = await response.text();
      console.log("Laravel Response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Invalid JSON:", jsonError);
        alert(`Invalid Laravel response. HTTP Status: ${response.status}`);
        return;
      }

      if (response.ok && data.success) {
        alert(
          "Agency Registration Successful!\n\nPlease wait for admin approval."
        );

        setAgencyName("");
        setOwnerName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setTradeLicense("");
        setPassword("");
        setPasswordConfirmation("");

        router.push("/login");
        return;
      }

      if (data.errors) {
        let errorMessage = "";

        Object.keys(data.errors).forEach((field) => {
          errorMessage += `${field}: ${data.errors[field]?.[0] || "Invalid value"}\n`;
        });

        alert(errorMessage || "Registration failed");
        return;
      }

      alert(data.message || "Registration failed. Please try again.");
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      alert(
        "Cannot connect to Laravel API.\n\nPlease check whether the Laravel backend is running."
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
          width: "500px",
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
                height: "auto",
                objectFit: "contain",
                marginBottom: "15px",
              }}
            />

            <h3 className="fw-bold mb-1">
              AIR FLY INTERNATIONAL
            </h3>

            <p className="text-muted mb-0">
              New Agent Registration
            </p>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Agency Name *
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter agency name"
              value={agencyName}
              disabled={loading}
              onChange={(e) => setAgencyName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Owner Name *
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter owner name"
              value={ownerName}
              disabled={loading}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Email *
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="agency@email.com"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Phone *
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="017XXXXXXXX"
              value={phone}
              disabled={loading}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* AGENCY ADDRESS */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Agency Address *
            </label>
            <textarea
              className="form-control"
              placeholder="Enter full agency address"
              rows={3}
              value={address}
              disabled={loading}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* TRADE LICENSE */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Trade License Number *
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter trade license number"
              value={tradeLicense}
              disabled={loading}
              onChange={(e) => setTradeLicense(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Password *
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Confirm Password *
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm password"
              value={passwordConfirmation}
              disabled={loading}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRegister();
                }
              }}
            />
          </div>

          <button
            type="button"
            className="btn btn-success w-100"
            onClick={handleRegister}
            disabled={loading}
            style={{
              height: "46px",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {loading ? "Registering..." : "Register Agency"}
          </button>

          <div className="text-center mt-3">
            <span className="text-muted">
              Already have an agency account?
            </span>

            <br />

            <button
              type="button"
              className="btn btn-link fw-semibold p-0 mt-1"
              onClick={() => router.push("/login")}
              disabled={loading}
            >
              Back to Login
            </button>
          </div>

          <p className="text-center mt-4 mb-0 text-muted">
            AIR FLY INTERNATIONAL B2B Portal
          </p>
        </div>
      </div>
    </div>
  );
}
