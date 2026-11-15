"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    title: "EXPLORE THE WORLD",
    subtitle: "Your Journey Begins With Us",
    description: "Domestic & International Flight Booking",
    emoji: "✈️",
    bg: "from-sky-700 via-blue-600 to-indigo-900",
  },
  {
    title: "YOUR VISA, OUR CARE",
    subtitle: "Travel Without Borders",
    description: "Professional Visa Processing Support",
    emoji: "🌍",
    bg: "from-emerald-700 via-teal-600 to-cyan-900",
  },
  {
    title: "DISCOVER YOUR STAY",
    subtitle: "Comfortable Hotels Worldwide",
    description: "Find the Right Hotel for Every Journey",
    emoji: "🏨",
    bg: "from-orange-600 via-rose-600 to-red-900",
  },
  {
    title: "PLAN YOUR NEXT HOLIDAY",
    subtitle: "Make Every Trip Memorable",
    description: "Holiday Packages & Travel Assistance",
    emoji: "🏝️",
    bg: "from-violet-700 via-purple-600 to-fuchsia-900",
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
    <section className="px-4 py-6 md:px-8">
      <div
        className={`relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-r ${slide.bg} px-6 py-16 text-white shadow-xl transition-all duration-700 md:px-16 md:py-24`}
      >
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] opacity-20 md:right-24 md:text-[220px]">
          {slide.emoji}
        </div>

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-bold tracking-[0.3em] text-yellow-300">
            AIR FLY INTERNATIONAL
          </p>

          <h2 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl">
            {slide.title}
          </h2>

          <h3 className="mb-3 text-xl font-semibold md:text-2xl">
            {slide.subtitle}
          </h3>

          <p className="mb-8 text-base text-white/90 md:text-lg">
            {slide.description}
          </p>

          <a
            href="#contact"
            className="inline-block rounded-lg bg-yellow-400 px-7 py-3 font-bold text-gray-900 transition hover:bg-yellow-300"
          >
            Contact Us
          </a>
        </div>

        <button
          onClick={previous}
          aria-label="Previous poster"
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 px-3 py-2 text-2xl hover:bg-black/60"
        >
          ‹
        </button>

        <button
          onClick={next}
          aria-label="Next poster"
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 px-3 py-2 text-2xl hover:bg-black/60"
        >
          ›
        </button>

        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((item, index) => (
            <button
              key={item.title}
              onClick={() => setActive(index)}
              aria-label={`Show poster ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                active === index ? "w-8 bg-yellow-400" : "w-2.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
