"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../services/api";

type GroupFareOffer = {
  id: number;
  airline_name: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string | null;
  fare: number | string;
  currency: string;
  total_seats: number;
  available_seats: number;
  description?: string | null;
  terms_conditions?: string | null;
  status: "draft" | "published" | "unpublished";
  created_at?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  offers?: GroupFareOffer[];
  offer?: GroupFareOffer;
  errors?: Record<string, string[]>;
};

type OfferForm = {
  airline_name: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string;
  fare: string;
  currency: string;
  total_seats: string;
  available_seats: string;
  description: string;
  terms_conditions: string;
  status: "draft" | "published" | "unpublished";
};

const emptyForm: OfferForm = {
  airline_name: "",
  origin: "",
  destination: "",
  departure_date: "",
  return_date: "",
  fare: "",
  currency: "BDT",
  total_seats: "",
  available_seats: "",
  description: "",
  terms_conditions: "",
  status: "draft",
};

function getErrorMessage(data: ApiResponse, fallback: string) {
  if (data.message) return data.message;

  if (data.errors) {
    const firstError = Object.values(data.errors)[0];
    if (firstError?.length) return firstError[0];
  }

  return fallback;
}

function dateValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export default function AdminGroupFaresPage() {
  const router = useRouter();

  const [offers, setOffers] = useState<GroupFareOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OfferForm>(emptyForm);

  const loadOffers = useCallback(async () => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin/login");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/admin/group-fares`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data: ApiResponse = await res.json();

      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Failed to load Group Fare offers.")
        );
      }

      setOffers(Array.isArray(data.offers) ? data.offers : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load offers."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOffers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOffers]);

  function updateField<K extends keyof OfferForm>(
    field: K,
    value: OfferForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(offer: GroupFareOffer) {
    setEditingId(offer.id);

    setForm({
      airline_name: offer.airline_name,
      origin: offer.origin,
      destination: offer.destination,
      departure_date: dateValue(offer.departure_date),
      return_date: dateValue(offer.return_date),
      fare: String(offer.fare),
      currency: offer.currency,
      total_seats: String(offer.total_seats),
      available_seats: String(offer.available_seats),
      description: offer.description || "",
      terms_conditions: offer.terms_conditions || "",
      status: offer.status,
    });

    setShowForm(true);
  }

  async function saveOffer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    const totalSeats = Number(form.total_seats);
    const availableSeats = Number(form.available_seats);
    const fare = Number(form.fare);

    if (
      !Number.isFinite(fare) ||
      !Number.isInteger(totalSeats) ||
      !Number.isInteger(availableSeats) ||
      fare < 0 ||
      totalSeats < 0 ||
      availableSeats < 0 ||
      availableSeats > totalSeats
    ) {
      alert("Please enter valid fare and seat information.");
      return;
    }

    const payload = {
      airline_name: form.airline_name.trim(),
      origin: form.origin.trim().toUpperCase(),
      destination: form.destination.trim().toUpperCase(),
      departure_date: form.departure_date,
      return_date: form.return_date || null,
      fare,
      currency: form.currency.trim().toUpperCase(),
      total_seats: totalSeats,
      available_seats: availableSeats,
      description: form.description,
      terms_conditions: form.terms_conditions,
      status: form.status,
    };

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API}/admin/group-fares/${editingId}`
        : `${API}/admin/group-fares`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await res.json();

      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Could not save Group Fare offer.")
        );
      }

      alert(data.message || "Group Fare offer saved successfully.");

      resetForm();
      await loadOffers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Save failed.";

      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    offer: GroupFareOffer,
    status: "published" | "unpublished"
  ) {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch(
        `${API}/admin/group-fares/${offer.id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data: ApiResponse = await res.json();

      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Could not update offer status.")
        );
      }

      await loadOffers();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Status update failed."
      );
    }
  }

  async function deleteOffer(offer: GroupFareOffer) {
    if (
      !confirm(
        `Delete ${offer.airline_name} ${offer.origin}-${offer.destination}?`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch(
        `${API}/admin/group-fares/${offer.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: ApiResponse = await res.json();

      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Could not delete offer.")
        );
      }

      alert(data.message || "Offer deleted successfully.");
      await loadOffers();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Delete failed."
      );
    }
  }

  const filteredOffers = offers.filter((offer) => {
    const keyword = search.toLowerCase();

    return (
      offer.airline_name.toLowerCase().includes(keyword) ||
      offer.origin.toLowerCase().includes(keyword) ||
      offer.destination.toLowerCase().includes(keyword) ||
      offer.status.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Group Fare Management</h2>
          <p className="text-muted mb-0">
            Manage airline offers, fares, seats and agent requests.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => router.push("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddForm}
          >
            + Add New Group Fare
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">
                {editingId ? "Edit Group Fare Offer" : "Add New Group Fare"}
              </h5>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={resetForm}
              >
                Close
              </button>
            </div>

            <form onSubmit={saveOffer}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Airline Name *
                  </label>
                  <input
                    className="form-control"
                    value={form.airline_name}
                    onChange={(e) =>
                      updateField("airline_name", e.target.value)
                    }
                    required
                    maxLength={255}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Origin *
                  </label>
                  <input
                    className="form-control text-uppercase"
                    placeholder="DAC"
                    value={form.origin}
                    onChange={(e) =>
                      updateField("origin", e.target.value.toUpperCase())
                    }
                    required
                    maxLength={10}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Destination *
                  </label>
                  <input
                    className="form-control text-uppercase"
                    placeholder="DXB"
                    value={form.destination}
                    onChange={(e) =>
                      updateField("destination", e.target.value.toUpperCase())
                    }
                    required
                    maxLength={10}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Departure Date *
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.departure_date}
                    onChange={(e) =>
                      updateField("departure_date", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Return Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    min={form.departure_date || undefined}
                    value={form.return_date}
                    onChange={(e) =>
                      updateField("return_date", e.target.value)
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Fare *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="0.01"
                    value={form.fare}
                    onChange={(e) =>
                      updateField("fare", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Currency *
                  </label>
                  <select
                    className="form-select"
                    value={form.currency}
                    onChange={(e) =>
                      updateField("currency", e.target.value)
                    }
                    required
                  >
                    <option value="BDT">BDT</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="1"
                    value={form.total_seats}
                    onChange={(e) =>
                      updateField("total_seats", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Available Seats *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max={form.total_seats || undefined}
                    step="1"
                    value={form.available_seats}
                    onChange={(e) =>
                      updateField("available_seats", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Status
                  </label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value as OfferForm["status"]
                      )
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Terms & Conditions
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.terms_conditions}
                    onChange={(e) =>
                      updateField("terms_conditions", e.target.value)
                    }
                  />
                </div>

                <div className="col-12 d-flex gap-2 flex-wrap">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Save Changes"
                        : "Create Offer"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h5 className="fw-bold mb-0">Group Fare Offers</h5>

            <div className="d-flex gap-2">
              <input
                type="search"
                className="form-control"
                placeholder="Search airline or sector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => void loadOffers()}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              />
              <p className="text-muted mt-2 mb-0">
                Loading Group Fare offers...
              </p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="alert alert-info mb-0">
              {offers.length === 0
                ? "No Group Fare offers found. Click Add New Group Fare to create your first offer."
                : "No offers match your search."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Airline / Sector</th>
                    <th>Travel Date</th>
                    <th>Fare</th>
                    <th>Seats</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td>
                        <div className="fw-semibold">
                          {offer.airline_name}
                        </div>
                        <small className="text-muted">
                          {offer.origin} → {offer.destination}
                        </small>
                      </td>

                      <td>
                        <div>{dateValue(offer.departure_date)}</div>
                        {offer.return_date && (
                          <small className="text-muted">
                            Return: {dateValue(offer.return_date)}
                          </small>
                        )}
                      </td>

                      <td className="fw-semibold">
                        {Number(offer.fare).toLocaleString()} {offer.currency}
                      </td>

                      <td>
                        {offer.available_seats} / {offer.total_seats}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            offer.status === "published"
                              ? "bg-success"
                              : offer.status === "unpublished"
                                ? "bg-secondary"
                                : "bg-warning text-dark"
                          }`}
                        >
                          {offer.status.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex justify-content-end gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditForm(offer)}
                          >
                            Edit
                          </button>

                          {offer.status === "published" ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning"
                              onClick={() =>
                                void changeStatus(offer, "unpublished")
                              }
                            >
                              Unpublish
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                void changeStatus(offer, "published")
                              }
                            >
                              Publish
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => void deleteOffer(offer)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
