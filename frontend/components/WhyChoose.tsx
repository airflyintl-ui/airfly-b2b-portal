export default function WhyChoose() {
  const features = [
    {
      title: "24/7 Support",
      desc: "Dedicated support team for travel agents.",
      icon: "📞",
    },
    {
      title: "Best Airfares",
      desc: "Competitive fares from multiple airlines.",
      icon: "✈️",
    },
    {
      title: "Fast Visa Processing",
      desc: "Quick and reliable visa assistance.",
      icon: "🌍",
    },
    {
      title: "Trusted Partner",
      desc: "Professional B2B travel service in Bangladesh.",
      icon: "🤝",
    },
  ];

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center fw-bold mb-5">
          Why Choose AIR FLY INTERNATIONAL
        </h2>

        <div className="row g-4">
          {features.map((item, index) => (
            <div className="col-md-3" key={index}>
              <div className="card border-0 shadow h-100 text-center p-4">
                <div style={{ fontSize: "50px" }}>{item.icon}</div>

                <h4 className="mt-3">{item.title}</h4>

                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}