"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow sticky-top">
      <div className="container">

        {/* Logo */}
        <Link href="/" className="navbar-brand fw-bold">
          ✈ AIR FLY INTERNATIONAL
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">

            <li className="nav-item">
              <Link href="/" className="nav-link">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/flights" className="nav-link">
                Flights
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/visa" className="nav-link">
                Visa
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/hotels" className="nav-link">
                Hotels
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/contact" className="nav-link">
                Contact
              </Link>
            </li>

            <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
              <Link
                href="/login"
                className="btn btn-warning fw-bold px-4"
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