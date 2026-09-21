const express = require("express");

const router = express.Router();

const {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
} = require("../controllers/kategoriController");

const {
  verifyToken,
  verifyRole,
} = require("../middlewares/authMiddleware");

// ======================================================
// PUBLIC
// ======================================================

// GET semua kategori
router.get("/", getAllKategori);

// GET kategori berdasarkan ID
router.get("/:id", getKategoriById);

// ======================================================
// ADMIN
// ======================================================

// POST tambah kategori
router.post(
  "/",
  verifyToken,
  verifyRole("admin"),
  createKategori
);

// PUT update kategori
router.put(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  updateKategori
);

// DELETE kategori
router.delete(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  deleteKategori
);

module.exports = router;