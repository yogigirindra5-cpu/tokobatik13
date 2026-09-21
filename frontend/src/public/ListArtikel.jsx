// src/pages/ListArtikel.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../constants.js";
import { mediaUrl, formatTanggal, onImgError } from "../utils.js";

export default function ListArtikel() {
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/artikel`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat artikel");
        return res.json();
      })
      .then(setArtikel)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="artikel-page">
      {/* ===== Hero ===== */}
      <section className="artikel-hero">
        <div className="container text-center">
          <span className="katalog-pill">Cerita Batik</span>
          <h1 className="katalog-title">
            Kisah di Balik <em>Setiap Helai</em>
          </h1>
          <p className="katalog-desc mx-auto">
            Telusuri cerita pengrajin, filosofi motif, dan perjalanan warisan batik Nusantara
            yang kami rangkum untuk kamu.
          </p>
        </div>
      </section>

      {/* ===== Daftar artikel ===== */}
      <section className="container artikel-hasil">
        {loading && <p className="loading-row">Memuat artikel...</p>}
        {error && <p className="loading-row">Gagal memuat artikel.</p>}

        {!loading && !error && artikel.length === 0 && (
          <div className="empty-state">
            <h3>Belum ada artikel</h3>
          </div>
        )}

        {!loading && !error && artikel.length > 0 && (
          <div className="row g-4">
            {artikel.map((a) => (
              <div key={a.id} className="col-12 col-sm-6 col-lg-4">
                <Link to={`/artikel/${a.id}`} className="card article-card h-100 text-decoration-none">
                  <div className="article-thumb">
                    <img src={mediaUrl(a.gambar)} alt={a.judul} onError={onImgError} className="card-img-top" />
                  </div>
                  <div className="card-body">
                    <span className="article-date">{formatTanggal(a.created_at)}</span>
                    <h3 className="h6 mb-2">{a.judul}</h3>
                    <p className="text-muted small mb-0">{a.ringkasan}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}