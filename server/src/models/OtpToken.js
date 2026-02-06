const mongoose = require("mongoose");

const otpTokenSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, trim: true },
    channel: { type: String, enum: ["email", "phone"], required: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    phone: { type: String, default: null, trim: true },
    purpose: { type: String, enum: ["signup", "login"], required: true },
    codeHash: { type: String, required: true },
    name: { type: String, default: null },
    passwordHash: { type: String, default: null },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpTokenSchema.index({ identifier: 1, purpose: 1, channel: 1 });

module.exports = mongoose.model("OtpToken", otpTokenSchema);
