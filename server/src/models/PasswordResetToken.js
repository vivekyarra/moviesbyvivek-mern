const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

passwordResetTokenSchema.index({ email: 1 });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);
