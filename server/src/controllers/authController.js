const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const OtpToken = require("../models/OtpToken");
const PasswordResetToken = require("../models/PasswordResetToken");
const { signToken } = require("../utils/jwt");
const { sendOtp } = require("../services/otpSender");
const { sendPasswordResetEmail } = require("../services/mailer");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function toSafeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email || null,
    phone: user.phone || null,
    avatar: user.avatar || null,
  };
}

function normalizeEmail(value) {
  return value ? value.trim().toLowerCase() : null;
}

function normalizePhone(value) {
  if (!value) return null;
  return value.replace(/[\s-]/g, "");
}

function resolveIdentifier({ identifier, email, phone }) {
  if (identifier) return identifier.trim();
  if (email) return normalizeEmail(email);
  if (phone) return normalizePhone(phone);
  return null;
}

function inferChannel(identifier, channel) {
  if (channel) return channel;
  if (identifier && identifier.includes("@")) return "email";
  return "phone";
}

function getClientBaseUrl() {
  const env = process.env.CLIENT_URL || process.env.CLIENT_URLS || "";
  if (!env) return "http://localhost:5173";
  if (env.includes(",")) {
    return env.split(",")[0].trim() || "http://localhost:5173";
  }
  return env.trim();
}

function shouldBypassOtp(channel) {
  const setting = String(process.env.OTP_BYPASS || "").toLowerCase();
  if (["true", "1", "yes", "all", "any"].includes(setting)) return true;
  if (["email"].includes(setting)) return channel === "email";
  if (["phone", "sms"].includes(setting)) return channel === "phone";

  // Phone OTP has no provider configured, allow any code for phone logins.
  if (channel === "phone") return true;

  return false;
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function findUserByIdentifier(identifier, channel) {
  if (!identifier) return null;
  if (channel === "email") {
    return User.findOne({ email: normalizeEmail(identifier) });
  }
  return User.findOne({ phone: normalizePhone(identifier) });
}

async function register(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    if (normalizedEmail) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ message: "Email already in use." });
      }
    }

    if (normalizedPhone) {
      const existing = await User.findOne({ phone: normalizedPhone });
      if (existing) {
        return res.status(409).json({ message: "Phone already in use." });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
    });

    const token = signToken(user);
    return res.status(201).json({ user: toSafeUser(user), token });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, email, phone, password } = req.body;

    if (!password || (!identifier && !email && !phone)) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const resolvedIdentifier = resolveIdentifier({ identifier, email, phone });
    const channel = inferChannel(resolvedIdentifier, req.body.channel);

    const user = await findUserByIdentifier(resolvedIdentifier, channel);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);
    return res.json({ user: toSafeUser(user), token });
  } catch (error) {
    return next(error);
  }
}

