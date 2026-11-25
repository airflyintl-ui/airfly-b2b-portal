"use client";

import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";

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

type VisaRequestResponse = {
  success?: boolean;
  message?: string;
  data?: {
    id?: number;
    status?: string;
  };
};

export default function VisaPage() {
  const [visaInformation, setVisaInformation] =
    useState<VisaInformation[]>([]);

  const [selectedVisaId, setSelectedVisaId] = useState("");

  const [passengerName, setPassengerName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [remarks, setRemarks] = useState("");

  const [documents, setDocuments] = useState<File[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submittedRequestId, setSubmittedRequestId] =
    useState<number | null>(null);

  const selectedVisa = visaInformation.find(
    (visa) => String(visa.id) === selectedVisaId
  );

  const loadVisaInformation = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/public/visa-information`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load Visa Information."
        );
      }

      const list: VisaInformation[] = Array.isArray(result.data)
        ? result.data
        : result.data
          ? [result.data as VisaInformation]
          : [];

      setVisaInformation(list);

      if (list.length > 0) {
        setSelectedVisaId(String(list[0].id));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Visa Information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVisaInformation();
  }, [loadVisaInformation]);

  const handleDocumentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 10) {
      setError("You can upload a maximum of 10 documents.");
      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Only PDF, JPG, JPEG and PNG files are allowed."
        );
        event.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(
          "Each document must be 5 MB or smaller."
        );
        event.target.value = "";
        return;
      }
    }

    setError("");
    setDocuments(files);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setSubmittedRequestId(null);

    if (!selectedVisa) {
      setError("Please select a Visa Type.");
      return;
    }

    if (
      !passengerName.trim() ||
      !passportNumber.trim() ||
      !email.trim() ||
      !mobile.trim()
    ) {
      setError("Please complete all required passenger information.");
      return;
    }

    if (documents.length === 0) {
      setError("Please upload at least one required document.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "Agent login required. Please login to submit a Visa Request."
      );
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append(
        "visa_information_id",
        String(selectedVisa.id)
      );

      formData.append("passenger_name", passengerName.trim());
      formData.append("passport_number", passportNumber.trim());
      formData.append("email", email.trim());
      formData.append("mobile", mobile.trim());
      formData.append("remarks", remarks.trim());

      documents.forEach((file) => {
        formData.append("documents[]", file);
      });

      const response = await fetch(
        `${API}/visa-requests`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result =
        (await response.json()) as VisaRequestResponse;

      if (!response.ok) {
        throw new Error(
          result.message || "Visa Request submission failed."
        );
      }

      setMessage(
        "Your Visa Request has been submitted successfully. It is now pending Admin review."
      );

      setSubmittedRequestId(result.data?.id ?? null);

      setPassengerName("");
      setPassportNumber("");
      setEmail("");
      setMobile("");
      setRemarks("");
      setDocuments([]);

      const fileInput = document.getElementById(
        "visaDocuments"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Visa Request submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-2 fw-bold text-primary">
            China Visa Application
          </h2>

          <p className="text-muted mb-0">
            Submit your passenger information and required documents.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Airfly International
        </span>
      </div>

      {message && (
        <div className="alert alert-success">
          <h6 className="fw-bold mb-1">
            Visa Request Submitted
          </h6>

          {message}

          {submittedRequestId !== null && (
            <div className="mt-2 fw-bold">
              Request ID: #{submittedRequestId}
            </div>
          )}

          <div className="mt-2">
            <span className="badge bg-warning text-dark">
              PENDING ADMIN REVIEW
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            Loading China Visa Information...
          </div>
        </div>
      ) : visaInformation.length === 0 ? (
        <div className="alert alert-warning">
          China Visa Information is currently unavailable.
          Please contact Airfly International Admin.
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow border-0">
              <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0">
                  Visa Request Form
                </h5>
              </div>

              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Destination Country
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value="China"
                        disabled
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Visa Type *
                      </label>

                      <select
                        className="form-select"
                        value={selectedVisaId}
                        onChange={(e) =>
                          setSelectedVisaId(e.target.value)
                        }
                        required
                      >
                        {visaInformation.map((visa) => (
                          <option
                            key={visa.id}
                            value={String(visa.id)}
                          >
                            {visa.visa_type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Passenger Name *
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Full Name as Passport"
                        value={passengerName}
                        onChange={(e) =>
                          setPassengerName(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Passport Number *
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Passport Number"
                        value={passportNumber}
                        onChange={(e) =>
                          setPassportNumber(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Email *
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        placeholder="Passenger Email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Mobile *
                      </label>

                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={(e) =>
                          setMobile(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">
                        Required Documents *
                      </label>

                      {selectedVisa?.required_documents &&
                        selectedVisa.required_documents.length > 0 && (
                          <div className="alert alert-info">
                            <strong>Required Documents:</strong>

                            <ul className="mb-0 mt-2">
                              {selectedVisa.required_documents.map(
                                (document, index) => (
                                  <li key={`${document}-${index}`}>
                                    {document}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      <input
                        id="visaDocuments"
                        type="file"
                        className="form-control"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={handleDocumentChange}
                        required
                      />

                      <small className="text-muted">
                        PDF, JPG, JPEG or PNG. Maximum 5 MB per file,
                        maximum 10 files.
                      </small>

                      {documents.length > 0 && (
                        <div className="mt-3">
                          <strong>Selected Documents:</strong>

                          <ul className="mt-2">
                            {documents.map((file, index) => (
                              <li key={`${file.name}-${index}`}>
                                {file.name} (
                                {(file.size / 1024 / 1024).toFixed(2)}
                                MB)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">
                        Remarks
                      </label>

                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Additional information..."
                        value={remarks}
                        onChange={(e) =>
                          setRemarks(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success px-4"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting Request..."
                      : "Submit Visa Request"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow border-0">
              <div className="card-header bg-success text-white py-3">
                <h5 className="mb-0">
                  Visa Information
                </h5>
              </div>

              <div className="card-body">
                {selectedVisa ? (
                  <>
                    <h5 className="fw-bold text-primary mb-3">
                      {selectedVisa.visa_type}
                    </h5>

                    <p>
                      <strong>Destination:</strong> China
                    </p>

                    <p>
                      <strong>Processing:</strong>{" "}
                      {selectedVisa.processing_time || "-"}
                    </p>

                    <p>
                      <strong>Validity:</strong>{" "}
                      {selectedVisa.validity || "-"}
                    </p>

                    <p>
                      <strong>Entry:</strong>{" "}
                      {selectedVisa.entry_type || "-"}
                    </p>

                    <p>
                      <strong>Visa Fee:</strong>{" "}
                      {selectedVisa.currency}{" "}
                      {Number(selectedVisa.visa_fee).toFixed(2)}
                    </p>

                    {selectedVisa.description && (
                      <>
                        <hr />
                        <h6 className="fw-bold">
                          Description
                        </h6>
                        <p className="text-muted">
                          {selectedVisa.description}
                        </p>
                      </>
                    )}

                    {selectedVisa.terms_conditions && (
                      <>
                        <hr />
                        <h6 className="fw-bold">
                          Terms & Conditions
                        </h6>
                        <p className="text-muted">
                          {selectedVisa.terms_conditions}
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-muted">
                    Select a Visa Type to see details.
                  </p>
                )}

                <hr />

                <div className="alert alert-warning mb-0">
                  <strong>Important:</strong>
                  <p className="mb-0 mt-2">
                    Submission does not guarantee visa approval.
                    Your application will be reviewed by Admin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
