import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import PageShell from "../components/common/PageShell";
import { getBookings } from "../services/booking.service";

export default function Payments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBookings()
      .then((data) => {
        if (!cancelled) setBookings(data || []);
      })
      .catch(() => {
        if (!cancelled) setBookings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell title="Stored Payments">
      <div className="space-y-6">
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-alt)] border border-[var(--border-color)] flex items-center justify-center">
            <CreditCard className="text-[var(--accent)]" size={20} />
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">
              No payment methods saved.
            </p>
            <p className="text-xs text-[var(--text-subtle)] mt-1">
              Save a card or UPI after your next payment.
            </p>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>

          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No payments yet. Your booking payments will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b._id || b.id}
                  className="border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-between bg-[var(--surface-alt)]"
                >
                  <div>
                    <p className="text-sm font-semibold">{b.movieTitle}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {b.theatre}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {b.datetime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">₹ {b.amount}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Booking ID: {(b._id || b.id || "").slice(-6)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
