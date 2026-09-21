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

/* =========================
   CORS
========================= */

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://toko-batik-two.vercel.app',
  'https://tokobatik13.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Izinkan request tanpa origin
      // contoh: Postman / Insomnia
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('❌ CORS ditolak:', origin);

      return callback(
        new Error(`Origin tidak diizinkan oleh CORS: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   UPLOADS
========================= */

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

/* =========================
   ROOT
========================= */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Toko Batik berjalan dengan baik 🚀'
  });
});

/* =========================
   API ROUTES
========================= */

app.use('/api/auth', authRoutes);

app.use('/api/produk', produkRoutes);

app.use('/api/transaksi', transaksiRoutes);

app.use('/api/artikel', artikelRoutes);

/* =========================
   404
========================= */

app.use(notFound);

/* =========================
   ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;