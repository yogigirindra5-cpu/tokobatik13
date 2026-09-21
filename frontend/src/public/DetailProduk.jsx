import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../constants.js";
import { mediaUrl, formatRupiah, onImgError } from "../utils.js";
import { useCart } from "../context/CartContext.jsx"; // <-- sesuaikan kalau nama export beda

const FAQ_LIST = [
  {
    q: "Apakah produk ini 100% pewarna alam?",
    a: "Sebagian besar koleksi kami menggunakan pewarna alam dari kulit kayu soga dan tanaman indigofera. Untuk memastikan komposisi warna pada produk tertentu, silakan hubungi kami lewat WhatsApp sebelum memesan.",
  },
  {
    q: "Berapa lama proses pembuatan batik tulis ini?",
    a: "Satu helai batik tulis dikerjakan 2-6 minggu tergantung kerumitan motif. Produk yang berstatus Tersedia sudah siap kirim, sedangkan pesanan khusus mengikuti antrean pengrajin.",
  },
  {
    q: "Dapatkah saya memesan ukuran khusus (Custom Made)?",
    a: "Bisa. Kirimkan ukuran badan kamu lewat WhatsApp kami, nanti tim pengrajin akan mengonfirmasi ketersediaan kain dan estimasi waktu pengerjaan.",
  },
];

const PERAWATAN_LIST = [
  "Cuci dengan tangan menggunakan air dingin, hindari mesin cuci.",
  "Gunakan sabun khusus batik atau lerak, jangan memakai deterjen dan pemutih.",
  "Jangan diperas dan dijemur langsung di bawah matahari — cukup diangin-anginkan di tempat teduh.",
  "Setrika dengan suhu sedang, lapisi kain lain di atas permukaan batik.",
  "Simpan dengan digantung atau digulung, beri merica/akar wangi agar terhindar dari ngengat.",
];