async function requestOtp(req, res, next) {
  try {
    const { name, password, purpose } = req.body;
    const resolvedIdentifier = resolveIdentifier(req.body);
    const channel = inferChannel(resolvedIdentifier, req.body.channel);

    if (!resolvedIdentifier || !purpose) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!["signup", "login"].includes(purpose)) {
      return res.status(400).json({ message: "Invalid OTP purpose." });
    }

    const normalizedEmail =
      normalizeEmail(req.body.email) ||
      (channel === "email" ? normalizeEmail(resolvedIdentifier) : null);
    const normalizedPhone =
      normalizePhone(req.body.phone) ||
      (channel === "phone" ? normalizePhone(resolvedIdentifier) : null);

    const existingUser =
      channel === "email"
        ? await User.findOne({ email: normalizedEmail })
        : await User.findOne({ phone: normalizedPhone });

    if (purpose === "signup") {
      if (!name || !password) {
        return res.status(400).json({ message: "Missing required fields." });
      }
      if (existingUser) {
        return res.status(409).json({ message: "User already exists." });
      }
    }

    if (purpose === "login" && !existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const passwordHash =
      purpose === "signup" ? await bcrypt.hash(password, 10) : null;

    await OtpToken.findOneAndUpdate(
      { identifier: resolvedIdentifier, purpose, channel },
      {
        identifier: resolvedIdentifier,
        channel,
        email: normalizedEmail,
        phone: normalizedPhone,
        purpose,
        codeHash,
        name: purpose === "signup" ? name : null,
        passwordHash,
        attempts: 0,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    const bypassOtp = shouldBypassOtp(channel);

    if (!bypassOtp) {
      await sendOtp({ channel, identifier: resolvedIdentifier, code });
      return res.json({ message: "OTP sent." });
    }

    console.log(`[OTP_BYPASS] ${resolvedIdentifier}: ${code}`);
    return res.json({ message: "OTP bypass enabled." });
  } catch (error) {
    return next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { code, purpose } = req.body;
    const resolvedIdentifier = resolveIdentifier(req.body);
    const channel = inferChannel(resolvedIdentifier, req.body.channel);

    if (!resolvedIdentifier || !code || !purpose) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const tokenDoc = await OtpToken.findOne({
      identifier: resolvedIdentifier,
      purpose,
      channel,
    });

    if (!tokenDoc) {
      return res.status(400).json({ message: "OTP not found or expired." });
    }

    const bypassOtp = shouldBypassOtp(channel);

    if (!bypassOtp) {
      if (tokenDoc.expiresAt < new Date()) {
        await tokenDoc.deleteOne();
        return res.status(400).json({ message: "OTP expired." });
      }

      if (tokenDoc.attempts >= 5) {
        await tokenDoc.deleteOne();
        return res.status(429).json({ message: "Too many attempts." });
      }

      const ok = await bcrypt.compare(code, tokenDoc.codeHash);
      if (!ok) {
        tokenDoc.attempts += 1;
        await tokenDoc.save();
        return res.status(401).json({ message: "Invalid OTP." });
      }
    }

    let user = await findUserByIdentifier(resolvedIdentifier, channel);
    if (purpose === "signup" && !user) {
      user = await User.create({
        name: tokenDoc.name,
        email: tokenDoc.email,
        phone: tokenDoc.phone,
        passwordHash: tokenDoc.passwordHash,
      });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await tokenDoc.deleteOne();
    const token = signToken(user);
    return res.json({ user: toSafeUser(user), token });
  } catch (error) {
    return next(error);
  }
}

async function googleAuth(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential." });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google client ID not set." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email?.toLowerCase();
    const name = payload.name || "Google User";
    const googleId = payload.sub;
    const avatar = payload.picture || null;

    if (!email) {
      return res.status(400).json({ message: "Google email not available." });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && avatar) user.avatar = avatar;
      if (!user.name) user.name = name;
      await user.save();
    }

    const token = signToken(user);
    return res.json({ user: toSafeUser(user), token });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json({ user: toSafeUser(user) });
}

async function updateMe(req, res, next) {
  try {
    const { name, email, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = normalizeEmail(email);
      if (normalizedEmail !== user.email) {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing && existing._id.toString() !== user._id.toString()) {
          return res.status(409).json({ message: "Email already in use." });
        }
      }
      user.email = normalizedEmail;
    }

    if (typeof phone === "string" && phone.trim()) {
      const normalizedPhone = normalizePhone(phone);
      if (normalizedPhone !== user.phone) {
        const existing = await User.findOne({ phone: normalizedPhone });
        if (existing && existing._id.toString() !== user._id.toString()) {
          return res.status(409).json({ message: "Phone already in use." });
        }
      }
      user.phone = normalizedPhone;
    }

    if (typeof avatar === "string") {
      user.avatar = avatar;
    }

    await user.save();
    return res.json({ user: toSafeUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond success to avoid user enumeration.
    const safeResponse = { message: "If the account exists, a reset link was sent." };
    if (!user) {
      return res.json(safeResponse);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await PasswordResetToken.deleteMany({ email: normalizedEmail, usedAt: null });
    await PasswordResetToken.create({
      email: normalizedEmail,
      tokenHash,
      expiresAt,
    });

    const baseUrl = getClientBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(
      normalizedEmail
    )}`;

    try {
      await sendPasswordResetEmail({ to: normalizedEmail, resetUrl });
    } catch (err) {
      console.error("[RESET_EMAIL_FAILED]", err?.message || err);
      console.log(`[RESET_LINK_FALLBACK] ${resetUrl}`);
    }

    return res.json(safeResponse);
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = normalizeEmail(email);
    const tokenHash = hashResetToken(token);

    const tokenDoc = await PasswordResetToken.findOne({
      email: normalizedEmail,
      tokenHash,
      usedAt: null,
    });

    if (!tokenDoc) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    if (tokenDoc.expiresAt < new Date()) {
      await tokenDoc.deleteOne();
      return res.status(400).json({ message: "Reset link expired." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();

    tokenDoc.usedAt = new Date();
    await tokenDoc.save();
    await PasswordResetToken.deleteMany({ email: normalizedEmail });

    return res.json({ message: "Password updated successfully." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  me,
  updateMe,
  requestOtp,
  verifyOtp,
  requestPasswordReset,
  resetPassword,
};
