const Movie = require("../models/Movie");

async function listMovies(req, res, next) {
  try {
    const movies = await Movie.find({}).sort({ title: 1 });
    res.json(movies);
  } catch (error) {
    next(error);
  }
}

async function getMovie(req, res, next) {
  try {
    const { slug } = req.params;
    const movie = await Movie.findOne({ slug });
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    res.json(movie);
  } catch (error) {
    next(error);
  }
}

async function createMovie(req, res, next) {
  try {
    const { slug, title, genre, language, poster, duration, certificate } =
      req.body;

    if (!slug || !title || !genre || !language || !poster || !duration) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existing = await Movie.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: "Movie slug already exists." });
    }

    const movie = await Movie.create({
      slug,
      title,
      genre,
      language,
      poster,
      duration,
      certificate: certificate || "U/A",
    });

    return res.status(201).json(movie);
  } catch (error) {
    return next(error);
  }
}

async function updateMovie(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    if (updates.slug) {
      const existing = await Movie.findOne({ slug: updates.slug });
      if (existing && existing._id.toString() !== id) {
        return res.status(409).json({ message: "Movie slug already exists." });
      }
    }

    const movie = await Movie.findByIdAndUpdate(id, updates, { new: true });
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    return res.json(movie);
  } catch (error) {
    return next(error);
  }
}

async function deleteMovie(req, res, next) {
  try {
    const { id } = req.params;
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    return res.json({ message: "Movie deleted." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
};
