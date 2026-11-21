"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";


interface Flight {
  id: number;
  airline_id?: number;
  flight_no?: string;
  from?: string;
  to?: string;
  departure_time?: string;
  arrival_time?: string;
  economy_fare?: string | number;
  business_fare?: string | number;
  available_seats?: number;
  status?: boolean;
}

interface Booking {
  id: number;
  agent_id: number;
  flight_id: number;
  pnr: string;
  passenger_name: string;
  passport: string;
  nationality?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  journey_type?: string;
  travel_class?: string;
  adults?: number;
  children?: number;
  infants?: number;
  total_amount: string | number;
  ticket_number?: string;
  payment_status?: string;
  booking_status?: string;
  remarks?: string | null;
  created_at?: string;
  updated_at?: string;
  flight?: Flight;
}

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wallet, setWallet] = useState<string | number>("0");

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  // =========================================================
  // FETCH BOOKINGS
  // =========================================================

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/bookings`, {
        method: "GET",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },

        cache: "no-store",
      });

      const data = await response.json();

      console.log("BOOKINGS RESPONSE:", data);

      if (response.status === 401) {
        localStorage.removeItem("token");

        alert("Session expired. Please login again.");
