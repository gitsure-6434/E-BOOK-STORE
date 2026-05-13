const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    pdfUrl: {
      type: String,
      default: "",
      trim: true
    },
    coverImageUrl: {
      type: String,
      default: "",
      trim: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
