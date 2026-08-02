import API from "./api";

export async function createBooking(data: any) {
  const res = await fetch(`${API}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function getBookings() {
  const res = await fetch(`${API}/bookings`);
  return await res.json();
}