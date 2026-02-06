import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOccupiedSeats, getShowtime } from "../services/showtimes.service";

const MAX_SEATS = 6;

const DEFAULT_SEAT_LAYOUT = [
  {
    label: "RECLINER \u20B91100",
    price: 1100,
    rows: ["A", "B"],
    seatsPerRow: 10,
  },
  {
    label: "GOLD \u20B9350",
    price: 350,
    rows: ["C", "D", "E", "F"],
    seatsPerRow: 15,
  },
  {
    label: "CLASSIC \u20B9210",
    price: 210,
    rows: ["G", "H", "I", "J"],
    seatsPerRow: 15,
  },
];

export default function SeatSelect() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const showtimeId = state?.showtimeId;
  const [showtime, setShowtime] = useState(null);
  const [showtimeLoading, setShowtimeLoading] = useState(true);
  const [showtimeError, setShowtimeError] = useState("");

  const [selected, setSelected] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatError, setSeatError] = useState("");

  useEffect(() => {
    if (!showtimeId) {
      setShowtimeLoading(false);
      setShowtimeError("Showtime not found.");
      return;
    }
    let cancelled = false;
    setShowtimeLoading(true);
    setShowtimeError("");
    getShowtime(showtimeId)
      .then((data) => {
        if (!cancelled) {
          setShowtime(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setShowtimeError(err.message || "Failed to load showtime.");
        }
      })
      .finally(() => {
        if (!cancelled) setShowtimeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showtimeId]);

  useEffect(() => {
    if (!showtime?._id) return;
    let cancelled = false;
    setLoadingSeats(true);
    setSeatError("");
    getOccupiedSeats(showtime._id)
      .then((data) => {
        if (!cancelled) {
          setOccupiedSeats(Array.isArray(data.seats) ? data.seats : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSeatError(err.message || "Failed to load booked seats.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSeats(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showtime?._id]);

  useEffect(() => {
    if (!occupiedSeats.length) return;
    setSelected((prev) => prev.filter((seat) => !occupiedSeats.includes(seat)));
  }, [occupiedSeats]);

  if (showtimeLoading) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center">
        Loading seats...
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center">
        {showtimeError || "Showtime details missing"}
      </div>
    );
  }

  const seatLayout =
    Array.isArray(showtime.seatLayout) && showtime.seatLayout.length
      ? showtime.seatLayout
      : DEFAULT_SEAT_LAYOUT;

  const toggleSeat = (seatId) => {
    // do nothing if seat is occupied
    if (occupiedSeats.includes(seatId)) return;

    setSelected((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      }

      if (prev.length >= MAX_SEATS) {
        return prev;
      }

      return [...prev, seatId];
    });
  };

  const getSeatPrice = (seatId) => {
    const row = seatId.charAt(0);
    const section = seatLayout.find((s) => s.rows.includes(row));
    return section?.price || 0;
  };

  const totalAmount = selected.reduce(
    (sum, seat) => sum + getSeatPrice(seat),
    0
  );

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-[var(--border-color)]">
        <h1 className="text-2xl font-semibold">
          {showtime.movie?.title}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {showtime.theatre?.name} {"\u2022"} {showtime.date} {"\u2022"}{" "}
          {showtime.time}
        </p>
        {loadingSeats && (
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Loading booked seats...
          </p>
        )}
        {seatError && (
          <p className="text-xs text-red-400 mt-2">{seatError}</p>
        )}
      </div>

      {/* SEATS */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {seatLayout.map((section, i) => (
          <div key={i} className="mb-10">
            <h3 className="text-sm text-[var(--text-muted)] mb-3">
              {section.label}
            </h3>

            {section.rows.map((row) => (
              <div
                key={row}
                className="flex justify-center mb-3 gap-2 flex-wrap"
              >
                {Array.from({ length: section.seatsPerRow }).map((_, idx) => {
                  const seatNo = idx + 1;
                  const seatId = `${row}${seatNo}`;

                  const isSelected = selected.includes(seatId);
                  const isOccupied = occupiedSeats.includes(seatId);
                  const isDisabled =
                    !isSelected && (isOccupied || selected.length >= MAX_SEATS);

                  return (
                    <button
                      key={seatId}
                      disabled={isDisabled}
                      onClick={() => toggleSeat(seatId)}
                      className={`w-10 h-10 rounded-md text-sm transition
                        ${
                          isOccupied
                            ? "bg-[var(--seat-occupied-bg)] text-[var(--seat-occupied-text)] cursor-not-allowed"
                            : isSelected
                              ? "bg-green-500 text-black"
                              : isDisabled
                                ? "bg-[var(--seat-disabled-bg)] text-[var(--seat-disabled-text)] cursor-not-allowed"
                                : "border border-[var(--seat-border)] hover:border-[var(--text-main)]"
                        }`}
                    >
                      {seatNo}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        {/* SCREEN */}
        <div className="mt-10">
          <div className="h-4 bg-[var(--seat-screen)] rounded-full mx-auto w-2/3" />
          <p className="text-center text-[var(--seat-screen-text)] mt-2 text-sm">
            SCREEN THIS WAY
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-[var(--border-color)] px-6 py-4 flex items-center justify-between bg-[var(--surface)] sticky bottom-0">
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            Seats: {selected.length ? selected.join(", ") : "None"}
          </p>
          <p className="text-lg font-semibold">
            {"\u20B9"} {totalAmount}
          </p>
          {selected.length >= MAX_SEATS && (
            <p className="text-xs text-red-400">
              Max {MAX_SEATS} seats allowed
            </p>
          )}
        </div>

        <button
          disabled={!selected.length}
          onClick={() =>
            navigate("/payment", {
              state: {
                showtimeId: showtime._id,
                showtime: {
                  movieTitle: showtime.movie?.title,
                  theatre: showtime.theatre?.name,
                  datetime: `${showtime.date} \u2022 ${showtime.time}`,
                  poster: showtime.movie?.poster,
                },
                seats: selected,
                amount: totalAmount,
              },
            })
          }
          className={`px-6 py-3 rounded-lg font-semibold
            ${
              selected.length
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-600/40 cursor-not-allowed"
            }`}
        >
          Pay {"\u20B9"}
          {totalAmount}
        </button>
      </div>
    </div>
  );
}
