"use client";

import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

type Poster = {
  id: number;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image_url: string;
  is_active: boolean;
  sort_order: number;
};

type PosterApiResponse = {
  success?: boolean;
  posters?: Poster[];
};

type Slide = {
  id: string | number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
};

const fallbackSlides: Slide[] = [
  {
    id: "fallback-1",
    title: "EXPLORE THE WORLD",
    subtitle: "Your Journey Begins With Us",
    description: "AIR FLY INTERNATIONAL - Your Trusted Travel Partner",
    image: "/images/airlines/poster1.jpg",
  },
  {
    id: "fallback-2",
    title: "DISCOVER AMAZING DESTINATIONS",
    subtitle: "Make Your Travel Dreams Come True",
    description: "International Travel & Visa Assistance",
    image: "/images/airlines/poster2.jpg",
  },
  {
    id: "fallback-3",
    title: "YOUR NEXT JOURNEY STARTS HERE",
    subtitle: "Travel Without Borders",
    description: "Flight Booking, Visa Processing & Travel Support",
    image: "/images/airlines/poster3.jpg",
  },
];

export default function TravelSlider() {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [active, setActive] = useState(0);

  const loadPosters = useCallback(async () => {
    try {
      const res = await fetch(`${API}/public/homepage-posters`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) return;

      const data: PosterApiResponse = await res.json();

      if (!data.success || !Array.isArray(data.posters)) return;

      const activePosters = data.posters
        .filter(
          (poster) =>
            poster.is_active === true &&
            typeof poster.image_url === "string" &&
            poster.image_url.trim() !== ""
        )
        .sort((a, b) => a.sort_order - b.sort_order);

      if (activePosters.length === 0) return;

      const dynamicSlides: Slide[] = activePosters.map((poster) => ({
        id: poster.id,
        title: poster.title || "",
        subtitle: poster.subtitle || "",
        description: poster.description || "",
        image: poster.image_url,
      }));

      setSlides(dynamicSlides);
      setActive(0);
    } catch (error) {
      console.error("Homepage poster loading failed:", error);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPosters();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPosters]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[active] || slides[0];

  if (!slide) return null;

  return (
    <section className="w-full px-2 py-3 md:px-8 md:py-5">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-xl shadow-xl">
        <div className="flex w-full items-center justify-center bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.title || "Air Fly International travel poster"}
            className="block h-auto w-full object-contain"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Pagination Dots Only */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show poster ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  active === index
                    ? "w-8 bg-yellow-400"
                    : "w-2.5 bg-white"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
