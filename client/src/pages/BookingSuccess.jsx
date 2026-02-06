import { useLocation, useNavigate } from "react-router-dom";

export default function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const booking = state?.booking;

  if (!booking) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center px-4">
        Booking details missing.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-xl p-6 border border-[var(--border-color)] text-center">
        <div className="text-green-500 text-4xl mb-4">✓</div>

        <h1 className="text-2xl font-semibold mb-2">Booking Confirmed</h1>

        <p className="text-[var(--text-muted)] mb-4">
          Your tickets are booked.
        </p>

        <div className="text-sm text-[var(--text-muted)] space-y-1 mb-4">
          <p className="text-[var(--text-main)] font-medium">
            {booking.movieTitle}
          </p>
          <p>{booking.theatre}</p>
          <p>{booking.datetime}</p>
          <p>Seats: {booking.seats?.join(", ")}</p>
          <p className="text-[var(--text-main)] font-semibold">
            Paid ₹{booking.amount}
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
