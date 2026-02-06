import { useState } from "react";
import { awards, awardMovieTitles } from "../../data/homeData";

const pickRandomMovie = () =>
  awardMovieTitles[Math.floor(Math.random() * awardMovieTitles.length)];

export default function AwardsList() {
  const [awardSelections, setAwardSelections] = useState({});

  return (
    <section className="mt-10 space-y-4">
      <h3 className="text-xs font-semibold tracking-widest text-[var(--text-muted)] mb-4">
        AWARD WINNERS
      </h3>

      {awards.map((award, i) => (
        <div
          key={`${award.name}-${i}`}
          onClick={() =>
            setAwardSelections((prev) => ({
              ...prev,
              [i]: pickRandomMovie(),
            }))
          }
          className="flex items-center gap-4 p-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--surface-alt)] transition cursor-pointer"
        >
          <img
            src={award.img}
            alt={award.name}
            className="w-14 h-14 object-contain"
          />

          <div>
            <p className="text-sm font-semibold text-[var(--text-main)]">
              {award.name}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {awardSelections[i]
                ? `Movie spotlight: ${awardSelections[i]}`
                : "Award-winning and critically acclaimed films"}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
