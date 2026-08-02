"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("agent");
    router.push("/login");
  };

  const menu = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "Agents", href: "/agents", icon: "👤" },
    { name: "Flight Search", href: "/flights", icon: "✈" },
    { name: "Bookings", href: "/bookings", icon: "🎫" },
    { name: "Recharge", href: "/recharges", icon: "💳" },
    { name: "Wallet", href: "/wallet", icon: "💰" },
    { name: "Reports", href: "/reports", icon: "📊" },
  ];

  return (
    <div
      className="bg-dark text-white vh-100 p-3"
      style={{ width: 260, position: "fixed" }}
    >
      <h3 className="text-center mb-4">
        ✈ AIR FLY
      </h3>

      {menu.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`d-block p-3 rounded mb-2 text-decoration-none ${
            pathname === item.href
              ? "bg-primary text-white"
              : "text-light"
          }`}
        >
          {item.icon} {item.name}
        </Link>
      ))}

      <button
        className="btn btn-danger w-100 mt-4"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}