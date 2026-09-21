const pool = require("../config/db");

// ======================================================
// KATEGORI MODEL
// PostgreSQL / Neon
// ======================================================

const KategoriModel = {
  // ====================================================
  // GET SEMUA KATEGORI
  // ====================================================

  getAll: async () => {
    const result = await pool.query(`
      SELECT
        id_kategori,
        nama_kategori
      FROM kategori
      ORDER BY id_kategori ASC
    `);

    return result.rows;
  },

  // ====================================================
  // GET KATEGORI BERDASARKAN ID
  // ====================================================

  getById: async (id) => {
    const result = await pool.query(
      `
      SELECT
        id_kategori,
        nama_kategori
      FROM kategori
      WHERE id_kategori = $1
      LIMIT 1
      `,
      [id]
    );

    return result.rows[0] || null;
  },

  // ====================================================
  // CREATE KATEGORI
  // ====================================================

  create: async (namaKategori) => {
    const result = await pool.query(
      `
      INSERT INTO kategori (
        nama_kategori
      )
      VALUES ($1)
      RETURNING
        id_kategori,
        nama_kategori
      `,
      [namaKategori]
    );

    return result.rows[0];
  },

  // ====================================================
  // UPDATE KATEGORI
  // ====================================================

  update: async (id, namaKategori) => {
    const result = await pool.query(
      `
      UPDATE kategori
      SET nama_kategori = $1
      WHERE id_kategori = $2
      RETURNING
        id_kategori,
        nama_kategori
      `,
      [namaKategori, id]
    );

    return result.rows[0] || null;
  },

  // ====================================================
  // HITUNG PRODUK BERDASARKAN KATEGORI
  // ====================================================

  countProduk: async (namaKategori) => {
    const result = await pool.query(
      `
      SELECT COUNT(*) AS jumlah
      FROM produk_batik
      WHERE kategori = $1
      `,
      [namaKategori]
    );

    return Number(result.rows[0]?.jumlah || 0);
  },

  // ====================================================
  // DELETE KATEGORI
  // ====================================================

  delete: async (id) => {
    const result = await pool.query(
      `
      DELETE FROM kategori
      WHERE id_kategori = $1
      RETURNING
        id_kategori,
        nama_kategori
      `,
      [id]
    );

    return result.rows[0] || null;
  },
};

// ======================================================
// EXPORT
// ======================================================

module.exports = KategoriModel;