"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    agency_name: "",
    owner_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    if (form.password !== form.confirm_password) {
      alert("Password does not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          agency_name: form.agency_name,
          owner_name: form.owner_name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful");
        router.push("/login");
      } else {
        alert(JSON.stringify(data));
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to Laravel API");
    }

    setLoading(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f5f7fb" }}
    >
      <div
        className="card shadow-lg border-0"
        style={{ width: 500, borderRadius: 15 }}
      >
        <div className="card-body p-5">

          <div className="text-center mb-4">
            <img src="/images/logo.jpg" width="90" alt="logo" />
            <h3 className="mt-3 fw-bold">
              AIR FLY INTERNATIONAL
            </h3>
            <p>Create Agent Account</p>
          </div>

          <input
            className="form-control mb-3"
            placeholder="Agency Name"
            name="agency_name"
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            placeholder="Owner Name"
            name="owner_name"
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            placeholder="Email"
            name="email"
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            placeholder="Phone"
            name="phone"
            onChange={handleChange}
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            name="password"
            onChange={handleChange}
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Confirm Password"
            name="confirm_password"
            onChange={handleChange}
          />

          <button
            className="btn btn-success w-100"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Please Wait..." : "Register"}
          </button>

          <div className="text-center mt-3">
            Already have an account?

            <br />

            <a href="/login">
              Login Here
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}