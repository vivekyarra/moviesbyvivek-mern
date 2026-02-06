const express = require("express");
const { listTheatres } = require("../controllers/theatreController");

const router = express.Router();

router.get("/", listTheatres);

module.exports = router;
