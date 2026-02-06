function admin(req, res, next) {
  const email = (req.user?.email || "").toLowerCase();
  const adminList = [
    ...(process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  ];
  const singleAdmin = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (singleAdmin) adminList.push(singleAdmin);

  if (!email || adminList.length === 0) {
    return res.status(403).json({ message: "Admin access not configured." });
  }

  if (!adminList.includes(email)) {
    return res.status(403).json({ message: "Admin access required." });
  }

  return next();
}

module.exports = { admin };
