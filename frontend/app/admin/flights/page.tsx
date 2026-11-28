"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import API from "../../../services/api";
import FlightForm from "./FlightForm";
import FlightTable, { type Flight } from "./FlightTable";
import EditFlightModal from "./EditFlightModal";

type Airline = {
  id: number;
  name: string;
  code?: string;
  logo?: string | null;
  status?: boolean | number;
};

type AirlinesResponse = {
  success?: boolean;
  airlines?: Airline[];
  data?: Airline[];
  message?: string;
};

type FlightsResponse = {
  success?: boolean;
  flights?: Flight[];
  data?: Flight[];
  message?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
};

const API_URL = API.replace(/\/+$/, "");

function getHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("token");

  if (!token) {
    throw new Error("Admin login required. Please login again.");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid server response. HTTP ${res.status}`);
  }
}

export default function FlightsPage() {
  const [loading, setLoading] = useState(true);

  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);

  const [search, setSearch] = useState("");

  const [airlineId, setAirlineId] = useState("");
  const [flightNo, setFlightNo] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [economyFare, setEconomyFare] = useState("");
  const [businessFare, setBusinessFare] = useState("");
  const [availableSeats, setAvailableSeats] = useState("");

  const [editId, setEditId] = useState<number | null>(null);
  const [editAirlineId, setEditAirlineId] = useState("");
  const [editFlightNo, setEditFlightNo] = useState("");
  const [editFrom, setEditFrom] = useState("");
  const [editTo, setEditTo] = useState("");
  const [editDepartureTime, setEditDepartureTime] = useState("");
  const [editArrivalTime, setEditArrivalTime] = useState("");
  const [editEconomyFare, setEditEconomyFare] = useState("");
  const [editBusinessFare, setEditBusinessFare] = useState("");
  const [editAvailableSeats, setEditAvailableSeats] = useState("");

  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadAirlines = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/airlines`, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await parseResponse<AirlinesResponse>(res);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || `Failed to load airlines. HTTP ${res.status}`
        );
      }

      const list = data.airlines || data.data || [];

      setAirlines(
        Array.isArray(list)
          ? list.filter((item) => item.status === undefined || Boolean(item.status))
          : []
      );
    } catch (error) {
      console.error("Load Airlines Error:", error);
      setAirlines([]);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load airlines."
      );
    }
  }, []);

  const loadFlights = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/flights`, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await parseResponse<FlightsResponse>(res);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || `Failed to load flights. HTTP ${res.status}`
        );
      }

      const list = data.flights || data.data || [];
      setFlights(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load Flights Error:", error);
      setFlights([]);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load flights."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAirlines();
      void loadFlights();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAirlines, loadFlights]);

  async function saveFlight(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    if (!airlineId) {
      alert("Please select an airline.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/flights`, {
        method: "POST",
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          airline_id: airlineId,
          flight_no: flightNo,
          from,
          to,
          departure_time: departureTime,
          arrival_time: arrivalTime,
          economy_fare: economyFare,
          business_fare: businessFare,
          available_seats: availableSeats,
        }),
      });

      const data = await parseResponse<ApiResponse>(res);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || `Failed to save flight. HTTP ${res.status}`
        );
      }

      alert(data.message || "Flight saved successfully.");

      setAirlineId("");
      setFlightNo("");
      setFrom("");
      setTo("");
      setDepartureTime("");
      setArrivalTime("");
      setEconomyFare("");
      setBusinessFare("");
      setAvailableSeats("");

      await loadFlights();
    } catch (error) {
      console.error("Save Flight Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save flight."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteFlight(id: number) {
    if (!window.confirm("Are you sure you want to delete this flight?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/flights/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await parseResponse<ApiResponse>(res);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || `Delete failed. HTTP ${res.status}`
        );
      }

      alert(data.message || "Flight deleted successfully.");
      await loadFlights();
    } catch (error) {
      console.error("Delete Flight Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Delete failed."
      );
    }
  }

  function openEditFlight(item: Flight) {
    setEditId(item.id);
    setEditAirlineId(String(item.airline_id ?? ""));
    setEditFlightNo(item.flight_no);
    setEditFrom(item.from);
    setEditTo(item.to);
    setEditDepartureTime(item.departure_time);
    setEditArrivalTime(item.arrival_time);
    setEditEconomyFare(String(item.economy_fare));
    setEditBusinessFare(String(item.business_fare));
    setEditAvailableSeats(String(item.available_seats));
  }

  async function updateFlight() {
    if (editId === null || updating) return;

    if (!editAirlineId) {
      alert("Please select an airline.");
      return;
    }

    setUpdating(true);

    try {
      const res = await fetch(`${API_URL}/flights/${editId}`, {
        method: "PUT",
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          airline_id: editAirlineId,
          flight_no: editFlightNo,
          from: editFrom,
          to: editTo,
          departure_time: editDepartureTime,
          arrival_time: editArrivalTime,
          economy_fare: editEconomyFare,
          business_fare: editBusinessFare,
          available_seats: editAvailableSeats,
        }),
      });

      const data = await parseResponse<ApiResponse>(res);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || `Update failed. HTTP ${res.status}`
        );
      }

      alert(data.message || "Flight updated successfully.");

      setEditId(null);
      await loadFlights();
    } catch (error) {
      console.error("Update Flight Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Update failed."
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold mb-4">Flight Management</h2>

      {airlines.length === 0 && !loading && (
        <div className="alert alert-warning">
          No active airlines found. Please add or activate an airline
          from Admin Airline Management first.
        </div>
      )}

      <div className="row">
        <div className="col-lg-4">
          <FlightForm
            airlines={airlines}
            airlineId={airlineId}
            setAirlineId={setAirlineId}
            flightNo={flightNo}
            setFlightNo={setFlightNo}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            departureTime={departureTime}
            setDepartureTime={setDepartureTime}
            arrivalTime={arrivalTime}
            setArrivalTime={setArrivalTime}
            economyFare={economyFare}
            setEconomyFare={setEconomyFare}
            businessFare={businessFare}
            setBusinessFare={setBusinessFare}
            availableSeats={availableSeats}
            setAvailableSeats={setAvailableSeats}
            saveFlight={saveFlight}
          />
        </div>

        <div className="col-lg-8">
          <FlightTable
            loading={loading}
            flights={flights}
            search={search}
            setSearch={setSearch}
            openEditFlight={openEditFlight}
            deleteFlight={deleteFlight}
          />
        </div>
      </div>

      <EditFlightModal
        show={editId !== null}
        airlines={airlines}
        onClose={() => setEditId(null)}
        onUpdate={updateFlight}
        airlineId={editAirlineId}
        setAirlineId={setEditAirlineId}
        flightNo={editFlightNo}
        setFlightNo={setEditFlightNo}
        from={editFrom}
        setFrom={setEditFrom}
        to={editTo}
        setTo={setEditTo}
        departureTime={editDepartureTime}
        setDepartureTime={setEditDepartureTime}
        arrivalTime={editArrivalTime}
        setArrivalTime={setEditArrivalTime}
        economyFare={editEconomyFare}
        setEconomyFare={setEditEconomyFare}
        businessFare={editBusinessFare}
        setBusinessFare={setEditBusinessFare}
        availableSeats={editAvailableSeats}
        setAvailableSeats={setEditAvailableSeats}
      />
    </div>
  );
}
