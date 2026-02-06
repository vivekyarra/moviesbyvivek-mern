const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");

async function listBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function createBooking(req, res, next) {
  try {
    const { showtimeId, seats, amount } = req.body;

    if (!showtimeId || !amount || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const showtime = await Showtime.findById(showtimeId)
      .populate("movie")
      .populate("theatre");
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found." });
    }

    const normalizedSeats = [...new Set(seats)].sort();
    const dedupeWindowMs = 5000;
    const windowStart = new Date(Date.now() - dedupeWindowMs);

    const existing = await Booking.findOne({
      userId: req.user.id,
      showtimeId,
      seats: normalizedSeats,
      amount,
      createdAt: { $gte: windowStart },
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const conflicts = await Booking.find({
      showtimeId,
      seats: { $in: normalizedSeats },
    }).select("seats");

    if (conflicts.length > 0) {
      const booked = new Set();
      conflicts.forEach((booking) => {
        booking.seats.forEach((seat) => {
          if (normalizedSeats.includes(seat)) booked.add(seat);
        });
      });
      return res.status(409).json({
        message: "Some seats are already booked.",
        seats: Array.from(booked),
      });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      showtimeId,
      movieId: showtime.movie?._id,
      theatreId: showtime.theatre?._id,
      movieTitle: showtime.movie?.title || "Movie",
      theatre: showtime.theatre?.name || "Theatre",
      date: showtime.date,
      time: showtime.time,
      datetime: `${showtime.date} \u2022 ${showtime.time}`,
      seats: normalizedSeats,
      amount,
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

module.exports = { listBookings, createBooking };
