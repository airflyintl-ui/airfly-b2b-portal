"use client";

import { useCallback, useEffect, useState } from "react";
import API from "../../../services/api";

type VisaInformation = {
  id: number;
  destination_country: string;
  visa_type: string;
  processing_time: string | null;
  validity: string | null;
  entry_type: string | null;
  visa_fee: string | number;
  currency: string;
  required_documents: string[] | null;
  description: string | null;
  terms_conditions: string | null;
  is_active: boolean;
};

type VisaForm = {
  destination_country: string;
  custom_country: string;
  visa_type: string;
  processing_time: string;
  validity: string;
  entry_type: string;
  visa_fee: string;
  currency: string;
  required_documents: string;
  description: string;
  terms_conditions: string;
  is_active: boolean;
};

const initialForm: VisaForm = {
  destination_country: "China",
  custom_country: "",
  visa_type: "Tourist Visa",
  processing_time: "3-7 Days",
  validity: "30 Days",
  entry_type: "Single",
  visa_fee: "120",
  currency: "USD",
  required_documents: [
    "Passport Copy",
    "Photo",
    "NID Copy",
    "Bank Statement",
    "Hotel Booking",
    "Flight Booking",
  ].join("\n"),
  description: "",
  terms_conditions: "",
  is_active: true,
};

const countryOptions = [
  "China",
  "Thailand",
  "Malaysia",
  "Singapore",
  "India",
  "United Arab Emirates",
  "Saudi Arabia",
  "United Kingdom",
  "United States",
  "Australia",
  "Other",
];

