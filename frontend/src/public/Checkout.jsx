// src/pages/Checkout.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  API_BASE_URL,
  METODE_BAYAR,
  PAYMENT_DETAILS,
} from "../constants.js";

import {
  getToken,
  formatRupiah,
  getImageUrl,
} from "../utils.js";

import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const metodePembayaran = METODE_BAYAR.length
  ? METODE_BAYAR
  : ["Bank Transfer", "E-Wallet"];

const detailMetode = {
  "Bank Transfer": {
    icon: "bi-bank",
    description: "Transfer ke rekening toko",
  },

  "E-Wallet": {
    icon: "bi-wallet2",
    description: "Bayar melalui dompet digital",
  },
};

function validateCheckout(
  user,
  selectedItems,
  metode
) {
  if (!user?.nama_d?.trim()) {
    return "Lengkapi nama depan di profil sebelum checkout.";
  }

  const phone =
    user?.phone == null
      ? ""
      : String(user.phone).trim();

  if (!phone) {
    return "Lengkapi nomor telepon di profil sebelum checkout.";
  }

  if (!/^[0-9+\-\s()]{8,20}$/.test(phone)) {
    return "Masukkan nomor telepon yang valid di profil sebelum checkout.";
  }

  if (!user?.alamat?.trim()) {
    return "Lengkapi alamat di profil sebelum checkout.";
  }

  if (!metodePembayaran.includes(metode)) {
    return "Pilih metode pembayaran yang tersedia.";
  }

  if (!selectedItems.length) {
    return "Belum ada produk yang dipilih.";
  }

  for (const item of selectedItems) {
    const jumlah = Number(item.jumlah);
    const harga = Number(item.harga);

    if (!Number.isInteger(jumlah) || jumlah < 1) {
      return "Jumlah produk tidak valid. Silakan perbarui keranjang.";
    }

    if (!Number.isFinite(harga) || harga <= 0) {
      return `Harga produk ${item.nama_produk || ""} tidak valid.`;
    }
  }

  return "";
}

