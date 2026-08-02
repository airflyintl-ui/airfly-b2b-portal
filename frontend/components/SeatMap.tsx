"use client";

import { useState } from "react";

export default function SeatMap() {
  const [selectedSeat, setSelectedSeat] = useState("");

  const seats = [
    "1A", "1B", "1C", "1D",
    "2A", "2B", "2C", "2D",
    "3A", "3B", "3C", "3D",
    "4A", "4B", "4C", "4D",
    "5A", "5B", "5C", "5D",
  ];

  return (
    <div className="card shadow border-0 mt-4">
      <div className="card-header bg-dark text-white">
        Select Your Seat
      </div>

      <div className="card-body">

        <div className="row g-2">

          {seats.map((seat) => (
            <div className="col-3" key={seat}>
              <button
                className={`btn w-100 ${
                  selectedSeat === seat
                    ? "btn-success"
                    : "btn-outline-primary"
                }`}
                onClick={() => setSelectedSeat(seat)}
              >
                {seat}
              </button>
            </div>
          ))}

        </div>

        <hr />

        <h5>
          Selected Seat:
          <span className="text-success ms-2">
            {selectedSeat || "None"}
          </span>
        </h5>

      </div>
    </div>
  );
}