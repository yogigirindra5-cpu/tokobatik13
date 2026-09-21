// Middleware untuk menangani error secara terpusat
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Terjadi kesalahan pada server',
  });
};

// Middleware untuk menangani route yang tidak ditemukan
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} tidak ditemukan` });
};

module.exports = { errorHandler, notFound };