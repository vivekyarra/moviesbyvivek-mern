const express = require("express");
const {
  register,
  login,
  googleAuth,
  me,
  updateMe,
  requestOtp,
  verifyOtp,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/me", auth, me);
router.patch("/me", auth, updateMe);

module.exports = router;
