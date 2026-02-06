import { useEffect, useState } from "react";
import { getBookings } from "../services/booking.service";
import PageShell from "../components/common/PageShell";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getBookings()
      .then((data) => {
        if (!cancelled) setBookings(data || []);
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.status === 401) {
            setError("Please login to view your bookings.");
          } else {
            setError(err.message || "Failed to load bookings.");
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell title="My Bookings">
      {loading ? (
        <p className="text-[var(--text-muted)]">Loading bookings...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : bookings.length === 0 ? (
        <p className="text-[var(--text-muted)]">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id || b.id}
              className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-4"
            >
              <p className="text-lg font-semibold">{b.movieTitle}</p>
              <p className="text-sm text-[var(--text-muted)]">{b.theatre}</p>
              <p className="text-sm text-[var(--text-muted)]">{b.datetime}</p>
              <p className="text-sm">
                Seats: {Array.isArray(b.seats) ? b.seats.join(", ") : "N/A"}
              </p>
              <p className="text-sm font-semibold mt-1">Rs {b.amount}</p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
