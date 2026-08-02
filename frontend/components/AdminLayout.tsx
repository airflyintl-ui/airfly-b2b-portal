"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="d-flex">

      <Sidebar />

      <div
        style={{
          marginLeft: 260,
          width: "100%",
          minHeight: "100vh",
          background: "#f5f7fb",
        }}
      >
        <Topbar />

        <div className="p-4">
          {children}
        </div>

      </div>

    </div>
  );
}