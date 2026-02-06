const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const payload = jwt.verify(token, secret);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { auth };
