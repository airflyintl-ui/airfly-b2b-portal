export default function VisaPage() {
  return (
    <div className="container py-5">

      <h2 className="mb-4 fw-bold text-primary">
        Visa Application
      </h2>

      <div className="row">

        {/* Left */}
        <div className="col-lg-8">

          <div className="card shadow border-0">

            <div className="card-header bg-primary text-white">
              Visa Request Form
            </div>

            <div className="card-body">

              <div className="row">

                <div className="col-md-6 mb-3">
                  <label>Destination Country</label>
                  <select className="form-select">
                    <option>United Arab Emirates</option>
                    <option>Saudi Arabia</option>
                    <option>Malaysia</option>
                    <option>Singapore</option>
                    <option>Thailand</option>
                    <option>Angola</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label>Visa Type</label>
                  <select className="form-select">
                    <option>Tourist Visa</option>
                    <option>Business Visa</option>
                    <option>Work Visa</option>
                    <option>Student Visa</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label>Passenger Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Passport Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Passport Number"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                  />
                </div>

                <div className="col-12 mb-3">
                  <label>Remarks</label>
                  <textarea
                    className="form-control"
                    rows={4}
                  ></textarea>
                </div>

              </div>

              <button className="btn btn-success">
                Submit Visa Request
              </button>

            </div>

          </div>

        </div>

        {/* Right */}
        <div className="col-lg-4">

          <div className="card shadow border-0">

            <div className="card-header bg-success text-white">
              Visa Information
            </div>

            <div className="card-body">

              <p><strong>Processing:</strong> 3-7 Days</p>
              <p><strong>Validity:</strong> 30 Days</p>
              <p><strong>Entry:</strong> Single</p>
              <p><strong>Visa Fee:</strong> $120</p>

              <hr />

              <h6>Required Documents</h6>

              <ul>
                <li>Passport Copy</li>
                <li>Photo</li>
                <li>NID Copy</li>
                <li>Bank Statement</li>
                <li>Hotel Booking</li>
                <li>Flight Booking</li>
              </ul>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}