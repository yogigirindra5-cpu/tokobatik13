const db = require("../config/db");

const produkModel = {
  // Ambil semua produk
  getAll: async (filters = {}) => {
    let query = `
      SELECT
        produk_batik.*,
        CASE
          WHEN stok > 0 THEN 'Tersedia'
          ELSE 'Habis'
        END AS status_produk
      FROM produk_batik
      WHERE 1 = 1
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.kategori) {
      query += ` AND kategori = $${paramIndex}`;
      params.push(filters.kategori);
      paramIndex++;
    }

    if (filters.status_produk) {
      query += ` AND status_produk = $${paramIndex}`;
      params.push(filters.status_produk);
      paramIndex++;
    }

    if (filters.search) {
      query += `
        AND (
          nama_produk ILIKE $${paramIndex}
          OR deskripsi ILIKE $${paramIndex + 1}
        )
      `;

      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`
      );

      paramIndex += 2;
    }

    query += `
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, params);

    return result.rows;
  },

  // Ambil produk berdasarkan ID
  getById: async (id) => {
    const result = await db.query(
      `
      SELECT
        produk_batik.*,
        CASE
          WHEN stok > 0 THEN 'Tersedia'
          ELSE 'Habis'
        END AS status_produk
      FROM produk_batik
      WHERE id_produk = $1
      `,
      [id]
    );

    return result.rows[0] || null;
  },

  // Tambah produk
  create: async (data) => {
    const {
      nama_produk,
      deskripsi,
      harga,
      stok,
      ukuran,
      bahan_kain,
      gambar,
      kategori,
      status_produk,
    } = data;

    const result = await db.query(
      `
      INSERT INTO produk_batik (
        nama_produk,
        deskripsi,
        harga,
        stok,
        ukuran,
        bahan_kain,
        gambar,
        kategori,
        status_produk
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9
      )
      RETURNING *
      `,
      [
        nama_produk,
        deskripsi,
        harga,
        stok || 0,
        ukuran || null,
        bahan_kain || null,
        gambar || null,
        kategori || "Kemeja Batik",
        status_produk || "Tersedia",
      ]
    );

    return result.rows[0];
  },

  // Update produk
  update: async (id, data) => {
    const {
      nama_produk,
      deskripsi,
      harga,
      stok,
      ukuran,
      bahan_kain,
      gambar,
      kategori,
      status_produk,
    } = data;

    const result = await db.query(
      `
      UPDATE produk_batik
      SET
        nama_produk = $1,
        deskripsi = $2,
        harga = $3,
        stok = $4,
        ukuran = $5,
        bahan_kain = $6,
        gambar = COALESCE($7, gambar),
        kategori = $8,
        status_produk = $9
      WHERE id_produk = $10
      RETURNING *
      `,
      [
        nama_produk,
        deskripsi,
        harga,
        stok,
        ukuran || null,
        bahan_kain || null,
        gambar || null,
        kategori,
        status_produk,
        id,
      ]
    );

    return result.rows[0] || null;
  },

  // Update stok
  updateStok: async (id, jumlah) => {
    const result = await db.query(
      `
      UPDATE produk_batik
      SET
        stok = stok - $1,
        status_produk =
          CASE
            WHEN (stok - $1) <= 0
            THEN 'Habis'
            ELSE 'Tersedia'
          END
      WHERE id_produk = $2
      RETURNING *
      `,
      [jumlah, id]
    );

    return result.rows[0] || null;
  },

  // Hapus produk
  delete: async (id) => {
    const result = await db.query(
      `
      DELETE FROM produk_batik
      WHERE id_produk = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0] || null;
  },
};

module.exports = produkModel;