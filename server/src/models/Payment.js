const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true },
    paymentId: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    provider: { type: String, default: "razorpay" },
    status: { type: String, default: "created" },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    seats: { type: [String], default: [] },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
