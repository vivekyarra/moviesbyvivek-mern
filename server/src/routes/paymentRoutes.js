const express = require("express");
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/order", auth, createOrder);
router.post("/verify", auth, verifyPayment);

module.exports = router;
