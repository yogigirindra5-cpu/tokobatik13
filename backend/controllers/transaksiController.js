const TransaksiModel = require("../models/transaksiModel");
const db = require("../config/db");

// ==========================================
// GET SEMUA TRANSAKSI
// ==========================================
const getAllTransaksi = async (req, res, next) => {
  try {
    const transaksi = await TransaksiModel.getAll();

    return res.json({
      success: true,
      data: transaksi,
      transaksi: transaksi,
    });
  } catch (error) {
    console.error("GET ALL TRANSAKSI ERROR:", error);
    next(error);
  }
};

// ==========================================
// GET TRANSAKSI BERDASARKAN ID
// ==========================================
const getTransaksiById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaksi =
      await TransaksiModel.getById(id);

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan",
      });
    }

    // Pembeli hanya boleh melihat transaksi sendiri
    if (
      req.user.role !== "admin" &&
      Number(transaksi.id_pembeli) !==
        Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    return res.json({
      success: true,
      data: transaksi,
      transaksi: transaksi,
    });
  } catch (error) {
    console.error(
      "GET TRANSAKSI BY ID ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// CREATE TRANSAKSI
// ==========================================
const createTransaksi = async (
  req,
  res,
  next
) => {
  const client = await db.connect();

  try {
    const {
      id_produk,
      nama_pembeli,
      phone_pembeli,
      jumlah,
      total_harga,
      metode_pembayaran,
      alamat_kirim,
      catatan,
    } = req.body;

    /*
     * User yang sedang login
     */
    const id_pembeli = req.user.id;

    /*
     * Konversi angka
     */
    const idProduk = Number(id_produk);
    const jumlahProduk = Number(jumlah);
    const totalHarga = Number(total_harga);

    // ==========================================
    // VALIDASI USER
    // ==========================================
    if (!id_pembeli) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // ==========================================
    // VALIDASI PRODUK
    // ==========================================
    if (
      !Number.isInteger(idProduk) ||
      idProduk <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Produk wajib dipilih",
      });
    }

    // ==========================================
    // VALIDASI JUMLAH
    // ==========================================
    if (
      !Number.isInteger(jumlahProduk) ||
      jumlahProduk <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Jumlah produk tidak valid",
      });
    }

    // ==========================================
    // VALIDASI TOTAL HARGA
    // ==========================================
    if (
      !Number.isFinite(totalHarga) ||
      totalHarga <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total harga tidak valid",
      });
    }

    // ==========================================
    // MULAI TRANSAKSI DATABASE
    // ==========================================
    await client.query("BEGIN");

    // ==========================================
    // LOCK PRODUK
    // ==========================================
    const produkResult =
      await client.query(
        `
        SELECT *
        FROM produk_batik
        WHERE id_produk = $1
        FOR UPDATE
        `,
        [idProduk]
      );

    if (
      produkResult.rows.length === 0
    ) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message:
          "Produk tidak ditemukan",
      });
    }

    const produk =
      produkResult.rows[0];

    // ==========================================
    // CEK STOK
    // ==========================================
    const stokLama =
      Number(produk.stok);

    if (
      !Number.isFinite(stokLama)
    ) {
      await client.query("ROLLBACK");

      return res.status(500).json({
        success: false,
        message:
          "Stok produk tidak valid",
      });
    }

    if (
      stokLama < jumlahProduk
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          `Stok tidak mencukupi. Stok tersedia: ${stokLama}`,
      });
    }

    // ==========================================
    // HITUNG STOK BARU
    // ==========================================
    const stokBaru =
      stokLama - jumlahProduk;

    // ==========================================
    // TENTUKAN STATUS PRODUK
    // ==========================================
    const statusProduk =
      stokBaru <= 0
        ? "Habis"
        : "Tersedia";

    // ==========================================
    // INSERT TRANSAKSI
    // ==========================================
    const transaksiResult =
      await client.query(
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
          catatan,
          pembayaran,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          'Belum',
          'Tertunda'
        )
        RETURNING *
        `,
        [
          id_pembeli,
          idProduk,
          nama_pembeli
            ? String(
                nama_pembeli
              ).trim()
            : null,
          phone_pembeli
            ? String(
                phone_pembeli
              ).trim()
            : null,
          jumlahProduk,
          totalHarga,
          metode_pembayaran ||
            "Bank Transfer",
          alamat_kirim
            ? String(
                alamat_kirim
              ).trim()
            : null,
          catatan
            ? String(catatan).trim()
            : null,
        ]
      );

    // ==========================================
    // UPDATE STOK + STATUS PRODUK
    // ==========================================
    await client.query(
      `
      UPDATE produk_batik
      SET
        stok = $1,
        status_produk = $2::status_produk
      WHERE id_produk = $3
      `,
      [
        stokBaru,
        statusProduk,
        idProduk,
      ]
    );

    // ==========================================
    // COMMIT
    // ==========================================
    await client.query("COMMIT");

    // ==========================================
    // RESPONSE
    // ==========================================
    return res.status(201).json({
      success: true,
      message:
        "Transaksi berhasil dibuat",

      data:
        transaksiResult.rows[0],

      transaksi:
        transaksiResult.rows[0],
    });
  } catch (error) {
    /*
     * Rollback jika terjadi error
     */
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "ROLLBACK ERROR:",
        rollbackError
      );
    }

    console.error(
      "CREATE TRANSAKSI ERROR:",
      error
    );

    next(error);
  } finally {
    client.release();
  }
};

// ==========================================
// UPLOAD BUKTI BAYAR
// ==========================================
const uploadBuktiBayar = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "File bukti pembayaran wajib diupload",
      });
    }

    const transaksi =
      await TransaksiModel.getById(id);

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message:
          "Transaksi tidak ditemukan",
      });
    }

    if (
      req.user.role !== "admin" &&
      Number(transaksi.id_pembeli) !==
        Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    const fotoBukti =
      req.file.filename;

    const updated =
      await TransaksiModel.updatePembayaran(
        id,
        "Dibayar",
        fotoBukti
      );

    return res.json({
      success: true,
      message:
        "Bukti pembayaran berhasil diupload",
      data: updated,
      transaksi: updated,
    });
  } catch (error) {
    console.error(
      "UPLOAD BUKTI BAYAR ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// UPDATE STATUS TRANSAKSI
// ==========================================
const updateStatusTransaksi = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValid = [
      "Tertunda",
      "Diproses",
      "Dikirim",
      "Selesai",
      "Dibatalkan",
    ];

    if (!statusValid.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status transaksi tidak valid",
      });
    }

    const transaksi =
      await TransaksiModel.updateStatus(
        id,
        status
      );

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message:
          "Transaksi tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message:
        "Status transaksi berhasil diperbarui",
      data: transaksi,
      transaksi: transaksi,
    });
  } catch (error) {
    console.error(
      "UPDATE STATUS TRANSAKSI ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// UPDATE PEMBAYARAN ADMIN
// ==========================================
const updatePembayaranAdmin = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { pembayaran } = req.body;

    const pembayaranValid = [
      "Belum",
      "Dibayar",
    ];

    if (
      !pembayaranValid.includes(
        pembayaran
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status pembayaran tidak valid",
      });
    }

    const transaksi =
      await TransaksiModel.updatePembayaran(
        id,
        pembayaran,
        null
      );

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message:
          "Transaksi tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message:
        "Status pembayaran berhasil diperbarui",
      data: transaksi,
      transaksi: transaksi,
    });
  } catch (error) {
    console.error(
      "UPDATE PEMBAYARAN ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// DELETE TRANSAKSI
// ==========================================
const deleteTransaksi = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const transaksi =
      await TransaksiModel.delete(id);

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message:
          "Transaksi tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message:
        "Transaksi berhasil dihapus",
      data: transaksi,
      transaksi: transaksi,
    });
  } catch (error) {
    console.error(
      "DELETE TRANSAKSI ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  getAllTransaksi,
  getTransaksiById,
  createTransaksi,
  uploadBuktiBayar,
  updateStatusTransaksi,
  updatePembayaranAdmin,
  deleteTransaksi,
};