const Transaction = require("../models/transactionModel");

const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyer: req.user.id })
      .populate("book", "title price pdfUrl coverImageUrl seller")
      .sort({ createdAt: -1 });

    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("buyer", "name email")
      .populate("book", "title price")
      .sort({ createdAt: -1 });

    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

module.exports = {
  getMyTransactions,
  getAllTransactions
};
