const db = require('../config/db');

const TransaksiModel = {
  // Ambil semua transaksi (untuk admin), lengkap dengan info produk & pembeli
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT t.*, p.nama_produk, p.gambar, u.email, u.uname
       FROM transaksi t
       JOIN produk_batik p ON t.id_produk = p.id_produk
       JOIN users u ON t.id_pembeli = u.id
       ORDER BY t.created_at DESC`
    );
    return rows;
  },

  // Ambil transaksi milik satu pembeli
  getByPembeli: async (idPembeli) => {
    const [rows] = await db.query(
      `SELECT t.*, p.nama_produk, p.gambar
       FROM transaksi t
       JOIN produk_batik p ON t.id_produk = p.id_produk
       WHERE t.id_pembeli = ?
       ORDER BY t.created_at DESC`,
      [idPembeli]
    );
    return rows;
  },

  // Ambil satu transaksi berdasarkan id
  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT t.*, p.nama_produk, p.gambar, p.harga AS harga_produk, u.email, u.uname
       FROM transaksi t
       JOIN produk_batik p ON t.id_produk = p.id_produk
       JOIN users u ON t.id_pembeli = u.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Buat transaksi baru
  create: async (data) => {
    const {
      id_pembeli, id_produk, nama_pembeli, phone_pembeli,
      jumlah, total_harga, metode_pembayaran, alamat_kirim, catatan
    } = data;

    const [result] = await db.query(
      `INSERT INTO transaksi
        (id_pembeli, id_produk, nama_pembeli, phone_pembeli, jumlah, total_harga, metode_pembayaran, alamat_kirim, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_pembeli, id_produk, nama_pembeli || null, phone_pembeli || null,
        jumlah || 1, total_harga, metode_pembayaran || 'Bank Transfer',
        alamat_kirim || null, catatan || null
      ]
    );
    return result.insertId;
  },

  // Update status transaksi (Tertunda, Diproses, Dikirim, Selesai, Dibatalkan)
  updateStatus: async (id, status) => {
    const [result] = await db.query(
      'UPDATE transaksi SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  },

  // Update status pembayaran + upload bukti bayar
  updatePembayaran: async (id, pembayaran, fotoBukti) => {
    const [result] = await db.query(
      `UPDATE transaksi
       SET pembayaran = ?, foto_bukti = COALESCE(?, foto_bukti)
       WHERE id = ?`,
      [pembayaran, fotoBukti, id]
    );
    return result.affectedRows;
  },

  // Hapus transaksi
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM transaksi WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = TransaksiModel;