export default function AdminVisaInformationPage() {
  const [visaList, setVisaList] = useState<VisaInformation[]>([]);
  const [form, setForm] = useState<VisaForm>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("admin_token");

    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    };
  }, []);

  const loadVisaInformation = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/admin/visa-information`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load visa information."
        );
      }

      setVisaList(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    void loadVisaInformation();
  }, [loadVisaInformation]);

  const handleChange = (
    field: keyof VisaForm,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setMessage("");
    setError("");
  };

  const handleEdit = (visa: VisaInformation) => {
    const knownCountry = countryOptions.includes(
      visa.destination_country
    );

    setEditingId(visa.id);

    setForm({
      ...initialForm,
      destination_country: knownCountry
        ? visa.destination_country
        : "Other",
      custom_country: knownCountry
        ? ""
        : visa.destination_country,
      visa_type: visa.visa_type || "",
      processing_time: visa.processing_time || "",
      validity: visa.validity || "",
      entry_type: visa.entry_type || "",
      visa_fee: String(visa.visa_fee ?? 0),
      currency: visa.currency || "USD",
      required_documents: Array.isArray(
        visa.required_documents
      )
        ? visa.required_documents.join("\n")
        : "",
      description: visa.description || "",
      terms_conditions: visa.terms_conditions || "",
      is_active: visa.is_active,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const country =
        form.destination_country === "Other"
          ? form.custom_country.trim()
          : form.destination_country.trim();

      if (!country) {
        throw new Error("Please select or enter Destination Country.");
      }

      const documents = form.required_documents
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        destination_country: country,
        visa_type: form.visa_type.trim(),
        processing_time: form.processing_time.trim(),
        validity: form.validity.trim(),
        entry_type: form.entry_type.trim(),
        visa_fee: Number(form.visa_fee),
        currency: form.currency.trim(),
        required_documents: documents,
        description: form.description,
        terms_conditions: form.terms_conditions,
        is_active: form.is_active,
      };

      if (!payload.visa_type) {
        throw new Error("Please enter Visa Type.");
      }

      if (
        !Number.isFinite(payload.visa_fee) ||
        payload.visa_fee < 0
      ) {
        throw new Error("Please enter a valid Visa Fee.");
      }

      const url = editingId
        ? `${API}/admin/visa-information/${editingId}`
        : `${API}/admin/visa-information`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const validationErrors = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";

        throw new Error(
          validationErrors ||
          result.message ||
          "Unable to save visa information."
        );
      }

      setMessage(
        editingId
          ? "Visa Information Updated Successfully."
          : "Visa Information Added Successfully."
      );

      resetForm();
      await loadVisaInformation();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Visa Information?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/admin/visa-information/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete visa information."
        );
      }

      setMessage("Visa Information Deleted Successfully.");

      if (editingId === id) {
        resetForm();
      }

      await loadVisaInformation();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Delete failed."
      );
    }
  };

  const handleToggleStatus = async (
    visa: VisaInformation
  ) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/admin/visa-information/${visa.id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            is_active: !visa.is_active,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update status."
        );
      }

      setMessage("Visa Status Updated Successfully.");
      await loadVisaInformation();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Status update failed."
      );
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            Visa Information Management
          </h2>

          <p className="text-muted mb-0">
            Manage countries, visa types, fees and required documents
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Multiple Destinations
        </span>
      </div>

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-primary text-white py-3">
          <h5 className="mb-0">
            {editingId
              ? "Edit Visa Information"
              : "Add New Visa Information"}
          </h5>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Destination Country *
              </label>

              <select
                className="form-select"
                value={form.destination_country}
                onChange={(e) =>
                  handleChange("destination_country", e.target.value)
                }
              >
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {form.destination_country === "Other" && (
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Enter Country Name *
                </label>

                <input
                  className="form-control"
                  placeholder="Enter destination country"
                  value={form.custom_country}
                  onChange={(e) =>
                    handleChange("custom_country", e.target.value)
                  }
                />
              </div>
            )}

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Visa Type *
              </label>

              <select
                className="form-select"
                value={form.visa_type}
                onChange={(e) =>
                  handleChange("visa_type", e.target.value)
                }
              >
                <option value="Tourist Visa">Tourist Visa</option>
                <option value="Business Visa">Business Visa</option>
                <option value="Work Visa">Work Visa</option>
                <option value="Student Visa">Student Visa</option>
                <option value="Visit Visa">Visit Visa</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">
                Processing Time
              </label>

              <input
                className="form-control"
                placeholder="Example: 3-7 Days"
                value={form.processing_time}
                onChange={(e) =>
                  handleChange("processing_time", e.target.value)
                }
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">
                Validity
              </label>

              <input
                className="form-control"
                placeholder="Example: 30 Days"
                value={form.validity}
                onChange={(e) =>
                  handleChange("validity", e.target.value)
                }
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">
                Entry Type
              </label>

              <select
                className="form-select"
                value={form.entry_type}
                onChange={(e) =>
                  handleChange("entry_type", e.target.value)
                }
              >
                <option value="Single">Single Entry</option>
                <option value="Double">Double Entry</option>
                <option value="Multiple">Multiple Entry</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Visa Fee *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={form.visa_fee}
                onChange={(e) =>
                  handleChange("visa_fee", e.target.value)
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Currency
              </label>

              <select
                className="form-select"
                value={form.currency}
                onChange={(e) =>
                  handleChange("currency", e.target.value)
                }
              >
                <option value="USD">USD</option>
                <option value="BDT">BDT</option>
              </select>
            </div>

            <div className="col-12 mb-3">
              <label className="form-label fw-semibold">
                Required Documents
              </label>

              <textarea
                className="form-control"
                rows={6}
                placeholder={
                  "Enter one document per line\nPassport Copy\nPhoto\nNID Copy"
                }
                value={form.required_documents}
                onChange={(e) =>
                  handleChange("required_documents", e.target.value)
                }
              />

              <small className="text-muted">
                Enter each required document on a separate line.
              </small>
            </div>

            <div className="col-12 mb-3">
              <label className="form-label fw-semibold">
                Description
              </label>

              <textarea
                className="form-control"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  handleChange("description", e.target.value)
                }
                placeholder="Visa information details..."
              />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label fw-semibold">
                Terms & Conditions
              </label>

              <textarea
                className="form-control"
                rows={3}
                value={form.terms_conditions}
                onChange={(e) =>
                  handleChange("terms_conditions", e.target.value)
                }
                placeholder="Visa terms and conditions..."
              />
            </div>

            <div className="col-12 mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="visaActive"
                  checked={form.is_active}
                  onChange={(e) =>
                    handleChange("is_active", e.target.checked)
                  }
                />

                <label
                  className="form-check-label fw-semibold"
                  htmlFor="visaActive"
                >
                  Active Visa Information
                </label>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-success px-4"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Visa Information"
                  : "Save Visa Information"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white py-3">
          <h5 className="mb-0">
            Visa Information List
          </h5>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              Loading Visa Information...
            </div>
          ) : visaList.length === 0 ? (
            <div className="alert alert-info mb-0">
              No Visa Information found. Add your first Visa Type above.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Country</th>
                    <th>Visa Type</th>
                    <th>Processing</th>
                    <th>Validity</th>
                    <th>Entry</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visaList.map((visa, index) => (
                    <tr key={visa.id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">
                        {visa.destination_country}
                      </td>
                      <td>{visa.visa_type}</td>
                      <td>{visa.processing_time || "-"}</td>
                      <td>{visa.validity || "-"}</td>
                      <td>{visa.entry_type || "-"}</td>
                      <td>
                        {visa.currency}{" "}
                        {Number(visa.visa_fee).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            visa.is_active
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {visa.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEdit(visa)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              visa.is_active
                                ? "btn-warning"
                                : "btn-success"
                            }`}
                            onClick={() => handleToggleStatus(visa)}
                          >
                            {visa.is_active ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(visa.id)}
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
