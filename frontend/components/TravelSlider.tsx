"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    title: "EXPLORE THE WORLD",
    subtitle: "Your Journey Begins With Us",
    description: "AIR FLY INTERNATIONAL - Your Trusted Travel Partner",
    image: "/images/airlines/poster1.jpg",
  },
  {
    title: "DISCOVER AMAZING DESTINATIONS",
    subtitle: "Make Your Travel Dreams Come True",
    description: "International Travel & Visa Assistance",
    image: "/images/airlines/poster2.jpg",
  },
  {
    title: "YOUR NEXT JOURNEY STARTS HERE",
    subtitle: "Travel Without Borders",
    description: "Flight Booking, Visa Processing & Travel Support",
    image: "/images/airlines/poster3.jpg",
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
    <section className="w-full px-2 py-3 md:px-8 md:py-5">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-xl shadow-xl">

        {/* Full Poster Image - No Extra Logo */}
        <div className="w-full bg-gray-100 flex items-center justify-center">
  <img
    key={slide.image}
    src={slide.image}
    alt={slide.title}
    className="block w-full h-auto max-h-none object-contain"
    style={{
      width: "100%",
      height: "auto",
      objectFit: "contain",
    }}
  />
</div>

        {/* Previous */}
        <button
          onClick={previous}
          aria-label="Previous poster"
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-2xl text-white"
        >
          ‹
        </button>

        {/* Next */}
        <button
          onClick={next}
          aria-label="Next poster"
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-2xl text-white"
        >
          ›
        </button>

        {/* Slide Dots */}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((item, index) => (
            <button
              key={item.image}
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
