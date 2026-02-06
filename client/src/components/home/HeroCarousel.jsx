import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trendingItems } from "../../data/homeData";
import "./HeroCarousel.css";

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const total = trendingItems.length;
  const activeItem = trendingItems[index];

  const prev = () =>
    setIndex((i) => (i - 1 + total) % total);

  const next = () => setIndex((i) => (i + 1) % total);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 4000);

    return () => clearInterval(interval);
  }, [total]);

  return (
    <section className="max-w-7xl mx-auto mt-10 px-6">
      <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={() => navigate(`/movie/${activeItem.slug}`)}
          className="absolute inset-0 z-0"
          aria-label={`Open ${activeItem.title}`}
        >
          <img
            src={activeItem.img}
            alt={activeItem.title}
            className="w-full h-full object-cover"
          />
        </button>

        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        <div className="absolute left-8 bottom-8 z-10 max-w-xl text-white">
          <div className="rounded-2xl bg-black/40 backdrop-blur-sm px-6 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
            {activeItem.lines.map((line, lineIndex) => (
              <p
                key={`${activeItem.slug}-line-${lineIndex}`}
                className={`hero-line ${lineIndex === 0 ? "hero-line-title" : "hero-line-text"}`}
                style={{ animationDelay: `${0.08 + lineIndex * 0.15}s` }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <button
          onClick={prev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 text-white text-4xl font-bold hover:scale-110 transition"
        >
          {"\u2039"}
        </button>

        <button
          onClick={next}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-10 text-white text-4xl font-bold hover:scale-110 transition"
        >
          {"\u203A"}
        </button>
      </div>
    </section>
  );
}
