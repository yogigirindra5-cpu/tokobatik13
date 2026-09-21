import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE_URL, KATEGORI_PRODUK } from "../constants.js";
import { mediaUrl, formatRupiah, onImgError } from "../utils.js";

const URUTAN = [
  { value: "terbaru", label: "Terbaru" },
  { value: "termurah", label: "Harga Termurah" },
  { value: "termahal", label: "Harga Termahal" },
  { value: "nama", label: "Nama A-Z" },
];

export default function ListProduk() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState(searchParams.get("kategori") || "");
  const [urutan, setUrutan] = useState("terbaru");
  const [tampilan, setTampilan] = useState("grid");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/produk`)
      .then((res) => res.json())
      .then(setProduk)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setKategori(searchParams.get("kategori") || "");
  }, [searchParams]);

  const pilihKategori = (nilai) => {
    setKategori(nilai);
    if (nilai) setSearchParams({ kategori: nilai });
    else setSearchParams({});
  };

  const hasil = useMemo(() => {
    const kata = cari.trim().toLowerCase();

    let data = produk.filter((p) => {
      const cocokKata =
        !kata ||
        [p.nama_produk, p.bahan_kain, p.kategori, p.deskripsi]
          .filter(Boolean)
          .some((t) => String(t).toLowerCase().includes(kata));
      const cocokKategori = !kategori || p.kategori === kategori;
      return cocokKata && cocokKategori;
    });

    data = [...data];
    if (urutan === "termurah") data.sort((a, b) => Number(a.harga) - Number(b.harga));
    else if (urutan === "termahal") data.sort((a, b) => Number(b.harga) - Number(a.harga));
    else if (urutan === "nama") data.sort((a, b) => String(a.nama_produk).localeCompare(String(b.nama_produk)));
    else data.sort((a, b) => Number(b.id_produk) - Number(a.id_produk));

    return data;
  }, [produk, cari, kategori, urutan]);

  const resetFilter = () => {
    setCari("");
    setUrutan("terbaru");
    pilihKategori("");
  };

  return (
    <div className="katalog-page">
      {/* ===== Hero ===== */}
      <section className="katalog-hero">
        <div className="container text-center">
          <span className="katalog-pill">Koleksi Girindra</span>
          <h1 className="katalog-title">
            Simfoni Canting &amp; <em>Warna Alam</em>
          </h1>
          <p className="katalog-desc mx-auto">
            Telusuri mahakarya batik premium yang dikerjakan dengan penuh ketelitian oleh para
            pengrajin kami. Setiap helai kain membawa cerita tentang warisan budaya dan keanggunan
            modern.
          </p>
        </div>
      </section>

      {/* ===== Toolbar: search, tampilan, urutan ===== */}
      <section className="katalog-toolbar">
        <div className="container">
          <div className="toolbar-row">
            <div className="search-box">
              <span className="search-ico">⌕</span>
              <input
                type="text"
                placeholder="Cari motif, jenis kain, atau koleksi..."
                value={cari}
                onChange={(e) => setCari(e.target.value)}
              />
            </div>

            <div className="toolbar-right">
              <div className="view-toggle">
                <button
                  type="button"
                  className={tampilan === "grid" ? "active" : ""}
                  onClick={() => setTampilan("grid")}
                  aria-label="Tampilan grid"
                >
                  ▦
                </button>
                <button
                  type="button"
                  className={tampilan === "list" ? "active" : ""}
                  onClick={() => setTampilan("list")}
                  aria-label="Tampilan daftar"
                >
                  ☰
                </button>
              </div>

              <select className="sort-select" value={urutan} onChange={(e) => setUrutan(e.target.value)}>
                {URUTAN.map((u) => (
                  <option key={u.value} value={u.value}>
                    Urutkan: {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ===== Filter chip ===== */}
          <div className="filter-row">
            <span className="filter-label">Kategori:</span>
            <button
              type="button"
              className={`filter-chip ${!kategori ? "active" : ""}`}
              onClick={() => pilihKategori("")}
            >
              Semua Kategori
            </button>
            {KATEGORI_PRODUK.map((k) => (
              <button
                key={k}
                type="button"
                className={`filter-chip ${kategori === k ? "active" : ""}`}
                onClick={() => pilihKategori(k)}
              >
                {k}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ===== Hasil ===== */}
      <section className="container katalog-hasil">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <p className="text-muted mb-0 small">
            Menampilkan <strong>{hasil.length}</strong> dari {produk.length} produk
          </p>
          {(cari || kategori || urutan !== "terbaru") && (
            <button type="button" className="btn-reset" onClick={resetFilter}>
              Reset filter
            </button>
          )}
        </div>

        {loading && <p className="text-center text-muted py-5">Memuat produk...</p>}
        {error && <p className="text-center text-danger py-5">Gagal memuat produk.</p>}

        {!loading && !error && hasil.length === 0 && (
          <div className="text-center text-muted py-5">
            <h3 className="h5">Tidak ada produk yang cocok</h3>
            <p className="mb-3">Coba ubah kata kunci atau reset filter.</p>
            <button type="button" className="btn btn-outline-accent" onClick={resetFilter}>
              Reset filter
            </button>
          </div>
        )}

        {!loading && !error && hasil.length > 0 && tampilan === "grid" && (
          <div className="row g-4">
            {hasil.map((p) => (
              <div key={p.id_produk} className="col-6 col-lg-4">
                <Link to={`/produk/${p.id_produk}`} className="card product-card h-100 text-decoration-none">
                  <div className="position-relative product-thumb">
                    <img src={mediaUrl(p.gambar)} alt={p.nama_produk} onError={onImgError} className="card-img-top" />
                    <span
                      className={`badge status-chip position-absolute top-0 end-0 m-2 ${
                        p.status_produk === "Tersedia" ? "bg-success" : "bg-danger"
                      }`}
                    >
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
        )}

        {!loading && !error && hasil.length > 0 && tampilan === "list" && (
          <div className="produk-list">
            {hasil.map((p) => (
              <Link key={p.id_produk} to={`/produk/${p.id_produk}`} className="produk-list-item">
                <div className="produk-list-thumb">
                  <img src={mediaUrl(p.gambar)} alt={p.nama_produk} onError={onImgError} />
                </div>
                <div className="produk-list-body">
                  <span className="detail-eyebrow">{p.kategori}</span>
                  <h3 className="h6 mb-1">{p.nama_produk}</h3>
                  <p className="text-muted small mb-2">
                    {p.kategori}
                    {p.bahan_kain ? ` • ${p.bahan_kain}` : ""}
                    {p.ukuran ? ` • ${p.ukuran}` : ""}
                  </p>
                  <p className="produk-list-desc">{p.deskripsi}</p>
                </div>
                <div className="produk-list-side">
                  <span className="fw-bold text-accent">{formatRupiah(p.harga)}</span>
                  <span
                    className={`badge status-chip ${p.status_produk === "Tersedia" ? "bg-success" : "bg-danger"}`}
                  >
                    {p.status_produk}
                  </span>
                  <span className="btn btn-outline-accent btn-sm">Lihat Detail</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}