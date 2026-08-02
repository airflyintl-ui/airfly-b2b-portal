export default function HotelPage() {
  return (
    <div className="container py-5">

      <h2 className="mb-4 fw-bold text-primary">
        Hotel Booking
      </h2>

      <div className="row">

        {/* Search Form */}
        <div className="col-lg-4">

          <div className="card shadow border-0">

            <div className="card-header bg-primary text-white">
              Search Hotel
            </div>

            <div className="card-body">

              <div className="mb-3">
                <label>Destination</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Dubai"
                />
              </div>

              <div className="mb-3">
                <label>Check In</label>
                <input
                  type="date"
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label>Check Out</label>
                <input
                  type="date"
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label>Rooms</label>
                <select className="form-select">
                  <option>1 Room</option>
                  <option>2 Rooms</option>
                  <option>3 Rooms</option>
                </select>
              </div>

              <div className="mb-3">
                <label>Guests</label>
                <select className="form-select">
                  <option>1 Adult</option>
                  <option>2 Adults</option>
                  <option>3 Adults</option>
                </select>
              </div>

              <button className="btn btn-success w-100">
                Search Hotels
              </button>

            </div>

          </div>

        </div>

        {/* Hotel Results */}
        <div className="col-lg-8">

          <div className="card shadow border-0 mb-3">

            <div className="card-body">

              <h4>★★★★★ Atlantis The Palm</h4>

              <p className="text-muted">
                Palm Jumeirah, Dubai
              </p>

              <h5 className="text-success">
                $280 / Night
              </h5>

              <button className="btn btn-primary">
                Book Hotel
              </button>

            </div>

          </div>

          <div className="card shadow border-0 mb-3">

            <div className="card-body">

              <h4>★★★★ Hilton Dubai</h4>

              <p className="text-muted">
                Downtown Dubai
              </p>

              <h5 className="text-success">
                $180 / Night
              </h5>

              <button className="btn btn-primary">
                Book Hotel
              </button>

            </div>

          </div>

          <div className="card shadow border-0">

            <div className="card-body">

              <h4>★★★★ Radisson Blu</h4>

              <p className="text-muted">
                Dubai Marina
              </p>

              <h5 className="text-success">
                $150 / Night
              </h5>

              <button className="btn btn-primary">
                Book Hotel
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}