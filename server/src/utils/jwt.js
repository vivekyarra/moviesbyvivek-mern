const jwt = require("jsonwebtoken");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables.");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    secret,
    { expiresIn: "7d" }
  );
}

module.exports = { signToken };
