export default function Stats() {
  const stats = [
    {
      number: "10+",
      title: "Years Experience",
    },
    {
      number: "500+",
      title: "Travel Agents",
    },
    {
      number: "100+",
      title: "Airlines",
    },
    {
      number: "50+",
      title: "Visa Destinations",
    },
  ];

  return (
    <section className="bg-primary text-white py-5">
      <div className="container">
        <div className="row text-center">

          {stats.map((item, index) => (
            <div className="col-md-3 mb-4" key={index}>
              <h1 className="display-4 fw-bold">
                {item.number}
              </h1>

              <p className="fs-5">
                {item.title}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}