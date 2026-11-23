import API from "./api";

type FlightSearchData = {
  [key: string]: unknown;
};

export async function searchFlights(data: FlightSearchData) {
  const res = await fetch(`${API}/search-flight`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function getFlights() {
  const res = await fetch(`${API}/flights`);
  return await res.json();
}
