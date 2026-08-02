"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PassengerPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "Mr",
    first_name: "",
    last_name: "",
    gender: "Male",
    dob: "",
    nationality: "Bangladesh",
    passport: "",
    passport_expiry: "",
    email: "",
    phone: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function nextStep(e: React.FormEvent) {
    e.preventDefault();

    localStorage.setItem(
      "passenger",
      JSON.stringify(form)
    );

    router.push("/booking/payment");
  }

  return (
    <div className="container py-4">

      <div className="card shadow border-0">

        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">
            Passenger Information
          </h3>
        </div>

        <div className="card-body">

          <form onSubmit={nextStep}>

            <div className="row">

              <div className="col-md-2 mb-3">
                <label>Title</label>

                <select
                  className="form-select"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                >
                  <option>Mr</option>
                  <option>Mrs</option>
                  <option>Ms</option>
                </select>
              </div>

              <div className="col-md-5 mb-3">
                <label>First Name</label>

                <input
                  className="form-control"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-5 mb-3">
                <label>Last Name</label>

                <input
                  className="form-control"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label>Gender</label>

                <select
                  className="form-select"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label>Date of Birth</label>

                <input
                  type="date"
                  className="form-control"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label>Nationality</label>

                <input
                  className="form-control"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Passport Number</label>

                <input
                  className="form-control"
                  name="passport"
                  value={form.passport}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Passport Expiry</label>

                <input
                  type="date"
                  className="form-control"
                  name="passport_expiry"
                  value={form.passport_expiry}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Email</label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Mobile Number</label>

                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="text-end">

              <button
                className="btn btn-primary btn-lg"
                type="submit"
              >
                Continue to Payment →
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}