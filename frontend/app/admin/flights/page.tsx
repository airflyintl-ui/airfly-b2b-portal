"use client";

import { useEffect, useState } from "react";

import FlightForm from "./FlightForm";
import FlightTable from "./FlightTable";
import EditFlightModal from "./EditFlightModal";

export default function FlightsPage() {
  // =========================
  // States
  // =========================

  const [loading, setLoading] = useState(true);

  const [airlines, setAirlines] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  // Add Flight

  const [airlineId, setAirlineId] = useState("");

  const [flightNo, setFlightNo] = useState("");

  const [from, setFrom] = useState("");

  const [to, setTo] = useState("");

  const [departureTime, setDepartureTime] = useState("");

  const [arrivalTime, setArrivalTime] = useState("");

  const [economyFare, setEconomyFare] = useState("");

  const [businessFare, setBusinessFare] = useState("");

  const [availableSeats, setAvailableSeats] = useState("");

  // Edit Flight

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

  // =========================
  // Load Data
  // =========================

  useEffect(() => {
    loadAirlines();
    loadFlights();
  }, []);
async function loadAirlines() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/airlines", {
      headers: {
        Accept: "application/json",
      },
    });

    const data = await res.json();

    console.log("Airlines Response:", data);

    if (data.success) {
      setAirlines(data.airlines);
    } else {
      setAirlines([]);
    }
  } catch (err) {
    console.error("Load Airlines Error:", err);
    setAirlines([]);
  }
}

  async function loadFlights() {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/flights",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setFlights(data.flights);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }
    // =========================
  // Save Flight
  // =========================

  async function saveFlight(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/flights", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
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

      const data = await res.json();

      alert(data.message);

      if (data.success) {
        setAirlineId("");
        setFlightNo("");
        setFrom("");
        setTo("");
        setDepartureTime("");
        setArrivalTime("");
        setEconomyFare("");
        setBusinessFare("");
        setAvailableSeats("");

        loadFlights();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save flight");
    }
  }

  // =========================
  // Delete Flight
  // =========================

  async function deleteFlight(id: number) {
    if (!confirm("Are you sure you want to delete this flight?")) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/flights/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      alert(data.message);

      if (data.success) {
        loadFlights();
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  // =========================
  // Open Edit Modal
  // =========================

  function openEditFlight(item: any) {
    setEditId(item.id);

    setEditAirlineId(String(item.airline_id));
    setEditFlightNo(item.flight_no);
    setEditFrom(item.from);
    setEditTo(item.to);

    setEditDepartureTime(item.departure_time);
    setEditArrivalTime(item.arrival_time);

    setEditEconomyFare(String(item.economy_fare));
    setEditBusinessFare(String(item.business_fare));
    setEditAvailableSeats(String(item.available_seats));
  }

  // =========================
  // Update Flight
  // =========================

  async function updateFlight() {
    if (!editId) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/flights/${editId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
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
        }
      );

      const data = await res.json();

      alert(data.message);

      if (data.success) {
        setEditId(null);
        loadFlights();
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  }  // =========================
  // JSX
  // =========================

  return (
    <div className="container-fluid py-4">

      <h2 className="fw-bold mb-4">
        Flight Management
      </h2>

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