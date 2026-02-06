const Theatre = require("../models/Theatre");

async function listTheatres(req, res, next) {
  try {
    const theatres = await Theatre.find({}).sort({ name: 1 });
    res.json(theatres);
  } catch (error) {
    next(error);
  }
}

async function createTheatre(req, res, next) {
  try {
    const { name, area, distance, city, state, shows } = req.body;
    if (!name || !area) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const theatre = await Theatre.create({
      name,
      area,
      distance: distance || "",
      city: city || "",
      state: state || "",
      shows: Array.isArray(shows) ? shows : [],
    });

    return res.status(201).json(theatre);
  } catch (error) {
    return next(error);
  }
}

async function updateTheatre(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const theatre = await Theatre.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!theatre) return res.status(404).json({ message: "Theatre not found." });
    return res.json(theatre);
  } catch (error) {
    return next(error);
  }
}

async function deleteTheatre(req, res, next) {
  try {
    const { id } = req.params;
    const theatre = await Theatre.findByIdAndDelete(id);
    if (!theatre) return res.status(404).json({ message: "Theatre not found." });
    return res.json({ message: "Theatre deleted." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listTheatres,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};
