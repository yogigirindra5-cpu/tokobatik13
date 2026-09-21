const db = require("../config/db");

const ArtikelModel = {
  getAll: async () => {
    const result = await db.query(`
      SELECT *
      FROM artikel
      ORDER BY created_at DESC
    `);

    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query(
      `
      SELECT *
      FROM artikel
      WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] || null;
  },

  create: async (data) => {
    const {
      judul,
      ringkasan,
      isi,
      gambar,
    } = data;

    const result = await db.query(
      `
      INSERT INTO artikel (
        judul,
        ringkasan,
        isi,
        gambar
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        judul,
        ringkasan,
        isi,
        gambar || null,
      ]
    );

    return result.rows[0];
  },

  update: async (id, data) => {
    const {
      judul,
      ringkasan,
      isi,
      gambar,
    } = data;

    const result = await db.query(
      `
      UPDATE artikel
      SET
        judul = $1,
        ringkasan = $2,
        isi = $3,
        gambar = COALESCE($4, gambar)
      WHERE id = $5
      RETURNING *
      `,
      [
        judul,
        ringkasan,
        isi,
        gambar || null,
        id,
      ]
    );

    return result.rows[0] || null;
  },

  delete: async (id) => {
    const result = await db.query(
      `
      DELETE FROM artikel
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0] || null;
  },
};

module.exports = ArtikelModel;