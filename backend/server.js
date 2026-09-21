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

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://tokobatik13.vercel.app',
  'https://tokobatik13-git-dev-yogigirindra13.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Request tanpa Origin, misalnya Postman/Insomnia
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Toko Batik berjalan dengan baik 🚀'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/produk', produkRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/artikel', artikelRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;