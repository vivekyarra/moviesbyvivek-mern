import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createOrder, verifyPayment } from "../services/payment.service";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const { showtimeId, showtime, seats, amount } = state || {};

  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK."));
      document.body.appendChild(script);
    });

  if (!showtimeId || !showtime || !seats?.length) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center">
        Payment details missing
      </div>
    );
  }

  const handlePayment = async () => {
    setStatus("loading");
    setError("");
    try {
      const order = await createOrder({
        amount,
        showtimeId,
        seats,
      });
      await loadRazorpay();

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Movies by Vivek",
        description: showtime.movieTitle,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            navigate("/success", {
              state: {
                booking: result.booking,
              },
            });
          } catch (err) {
            setError(err.message || "Payment verification failed.");
            setStatus("idle");
          }
        },
        theme: {
          color: "#ef4444",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed.");
        setStatus("idle");
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Failed to start payment.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-[var(--surface)] rounded-xl p-6 border border-[var(--border-color)]">
        <h1 className="text-2xl font-semibold mb-4">Confirm Booking</h1>

        <div className="space-y-3 text-sm text-[var(--text-muted)]">
          <div>
            <p className="text-[var(--text-main)] font-medium">
              {showtime.movieTitle}
            </p>
            <p>{showtime.theatre}</p>
            <p>{showtime.datetime}</p>
          </div>

          <div>
            <p>
              <span className="text-[var(--text-main)]">Seats:</span>{" "}
              {seats.join(", ")}
            </p>
          </div>

          <div className="flex justify-between pt-3 border-t border-[var(--border-color)] text-lg">
            <span>Total</span>
            <span className="text-[var(--text-main)] font-semibold">
              ₹ {amount}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

        <button
          onClick={handlePayment}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold transition"
          disabled={status === "loading"}
        >
          {status === "loading"
            ? "Opening payment..."
            : `Confirm & Pay ₹${amount}`}
        </button>
      </div>
    </div>
  );
}
