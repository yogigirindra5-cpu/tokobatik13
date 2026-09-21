const pool = require("../config/db");


// GET SEMUA ARTIKEL
async function getAllArtikel(req, res) {
  try {

    const result = await pool.query(`
      SELECT *
      FROM artikel
      ORDER BY created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {

    console.error(
      "GET ARTIKEL ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Gagal mengambil artikel",
    });
  }
}


// GET ARTIKEL BY ID
async function getArtikelById(req, res) {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM artikel
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error(
      "GET ARTIKEL ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Gagal mengambil artikel",
    });
  }
}


// CREATE ARTIKEL
async function createArtikel(req, res) {
  try {

    const {
      judul,
      ringkasan,
      isi,
      gambar,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO artikel (
        judul,
        ringkasan,
        isi,
        gambar
      )
      VALUES (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING *
      `,
      [
        judul,
        ringkasan,
        isi,
        gambar || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Artikel berhasil ditambahkan",
      data: result.rows[0],
    });

  } catch (error) {

    console.error(
      "CREATE ARTIKEL ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Gagal menambahkan artikel",
      error: error.message,
    });
  }
}


// UPDATE ARTIKEL
async function updateArtikel(req, res) {
  try {

    const { id } = req.params;

    const {
      judul,
      ringkasan,
      isi,
      gambar,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE artikel
      SET
        judul = $1,
        ringkasan = $2,
        isi = $3,
        gambar = $4
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

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Artikel berhasil diperbarui",
      data: result.rows[0],
    });

  } catch (error) {

    console.error(
      "UPDATE ARTIKEL ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Gagal memperbarui artikel",
      error: error.message,
    });
  }
}


// DELETE ARTIKEL
async function deleteArtikel(req, res) {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM artikel
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Artikel berhasil dihapus",
    });

  } catch (error) {

    console.error(
      "DELETE ARTIKEL ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Gagal menghapus artikel",
    });
  }
}


module.exports = {
  getAllArtikel,
  getArtikelById,
  createArtikel,
  updateArtikel,
  deleteArtikel,
};