import React from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  API_BASE_URL,
  SITE,
} from "../constants.js";

import {
  mediaUrl,
  formatRupiah,
  onImgError,
  getToken,
} from "../utils.js";

import {
  useCart,
} from "../context/CartContext.jsx";

// ======================================================
// KERANJANG
// ======================================================

export default function Keranjang() {
  const navigate = useNavigate();

  const {
    cart,
    items,
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  // ====================================================
  // AMBIL DATA ITEM
  // ====================================================

  const dataCart =
    Array.isArray(cart)
      ? cart
      : Array.isArray(items)
        ? items
        : Array.isArray(cartItems)
          ? cartItems
          : [];

  // ====================================================
  // HITUNG TOTAL
  // ====================================================

  const totalHarga =
    dataCart.reduce(
      (total, item) => {
        const harga =
          Number(
            item.harga ??
              item.price ??
              item.harga_produk ??
              0
          );

        const jumlah =
          Number(
            item.jumlah ??
              item.quantity ??
              item.qty ??
              1
          );

        return (
          total +
          harga * jumlah
        );
      },
      0
    );

  // ====================================================
  // UPDATE JUMLAH
  // ====================================================

  const handleUpdateQuantity = (
    item,
    quantity
  ) => {
    if (
      typeof updateQuantity !==
      "function"
    ) {
      return;
    }

    const id =
      item.id_produk ??
      item.product_id ??
      item.id;

    updateQuantity(
      id,
      quantity
    );
  };

  // ====================================================
  // HAPUS ITEM
  // ====================================================

  const handleRemove = (item) => {
    if (
      typeof removeFromCart !==
      "function"
    ) {
      return;
    }

    const id =
      item.id_produk ??
      item.product_id ??
      item.id;

    removeFromCart(id);
  };

  // ====================================================
  // KOSONGKAN KERANJANG
  // ====================================================

  const handleClearCart = () => {
    if (
      typeof clearCart ===
      "function"
    ) {
      clearCart();
    }
  };

  // ====================================================
  // CHECKOUT
  // ====================================================

  const handleCheckout = () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (dataCart.length === 0) {
      return;
    }

    navigate("/checkout");
  };

  // ====================================================
  // EMPTY CART
  // ====================================================

  if (dataCart.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div
            style={{
              fontSize: "70px",
            }}
          >
            🛒
          </div>

          <h2 className="mt-3">
            Keranjang masih kosong
          </h2>

          <p className="text-muted">
            Belum ada produk yang
            ditambahkan ke keranjang.
          </p>

          <Link
            to="/produk"
            className="btn btn-primary mt-3"
          >
            Belanja Sekarang
          </Link>
        </div>
      </div>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="container py-4">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Keranjang Belanja
          </h2>

          <p className="text-muted mb-0">
            Periksa produk yang ingin
            kamu beli.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={
            handleClearCart
          }
        >
          Kosongkan Keranjang
        </button>
      </div>

      {/* ================================================= */}
      {/* PRODUK */}
      {/* ================================================= */}

      <div className="row g-4">
        <div className="col-lg-8">
          {dataCart.map(
            (item, index) => {
              const id =
                item.id_produk ??
                item.product_id ??
                item.id ??
                index;

              const nama =
                item.nama_produk ??
                item.nama ??
                item.name ??
                "Produk Batik";

              const harga =
                Number(
                  item.harga ??
                    item.price ??
                    item.harga_produk ??
                    0
                );

              const jumlah =
                Number(
                  item.jumlah ??
                    item.quantity ??
                    item.qty ??
                    1
                );

              const stok =
                Number(
                  item.stok ??
                    item.stock ??
                    999
                );

              const gambar =
                item.gambar ??
                item.image ??
                item.image_url ??
                item.foto ??
                null;

              return (
                <div
                  className="card mb-3 shadow-sm"
                  key={id}
                >
                  <div className="card-body">
                    <div className="row align-items-center">
                      {/* GAMBAR */}
                      <div className="col-md-2 mb-3 mb-md-0">
                        <img
                          src={mediaUrl(
                            gambar
                          )}
                          alt={nama}
                          className="img-fluid rounded"
                          style={{
                            width: "100%",
                            height: "120px",
                            objectFit:
                              "cover",
                          }}
                          onError={
                            onImgError
                          }
                        />
                      </div>

                      {/* DETAIL */}
                      <div className="col-md-4">
                        <h5 className="mb-2">
                          {nama}
                        </h5>

                        {item.ukuran && (
                          <small className="text-muted d-block">
                            Ukuran:{" "}
                            {item.ukuran}
                          </small>
                        )}

                        {item.bahan_kain && (
                          <small className="text-muted d-block">
                            Bahan:{" "}
                            {
                              item.bahan_kain
                            }
                          </small>
                        )}

                        <div className="fw-bold mt-2">
                          {formatRupiah(
                            harga
                          )}
                        </div>
                      </div>

                      {/* JUMLAH */}
                      <div className="col-md-3 mt-3 mt-md-0">
                        <label className="form-label">
                          Jumlah
                        </label>

                        <div className="input-group">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              handleUpdateQuantity(
                                item,
                                Math.max(
                                  1,
                                  jumlah -
                                    1
                                )
                              )
                            }
                            disabled={
                              jumlah <= 1
                            }
                          >
                            −
                          </button>

                          <input
                            type="number"
                            className="form-control text-center"
                            value={
                              jumlah
                            }
                            min="1"
                            max={stok}
                            onChange={(
                              e
                            ) => {
                              let value =
                                Number(
                                  e
                                    .target
                                    .value
                                );

                              if (
                                !value ||
                                value <
                                  1
                              ) {
                                value = 1;
                              }

                              if (
                                value >
                                stok
                              ) {
                                value =
                                  stok;
                              }

                              handleUpdateQuantity(
                                item,
                                value
                              );
                            }}
                          />

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              handleUpdateQuantity(
                                item,
                                Math.min(
                                  stok,
                                  jumlah +
                                    1
                                )
                              )
                            }
                            disabled={
                              jumlah >=
                              stok
                            }
                          >
                            +
                          </button>
                        </div>

                        <small className="text-muted">
                          Stok: {stok}
                        </small>
                      </div>

                      {/* SUBTOTAL */}
                      <div className="col-md-2 text-md-end mt-3 mt-md-0">
                        <small className="text-muted d-block">
                          Subtotal
                        </small>

                        <strong>
                          {formatRupiah(
                            harga *
                              jumlah
                          )}
                        </strong>
                      </div>

                      {/* HAPUS */}
                      <div className="col-md-1 text-md-end mt-3 mt-md-0">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          title="Hapus"
                          onClick={() =>
                            handleRemove(
                              item
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* ================================================= */}
        {/* RINGKASAN */}
        {/* ================================================= */}

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="mb-4">
                Ringkasan Belanja
              </h4>

              <div className="d-flex justify-content-between mb-3">
                <span>
                  Jumlah Produk
                </span>

                <strong>
                  {dataCart.length}
                </strong>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span>
                  Total
                </span>

                <strong className="fs-4">
                  {formatRupiah(
                    totalHarga
                  )}
                </strong>
              </div>

              <button
                type="button"
                className="btn btn-primary w-100 mb-2"
                onClick={
                  handleCheckout
                }
              >
                Lanjut ke Checkout
              </button>

              <Link
                to="/produk"
                className="btn btn-outline-secondary w-100"
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}