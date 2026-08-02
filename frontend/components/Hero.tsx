export default function Hero() {
  return (
    <section className="hero">
      <div className="container text-center">
        <img
          src="/images/logo.jpg"
          alt="AIR FLY INTERNATIONAL"
          className="img-fluid mb-4 mx-auto d-block"
          style={{ width: "150px" }}
        />

        <h1 className="display-3 fw-bold">
          AIR FLY INTERNATIONAL
        </h1>

        <p className="lead mb-4">
          B2B Travel Agent Portal
        </p>

        <button className="btn btn-gold btn-lg">
          Book Flight
        </button>
      </div>
    </section>
  );
}