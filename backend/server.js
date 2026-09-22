const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend Toko Batik berhasil berjalan di Vercel"
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API berhasil berjalan di Vercel"
  });
});

app.get("/api/index", (req, res) => {
  res.json({
    success: true,
    message: "API index berhasil berjalan di Vercel"
  });
});

module.exports = app;