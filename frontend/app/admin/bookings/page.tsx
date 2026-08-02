"use client";

import { useEffect, useMemo, useState } from "react";

interface Flight {
  id: number;
  airline: {
    id: number;
    name: string;
  };
  flight_no: string;
  from: string;
  to: string;
  departure_time: string;
  arrival_time: string;
  economy_fare: number;
  business_fare: number;
}

interface Agent {
  id: number;
  agency_name: string;
}

interface Booking {
  id: number;
  pnr: string;
  passenger_name: string;
  passport: string;

  flight: Flight;

  total_amount: number;

  booking_status: string;

  created_at: string;
}

export default function AdminBookingsPage() {

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({

    agent_id: "",

    flight_id: "",

    passenger_name: "",

    passport: "",

    seat_class: "Economy",

  });

  useEffect(() => {

    loadBookings();

    loadFlights();

    loadAgents();

  }, []);  async function loadBookings() {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:8000/api/admin/bookings",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings);
      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }

  async function loadFlights() {

    try {

      const token = localStorage.getItem("token");

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

      console.log(err);

    }

  }

  async function loadAgents() {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:8000/api/agents",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setAgents(data.agents);
      }

    } catch (err) {

      console.log(err);

    }

  }  async function saveBooking() {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:8000/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      alert(data.message);

      if (data.success) {

        setForm({
          agent_id: "",
          flight_id: "",
          passenger_name: "",
          passport: "",
          seat_class: "Economy",
        });

        loadBookings();

      }

    } catch (err) {

      console.log(err);

      alert("Booking Failed");

    }

  }

  async function cancelBooking(id: number) {

    if (!confirm("Cancel this booking?")) return;

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:8000/api/bookings/${id}/cancel`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      alert(data.message);

      if (data.success) {
        loadBookings();
      }

    } catch (err) {

      console.log(err);

    }

  }

  const filteredBookings = useMemo(() => {

    return bookings.filter((b) => {

      const s = search.toLowerCase();

      return (

        b.pnr.toLowerCase().includes(s) ||

        b.passenger_name.toLowerCase().includes(s) ||

        b.passport.toLowerCase().includes(s) ||

        b.flight.airline.name.toLowerCase().includes(s) ||

        b.flight.flight_no.toLowerCase().includes(s)

      );

    });

  }, [bookings, search]);

  return (

    <div className="container-fluid py-4">      <div className="row">

        {/* LEFT */}

        <div className="col-lg-4">

          <div className="card shadow mb-4">

            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">New Booking</h5>
            </div>

            <div className="card-body">

              <div className="mb-3">
                <label className="form-label">Agent</label>

                <select
                  className="form-select"
                  value={form.agent_id}
                  onChange={(e)=>
                    setForm({...form,agent_id:e.target.value})
                  }
                >
                  <option value="">Select Agent</option>

                  {agents.map(agent=>(
                    <option key={agent.id} value={agent.id}>
                      {agent.agency_name}
                    </option>
                  ))}

                </select>

              </div>

              <div className="mb-3">

                <label className="form-label">Flight</label>

                <select
                  className="form-select"
                  value={form.flight_id}
                  onChange={(e)=>
                    setForm({...form,flight_id:e.target.value})
                  }
                >

                  <option value="">Select Flight</option>

                  {flights.map(f=>(
                    <option key={f.id} value={f.id}>
                      {f.airline.name} | {f.flight_no} | {f.from} → {f.to}
                    </option>
                  ))}

                </select>

              </div>

              <div className="mb-3">

                <label className="form-label">Passenger Name</label>

                <input
                  className="form-control"
                  value={form.passenger_name}
                  onChange={(e)=>
                    setForm({...form,passenger_name:e.target.value})
                  }
                />

              </div>

              <div className="mb-3">

                <label className="form-label">Passport</label>

                <input
                  className="form-control"
                  value={form.passport}
                  onChange={(e)=>
                    setForm({...form,passport:e.target.value})
                  }
                />

              </div>

              <div className="mb-3">

                <label className="form-label">Class</label>

                <select
                  className="form-select"
                  value={form.seat_class}
                  onChange={(e)=>
                    setForm({...form,seat_class:e.target.value})
                  }
                >
                  <option>Economy</option>
                  <option>Business</option>
                </select>

              </div>

              <button
                className="btn btn-success w-100"
                onClick={saveBooking}
              >
                Save Booking
              </button>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="col-lg-8">

          <div className="card shadow">

            <div className="card-header d-flex justify-content-between">

              <h5>Bookings</h5>

              <input
                className="form-control w-25"
                placeholder="Search..."
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
              />

            </div>

            <div className="card-body p-0">

              <table className="table table-bordered table-hover mb-0">

                <thead className="table-dark">

                  <tr>
                    <th>#</th>
                    <th>PNR</th>
                    <th>Passenger</th>
                    <th>Flight</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ width: '150px' }}>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td colSpan={7} className="text-center py-5">
                        Loading...
                      </td>
                    </tr>

                  ) : filteredBookings.length===0 ? (

                    <tr>
                      <td colSpan={7} className="text-center py-5">
                        No Booking Found
                      </td>
                    </tr>

                  ) : (

                    filteredBookings.map((item,index)=>(

                      <tr key={item.id}>

                        <td>{index+1}</td>

                        <td>{item.pnr}</td>

                        <td>
                          {item.passenger_name}
                          <br/>
                          <small>{item.passport}</small>
                        </td>

                        <td>
                          {item.flight.airline.name}
                          <br/>
                          {item.flight.flight_no}
                        </td>

                        <td>
                          ৳ {Number(item.total_amount).toLocaleString()}
                        </td>

                        <td>

                          <span className={`badge ${
                            item.booking_status==="Confirmed"
                            ? "bg-success"
                            : "bg-danger"
                          }`}>
                            {item.booking_status}
                          </span>

                        </td>

                        <td>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={()=>cancelBooking(item.id)}
                          >
                            Cancel
                          </button>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}
    