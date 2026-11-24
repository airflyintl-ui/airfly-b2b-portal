"use client";

type Airline = {
  id: number;
  name: string;
};

export type Flight = {
  id: number;
  airline_id?: number | string | null;
  airline?: Airline | null;
  flight_no: string;
  from: string;
  to: string;
  departure_time: string;
  arrival_time: string;
  economy_fare: number | string;
  business_fare: number | string;
  available_seats: number;
  status: boolean | number;
};

type Props = {
  loading: boolean;
  flights: Flight[];
  search: string;
  setSearch: (value: string) => void;
  openEditFlight: (item: Flight) => void;
  deleteFlight: (id: number) => void;
};

export default function FlightTable({
  loading,
  flights,
  search,
  setSearch,
  openEditFlight,
  deleteFlight,
}: Props) {
  const filteredFlights = flights.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.flight_no?.toLowerCase().includes(keyword) ||
      item.from?.toLowerCase().includes(keyword) ||
      item.to?.toLowerCase().includes(keyword) ||
      item.airline?.name?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="card shadow">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Flight List</h5>

        <input
          className="form-control"
          style={{ width: 300 }}
          placeholder="Search Flight..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card-body p-0">
        <table className="table table-bordered table-hover mb-0">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Airline</th>
              <th>Flight No</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Economy</th>
              <th>Business</th>
              <th>Seats</th>
              <th>Status</th>
              <th style={{ width: "170px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredFlights.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center">
                  No Flight Found
                </td>
              </tr>
            ) : (
              filteredFlights.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.airline?.name}</td>
                  <td>{item.flight_no}</td>
                  <td>
                    {item.from} → {item.to}
                  </td>
                  <td>{item.departure_time}</td>
                  <td>{item.arrival_time}</td>
                  <td>৳ {item.economy_fare}</td>
                  <td>৳ {item.business_fare}</td>
                  <td>{item.available_seats}</td>
                  <td>
                    {item.status ? (
                      <span className="badge bg-success">
                        Active
                      </span>
                    ) : (
                      <span className="badge bg-danger">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => openEditFlight(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteFlight(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
