"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    title: "EXPLORE THE WORLD",
    subtitle: "Your Journey Begins With Us",
    description: "Domestic & International Flight Booking",
    image: "/images/airline.jpg",
  },
  {
    title: "US-BANGLA AIRLINES",
    subtitle: "Fly With Comfort",
    description: "Book Your Domestic & International Flights",
    image: "/images/us-bangla.jpg",
  },
  {
    title: "AIR ARABIA",
    subtitle: "Travel Beyond Boundaries",
    description: "International Flight Booking",
    image: "/images/air-arabia.jpg",
  },
  {
    title: "DISCOVER CHINA",
    subtitle: "Explore Amazing Destinations",
    description: "China Visa & Travel Assistance",
    image: "/images/china.jpg",
  },
  {
    title: "WELCOME TO BANGKOK",
    subtitle: "Your Next Journey Awaits",
    description: "Thailand Visa & Travel Assistance",
    image: "/images/bangkok.jpg",
  },
];

export default function TravelSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const previous = () => {
    setActive((current) =>
      current === 0 ? slides.length - 1 : current - 1
    );
  };

  const next = () => {
    setActive((current) => (current + 1) % slides.length);
  };

  const slide = slides[active];

  return (
    <section className="px-3 py-5 md:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl shadow-xl">

        {/* Poster Image */}
        <img
          src={slide.image}
          alt={slide.title}
          className="h-[250px] w-full object-cover sm:h-[350px] md:h-[480px]"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

        {/* Logo */}
        <img
          src="/images/logo.jpg"
          alt="Air Fly International Logo"
          className="absolute left-5 top-5 z-10 h-12 w-12 rounded-full bg-white object-contain p-1 md:left-10 md:top-8 md:h-16 md:w-16"
        />

        {/* Poster Text */}
        <div className="absolute inset-0 z-10 flex items-center px-10 md:px-20">
          <div className="max-w-2xl text-white">

            <p className="mb-3 text-xs font-bold tracking-widest text-yellow-300 md:text-base">
              AIR FLY INTERNATIONAL
            </p>

            <h2 className="mb-3 text-2xl font-extrabold md:text-5xl">
              {slide.title}
            </h2>

            <h3 className="mb-2 text-base font-semibold md:text-2xl">
              {slide.subtitle}
            </h3>

            <p className="mb-5 text-sm text-white md:text-lg">
              {slide.description}
            </p>

            <a
              href="#contact"
              className="inline-block rounded-lg bg-yellow-400 px-5 py-2 font-bold text-gray-900 hover:bg-yellow-300 md:px-7 md:py-3"
            >
              Contact Us
            </a>

          </div>
        </div>

        {/* Previous */}
        <button
          onClick={previous}
          aria-label="Previous poster"
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-2xl text-white hover:bg-black"
        >
          ‹
        </button>

        {/* Next */}
        <button
          onClick={next}
          aria-label="Next poster"
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-2xl text-white hover:bg-black"
        >
          ›
        </button>

        {/* Slide Dots */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((item, index) => (
            <button
              key={item.title}
              onClick={() => setActive(index)}
              aria-label={`Show poster ${index + 1}`}
              className={`h-2.5 rounded-full ${
                active === index
                  ? "w-8 bg-yellow-400"
                  : "w-2.5 bg-white"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
