import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL, SITE } from "../constants.js";
import { mediaUrl, formatRupiah, onImgError, getToken } from "../utils.js";
import { useCart } from "../context/CartContext.jsx";

export default function Keranjang() {
  const navigate = useNavigate();
  const {
    items,
    selectedItems,
    updateJumlah,
    removeFromCart,
    toggleDipilih,
    clearCart,
  } = useCart();

  const [rekomendasi, setRekomendasi] = useState([]);
  const [konfirmasiKosong, setKonfirmasiKosong] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    fetch(`${API_BASE_URL}/api/produk`)
      .then((res) => res.json())
      .then((data) => {
        const idDiKeranjang = items.map((i) => String(i.id_produk));
        setRekomendasi(
          data
            .filter((p) => !idDiKeranjang.includes(String(p.id_produk)))
            .filter((p) => p.status_produk === "Tersedia")
            .slice(0, 4)
        );
      })
      .catch(() => {});
    // sengaja hanya dijalankan sekali saat halaman dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotalItem = (item) => (Number(item.harga) || 0) * (Number(item.jumlah) || 1);
  const selectedTotalItem = selectedItems.reduce((sum, item) => sum + item.jumlah, 0);
  const selectedTotalHarga = selectedItems.reduce((sum, item) => sum + subtotalItem(item), 0);

  const ubah = (item, delta) => {
    updateJumlah(item.id_produk, (Number(item.jumlah) || 1) + delta);
  };

  const lanjutCheckout = () => {
    if (!selectedItems.length) return;
    if (!getToken()) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  /* ===== Keranjang kosong ===== */
  if (!items.length) {
    return (
      <div className="keranjang-page">
        <div className="container py-5">
          <Link to="/produk" className="back-link">&larr; Kembali Belanja</Link>
          <h1 className="keranjang-title">Keranjang Belanja</h1>

          <div className="keranjang-kosong">
            <div className="kosong-ico">🧺</div>
            <h2 className="h5 mb-2">Keranjang kamu masih kosong</h2>
            <p className="text-muted mb-4">
              Belum ada wastra yang dipilih. Telusuri koleksi kami dan temukan helai yang cocok untukmu.
            </p>
            <Link to="/produk" className="btn btn-accent">Mulai Belanja</Link>
          </div>
        </div>

        <Rekomendasi data={rekomendasi} />
      </div>
    );
  }

  /* ===== Keranjang terisi ===== */
  return (
    <div className="keranjang-page">
      <div className="container py-5">
        <Link to="/produk" className="back-link">&larr; Kembali Belanja</Link>
        <h1 className="keranjang-title">Keranjang Belanja</h1>
        <p className="keranjang-desc">
              Tinjau pilihan batik Anda sebelum melanjutkan ke proses pembayaran. Setiap helai kain
          kami adalah wujud dedikasi pengrajin lokal.
        </p>

        <div className="row g-4 mt-1">
          {/* ---- Daftar item ---- */}
          <div className="col-12 col-lg-8">
            <div className="cart-head d-none d-md-flex">
              <span className="col-pilih">Pilih</span>
              <span className="col-produk">Produk</span>
              <span className="col-harga">Harga</span>
              <span className="col-qty">Jumlah</span>
              <span className="col-total">Subtotal</span>
              <span className="col-aksi" />
            </div>

            <div className="cart-list">
              {items.map((item) => {
                const stok = Number(item.stok) || 99;
                const jumlah = Number(item.jumlah) || 1;
                const detail = [item.bahan_kain, item.ukuran]
                  .filter(Boolean)
                  .join(" • ");

                return (
                  <div key={item.id_produk} className="cart-item">
                    <div className="col-pilih">
                      <input
                        type="checkbox"
                        checked={item.dipilih}
                        onChange={() => toggleDipilih(item.id_produk)}
                        aria-label={`Pilih ${item.nama_produk} untuk checkout`}
                      />
                    </div>
                    <div className="col-produk">
                      <Link to={`/produk/${item.id_produk}`} className="cart-thumb">
                        <img src={mediaUrl(item.gambar)} alt={item.nama_produk} onError={onImgError} />
                      </Link>
                      <div className="cart-info">
                        {item.kategori && <span className="detail-eyebrow">{item.kategori}</span>}
                        <Link to={`/produk/${item.id_produk}`} className="cart-name">
                          {item.nama_produk}
                        </Link>
                        {detail && <p className="cart-meta">{detail}</p>}
                      </div>
                    </div>

                    <div className="col-harga" data-label="Harga">
                      {formatRupiah(item.harga)}
                    </div>

                    <div className="col-qty" data-label="Jumlah">
                      <div className="qty-box qty-sm">
                        <button type="button" onClick={() => ubah(item, -1)} disabled={jumlah <= 1}>−</button>
                        <span>{jumlah}</span>
                        <button type="button" onClick={() => ubah(item, 1)} disabled={jumlah >= stok}>+</button>
                      </div>
                      {jumlah >= stok && <span className="qty-note">Stok tersisa {stok}</span>}
                    </div>

                    <div className="col-total" data-label="Subtotal">
                      <strong className="text-accent">{formatRupiah(subtotalItem(item))}</strong>
                    </div>

                    <div className="col-aksi">
                      <button
                        type="button"
                        className="btn-hapus"
                        onClick={() => removeFromCart(item.id_produk)}
                        aria-label={`Hapus ${item.nama_produk}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-foot">
              {!konfirmasiKosong ? (
                <button type="button" className="btn-reset" onClick={() => setKonfirmasiKosong(true)}>
                  Kosongkan keranjang
                </button>
              ) : (
                <div className="cart-konfirmasi">
                  <span>Yakin mengosongkan seluruh keranjang?</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      clearCart();
                      setKonfirmasiKosong(false);
                    }}
                  >
                    Ya, kosongkan
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-accent"
                    onClick={() => setKonfirmasiKosong(false)}
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ---- Ringkasan ---- */}
          <div className="col-12 col-lg-4">
            <div className="cart-summary">
              <h2 className="summary-title">Ringkasan Pesanan</h2>

              <div className="summary-row">
                <span>Total barang</span>
                <span>{selectedTotalItem} pcs</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatRupiah(selectedTotalHarga)}</span>
              </div>
              <div className="summary-row muted">
                <span>Ongkos kirim</span>
                <span>Dihitung saat checkout</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>{formatRupiah(selectedTotalHarga)}</strong>
              </div>

              <button type="button" className="btn btn-accent w-100 btn-cart" onClick={lanjutCheckout} disabled={!selectedItems.length}>
                {selectedItems.length ? 'CHECKOUT YANG DIPILIH' : 'PILIH PRODUK UNTUK CHECKOUT'}
              </button>

              <Link to="/produk" className="summary-link">Tambah produk lain</Link>

              <div className="summary-note">
                <p className="mb-1"><strong>Pembayaran</strong></p>
                <p className="mb-0">{SITE.bank}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Rekomendasi data={rekomendasi} />
    </div>
  );
}

/* ===== Bagian "pelengkap koleksi" ===== */
function Rekomendasi({ data }) {
  if (!data?.length) return null;

  return (
    <section className="container py-5 rekomendasi-section">
      <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
        <div>
          <span className="detail-eyebrow">Kurasi Untuk Anda</span>
          <h2 className="section-serif mb-0">Pelengkap Koleksi</h2>
        </div>
        <Link to="/produk" className="link-accent">Lihat Semua Produk &rarr;</Link>
      </div>

      <div className="row g-4">
        {data.map((p) => (
          <div key={p.id_produk} className="col-6 col-lg-3">
            <Link to={`/produk/${p.id_produk}`} className="card product-card h-100 text-decoration-none">
              <div className="position-relative product-thumb">
                <img src={mediaUrl(p.gambar)} alt={p.nama_produk} onError={onImgError} className="card-img-top" />
                <span className="badge kategori-chip position-absolute bottom-0 start-0 m-2">{p.kategori}</span>
              </div>
              <div className="card-body">
                <h3 className="h6 mb-1">{p.nama_produk}</h3>
                <span className="fw-bold text-accent">{formatRupiah(p.harga)}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}