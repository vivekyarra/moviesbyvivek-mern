const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured.");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

async function createOrder(req, res, next) {
  try {
    const { amount, showtimeId, seats } = req.body;
    if (!amount || !showtimeId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const showtime = await Showtime.findById(showtimeId)
      .populate("movie")
      .populate("theatre");
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found." });
    }

    const normalizedSeats = [...new Set(seats)].sort();
    const conflicts = await Booking.find({
      showtimeId,
      seats: { $in: normalizedSeats },
    }).select("seats");

    if (conflicts.length > 0) {
      return res.status(409).json({ message: "Some seats are already booked." });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `mb_${Date.now()}`,
    });

    const payment = await Payment.create({
      userId: req.user.id,
      orderId: order.id,
      amount: Number(amount),
      currency: order.currency,
      provider: "razorpay",
      status: "created",
      showtimeId,
      seats: normalizedSeats,
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id.toString(),
      showtime: {
        id: showtime._id.toString(),
        movieTitle: showtime.movie?.title,
        theatre: showtime.theatre?.name,
        datetime: `${showtime.date} \u2022 ${showtime.time}`,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ message: "Razorpay not configured." });
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expected !== signature) {
      return res.status(400).json({ message: "Invalid payment signature." });
    }

    const payment = await Payment.findOne({ orderId, userId: req.user.id });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    if (payment.status === "paid" && payment.bookingId) {
      const booking = await Booking.findById(payment.bookingId);
      return res.json({ booking });
    }

    const showtime = await Showtime.findById(payment.showtimeId)
      .populate("movie")
      .populate("theatre");
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found." });
    }

    const conflicts = await Booking.find({
      showtimeId: payment.showtimeId,
      seats: { $in: payment.seats },
    }).select("seats");

    if (conflicts.length > 0) {
      payment.status = "failed";
      payment.paymentId = paymentId;
      await payment.save();
      return res.status(409).json({ message: "Seats already booked." });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      showtimeId: showtime._id,
      movieId: showtime.movie?._id,
      theatreId: showtime.theatre?._id,
      movieTitle: showtime.movie?.title || "Movie",
      theatre: showtime.theatre?.name || "Theatre",
      date: showtime.date,
      time: showtime.time,
      datetime: `${showtime.date} \u2022 ${showtime.time}`,
      seats: payment.seats,
      amount: payment.amount,
      paymentId,
      paymentProvider: "razorpay",
      status: "confirmed",
    });

    payment.status = "paid";
    payment.paymentId = paymentId;
    payment.bookingId = booking._id;
    await payment.save();

    return res.json({ booking });
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, verifyPayment };
