const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { createCheckoutSession, getSessionStatus, getCheckoutReceipt } = require("../controllers/stripeController");

const router = express.Router();

router.get("/receipt", getCheckoutReceipt);
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
router.get("/session-status", authMiddleware, getSessionStatus);

module.exports = router;
