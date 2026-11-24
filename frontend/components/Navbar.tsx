"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const linkStyle: React.CSSProperties = {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 9999,
        width: "100%",
        backgroundColor: "#0d6efd",
        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
      }}
    >
      <div
        className="container"
        style={{
          minHeight: "76px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px",
          paddingTop: "10px",
          paddingBottom: "10px",
        }}
      >
        <Link
          href="/"
          onClick={closeMenu}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#ffffff",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: "43px",
              height: "43px",
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "10px",
              fontSize: "24px",
            }}
          >
            ✈
          </span>

          <span>
            <strong style={{ display: "block", fontSize: "15px" }}>
              AIR FLY INTERNATIONAL
            </strong>
            <small
              style={{
                display: "block",
                fontSize: "9px",
                letterSpacing: "2px",
                color: "#ffffff",
              }}
            >
              B2B TRAVEL PORTAL
            </small>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          style={{
            display: "none",
            background: "transparent",
            border: "1px solid white",
            color: "white",
            padding: "7px 12px",
            borderRadius: "6px",
            fontSize: "22px",
            cursor: "pointer",
          }}
          className="airfly-mobile-toggle"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div
          className={`airfly-nav-links ${menuOpen ? "airfly-open" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "25px",
          }}
        >
          <Link href="/" onClick={closeMenu} style={linkStyle}>Home</Link>
          <Link href="/#flight-search" onClick={closeMenu} style={linkStyle}>Flights</Link>
          <Link href="/group-fare" onClick={closeMenu} style={linkStyle}>Group Fare</Link>
          <Link href="/visa" onClick={closeMenu} style={linkStyle}>Visa</Link>
          <Link href="/contact" onClick={closeMenu} style={linkStyle}>Contact</Link>

          <Link
            href="/login"
            onClick={closeMenu}
            style={{
              background: "#ffc107",
              color: "#212529",
              padding: "11px 19px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 800,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Agent Login →
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 991px) {
          .airfly-mobile-toggle {
            display: block !important;
          }

          .airfly-nav-links {
            display: none !important;
            width: 100%;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0 !important;
            padding: 10px 0;
          }

          .airfly-nav-links.airfly-open {
            display: flex !important;
          }

          .airfly-nav-links a {
            padding: 12px 8px;
          }
        }
      `}</style>
    </nav>
  );
}
