const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, required: true },
    title: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true },
    poster: { type: String, required: true },
    duration: { type: String, required: true },
    certificate: { type: String, default: "U/A" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
