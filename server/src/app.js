const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const theatreRoutes = require("./routes/theatreRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

const defaultOrigins = ["http://localhost:5173", "http://localhost:5174"];
const envOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL;
const allowedOrigins = envOrigins
  ? envOrigins.split(",").map((origin) => origin.trim())
  : defaultOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

module.exports = app;
