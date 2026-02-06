const mongoose = require("mongoose");

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    distance: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    shows: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theatre", theatreSchema);
