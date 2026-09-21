const db = require('../config/db');

const ProdukModel = {
  // Ambil semua produk, dengan filter opsional (kategori, status)
  getAll: async (filters = {}) => {
    let query = `SELECT produk_batik.*,
      CASE WHEN stok > 0 THEN 'Tersedia' ELSE 'Habis' END AS status_produk
      FROM produk_batik WHERE 1=1`;
    const params = [];

    if (filters.kategori) {
      query += ' AND kategori = ?';
      params.push(filters.kategori);
    }
    if (filters.status_produk) {
      query += ' AND status_produk = ?';
      params.push(filters.status_produk);
    }
    if (filters.search) {
      query += ' AND (nama_produk LIKE ? OR deskripsi LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Ambil produk berdasarkan id
  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT produk_batik.*,
        CASE WHEN stok > 0 THEN 'Tersedia' ELSE 'Habis' END AS status_produk
       FROM produk_batik WHERE id_produk = ?`,
      [id]
    );
    return rows[0];
  },

  // Tambah produk baru
  create: async (data) => {
    const {
      nama_produk, deskripsi, harga, stok, ukuran,
      bahan_kain, gambar, kategori, status_produk
    } = data;

    const [result] = await db.query(
      `INSERT INTO produk_batik
        (nama_produk, deskripsi, harga, stok, ukuran, bahan_kain, gambar, kategori, status_produk)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nama_produk, deskripsi, harga, stok || 0, ukuran || null,
        bahan_kain || null, gambar || null, kategori || 'Kemeja Batik',
        status_produk || 'Tersedia'
      ]
    );
    return result.insertId;
  },

  // Update produk
  update: async (id, data) => {
    const {
      nama_produk, deskripsi, harga, stok, ukuran,
      bahan_kain, gambar, kategori, status_produk
    } = data;

    const [result] = await db.query(
      `UPDATE produk_batik SET
        nama_produk = ?, deskripsi = ?, harga = ?, stok = ?, ukuran = ?,
        bahan_kain = ?, gambar = COALESCE(?, gambar), kategori = ?, status_produk = ?
       WHERE id_produk = ?`,
      [
        nama_produk, deskripsi, harga, stok, ukuran,
        bahan_kain, gambar, kategori, status_produk, id
      ]
    );
    return result.affectedRows;
  },

  // Update stok saja (dipakai setelah transaksi)
  updateStok: async (id, jumlah) => {
    const [result] = await db.query(
      `UPDATE produk_batik
       SET stok = stok - ?,
           status_produk = CASE WHEN (stok - ?) <= 0 THEN 'Habis' ELSE 'Tersedia' END
       WHERE id_produk = ?`,
      [jumlah, jumlah, id]
    );
    return result.affectedRows;
  },

  // Hapus produk
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM produk_batik WHERE id_produk = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = ProdukModel;