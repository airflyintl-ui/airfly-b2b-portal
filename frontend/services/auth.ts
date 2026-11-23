
import API from "./api";

type AuthData = {
  email: string;
  password: string;
  agency_name?: string;
  owner_name?: string;
  phone?: string;
  password_confirmation?: string;
};

export async function login(data: AuthData) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function register(data: AuthData) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}
