const express = require("express");

const router = express.Router();

const {
  getAllProduk,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
} = require("../controllers/produkController");

const {
  verifyToken,
  verifyRole,
} = require("../middlewares/authMiddleware");

const upload = require("../config/multer");

// ======================================================
// DEBUG
// ======================================================

console.log("========================================");
console.log("✅ produkRoutes.js BERHASIL DILOAD");
console.log("getAllProduk:", typeof getAllProduk);
console.log("getProdukById:", typeof getProdukById);
console.log("createProduk:", typeof createProduk);
console.log("updateProduk:", typeof updateProduk);
console.log("deleteProduk:", typeof deleteProduk);
console.log("========================================");

// ======================================================
// PUBLIC
// ======================================================

// GET semua produk
// URL: GET /api/produk
router.get("/", getAllProduk);

// GET detail produk
// URL: GET /api/produk/:id
router.get("/:id", getProdukById);

// ======================================================
// ADMIN
// ======================================================

// POST produk
// URL: POST /api/produk
router.post(
  "/",
  verifyToken,
  verifyRole("admin"),
  upload.single("gambar"),
  createProduk
);

// PUT produk
// URL: PUT /api/produk/:id
router.put(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  upload.single("gambar"),
  updateProduk
);

// DELETE produk
// URL: DELETE /api/produk/:id
router.delete(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  deleteProduk
);

module.exports = router;