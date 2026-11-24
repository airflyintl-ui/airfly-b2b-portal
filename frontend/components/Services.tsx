import Link from "next/link";
import styles from "./Services.module.css";

const services = [
  {
    icon: "✈",
    title: "Air Ticket",
    desc: "Domestic & International Flight Booking",
    link: "/#flight-search",
    label: "Search Flights",
    color: "",
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
    <section className={styles.airflyServices}>
      <div className="container">
        <div className={styles.servicesHeading}>
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
              <div
                className={`${styles.serviceCard} ${
                  service.color ? styles[service.color] : ""
                }`}
              >
                <div className={styles.serviceIcon}>
                  {service.icon}
                </div>

                <h3>{service.title}</h3>
                <p>{service.desc}</p>

                <Link
                  href={service.link}
                  className={styles.serviceLink}
                >
                  {service.label}
                  <span> →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
