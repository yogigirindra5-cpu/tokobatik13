const db = require('../config/db');

const ArtikelModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM artikel ORDER BY created_at DESC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM artikel WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { judul, ringkasan, isi, gambar } = data;
    const [result] = await db.query(
      'INSERT INTO artikel (judul, ringkasan, isi, gambar) VALUES (?, ?, ?, ?)',
      [judul, ringkasan, isi, gambar || null]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { judul, ringkasan, isi, gambar } = data;
    const [result] = await db.query(
      `UPDATE artikel SET judul = ?, ringkasan = ?, isi = ?, gambar = COALESCE(?, gambar) WHERE id = ?`,
      [judul, ringkasan, isi, gambar, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM artikel WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = ArtikelModel;