export default function DetailProduk() {
  const { id } = useParams();
  const { addToCart } = useCart(); // <-- sesuaikan kalau nama fungsi beda

  const [produk, setProduk] = useState(null);
  const [lainnya, setLainnya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [jumlah, setJumlah] = useState(1);
  const [tab, setTab] = useState("cerita");
  const [faqAktif, setFaqAktif] = useState(null);
  const [notif, setNotif] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setJumlah(1);
    setTab("cerita");
    setNotif("");
    window.scrollTo({ top: 0 });

    fetch(`${API_BASE_URL}/produk/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Produk tidak ditemukan");
        return res.json();
      })
      .then(setProduk)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!produk) return;
    fetch(`${API_BASE_URL}/produk`)
      .then((res) => res.json())
      .then((data) => {
        const lain = data.filter((p) => String(p.id_produk) !== String(produk.id_produk));
        const seKategori = lain.filter((p) => p.kategori === produk.kategori);
        const sisanya = lain.filter((p) => p.kategori !== produk.kategori);
        setLainnya([...seKategori, ...sisanya].slice(0, 4));
      })
      .catch(() => {});
  }, [produk]);

  if (loading) return <div className="container py-5 text-center text-muted">Memuat produk...</div>;

  if (error || !produk) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-2">Produk tidak ditemukan</h2>
        <p className="text-muted mb-4">Produk yang kamu cari mungkin sudah dihapus atau tidak tersedia.</p>
        <Link to="/produk" className="btn btn-accent">Kembali ke Katalog</Link>
      </div>
    );
  }

  const stok = Number(produk.stok) || 0;
  const habis = stok < 1 || produk.status_produk !== "Tersedia";

    const ubahJumlah = (delta) => {
    setJumlah((n) => Math.min(Math.max(1, n + delta), Math.max(1, stok)));
  };

  const handleTambah = () => {
    if (habis) return;
    addToCart(produk, jumlah); // <-- sesuaikan kalau signature beda
    setNotif(`${jumlah} item ditambahkan ke keranjang.`);
    setTimeout(() => setNotif(""), 3000);
  };

  return (
    <div className="detail-page">
      {/* ===== Breadcrumb ===== */}
      <div className="container pt-4">
        <nav className="detail-breadcrumb">
          <Link to="/">Beranda</Link>
          <span>/</span>
          <Link to="/produk">Katalog</Link>
          <span>/</span>
          <span className="current">Detail Produk</span>
        </nav>
      </div>

      {/* ===== Bagian atas: gambar + info beli ===== */}
      <section className="container detail-top">
        <div className="row g-4 g-lg-5">
          <div className="col-12 col-lg-6">
            <div className="detail-gallery">
              <img
                src={mediaUrl(produk.gambar)}
                alt={produk.nama_produk}
                onError={onImgError}
                className="detail-gallery-main"
              />
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="detail-info">
              <span className="detail-eyebrow">{produk.kategori}</span>
              <h1 className="detail-title">{produk.nama_produk}</h1>

              <div className="detail-meta">
                <span className={`status-chip badge ${habis ? "bg-danger" : "bg-success"}`}>
                  {habis ? "Stok Habis" : produk.status_produk}
                </span>
                <span className="detail-meta-sep">•</span>
                <span className="text-muted small">{produk.bahan_kain || "Batik pilihan"}</span>
              </div>

              <div className="detail-price">{formatRupiah(produk.harga)}</div>
              <p className="detail-price-note">Termasuk pajak. Biaya pengiriman dihitung saat checkout.</p>

              <div className="detail-spec-inline">
                <div>
                  <span className="label">Bahan Kain</span>
                  <span className="value">{produk.bahan_kain || "-"}</span>
                </div>
                <div>
                  <span className="label">Ukuran</span>
                  <span className="value">{produk.ukuran || "-"}</span>
                </div>
                <div>
                  <span className="label">Stok</span>
                  <span className="value">{stok} pcs</span>
                </div>
              </div>

              <div className="detail-buy">
                <div className="qty-box">
                  <button type="button" onClick={() => ubahJumlah(-1)} disabled={habis || jumlah <= 1}>−</button>
                  <span>{jumlah}</span>
                  <button type="button" onClick={() => ubahJumlah(1)} disabled={habis || jumlah >= stok}>+</button>
                </div>
                <button type="button" className="btn btn-accent btn-cart" onClick={handleTambah} disabled={habis}>
                  {habis ? "STOK HABIS" : "TAMBAH KE KERANJANG"}
                </button>
              </div>

              {notif && <p className="detail-notif">{notif}</p>}

              <Link to="/keranjang" className="btn btn-outline-accent btn-wishlist">
                Lihat Keranjang
              </Link>

              <div className="detail-trust">
                <div>
                  <span className="trust-ico">✓</span>
                  <span>Keaslian Terjamin</span>
                </div>
                <div>
                  <span className="trust-ico">⌂</span>
                  <span>Dikirim dari Pekalongan</span>
                </div>
                <div>
                  <span className="trust-ico">↺</span>
                  <span>Garansi Salah Kirim</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Tab: Cerita / Spesifikasi / Perawatan ===== */}
      <section className="detail-tabs-section">
        <div className="container">
          <div className="detail-tabs">
            <button type="button" className={tab === "cerita" ? "active" : ""} onClick={() => setTab("cerita")}>
              Cerita Produk
            </button>
            <button type="button" className={tab === "spesifikasi" ? "active" : ""} onClick={() => setTab("spesifikasi")}>
              Spesifikasi
            </button>
            <button type="button" className={tab === "perawatan" ? "active" : ""} onClick={() => setTab("perawatan")}>
              Perawatan
            </button>
          </div>

          <div className="detail-tab-body">
            {tab === "cerita" && (
              <div className="row g-4 align-items-center">
                <div className="col-12 col-lg-6">
                  <h2 className="tab-heading">Tentang {produk.nama_produk}</h2>
                  <p className="tab-text">
                    {produk.deskripsi || "Belum ada deskripsi untuk produk ini."}
                  </p>
                  <span className="tab-badge">{produk.kategori}</span>
                </div>
                <div className="col-12 col-lg-6">
                  <img
                    src={mediaUrl(produk.gambar)}
                    alt={produk.nama_produk}
                    onError={onImgError}
                    className="tab-image"
                  />
                </div>
              </div>
            )}

            {tab === "spesifikasi" && (
              <table className="spec-table">
                <tbody>
                  <tr><th>Nama Produk</th><td>{produk.nama_produk}</td></tr>
                  <tr><th>Kategori</th><td>{produk.kategori}</td></tr>
                  <tr><th>Bahan Kain</th><td>{produk.bahan_kain || "-"}</td></tr>
                  <tr><th>Ukuran</th><td>{produk.ukuran || "-"}</td></tr>
                  <tr><th>Stok</th><td>{stok} pcs</td></tr>
                  <tr><th>Status</th><td>{produk.status_produk}</td></tr>
                </tbody>
              </table>
            )}

            {tab === "perawatan" && (
              <div className="row g-4">
                <div className="col-12 col-lg-8">
                  <h2 className="tab-heading">Cara Merawat Batik</h2>
                  <ul className="care-list">
                    {PERAWATAN_LIST.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Produk lainnya ===== */}
      {lainnya.length > 0 && (
        <section className="container py-5">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <span className="detail-eyebrow">Inspirasi Lainnya</span>
              <h2 className="section-serif mb-0">Mungkin Anda Juga Menyukai</h2>
            </div>
            <Link to="/produk" className="link-accent">Lihat Semua Koleksi &rarr;</Link>
          </div>

          <div className="row g-4">
            {lainnya.map((p) => (
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
      )}

      {/* ===== FAQ ===== */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-serif text-center mb-4">Pertanyaan Umum</h2>
          <div className="faq-list mx-auto">
            {FAQ_LIST.map((item, i) => (
              <div key={i} className={`faq-item ${faqAktif === i ? "open" : ""}`}>
                <button type="button" className="faq-q" onClick={() => setFaqAktif(faqAktif === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className="faq-ico">{faqAktif === i ? "−" : "+"}</span>
                </button>
                {faqAktif === i && <p className="faq-a">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}