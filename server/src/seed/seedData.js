const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const movies = require("../data/movies");
const theatres = require("../data/theatres");

async function seedDataIfNeeded() {
  const autoSeed =
    String(process.env.AUTO_SEED || "true").toLowerCase() !== "false";
  if (!autoSeed) return;

  const movieCount = await Movie.countDocuments();
  if (movieCount === 0) {
    await Movie.insertMany(movies);
    console.log(`Seeded ${movies.length} movies.`);
  }

  const theatreCount = await Theatre.countDocuments();
  if (theatreCount === 0) {
    await Theatre.insertMany(theatres);
    console.log(`Seeded ${theatres.length} theatres.`);
  }
}

module.exports = { seedDataIfNeeded };
