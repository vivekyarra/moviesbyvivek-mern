const express = require("express");
const { auth } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const {
  listMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");
const {
  listTheatres,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} = require("../controllers/theatreController");
const {
  listAdminShowtimes,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} = require("../controllers/showtimeController");

const router = express.Router();

router.use(auth, admin);

router.get("/status", (req, res) => {
  res.json({ isAdmin: true });
});

router.get("/movies", listMovies);
router.post("/movies", createMovie);
router.put("/movies/:id", updateMovie);
router.delete("/movies/:id", deleteMovie);

router.get("/theatres", listTheatres);
router.post("/theatres", createTheatre);
router.put("/theatres/:id", updateTheatre);
router.delete("/theatres/:id", deleteTheatre);

router.get("/showtimes", listAdminShowtimes);
router.post("/showtimes", createShowtime);
router.put("/showtimes/:id", updateShowtime);
router.delete("/showtimes/:id", deleteShowtime);

module.exports = router;
