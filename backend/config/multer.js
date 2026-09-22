const multer = require("multer");
const path = require("path");

// Vercel tidak menyediakan penyimpanan file lokal permanen.
// Gunakan memoryStorage agar backend tidak mencoba membuat folder "uploads".
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const ext = path.extname(file.originalname).toLowerCase();

  const isValidExt = allowedTypes.test(ext);
  const isValidMime = allowedTypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Hanya file gambar (jpeg, jpg, png, webp) yang diizinkan"
      )
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;