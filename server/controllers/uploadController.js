const path = require("path");

const uploadBookPdf = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }
    const relativeUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json({
      message: "File uploaded successfully",
      pdfUrl: relativeUrl,
      filename: req.file.filename
    });
  } catch (error) {
    return res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

module.exports = { uploadBookPdf };
