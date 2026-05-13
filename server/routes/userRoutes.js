const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);

router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.get("/:id", authMiddleware, adminMiddleware, getUserById);
router.patch("/:id/role", authMiddleware, adminMiddleware, updateUserRole);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
