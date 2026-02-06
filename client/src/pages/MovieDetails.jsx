import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "../components/context/CatalogContext";
import { getShowtimes } from "../services/showtimes.service";

function buildDates(baseDate) {
  return Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      day: d.getDate(),
      full: d.toLocaleDateString("en-CA"),
    };
  });
}

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movies, loading } = useCatalog() || { movies: [], loading: true };
  const [todayKey, setTodayKey] = useState(() => new Date().toDateString());
  const dates = useMemo(() => buildDates(new Date(todayKey)), [todayKey]);
  const [selectedDate, setSelectedDate] = useState(() => dates[0]?.full || null);
  const [showtimes, setShowtimes] = useState([]);
  const [showtimeError, setShowtimeError] = useState("");
  const [showtimeLoading, setShowtimeLoading] = useState(false);

  useEffect(() => {
    if (dates.length) {
      setSelectedDate((prev) =>
        prev && dates.some((d) => d.full === prev) ? prev : dates[0].full
      );
    }
  }, [dates]);

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const timeout = nextMidnight.getTime() - now.getTime();
    const timer = setTimeout(() => {
      setTodayKey(new Date().toDateString());
    }, timeout);
    return () => clearTimeout(timer);
  }, [todayKey]);

  const movie = movies.find((m) => m.slug === id);

  useEffect(() => {
    if (!movie?._id || !selectedDate) return;
    let cancelled = false;
    setShowtimeLoading(true);
    setShowtimeError("");
    getShowtimes({ movieId: movie._id, date: selectedDate })
      .then((data) => {
        if (!cancelled) {
          setShowtimes(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setShowtimeError(err.message || "Failed to load showtimes.");
        }
      })
      .finally(() => {
        if (!cancelled) setShowtimeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movie?._id, selectedDate]);

  const groupedShowtimes = useMemo(() => {
    const map = new Map();
    showtimes.forEach((showtime) => {
      const theatre = showtime.theatre;
      const key = theatre?._id || showtime.theatre;
      if (!map.has(key)) {
        map.set(key, { theatre, shows: [] });
      }
      map.get(key).shows.push(showtime);
    });
    return Array.from(map.values());
  }, [showtimes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center">
        Loading movie...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center">
        Movie not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] px-10 py-10">
      <div className="flex items-start gap-6">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-36 h-52 object-cover rounded-xl border border-[var(--border-color)] shadow-lg"
        />

        <div>
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="text-[var(--text-muted)] mt-2">
            {movie.certificate || "U/A"} {"|"} {movie.language} {"|"}{" "}
            {movie.duration}
          </p>
        </div>
      </div>

      <hr className="my-6 border-[var(--border-color)]" />

      <h2 className="text-xl font-semibold mb-4">Select Date & Theatre</h2>
      <div className="flex gap-4 mt-8">
        {dates.map((d, index) => (
          <button
            key={index}
            onClick={() => setSelectedDate(d.full)}
            className={`w-16 py-3 rounded-lg text-center transition
              ${
                selectedDate === d.full
                  ? "bg-red-600 text-white"
                  : "bg-[var(--surface-alt)] text-[var(--text-muted)] hover:opacity-90"
              }`}
          >
            <div className="text-sm">{d.label}</div>
            <div className="text-lg font-semibold">{d.day}</div>
          </button>
        ))}
      </div>

      {selectedDate && (
        <div className="mt-10 space-y-6">
          {showtimeLoading && (
            <p className="text-sm text-[var(--text-muted)]">
              Loading showtimes...
            </p>
          )}
          {showtimeError && (
            <p className="text-sm text-red-400">{showtimeError}</p>
          )}
          {!showtimeLoading && groupedShowtimes.length === 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-lg p-4 text-[var(--text-muted)]">
              No showtimes available for this date.
            </div>
          )}
          {groupedShowtimes.map((group) => (
            <div
              key={group.theatre?._id || group.theatre?.name}
              className="bg-[var(--surface)] border border-[var(--border-color)] rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="text-[var(--text-main)] font-semibold">
                    {group.theatre?.name}
                  </h4>
                  <p className="text-sm text-[var(--text-muted)]">
                    {group.theatre?.distance || ""} {"\u2022"}{" "}
                    {group.theatre?.area}
                  </p>
                </div>

                <span className="text-xs text-green-400 font-semibold">
                  AVAILABLE
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {group.shows.map((showtime) => (
                  <button
                    key={showtime._id}
                    onClick={() =>
                      navigate("/seats", {
                        state: {
                          showtimeId: showtime._id,
                        },
                      })
                    }
                    className="px-4 py-2 border border-green-500 text-green-400 rounded hover:bg-green-500 hover:text-black transition"
                  >
                    {showtime.time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
