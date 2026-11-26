"use client";

import { useState, type FormEvent } from "react";
import API from "../../services/api";

const cardStyle = {
  background: "#ffffff",
  padding: "24px",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
};

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "13px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    marginTop: "7px",
    fontSize: "15px",
    boxSizing: "border-box" as const,
    color: "#1f2937",
    background: "#ffffff",
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(
        `${API.replace(/\/+$/, "")}/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Message could not be sent.");
      }

      setStatus("Your message has been sent successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const text = [
      "Hello Airfly International,",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const url = `https://wa.me/8801711304917?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f6fb",
        color: "#1f2937",
        fontFamily: "Arial, sans-serif",
        paddingBottom: "50px",
      }}
    >
      <header
        style={{
          background: "#1266e8",
          color: "white",
          textAlign: "center",
          padding: "55px 20px",
        }}
      >
        <h1 style={{ fontSize: "34px", fontWeight: 800, margin: "0 0 12px" }}>
          Contact Airfly International
        </h1>
        <p style={{ fontSize: "17px", margin: 0 }}>
          We are always ready to assist you with your travel needs.
        </p>
      </header>

      <div
        style={{
          maxWidth: "1050px",
          width: "calc(100% - 32px)",
          margin: "40px auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "25px",
            alignItems: "start",
          }}
        >
          <section style={cardStyle}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#1266e8",
                margin: "0 0 25px",
              }}
            >
              Contact Information
            </h2>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                📍 Office Address
              </div>
              <p style={{ lineHeight: 1.8, margin: "8px 0 0", color: "#4b5563" }}>
                598/A, Shamsuddin Tower (2nd Floor),
                <br />
                Reazuddin Bazar, Chattogram
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                ☎ Telephone
              </div>
              <a href="tel:02333366085" style={{ color: "#1266e8", display: "inline-block", marginTop: "8px" }}>
                02-333366085
              </a>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                📱 Mobile
              </div>
              <a href="tel:01819316705" style={{ color: "#1266e8", display: "inline-block", marginTop: "8px" }}>
                01819316705
              </a>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                ✉ Email
              </div>
              <a href="mailto:airflyintl@gmail.com" style={{ color: "#1266e8", display: "inline-block", marginTop: "8px" }}>
                airflyintl@gmail.com
              </a>
            </div>

            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              <div style={{ color: "#15803d", fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>
                WhatsApp Contact
              </div>

              <div style={{ color: "#166534", fontSize: "23px", fontWeight: 800, marginBottom: "15px" }}>
                01711304917
              </div>

              <a
                href="https://wa.me/8801711304917"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  background: "#16a34a",
                  color: "#ffffff",
                  padding: "12px 22px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Chat on WhatsApp →
              </a>
            </div>
          </section>

          <section style={cardStyle}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#1266e8",
                margin: "0 0 10px",
              }}
            >
              Send Us a Message
            </h2>

            <p style={{ color: "#6b7280", marginBottom: "25px" }}>
              Have a question? Send us your message.
            </p>

            <form onSubmit={handleSubmit}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "16px" }}>
                Your Name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  style={inputStyle}
                />
              </label>

              <label style={{ display: "block", fontWeight: 600, marginBottom: "16px" }}>
                Email Address
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={inputStyle}
                />
              </label>

              <label style={{ display: "block", fontWeight: 600, marginBottom: "16px" }}>
                Phone Number
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  style={inputStyle}
                />
              </label>

              <label style={{ display: "block", fontWeight: 600, marginBottom: "20px" }}>
                Your Message
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: loading ? "#9ca3af" : "#facc15",
                  color: "#111827",
                  border: "none",
                  borderRadius: "9px",
                  fontSize: "16px",
                  fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Sending..." : "Send Email"}
              </button>

              <button
                type="button"
                onClick={handleWhatsApp}
                disabled={!name.trim() || !email.trim() || !message.trim()}
                style={{
                  width: "100%",
                  padding: "15px",
                  marginTop: "12px",
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "9px",
                  fontSize: "16px",
                  fontWeight: 800,
                  cursor: "pointer",
                  opacity:
                    !name.trim() || !email.trim() || !message.trim()
                      ? 0.6
                      : 1,
                }}
              >
                Send via WhatsApp
              </button>
            </form>

            {status && (
              <p
                role="status"
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: status.includes("successfully")
                    ? "#dcfce7"
                    : "#fee2e2",
                  color: status.includes("successfully")
                    ? "#166534"
                    : "#991b1b",
                }}
              >
                {status}
              </p>
            )}

            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "15px" }}>
              Email messages are sent securely through Airfly International.
              WhatsApp messages require your confirmation in WhatsApp.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
