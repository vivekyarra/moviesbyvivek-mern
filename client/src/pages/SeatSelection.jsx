import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SEAT_PRICE = {
  RECLINER: 1100,
  GOLD: 350,
  SILVER: 200,
};

const seatLayout = [
  { row: "A", type: "RECLINER", seats: 6 },
  { row: "B", type: "RECLINER", seats: 6 },
  { row: "C", type: "GOLD", seats: 10 },
  { row: "D", type: "GOLD", seats: 10 },
  { row: "E", type: "GOLD", seats: 10 },
  { row: "F", type: "SILVER", seats: 12 },
  { row: "G", type: "SILVER", seats: 12 },
  { row: "H", type: "SILVER", seats: 12 },
];

const occupiedSeats = ["C5", "C6", "D4", "E7", "F2", "G9"];

export default function SeatSelection() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [selectedSeats, setSelectedSeats] = useState([]);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-main)]">
        Invalid booking flow
      </div>
    );
  }

  const toggleSeat = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) return;
      setSelectedSeats((prev) => [...prev, seatId]);
    }
  };

  const totalAmount = selectedSeats.reduce((sum, seat) => {
    const row = seat[0];
    const rowInfo = seatLayout.find((r) => r.row === row);
    return sum + SEAT_PRICE[rowInfo.type];
  }, 0);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] px-6 py-6">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">{state.movieTitle}</h2>
        <p className="text-sm text-[var(--text-muted)]">
          {state.theatre} • {state.date} • {state.time}
        </p>
      </div>

      {/* SCREEN */}
      <div className="flex justify-center mb-10">
        <div className="w-2/3 h-4 bg-gradient-to-r from-transparent via-slate-400 to-transparent rounded-full text-center text-xs text-[var(--text-muted)]">
          SCREEN THIS WAY
        </div>
      </div>

      {/* SEATS */}
      <div className="space-y-6">
        {seatLayout.map((row) => (
          <div key={row.row}>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              {row.type} ₹{SEAT_PRICE[row.type]}
            </p>

            <div className="flex gap-3">
              {Array.from({ length: row.seats }).map((_, i) => {
                const seatId = `${row.row}${i + 1}`;
                const isOccupied = occupiedSeats.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);

                return (
                  <button
                    key={seatId}
                    onClick={() => toggleSeat(seatId)}
                    disabled={isOccupied}
                    className={`w-9 h-9 rounded text-sm font-semibold transition
                      ${
                        isOccupied
                          ? "bg-[var(--seat-occupied-bg)] text-[var(--seat-occupied-text)] cursor-not-allowed"
                          : isSelected
                            ? "bg-green-500 text-black"
                            : "border border-[var(--seat-border)] hover:bg-[var(--surface-alt)]"
                      }
                    `}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border-color)] p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            Seats: {selectedSeats.join(", ") || "None"}
          </p>
          <p className="font-semibold">₹ {totalAmount}</p>
        </div>

        <button
          disabled={selectedSeats.length === 0}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md font-semibold disabled:opacity-50"
        >
          Pay ₹{totalAmount}
        </button>
      </div>
    </div>
  );
}
