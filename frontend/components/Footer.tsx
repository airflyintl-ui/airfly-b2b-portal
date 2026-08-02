export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-3">
      <div className="container">
        <div className="row">

          <div className="col-md-4 mb-4">
            <h4>AIR FLY INTERNATIONAL</h4>
            <p>
              Your trusted B2B travel partner for Flights,
              Visa, Hotels and Holiday Packages.
            </p>
          </div>

          <div className="col-md-4 mb-4">
            <h5>Contact</h5>

            <p>📍 598/A, Shamsuddin Tower (2nd Floor)</p>
            <p>Reazuddin Bazar, Chattogram</p>

            <p>📞 02-333366085</p>
            <p>📱 01819316705</p>

            <p>✉ airflyintl@gmail.com</p>
          </div>

          <div className="col-md-4 mb-4">
            <h5>Quick Links</h5>

            <ul className="list-unstyled">
              <li>Home</li>
              <li>Flights</li>
              <li>Visa</li>
              <li>Hotels</li>
              <li>Contact</li>
            </ul>
          </div>

        </div>

        <hr />

        <p className="text-center">
          © 2026 AIR FLY INTERNATIONAL. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}