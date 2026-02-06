const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const Showtime = require("../models/Showtime");
const Booking = require("../models/Booking");
const { DEFAULT_SEAT_LAYOUT } = require("../data/seatLayout");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function ensureShowtimesForDate(movieId, date) {
  const existing = await Showtime.find({ movie: movieId, date });
  if (existing.length > 0) return existing;

  const movie = await Movie.findById(movieId);
  if (!movie) return null;

  const theatres = await Theatre.find({});
  if (!theatres.length) return [];

  const showtimesToCreate = [];
  theatres.forEach((theatre) => {
    theatre.shows.forEach((time) => {
      showtimesToCreate.push({
        movie: movie._id,
        theatre: theatre._id,
        date,
        time,
        seatLayout: DEFAULT_SEAT_LAYOUT,
      });
    });
  });

  if (!showtimesToCreate.length) return [];
  return Showtime.insertMany(showtimesToCreate);
}

async function listShowtimes(req, res, next) {
  try {
    const { movieId, date } = req.query;
    if (!movieId || !date || !DATE_RE.test(date)) {
      return res.status(400).json({ message: "Invalid movie or date." });
    }

    const ensured = await ensureShowtimesForDate(movieId, date);
    if (ensured === null) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const showtimes = await Showtime.find({ movie: movieId, date })
      .populate("theatre")
      .populate("movie");

    return res.json(showtimes);
  } catch (error) {
    next(error);
  }
}

async function getShowtime(req, res, next) {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate("theatre")
      .populate("movie");
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found." });
    }
    res.json(showtime);
  } catch (error) {
    next(error);
  }
}

async function listOccupiedSeats(req, res, next) {
  try {
    const { id } = req.params;
    const bookings = await Booking.find({ showtimeId: id }).select("seats");

    const seats = new Set();
    bookings.forEach((booking) => {
      booking.seats.forEach((seat) => seats.add(seat));
    });

    return res.json({ seats: Array.from(seats) });
  } catch (error) {
    next(error);
  }
}

async function listAdminShowtimes(req, res, next) {
  try {
    const { movieId, date } = req.query;
    const query = {};
    if (movieId) query.movie = movieId;
    if (date) query.date = date;
    const showtimes = await Showtime.find(query)
      .populate("theatre")
      .populate("movie")
      .sort({ date: 1, time: 1 });
    return res.json(showtimes);
  } catch (error) {
    next(error);
  }
}

async function createShowtime(req, res, next) {
  try {
    const { movieId, theatreId, date, time, seatLayout } = req.body;
    if (!movieId || !theatreId || !date || !time) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (!DATE_RE.test(date)) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    const existing = await Showtime.findOne({
      movie: movieId,
      theatre: theatreId,
      date,
      time,
    });
    if (existing) {
      return res.status(409).json({ message: "Showtime already exists." });
    }

    const showtime = await Showtime.create({
      movie: movieId,
      theatre: theatreId,
      date,
      time,
      seatLayout: Array.isArray(seatLayout) && seatLayout.length
        ? seatLayout
        : DEFAULT_SEAT_LAYOUT,
    });

    return res.status(201).json(showtime);
  } catch (error) {
    next(error);
  }
}

async function updateShowtime(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    if (updates.date && !DATE_RE.test(updates.date)) {
      return res.status(400).json({ message: "Invalid date format." });
    }
    const showtime = await Showtime.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found." });
    }
    return res.json(showtime);
  } catch (error) {
    next(error);
  }
}

async function deleteShowtime(req, res, next) {
  try {
    const { id } = req.params;
    const showtime = await Showtime.findByIdAndDelete(id);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found." });
    }
    return res.json({ message: "Showtime deleted." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listShowtimes,
  getShowtime,
  listOccupiedSeats,
  listAdminShowtimes,
  createShowtime,
  updateShowtime,
  deleteShowtime,
};
