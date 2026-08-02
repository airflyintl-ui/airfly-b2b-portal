export default function SeatSelection() {
  return (
    <div className="card shadow border-0 mt-4">

      <div className="card-header bg-dark text-white">
        Seat & Extra Services
      </div>

      <div className="card-body">

        <div className="row">

          <div className="col-md-4 mb-3">
            <label className="form-label">
              Seat Preference
            </label>

            <select className="form-select">
              <option>Window</option>
              <option>Aisle</option>
              <option>Middle</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">
              Meal
            </label>

            <select className="form-select">
              <option>Standard Meal</option>
              <option>Vegetarian</option>
              <option>Halal Meal</option>
              <option>Seafood Meal</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">
              Extra Baggage
            </label>

            <select className="form-select">
              <option>0 KG</option>
              <option>10 KG</option>
              <option>20 KG</option>
              <option>30 KG</option>
            </select>
          </div>

        </div>

      </div>

    </div>
  );
}