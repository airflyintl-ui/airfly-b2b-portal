"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../services/api";

type HomepagePoster = {
  id: number;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image_url: string;
  cloudinary_public_id?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  posters?: HomepagePoster[];
  poster?: HomepagePoster;
  errors?: Record<string, string[]>;
};

type PosterForm = {
  title: string;
  subtitle: string;
  description: string;
  is_active: boolean;
  sort_order: string;
};

const emptyForm: PosterForm = {
  title: "",
  subtitle: "",
  description: "",
  is_active: true,
  sort_order: "0",
};

function getErrorMessage(data: ApiResponse, fallback: string) {
  if (data.message) return data.message;

  if (data.errors) {
    const firstError = Object.values(data.errors)[0];
    if (firstError?.length) return firstError[0];
  }

  return fallback;
}

export default function AdminHomepagePostersPage() {
  const router = useRouter();

  const [posters, setPosters] = useState<HomepagePoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PosterForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const loadPosters = useCallback(async () => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin/login");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/admin/homepage-posters`, {
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
          getErrorMessage(data, "Failed to load homepage posters.")
        );
      }

      setPosters(Array.isArray(data.posters) ? data.posters : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load posters."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPosters();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPosters]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function updateField<K extends keyof PosterForm>(
    field: K,
    value: PosterForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setPreviewUrl("");
    setShowForm(false);
  }

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setPreviewUrl("");
    setShowForm(true);
  }

  function openEditForm(poster: HomepagePoster) {
    setEditingId(poster.id);

    setForm({
      title: poster.title || "",
      subtitle: poster.subtitle || "",
      description: poster.description || "",
      is_active: poster.is_active,
      sort_order: String(poster.sort_order ?? 0),
    });

    setImageFile(null);
    setPreviewUrl(poster.image_url);
    setShowForm(true);
  }

  function handleImageChange(file: File | null) {
    if (!file) {
      setImageFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, JPEG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must not exceed 5MB.");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function savePoster(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    if (!editingId && !imageFile) {
      alert("Please select a poster image.");
      return;
    }

    const sortOrder = Number(form.sort_order);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      alert("Please enter a valid non-negative sort order.");
      return;
    }

    const payload = new FormData();

    payload.append("title", form.title.trim());
    payload.append("subtitle", form.subtitle.trim());
    payload.append("description", form.description.trim());
    payload.append("is_active", form.is_active ? "1" : "0");
    payload.append("sort_order", String(sortOrder));

    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API}/admin/homepage-posters/${editingId}`
        : `${API}/admin/homepage-posters`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data: ApiResponse = await res.json();

      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Could not save homepage poster.")
        );
      }

      alert(data.message || "Homepage poster saved successfully.");

      resetForm();
      await loadPosters();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Poster save failed.";

      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    poster: HomepagePoster,
    isActive: boolean
  ) {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    const payload = new FormData();
    payload.append("is_active", isActive ? "1" : "0");

    try {
      const res = await fetch(
        `${API}/admin/homepage-posters/${poster.id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      const data: ApiResponse = await res.json();

      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Could not update poster status.")
        );
      }

      await loadPosters();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Status update failed."
      );
    }
  }

  async function deletePoster(poster: HomepagePoster) {
    if (!confirm("Are you sure you want to delete this homepage poster?")) {
      return;
    }

    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch(
        `${API}/admin/homepage-posters/${poster.id}`,
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
          getErrorMessage(data, "Could not delete poster.")
        );
      }

      alert(data.message || "Poster deleted successfully.");
      await loadPosters();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Poster delete failed."
      );
    }
  }

  const filteredPosters = posters.filter((poster) => {
    const keyword = search.toLowerCase();

    return (
      (poster.title || "").toLowerCase().includes(keyword) ||
      (poster.subtitle || "").toLowerCase().includes(keyword) ||
      (poster.description || "").toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Homepage Poster Management</h2>
          <p className="text-muted mb-0">
            Upload, edit, replace, publish and remove homepage slider posters.
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
            + Add New Poster
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
                {editingId ? "Edit Homepage Poster" : "Upload New Poster"}
              </h5>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Close
              </button>
            </div>

            <form onSubmit={savePoster}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Poster Title
                  </label>
                  <input
                    className="form-control"
                    value={form.title}
                    onChange={(e) =>
                      updateField("title", e.target.value)
                    }
                    maxLength={255}
                    placeholder="EXPLORE THE WORLD"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Subtitle
                  </label>
                  <input
                    className="form-control"
                    value={form.subtitle}
                    onChange={(e) =>
                      updateField("subtitle", e.target.value)
                    }
                    maxLength={255}
                    placeholder="Your Journey Begins With Us"
                  />
                </div>

                <div className="col-md-8">
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
                    placeholder="Poster description..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="form-control"
                    value={form.sort_order}
                    onChange={(e) =>
                      updateField("sort_order", e.target.value)
                    }
                  />
                  <small className="text-muted">
                    Lower number appears first.
                  </small>
                </div>

                <div className="col-md-8">
                  <label className="form-label fw-semibold">
                    Poster Image {!editingId && "*"}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    required={!editingId}
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] || null)
                    }
                  />
                  <small className="text-muted">
                    JPG, JPEG, PNG or WEBP. Maximum 5MB.
                    {editingId
                      ? " Select a new image only if you want to replace the existing one."
                      : ""}
                  </small>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold d-block">
                    Visibility
                  </label>
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="posterActive"
                      checked={form.is_active}
                      onChange={(e) =>
                        updateField("is_active", e.target.checked)
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor="posterActive"
                    >
                      {form.is_active ? "Active" : "Inactive"}
                    </label>
                  </div>
                </div>

                {previewUrl && (
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Image Preview
                    </label>
                    <div
                      className="border rounded p-2 bg-light"
                      style={{ maxWidth: "700px" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Poster preview"
                        className="img-fluid rounded"
                        style={{
                          width: "100%",
                          maxHeight: "320px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  </div>
                )}

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
                        : "Upload Poster"}
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
            <h5 className="fw-bold mb-0">
              Homepage Posters ({posters.length})
            </h5>

            <div className="d-flex gap-2">
              <input
                type="search"
                className="form-control"
                placeholder="Search posters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => void loadPosters()}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="text-muted mt-2 mb-0">
                Loading homepage posters...
              </p>
            </div>
          ) : filteredPosters.length === 0 ? (
            <div className="alert alert-info mb-0">
              {posters.length === 0
                ? "No posters found. Click Add New Poster to upload your first homepage poster."
                : "No posters match your search."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Poster</th>
                    <th>Title / Subtitle</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPosters.map((poster) => (
                    <tr key={poster.id}>
                      <td style={{ minWidth: "170px" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={poster.image_url}
                          alt={poster.title || "Homepage poster"}
                          className="rounded border"
                          style={{
                            width: "150px",
                            height: "75px",
                            objectFit: "contain",
                            background: "#f8f9fa",
                          }}
                        />
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {poster.title || "Untitled Poster"}
                        </div>
                        <small className="text-muted">
                          {poster.subtitle || "No subtitle"}
                        </small>
                      </td>

                      <td>{poster.sort_order}</td>

                      <td>
                        <span
                          className={`badge ${
                            poster.is_active
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {poster.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex justify-content-end gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditForm(poster)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              poster.is_active
                                ? "btn-outline-warning"
                                : "btn-outline-success"
                            }`}
                            onClick={() =>
                              void changeStatus(poster, !poster.is_active)
                            }
                          >
                            {poster.is_active ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => void deletePoster(poster)}
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
