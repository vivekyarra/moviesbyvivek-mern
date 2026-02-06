const express = require("express");
const {
  listShowtimes,
  getShowtime,
  listOccupiedSeats,
} = require("../controllers/showtimeController");

const router = express.Router();

router.get("/", listShowtimes);
router.get("/:id", getShowtime);
router.get("/:id/occupied", listOccupiedSeats);

module.exports = router;
