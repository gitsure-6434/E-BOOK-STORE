const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { getMyTransactions, getAllTransactions } = require("../controllers/transactionController");

const router = express.Router();

router.get("/my", authMiddleware, getMyTransactions);
router.get("/", authMiddleware, adminMiddleware, getAllTransactions);

module.exports = router;
