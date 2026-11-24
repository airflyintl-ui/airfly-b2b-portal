"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="airfly-navbar">
        <div className="container airfly-nav-container">

          <Link href="/" className="airfly-brand" onClick={closeMenu}>
            <span className="brand-icon">✈</span>
            <span>
              <strong>AIRFLY INTERNATIONAL</strong>
              <small>B2B TRAVEL PORTAL</small>
            </span>
          </Link>

          <button
            className="airfly-toggler"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          <div className={`airfly-menu ${menuOpen ? "menu-open" : ""}`}>
            <Link href="/" onClick={closeMenu}>Home</Link>

            <Link href="/#flight-search" onClick={closeMenu}>
              Flights
            </Link>

            <Link href="/group-fare" onClick={closeMenu}>
              Group Fare
            </Link>

            <Link href="/visa" onClick={closeMenu}>
              Visa
            </Link>

            <Link href="/contact" onClick={closeMenu}>
              Contact
            </Link>

            <Link
              href="/login"
              className="agent-login-btn"
              onClick={closeMenu}
            >
              Agent Login <span>→</span>
            </Link>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .airfly-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #102b50;
          box-shadow: 0 4px 18px rgba(5, 25, 50, 0.18);
        }

        .airfly-nav-container {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .airfly-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          color: white;
          text-decoration: none;
        }

        .brand-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          background: #13a6a0;
          border-radius: 12px;
          font-size: 24px;
        }

        .airfly-brand strong,
        .airfly-brand small {
          display: block;
        }

        .airfly-brand strong {
          font-size: 16px;
          letter-spacing: 0.5px;
          font-weight: 850;
        }

        .airfly-brand small {
          margin-top: 3px;
          color: #9bc8db;
          font-size: 9px;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .airfly-menu {
          display: flex;
          align-items: center;
          gap: 27px;
        }

        .airfly-menu > a {
          color: #e5eef8;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .airfly-menu > a:hover {
          color: #42d4c7;
        }

        .airfly-menu .agent-login-btn {
          background: #13a6a0;
          color: white;
          padding: 11px 19px;
          border-radius: 9px;
          font-weight: 800;
        }

        .agent-login-btn:hover {
          background: #0e8e89;
          color: white;
        }

        .agent-login-btn span {
          margin-left: 7px;
        }

        .airfly-toggler {
          display: none;
          background: transparent;
          border: 1px solid #7f9db9;
          color: white;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 23px;
          cursor: pointer;
        }

        @media (max-width: 991px) {
          .airfly-nav-container {
            flex-wrap: wrap;
            padding-top: 12px;
            padding-bottom: 12px;
          }

          .airfly-toggler {
            display: block;
          }

          .airfly-menu {
            display: none;
            width: 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            padding: 8px 0;
          }

          .airfly-menu.menu-open {
            display: flex;
          }

          .airfly-menu > a {
            padding: 12px 8px;
            border-bottom: 1px solid rgba(255,255,255,0.09);
          }

          .airfly-menu .agent-login-btn {
            margin-top: 12px;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .airfly-brand strong {
            font-size: 13px;
          }

          .brand-icon {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </>
  );
}
