import { useEffect, useState } from "react";
import {
  useParams,
  useLocation,
} from "react-router-dom";

import {
  API_BASE_URL,
} from "../../constants.js";

import {
  getToken,
  formatRupiah,
  formatTanggal,
  getImageUrl,
  onImgError,
} from "../../utils.js";

export default function DetailPesanan() {
  const { id } = useParams();
  const location = useLocation();

  const [
    transaksi,
    setTransaksi,
  ] = useState(null);

  const [
    status,
    setStatus,
  ] = useState("loading");

  const [
    buktiFile,
    setBuktiFile,
  ] = useState(null);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================
  // MUAT DETAIL TRANSAKSI
  // ==========================================
  const muatTransaksi = async () => {
    try {
      setStatus("loading");
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan"
        );
      }

      /*
       * API_BASE_URL sudah:
       *
       * http://localhost:5000/api
       *
       * Jadi JANGAN tambahkan /api lagi.
       */
      const url =
        `${API_BASE_URL}/transaksi/${id}`;

      console.log(
        "GET DETAIL TRANSAKSI:",
        url
      );

      const res = await fetch(url, {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      });

      const data =
        await res
          .json()
          .catch(() => null);

      console.log(
        "RESPONSE DETAIL TRANSAKSI:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Transaksi tidak ditemukan"
        );
      }

      /*
       * Backend mengembalikan:
       *
       * {
       *   success: true,
       *   data: {...},
       *   transaksi: {...}
       * }
       *
       * Ambil data transaksi dari response.
       */
      const detail =
        data?.data ||
        data?.transaksi ||
        data;

      if (!detail) {
        throw new Error(
          "Data transaksi tidak ditemukan"
        );
      }

      setTransaksi(detail);
      setStatus("ready");
    } catch (err) {
      console.error(
        "MUAT TRANSAKSI ERROR:",
        err
      );

      setError(
        err.message ||
          "Gagal mengambil transaksi"
      );

      setTransaksi(null);
      setStatus("error");
    }
  };

  // ==========================================
  // LOAD SAAT HALAMAN DIBUKA
  // ==========================================
  useEffect(() => {
    if (id) {
      muatTransaksi();
    } else {
      setError(
        "ID transaksi tidak ditemukan"
      );
      setStatus("error");
    }
  }, [id]);

  // ==========================================
  // UPLOAD BUKTI PEMBAYARAN
  // ==========================================
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!buktiFile) {
      setError(
        "Pilih file bukti pembayaran terlebih dahulu"
      );
      return;
    }

    setError("");
    setUploading(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan"
        );
      }

      const formData =
        new FormData();

      formData.append(
        "foto_bukti",
        buktiFile
      );

      /*
       * API_BASE_URL sudah berisi /api
       *
       * Benar:
       * /api/transaksi/4/bukti-bayar
       *
       * Bukan:
       * /api/api/transaksi/4/bukti-bayar
       */
      const url =
        `${API_BASE_URL}/transaksi/${id}/bukti-bayar`;

      console.log(
        "UPLOAD BUKTI:",
        url
      );

      const res = await fetch(url, {
        method: "PATCH",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body: formData,
      });

      const data =
        await res
          .json()
          .catch(() => null);

      console.log(
        "RESPONSE UPLOAD:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Gagal mengunggah bukti pembayaran"
        );
      }

      setBuktiFile(null);
      setError("");

      /*
       * Muat ulang detail transaksi
       * supaya status pembayaran terbaru
       * langsung terlihat.
       */
      await muatTransaksi();
    } catch (err) {
      console.error(
        "UPLOAD BUKTI ERROR:",
        err
      );

      setError(
        err.message ||
          "Gagal mengunggah bukti pembayaran"
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (status === "loading") {
    return (
      <p className="loading-row">
        Memuat pesanan...
      </p>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (
    status === "error" ||
    !transaksi
  ) {
    return (
      <div className="container py-5">

        <div className="empty-state">

          <h3>
            Pesanan tidak ditemukan
          </h3>

          {error && (
            <p className="text-danger">
              {error}
            </p>
          )}

          <button
            type="button"
            className="btn btn-accent mt-3"
            onClick={muatTransaksi}
          >
            Coba Lagi
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // DATA TRANSAKSI
  // ==========================================

  const transactionId =
    transaksi.id ||
    transaksi.id_transaksi ||
    id;

  const namaProduk =
    transaksi.nama_produk ||
    "Produk Batik";

  const jumlah =
    Number(transaksi.jumlah) || 0;

  const totalHarga =
    Number(
      transaksi.total_harga
    ) || 0;

  return (
    <div
      className="container"
      style={{
        padding:
          "40px 0 64px",
        maxWidth: 700,
      }}
    >

      {/* ======================================
          PESAN DARI CHECKOUT
      ======================================= */}
      {location.state?.message && (
        <div className="alert alert-success show">
          {location.state.message}
        </div>
      )}

      {/* ======================================
          ERROR UPLOAD
      ======================================= */}
      {error && (
        <div className="alert alert-error show">
          {error}
        </div>
      )}

      {/* ======================================
          HEADER
      ======================================= */}

      <h2>
        Pesanan #{transactionId}
      </h2>

      <p className="text-muted">
        {formatTanggal(
          transaksi.created_at
        )}
      </p>

      {/* ======================================
          DETAIL PESANAN
      ======================================= */}

      <div className="checkout-card">

        <div className="summary-row">
          <span>
            Nama Produk
          </span>

          <span>
            {namaProduk}
          </span>
        </div>

        <div className="summary-row">
          <span>
            Jumlah
          </span>

          <span>
            {jumlah}
          </span>
        </div>

        <div className="summary-row">
          <span>
            Total
          </span>

          <span>
            {formatRupiah(
              totalHarga
            )}
          </span>
        </div>

        <div className="summary-row">
          <span>
            Metode Bayar
          </span>

          <span>
            {transaksi.metode_pembayaran ||
              "-"}
          </span>
        </div>

        <div className="summary-row">
          <span>
            Status Pembayaran
          </span>

          <span>
            {transaksi.pembayaran ||
              "Belum"}
          </span>
        </div>

        <div className="summary-row">
          <span>
            Status Pesanan
          </span>

          <span>
            {transaksi.status ||
              "Tertunda"}
          </span>
        </div>

        <div className="summary-row">
          <span>
            Nama Pembeli
          </span>

          <span>
            {transaksi.nama_pembeli ||
              "-"}
          </span>
        </div>

        <div className="summary-row">
          <span>
            Nomor Telepon
          </span>

          <span>
            {transaksi.phone_pembeli ||
              "-"}
          </span>
        </div>

        <div className="summary-row">
          <span>
            Alamat Kirim
          </span>

          <span>
            {transaksi.alamat_kirim ||
              "-"}
          </span>
        </div>

        {transaksi.catatan && (
          <div className="summary-row">
            <span>
              Catatan
            </span>

            <span>
              {transaksi.catatan}
            </span>
          </div>
        )}

      </div>

      {/* ======================================
          UPLOAD BUKTI PEMBAYARAN
      ======================================= */}

      {transaksi.pembayaran ===
        "Belum" && (
        <div className="checkout-card">

          <h3 className="checkout-card-title">
            Unggah Bukti Pembayaran
          </h3>

          <p className="text-muted">
            Silakan upload bukti pembayaran
            setelah melakukan transfer.
          </p>

          <form
            onSubmit={handleUpload}
          >

            <div className="field">

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0] ||
                    null;

                  setBuktiFile(file);
                  setError("");
                }}
              />

            </div>

            {buktiFile && (
              <p className="small text-muted mt-2">
                File dipilih:{" "}
                {buktiFile.name}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-accent"
              disabled={uploading}
            >
              {uploading
                ? "Mengunggah..."
                : "Unggah Bukti"}
            </button>

          </form>

        </div>
      )}

      {/* ======================================
          BUKTI PEMBAYARAN
      ======================================= */}

      {transaksi.foto_bukti && (
        <div className="checkout-card">

          <h3 className="checkout-card-title">
            Bukti Pembayaran
          </h3>

          <img
            src={getImageUrl(
              transaksi.foto_bukti
            )}
            alt="Bukti pembayaran"
            onError={onImgError}
            style={{
              maxWidth: "100%",
              borderRadius: 8,
            }}
          />

        </div>
      )}

    </div>
  );
}