export default function Checkout() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    selectedItems,
    removeSelectedItems,
  } = useCart();

  const [metode, setMetode] = useState(
    metodePembayaran[0]
  );

  const [catatan, setCatatan] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * Jika tidak ada produk yang dipilih
   */
  if (!selectedItems.length) {
    return (
      <div className="empty-state">
        <h3>Belum ada produk yang dipilih</h3>

        <p>
          Pilih produk yang ingin dibeli dari
          keranjang terlebih dahulu.
        </p>

        <Link
          to="/keranjang"
          className="btn btn-accent"
        >
          Kembali ke Keranjang
        </Link>
      </div>
    );
  }

  /*
   * Hitung total
   */
  const ongkir = 0;

  const totalHarga =
    selectedItems.reduce(
      (sum, item) => {
        const harga = Number(item.harga) || 0;
        const jumlah =
          Number(item.jumlah) || 0;

        return sum + harga * jumlah;
      },
      0
    );

  const total = totalHarga + ongkir;

  /*
   * SUBMIT CHECKOUT
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /*
     * Validasi frontend
     */
    const validationError =
      validateCheckout(
        user,
        selectedItems,
        metode
      );

    if (validationError) {
      setError(validationError);
      return;
    }

    /*
     * Pastikan total valid
     */
    if (
      !Number.isFinite(totalHarga) ||
      totalHarga <= 0
    ) {
      setError("Total harga tidak valid.");
      return;
    }

    setSubmitting(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Silakan login terlebih dahulu."
        );
      }

      const transaksi = [];

      /*
       * Buat transaksi untuk setiap produk
       */
      for (const item of selectedItems) {
        const harga =
          Number(item.harga);

        const jumlah =
          Number(item.jumlah);

        /*
         * Total harga produk
         */
        const totalHargaProduk =
          harga * jumlah;

        /*
         * Pastikan total produk valid
         */
        if (
          !Number.isFinite(
            totalHargaProduk
          ) ||
          totalHargaProduk <= 0
        ) {
          throw new Error(
            `Total harga produk "${item.nama_produk}" tidak valid.`
          );
        }

        /*
         * DATA YANG DIKIRIM KE BACKEND
         */
        const requestBody = {
          id_produk: Number(
            item.id_produk
          ),

          jumlah: jumlah,

          nama_pembeli:
            user.nama_d.trim(),

          phone_pembeli:
            String(user.phone).trim(),

          metode_pembayaran:
            metode,

          alamat_kirim:
            user.alamat.trim(),

          catatan:
            catatan.trim(),

          /*
           * INI YANG SEBELUMNYA BELUM ADA
           */
          total_harga:
            Number(totalHargaProduk),
        };

        console.log(
          "DATA CHECKOUT:",
          requestBody
        );

        const response =
          await fetch(
            `${API_BASE_URL}/transaksi`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify(
                requestBody
              ),
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        console.log(
          "RESPONSE TRANSAKSI:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Gagal membuat transaksi (${response.status})`
          );
        }

        /*
         * Simpan hasil transaksi
         */
        if (data?.transaksi) {
          transaksi.push(
            data.transaksi
          );
        } else if (data?.transaction) {
          transaksi.push(
            data.transaction
          );
        } else if (data) {
          transaksi.push(data);
        }
      }

      /*
       * Hapus produk yang sudah dibeli
       */
      removeSelectedItems();

      /*
       * Ambil ID transaksi
       */
      const firstTransaction =
        transaksi[0];

      const transactionId =
        firstTransaction?.id_transaksi ||
        firstTransaction?.id ||
        firstTransaction?.transaction_id ||
        firstTransaction?.data?.id_transaksi ||
        firstTransaction?.data?.id;

      console.log(
        "TRANSACTION ID:",
        transactionId
      );

      /*
       * Redirect
       */
      if (transactionId) {
        navigate(
          `/pembeli/transaksi/${transactionId}`,
          {
            state: {
              message:
                "Transaksi berhasil dibuat, silakan lakukan pembayaran",
            },
          }
        );
      } else {
        navigate(
          "/pembeli/transaksi",
          {
            state: {
              message:
                "Transaksi berhasil dibuat, silakan lakukan pembayaran",
            },
          }
        );
      }
    } catch (err) {
      console.error(
        "CHECKOUT ERROR:",
        err
      );

      setError(
        err.message ||
          "Gagal membuat transaksi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">

        {/* Breadcrumb */}
        <div className="checkout-breadcrumb">
          <Link to="/keranjang">
            &larr; Kembali ke keranjang
          </Link>
        </div>

        <h2 className="checkout-title">
          Checkout
        </h2>

        {/* Error */}
        {error && (
          <div className="checkout-alert">
            {error}
          </div>
        )}

        <div className="checkout-grid">

          {/* =========================
              BAGIAN KIRI
          ========================= */}
          <div className="checkout-main">

            <form
              onSubmit={handleSubmit}
              id="checkout-form"
            >

              {/* DATA PENERIMA */}
              <div className="checkout-card">

                <h3 className="checkout-card-title">
                  1. Data Penerima
                </h3>

                <p className="text-muted mb-2">
                  Data penerima dan alamat
                  diambil dari profil akun.
                </p>

                <p className="mb-1">
                  <strong>
                    {user?.nama_d}
                  </strong>

                  {" · "}

                  {user?.phone}
                </p>

                <p className="mb-0">
                  {user?.alamat}
                </p>

                {!user?.alamat && (
                  <p className="text-danger small mt-2 mb-0">
                    Lengkapi alamat di profil
                    sebelum checkout.
                  </p>
                )}

              </div>

              {/* PEMBAYARAN */}
              <div className="checkout-card">

                <h3 className="checkout-card-title">
                  2. Pembayaran
                </h3>

                <div className="payment-options">

                  {metodePembayaran.map(
                    (m) => (
                      <label
                        key={m}
                        className={`payment-option ${
                          metode === m
                            ? "selected"
                            : ""
                        }`}
                      >

                        <input
                          type="radio"
                          name="metode"
                          value={m}
                          checked={
                            metode === m
                          }
                          onChange={(e) =>
                            setMetode(
                              e.target.value
                            )
                          }
                        />

                        <span
                          className="payment-option-icon"
                          aria-hidden="true"
                        >
                          <i
                            className={`bi ${
                              detailMetode[m]
                                ?.icon ||
                              "bi-credit-card"
                            }`}
                          ></i>
                        </span>

                        <span className="payment-option-copy">

                          <strong>
                            {m}
                          </strong>

                          <small>
                            {
                              detailMetode[m]
                                ?.description ||
                              "Metode pembayaran tersedia"
                            }
                          </small>

                        </span>

                        <i
                          className="bi bi-check-circle-fill payment-option-check"
                          aria-hidden="true"
                        ></i>

                      </label>
                    )
                  )}

                </div>

                {PAYMENT_DETAILS[
                  metode
                ] && (
                  <div className="payment-details">

                    <div className="payment-details-heading">

                      <i
                        className="bi bi-info-circle"
                        aria-hidden="true"
                      ></i>

                      Detail pembayaran

                    </div>

                    <div className="payment-details-row">

                      <span>
                        {
                          PAYMENT_DETAILS[
                            metode
                          ].provider
                        }
                      </span>

                      <strong>
                        {
                          PAYMENT_DETAILS[
                            metode
                          ].account
                        }
                      </strong>

                    </div>

                    <div className="payment-details-holder">
                      a.n.{" "}
                      {
                        PAYMENT_DETAILS[
                          metode
                        ].holder
                      }
                    </div>

                  </div>
                )}

              </div>

              {/* CATATAN */}
              <div className="checkout-card">

                <h3 className="checkout-card-title">
                  3. Catatan (opsional)
                </h3>

                <div
                  className="checkout-field"
                  style={{
                    marginBottom: 0,
                  }}
                >

                  <textarea
                    rows={2}
                    placeholder="Tulis pesan untuk penjual, misalnya request warna atau ukuran"
                    value={catatan}
                    onChange={(e) =>
                      setCatatan(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </form>

          </div>

          {/* =========================
              BAGIAN KANAN
          ========================= */}
          <div className="checkout-side">

            <div className="checkout-card checkout-summary">

              <h3 className="checkout-card-title">
                Ringkasan Pesanan
              </h3>

              <div className="summary-item-list">

                {selectedItems.map(
                  (item) => (
                    <div
                      key={
                        item.id_produk
                      }
                      className="summary-item"
                    >

                      <div className="summary-thumb">

                        <img
                          src={getImageUrl(
                            item.gambar
                          )}
                          alt={
                            item.nama_produk
                          }
                        />

                      </div>

                      <div className="summary-info">

                        <div className="summary-name">
                          {
                            item.nama_produk
                          }
                        </div>

                        <div className="summary-price">
                          {item.jumlah} x{" "}
                          {formatRupiah(
                            Number(
                              item.harga
                            )
                          )}
                        </div>

                      </div>

                      <div className="summary-subtotal">
                        {formatRupiah(
                          Number(
                            item.harga
                          ) *
                            Number(
                              item.jumlah
                            )
                        )}
                      </div>

                    </div>
                  )
                )}

              </div>

              <div className="summary-divider" />

              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <span>
                  {formatRupiah(
                    totalHarga
                  )}
                </span>

              </div>

              <div className="summary-row">

                <span>
                  Ongkos Kirim
                </span>

                <span>
                  {ongkir === 0
                    ? "Dihitung admin"
                    : formatRupiah(
                        ongkir
                      )}
                </span>

              </div>

              <div className="summary-divider" />

              <div className="summary-row summary-total">

                <span>
                  Total
                </span>

                <span>
                  {formatRupiah(total)}
                </span>

              </div>

              <button
                type="submit"
                form="checkout-form"
                className="btn btn-accent w-100 checkout-submit"
                disabled={submitting}
              >
                {submitting
                  ? "Memproses..."
                  : "Buat Pesanan"}
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}