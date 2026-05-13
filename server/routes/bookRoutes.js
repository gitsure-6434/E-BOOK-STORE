const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadPdf = require("../middlewares/uploadPdfMiddleware");
const { uploadBookPdf } = require("../controllers/uploadController");
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware");
const {
  getAllBooks,
  getMyBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require("../controllers/bookController");

const router = express.Router();

const handlePdfUpload = (req, res, next) => {
  uploadPdf.single("pdf")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Invalid file upload" });
    }
    return next();
  });
};

router.get("/my", authMiddleware, getMyBooks);
router.post("/upload", authMiddleware, handlePdfUpload, uploadBookPdf);
router.get("/", getAllBooks);
router.get("/:id", optionalAuthMiddleware, getBookById);
router.post("/", authMiddleware, createBook);
router.put("/:id", authMiddleware, updateBook);
router.delete("/:id", authMiddleware, deleteBook);

module.exports = router;
