"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menus = [
    {
      title: "Dashboard",
      icon: "📊",
      href: "/admin/dashboard",
    },
    {
      title: "Bookings",
      icon: "✈️",
      href: "/admin/bookings",
    },
    {
      title: "Agents",
      icon: "👥",
      href: "/admin/agents",
    },
    {
      title: "Recharges",
      icon: "💳",
      href: "/admin/recharges",
    },
    {
      title: "Reports",
      icon: "📈",
      href: "/admin/reports",
    },
    {
      title: "Settings",
      icon: "⚙️",
      href: "/admin/settings",
    },
  ];

  return (
    <aside
      className="bg-dark text-white vh-100 position-fixed"
      style={{
        width: "260px",
        left: 0,
        top: 0,
      }}
    >
      <div className="p-4 border-bottom">

        <h3 className="fw-bold text-center mb-0">
          ✈ AIR FLY
        </h3>

        <small className="d-block text-center text-secondary">
          Admin Panel
        </small>

      </div>

      <div className="p-3">

        {menus.map((menu) => (

          <Link
            key={menu.href}
            href={menu.href}
            className={`d-flex align-items-center mb-2 text-decoration-none rounded px-3 py-3 ${
              pathname === menu.href
                ? "bg-primary text-white"
                : "text-light"
            }`}
          >
            <span style={{ fontSize: 22 }}>
              {menu.icon}
            </span>

            <span className="ms-3 fw-semibold">
              {menu.title}
            </span>

          </Link>

        ))}

      </div>

      <div className="position-absolute bottom-0 start-0 w-100 p-3 border-top">

        <small className="text-secondary">
          AirFly International
        </small>

      </div>

    </aside>
  );
}