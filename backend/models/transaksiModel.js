const db = require("../config/db");

const transaksiModel = {
  // Ambil semua transaksi
  getAll: async () => {
    const result = await db.query(`
      SELECT
        t.*,
        p.nama_produk,
        p.gambar,
        p.harga AS harga_produk,
        u.email,
        u.uname
      FROM transaksi t
      JOIN produk_batik p
        ON t.id_produk = p.id_produk
      JOIN users u
        ON t.id_pembeli = u.id
      ORDER BY t.created_at DESC
    `);

    return result.rows;
  },

  // Ambil transaksi berdasarkan pembeli
  getByPembeli: async (idPembeli) => {
    const result = await db.query(
      `
      SELECT
        t.*,
        p.nama_produk,
        p.gambar,
        p.harga AS harga_produk
      FROM transaksi t
      JOIN produk_batik p
        ON t.id_produk = p.id_produk
      WHERE t.id_pembeli = $1
      ORDER BY t.created_at DESC
      `,
      [idPembeli]
    );

    return result.rows;
  },

  // Ambil satu transaksi
  getById: async (id) => {
    const result = await db.query(
      `
      SELECT
        t.*,
        p.nama_produk,
        p.gambar,
        p.harga AS harga_produk,
        u.email,
        u.uname
      FROM transaksi t
      JOIN produk_batik p
        ON t.id_produk = p.id_produk
      JOIN users u
        ON t.id_pembeli = u.id
      WHERE t.id = $1
      `,
      [id]
    );

    return result.rows[0] || null;
  },

  // Buat transaksi
  create: async (data) => {
    const {
      id_pembeli,
      id_produk,
      nama_pembeli,
      phone_pembeli,
      jumlah,
      total_harga,
      metode_pembayaran,
      alamat_kirim,
      catatan,
    } = data;

    const result = await db.query(
      `
      INSERT INTO transaksi (
        id_pembeli,
        id_produk,
        nama_pembeli,
        phone_pembeli,
        jumlah,
        total_harga,
        metode_pembayaran,
        alamat_kirim,
        catatan
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9
      )
      RETURNING *
      `,
      [
        id_pembeli,
        id_produk,
        nama_pembeli || null,
        phone_pembeli || null,
        jumlah || 1,
        total_harga,
        metode_pembayaran || "Bank Transfer",
        alamat_kirim || null,
        catatan || null,
      ]
    );

    return result.rows[0];
  },

  // Update status transaksi
  updateStatus: async (id, status) => {
    const result = await db.query(
      `
      UPDATE transaksi
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    return result.rows[0] || null;
  },

  // Update pembayaran
  updatePembayaran: async (id, pembayaran, fotoBukti = null) => {
    const result = await db.query(
      `
      UPDATE transaksi
      SET
        pembayaran = $1,
        foto_bukti = COALESCE($2, foto_bukti)
      WHERE id = $3
      RETURNING *
      `,
      [pembayaran, fotoBukti, id]
    );

    return result.rows[0] || null;
  },

  // Hapus transaksi
  delete: async (id) => {
    const result = await db.query(
      `
      DELETE FROM transaksi
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0] || null;
  },
};

module.exports = transaksiModel;