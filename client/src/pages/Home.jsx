import { useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/common/Footer";
import HeroCarousel from "../components/home/HeroCarousel";
import LocationPanel from "../components/home/LocationPanel";
import MoviesSection from "../components/home/MoviesSection";

export default function Home() {
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg-alt)] text-[var(--text-main)]">
      <Navbar
        onLocationClick={scrollToMap}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <HeroCarousel />

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-[360px_1fr] gap-10">
        <LocationPanel mapRef={mapRef} />
        <MoviesSection searchQuery={searchQuery} />
      </main>

      <Footer />
    </div>
  );
}
