const express = require("express");
const { listBookings, createBooking } = require("../controllers/bookingController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.use(auth);
router.get("/", listBookings);
router.post("/", createBooking);

module.exports = router;
