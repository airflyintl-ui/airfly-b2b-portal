export default function Services() {
  const services = [
    {
      icon: "✈️",
      title: "Air Ticket",
      desc: "Domestic & International Flight Booking",
    },
    {
      icon: "🌍",
      title: "Visa Processing",
      desc: "Tourist, Business & Visit Visa",
    },
    {
      icon: "🏨",
      title: "Hotel Booking",
      desc: "Worldwide Hotel Reservation",
    },
    {
      icon: "🛡️",
      title: "Travel Insurance",
      desc: "Secure travel with insurance coverage",
    },
  ];

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center fw-bold mb-5">
          Our Services
        </h2>

        <div className="row g-4">
          {services.map((service, index) => (
            <div className="col-md-3" key={index}>
              <div className="card h-100 shadow border-0 text-center p-4">
                <h1>{service.icon}</h1>
                <h4 className="mt-3">{service.title}</h4>
                <p>{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}