const mongoose = require("mongoose");

const showtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // e.g. "10:30 AM"
    seatLayout: { type: Array, default: [] },
  },
  { timestamps: true }
);

showtimeSchema.index({ movie: 1, theatre: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model("Showtime", showtimeSchema);
