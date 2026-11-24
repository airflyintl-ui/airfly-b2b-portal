import Link from "next/link";

const services = [
  {
    icon: "✈",
    title: "Air Ticket",
    desc: "Domestic & International Flight Booking",
    link: "/#flight-search",
    label: "Search Flights",
    color: "blue",
  },
  {
    icon: "👥",
    title: "Group Fare",
    desc: "Special Group Airfare & Group Booking Requests",
    link: "/group-fare",
    label: "Request Group Fare",
    color: "teal",
  },
  {
    icon: "🌏",
    title: "Visa Processing",
    desc: "Tourist, Business & Visit Visa Assistance",
    link: "/visa",
    label: "Explore Visa",
    color: "purple",
  },
  {
    icon: "🛡",
    title: "Travel Insurance",
    desc: "Travel Protection & Insurance Assistance",
    link: "/contact",
    label: "Get Assistance",
    color: "orange",
  },
];

export default function Services() {
  return (
    <section className="airfly-services">
      <div className="container">

        <div className="services-heading">
          <span>WHAT WE OFFER</span>
          <h2>Our Travel Services</h2>
          <p>
            Complete travel solutions for your agency,
            all in one place.
          </p>
        </div>

        <div className="row g-4">
          {services.map((service) => (
            <div className="col-lg-3 col-md-6" key={service.title}>
              <div className={`service-card ${service.color}`}>
                <div className="service-icon">
                  {service.icon}
                </div>

                <h3>{service.title}</h3>

                <p>{service.desc}</p>

                <Link href={service.link} className="service-link">
                  {service.label}
                  <span> →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        .airfly-services {
          background: #f1f6fa;
          padding: 75px 0;
        }

        .services-heading {
          text-align: center;
          margin-bottom: 42px;
        }

        .services-heading > span {
          color: #119b9a;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 3px;
        }

        .services-heading h2 {
          color: #102b50;
          font-size: clamp(26px, 4vw, 35px);
          font-weight: 850;
          margin: 12px 0;
        }

        .services-heading p {
          color: #7c8da1;
          font-size: 14px;
          margin: 0;
        }

        .service-card {
          height: 100%;
          min-height: 255px;
          background: #ffffff;
          padding: 27px 23px;
          border: 1px solid #e5edf4;
          border-radius: 16px;
          box-shadow: 0 7px 25px rgba(16, 43, 80, 0.05);
          transition: transform 0.25s, box-shadow 0.25s;
        }

        .service-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 14px 32px rgba(16, 43, 80, 0.12);
        }

        .service-icon {
          width: 57px;
          height: 57px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #eaf3ff;
          color: #176fb4;
          font-size: 29px;
          margin-bottom: 21px;
        }

        .service-card h3 {
          color: #102b50;
          font-size: 19px;
          font-weight: 850;
          margin-bottom: 11px;
        }

        .service-card p {
          color: #8291a3;
          font-size: 13px;
          line-height: 1.7;
          min-height: 44px;
        }

        .service-link {
          display: inline-block;
          margin-top: 12px;
          color: #1479b8;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }

        .service-link:hover {
          color: #0e9994;
        }

        .teal .service-icon {
          background: #e2f8f4;
          color: #0e9994;
        }

        .teal .service-link {
          color: #0e9994;
        }

        .purple .service-icon {
          background: #f0edff;
          color: #765bd0;
        }

        .purple .service-link {
          color: #765bd0;
        }

        .orange .service-icon {
          background: #fff3e5;
          color: #d88727;
        }

        .orange .service-link {
          color: #d88727;
        }

        @media (max-width: 576px) {
          .airfly-services {
            padding: 50px 0;
          }

          .service-card {
            min-height: auto;
          }
        }
      `}</style>
    </section>
  );
}
