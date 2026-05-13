const Book = require("../models/bookModel");
const User = require("../models/userModel");

const isAdmin = (req) => req.user && req.user.role === "admin";

const canManageBook = (book, req) => {
  if (!book || !req.user) return false;
  if (isAdmin(req)) return true;
  return book.seller.toString() === req.user.id;
};

const getAllBooks = async (req, res) => {
  try {
    const filter = { isPublished: true };
    if (req.query.seller) {
      filter.seller = req.query.seller;
    }

    const books = await Book.find(filter)
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
};

const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ seller: req.user.id })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch your books", error: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("seller", "name email");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!book.isPublished) {
      if (!req.user || !canManageBook(book, req)) {
        return res.status(404).json({ message: "Book not found" });
      }
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch book", error: error.message });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, description, price, pdfUrl, coverImageUrl, isPublished } = req.body;

    if (!title || price === undefined || price === null) {
      return res.status(400).json({ message: "title and price are required" });
    }

    const sellerExists = await User.findById(req.user.id);
    if (!sellerExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const book = await Book.create({
      title,
      description: description ?? "",
      price: Number(price),
      pdfUrl: pdfUrl ?? "",
      coverImageUrl: coverImageUrl ?? "",
      seller: req.user.id,
      isPublished: typeof isPublished === "boolean" ? isPublished : true
    });

    const populated = await Book.findById(book._id).populate("seller", "name email");
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create book", error: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!canManageBook(book, req)) {
      return res.status(403).json({ message: "Forbidden: not allowed to update this book" });
    }

    const { title, description, price, pdfUrl, coverImageUrl, isPublished } = req.body;
    if (title !== undefined) book.title = title;
    if (description !== undefined) book.description = description;
    if (price !== undefined) book.price = Number(price);
    if (pdfUrl !== undefined) book.pdfUrl = pdfUrl;
    if (coverImageUrl !== undefined) book.coverImageUrl = coverImageUrl;
    if (typeof isPublished === "boolean") book.isPublished = isPublished;

    await book.save();
    const populated = await Book.findById(book._id).populate("seller", "name email");
    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update book", error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!canManageBook(book, req)) {
      return res.status(403).json({ message: "Forbidden: not allowed to delete this book" });
    }

    await Book.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete book", error: error.message });
  }
};

module.exports = {
  getAllBooks,
  getMyBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
