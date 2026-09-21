import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, KATEGORI_PRODUK, SITE } from "../constants.js";
import { mediaUrl, formatRupiah, onImgError, formatTanggal } from "../utils.js";

export default function Home() {
  const [produk, setProduk] = useState([]);
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/produk`)
      .then((res) => res.json())
      .then(setProduk)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetch(`${API_BASE_URL}/api/artikel`)
      .then((res) => res.json())
      .then(setArtikel)
      .catch(() => {});
  }, []);

  const jumlahPerKategori = (kategori) => produk.filter((p) => p.kategori === kategori).length;
  const produkUnggulan = produk.slice(0, 3);
  const artikelTerbaru = artikel.slice(0, 3);

  return (
    <div className="home-page">
      <section className="hero-section-v2">
        <div className="container text-center">
          <h1 className="hero-title-v2">
            Menjadi Bagian dari<br />Perjalanan Kami
          </h1>
          <p className="hero-desc-v2 mx-auto">
            {SITE.tentang} Dapatkan informasi eksklusif tentang koleksi terbaru
            dan proses pembuatan batik langsung dari pengrajin kami.
          </p>

        </div>
      </section>

      {/* Kategori */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">Kategori Batik</h2>
            <p className="text-muted mb-0">Pilih kategori produk batik yang kamu cari</p>
          </div>
          <Link to="/produk" className="link-accent">Lihat semua &rarr;</Link>
        </div>

        <div className="row g-3 justify-content-center">
          {KATEGORI_PRODUK.map((k) => (
            <div key={k} className="col-6 col-md-4 col-lg-2">
              <Link to={`/produk?kategori=${encodeURIComponent(k)}`} className="kategori-card d-block h-100">
                <span className="kategori-name d-block">{k}</span>
                <span className="kategori-count">{jumlahPerKategori(k)} produk</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Produk unggulan */}
      <section className="py-5 section-alt">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <h2 className="fw-bold mb-1">Produk Unggulan</h2>
              <p className="text-muted mb-0">Batik pilihan terbaik</p>
            </div>
            <Link to="/produk" className="link-accent">Semua produk &rarr;</Link>
          </div>

          {loading && <p className="text-center text-muted py-4">Memuat produk...</p>}
          {error && <p className="text-center text-danger py-4">Gagal memuat produk.</p>}

          {!loading && !error && (
            produkUnggulan.length ? (
              <div className="row g-4">
                {produkUnggulan.map((p) => (
                  <div key={p.id_produk} className="col-12 col-sm-6 col-lg-4">
                    <Link to={`/produk/${p.id_produk}`} className="card product-card h-100 text-decoration-none">
                      <div className="position-relative product-thumb">
                        <img src={mediaUrl(p.gambar)} alt={p.nama_produk} onError={onImgError} className="card-img-top" />
                        <span className={`badge status-chip position-absolute top-0 end-0 m-2 ${p.status_produk === "Tersedia" ? "bg-success" : "bg-danger"}`}>
                          {p.status_produk}
                        </span>
                        <span className="badge kategori-chip position-absolute bottom-0 start-0 m-2">{p.kategori}</span>
                      </div>
                      <div className="card-body">
                        <h3 className="h6 mb-1">{p.nama_produk}</h3>
                        <p className="text-muted small mb-3">{p.bahan_kain || 'Batik pilihan'}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-accent">{formatRupiah(p.harga)}</span>
                          <span className="btn btn-outline-accent btn-sm">Lihat</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted py-5"><h3>Belum ada produk</h3></div>
            )
          )}
        </div>
      </section>

      {/* Artikel */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">Cerita Batik</h2>
            <p className="text-muted mb-0">Kisah pengrajin dan filosofi motif batik</p>
          </div>
          <Link to="/artikel" className="link-accent">Lihat semua &rarr;</Link>
        </div>

        {artikelTerbaru.length ? (
          <div className="row g-4">
            {artikelTerbaru.map((a) => (
              <div key={a.id} className="col-12 col-sm-6 col-lg-4">
                <Link to={`/artikel/${a.id}`} className="card article-card h-100 text-decoration-none">
                  <div className="article-thumb">
                    <img src={mediaUrl(a.gambar)} alt={a.judul} onError={onImgError} className="card-img-top" />
                  </div>
                  <div className="card-body">
                    <span className="text-accent small d-block mb-1">{formatTanggal(a.created_at)}</span>
                    <h3 className="h6">{a.judul}</h3>
                    <p className="text-muted small mb-0">{a.ringkasan}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-5"><h3>Belum ada artikel</h3></div>
        )}
      </section>
    </div>
  );
}