"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FlightsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    from: "",
    to: "",
    departure: "",
    adults: 1,
    children: 0,
    infants: 0,
    cabin: "Economy",
  });

  const handleSearch = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please Login First");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/search-flight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem(
          "flight_results",
          JSON.stringify(data.flights)
        );

        router.push("/flights/results");
      } else {
        alert("No Flight Found");
      }
    } catch (err) {
      console.log(err);
      alert("API Error");
    }
  };

  return (
    <div className="container py-5">

      <div className="card shadow border-0">

        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">✈ Flight Search</h3>
        </div>

        <div className="card-body">

          <div className="row g-3">

            <div className="col-md-6">
              <label>From</label>

              <input
                className="form-control"
                placeholder="DAC"
                value={form.from}
                onChange={(e) =>
                  setForm({ ...form, from: e.target.value })
                }
              />
            </div>

            <div className="col-md-6">
              <label>To</label>

              <input
                className="form-control"
                placeholder="DXB"
                value={form.to}
                onChange={(e) =>
                  setForm({ ...form, to: e.target.value })
                }
              />
            </div>

            <div className="col-md-6">
              <label>Departure Date</label>

              <input
                type="date"
                className="form-control"
                value={form.departure}
                onChange={(e) =>
                  setForm({
                    ...form,
                    departure: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-2">
              <label>Adult</label>

              <input
                type="number"
                className="form-control"
                value={form.adults}
                onChange={(e) =>
                  setForm({
                    ...form,
                    adults: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="col-md-2">
              <label>Child</label>

              <input
                type="number"
                className="form-control"
                value={form.children}
                onChange={(e) =>
                  setForm({
                    ...form,
                    children: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="col-md-2">
              <label>Infant</label>

              <input
                type="number"
                className="form-control"
                value={form.infants}
                onChange={(e) =>
                  setForm({
                    ...form,
                    infants: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="col-md-6">
              <label>Cabin Class</label>

              <select
                className="form-select"
                value={form.cabin}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cabin: e.target.value,
                  })
                }
              >
                <option>Economy</option>
                <option>Business</option>
                <option>First Class</option>
              </select>
            </div>

          </div>

          <button
            className="btn btn-primary mt-4 w-100"
            onClick={handleSearch}
          >
            🔍 Search Flight
          </button>

        </div>

      </div>

    </div>
  );
}