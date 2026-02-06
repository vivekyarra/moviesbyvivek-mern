const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: "Theatre" },
    movieTitle: { type: String, required: true, trim: true },
    theatre: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    datetime: { type: String, required: true, trim: true },
    seats: { type: [String], default: [] },
    amount: { type: Number, required: true, min: 0 },
    paymentId: { type: String, default: null },
    paymentProvider: { type: String, default: null },
    status: { type: String, default: "confirmed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
