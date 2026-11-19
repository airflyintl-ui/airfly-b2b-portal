"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow sticky-top">
      <div className="container">
        <Link
          href="/"
          className="navbar-brand fw-bold"
          onClick={closeMenu}
        >
          ✈ AIR FLY INTERNATIONAL
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-controls="navbarNav"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          style={{
            border: "1px solid white",
            padding: "6px 12px",
          }}
        >
          <span style={{ color: "white", fontSize: "25px" }}>
            {menuOpen ? "✕" : "☰"}
          </span>
        </button>

        <div
          className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link href="/" className="nav-link" onClick={closeMenu}>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                href="/#flight-search"
                className="nav-link"
                onClick={closeMenu}
              >
                Flights
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/visa" className="nav-link" onClick={closeMenu}>
                Visa
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/hotels" className="nav-link" onClick={closeMenu}>
                Hotels
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/contact" className="nav-link" onClick={closeMenu}>
                Contact
              </Link>
            </li>

            <li className="nav-item ms-lg-3 mt-2 mt-lg-0 mb-2 mb-lg-0">
              <Link
                href="/login"
                className="btn btn-warning fw-bold px-4"
                onClick={closeMenu}
              >
                Agent Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
