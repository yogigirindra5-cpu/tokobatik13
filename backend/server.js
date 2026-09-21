const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const produkRoutes = require('./routes/produkRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const artikelRoutes = require('./routes/artikelRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// ===============================
// CORS
// ===============================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tokobatik13.vercel.app'
  ],
  credentials: true
}));

// ===============================
// Middleware
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Folder statis uploads
// ===============================
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// ===============================
// Route utama
// ===============================
app.get('/', (req, res) => {
  res.json({
    message: 'API Toko Pengrajin Batik berjalan dengan baik 🚀'
  });
});

// ===============================
// Routing API
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/produk', produkRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/artikel', artikelRoutes);

app.use(notFound);
app.use(errorHandler);

// Export Express app untuk Vercel
module.exports = app;

// Jalankan server hanya saat lokal
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  });
}