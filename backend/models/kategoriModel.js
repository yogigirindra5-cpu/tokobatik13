const db = require('../config/db');

let tableReady;

const ensureTable = async () => {
  if (!tableReady) {
    tableReady = (async () => {
      await db.query(`
        CREATE TABLE IF NOT EXISTS kategori (
          id_kategori INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
          nama_kategori VARCHAR(100) UNIQUE NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      await db.query(`
        INSERT IGNORE INTO kategori (nama_kategori) VALUES
          ('Kemeja Batik'), ('Dress Batik'), ('Kain Batik'), ('Sarung Batik')
      `);
    })();
  }
  await tableReady;
};

const KategoriModel = {
  getAll: async () => {
    await ensureTable();
    const [rows] = await db.query(
      'SELECT id_kategori, nama_kategori FROM kategori ORDER BY nama_kategori ASC'
    );
    return rows;
  },

  create: async (namaKategori) => {
    await ensureTable();
    const [result] = await db.query(
      'INSERT INTO kategori (nama_kategori) VALUES (?)',
      [namaKategori]
    );
    return result.insertId;
  },

  getById: async (id) => {
    await ensureTable();
    const [rows] = await db.query(
      'SELECT id_kategori, nama_kategori FROM kategori WHERE id_kategori = ?',
      [id]
    );
    return rows[0];
  },

  update: async (id, namaKategori) => {
    await ensureTable();
    const [result] = await db.query(
      'UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?',
      [namaKategori, id]
    );
    return result.affectedRows;
  },

  countProduk: async (namaKategori) => {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS jumlah FROM produk_batik WHERE kategori = ?',
      [namaKategori]
    );
    return Number(rows[0]?.jumlah || 0);
  },

  delete: async (id) => {
    await ensureTable();
    const [result] = await db.query(
      'DELETE FROM kategori WHERE id_kategori = ?',
      [id]
    );
    return result.affectedRows;
  },
};

module.exports = KategoriModel;
