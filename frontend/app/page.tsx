import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TravelSlider from "@/components/TravelSlider";
import FlightSearch from "@/components/FlightSearch";
import Services from "@/components/Services";
import WhyChoose from "@/components/WhyChoose";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <TravelSlider />

      <Hero />

      <div
        id="flight-search"
        style={{ scrollMarginTop: "90px" }}
      >
        <FlightSearch />
      </div>

      <Services />
      <WhyChoose />
      <Stats />

      <div id="contact">
        <Footer />
      </div>
    </>
  );
}
