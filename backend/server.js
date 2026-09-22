const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// ======================================================
// ROUTES
// ======================================================

const authRoutes = require("./routes/authRoutes");
const produkRoutes = require("./routes/produkRoutes");
const kategoriRoutes = require("./routes/kategoriRoutes");
const transaksiRoutes = require("./routes/transaksiRoutes");
const artikelRoutes = require("./routes/artikelRoutes");

// ======================================================
// ERROR HANDLER
// ======================================================

const {
  errorHandler,
  notFound,
} = require("./middlewares/errorHandler");

// ======================================================
// APP
// ======================================================

const app = express();

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",

  // Vercel
  "https://tokobatik09.vercel.app",
  "https://tokobatik13.vercel.app",
  "https://tokobatik13-khxf-beta.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Request dari Postman, Insomnia, server-to-server, dll.
      if (!origin) {
        return callback(null, true);
      }

      // Izinkan origin yang terdaftar
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS ditolak:", origin);

      return callback(
        new Error(`Origin tidak diizinkan: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ======================================================
// STATIC UPLOADS
// ======================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// ======================================================
// HOME / HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Toko Batik berjalan dengan baik 🚀",
  });
});

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/auth", authRoutes);

app.use("/api/produk", produkRoutes);

app.use("/api/kategori", kategoriRoutes);

app.use("/api/transaksi", transaksiRoutes);

app.use("/api/artikel", artikelRoutes);

// ======================================================
// 404
// ======================================================

app.use(notFound);

// ======================================================
// ERROR HANDLER
// ======================================================

app.use(errorHandler);

// ======================================================
// LOCAL SERVER
// ======================================================

// Hanya menjalankan app.listen ketika dijalankan
// secara langsung di localhost.
// Saat di-import oleh Vercel, app.listen tidak dijalankan.

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server berjalan di port ${PORT}`);
  });
}

// ======================================================
// EXPORT
// ======================================================

module.exports = app;