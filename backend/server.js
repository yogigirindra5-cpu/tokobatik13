const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const produkRoutes = require('./routes/produkRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const artikelRoutes = require('./routes/artikelRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder statis untuk akses gambar yang diupload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route utama untuk cek server hidup
app.get('/', (req, res) => {
  res.json({ message: 'API Toko Pengrajin Batik berjalan dengan baik 🚀' });
});

// Routing API
app.use('/api/auth', authRoutes);
app.use('/api/produk', produkRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/artikel', artikelRoutes);
app.use('/api/kategori', kategoriRoutes);

// Middleware 404 & error handler (harus di paling bawah)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});