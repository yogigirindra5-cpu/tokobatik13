import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, STATUS_PROSES, STATUS_BAYAR } from "../../constants.js";
import { getToken, formatRupiah, formatTanggal, getImageUrl } from "../../utils.js";

export default function DetailPembelian() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [buktiZoom, setBuktiZoom] = useState(false);

  const muatData = () => {
    setStatus("loading");
    setError("");

    // Belum ada endpoint GET per-id, jadi ambil dari daftar lalu cari id-nya.
    // Ganti ke `/api/transaksi/${id}` langsung kalau backend sudah menyediakannya.
    fetch(`${API_BASE_URL}/api/transaksi`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat transaksi");
        return res.json();
      })
      .then((list) => {
        const found = list.find((t) => String(t.id) === String(id));
        if (!found) throw new Error("Transaksi tidak ditemukan");
        setData(found);
        setStatus("ready");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  };

  useEffect(() => {
    muatData();
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (field, value) => {
    setError("");
    try {
      const url =
        field === "status"
          ? `${API_BASE_URL}/api/transaksi/${id}/status`
          : `${API_BASE_URL}/api/transaksi/${id}/pembayaran`;

      const body = field === "status" ? { status: value } : { status_bayar: value };

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal mengubah status");

      setData((prev) => ({
        ...prev,
        [field === "status" ? "status" : "pembayaran"]: value,
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleHapus = async () => {
    if (!confirm("Hapus transaksi ini?")) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/transaksi/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal menghapus transaksi");
      navigate("/admin/pembelian");
    } catch (err) {
      setError(err.message);
    }
  };

  const verifikasiCepat = () => {
    handleUpdate("pembayaran", "Dibayar");
    handleUpdate("status", "Diproses");
  };

  if (status === "loading") {
    return <div className="loading-row">Memuat transaksi...</div>;
  }

  if (status === "error" || !data) {
    return (
      <div>
        <div className="alert alert-error show">{error || "Transaksi tidak ditemukan."}</div>
        <Link to="/admin/pembelian" className="btn btn-ghost btn-sm">
          <i className="bi bi-arrow-left" aria-hidden="true"></i> Kembali ke Daftar Transaksi
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <Link to="/admin/pembelian" className="btn btn-ghost btn-sm">
          <i className="bi bi-arrow-left" aria-hidden="true"></i> Kembali
        </Link>
        <span style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>
          Transaksi #{data.id} • {formatTanggal(data.created_at)}
        </span>
      </div>

      {error && <div className="alert alert-error show">{error}</div>}

      <div className="detail-transaksi-grid">
        {/* ---- Kiri: info pesanan + bukti bayar ---- */}
        <div className="table-wrap detail-transaksi-panel">
          <h3 className="h6 fw-bold mb-3">Info Pesanan</h3>
          <dl className="admin-dl">
            <dt>Pembeli</dt>
            <dd>{data.nama_pembeli || data.uname}</dd>
            <dt>No HP</dt>
            <dd>{data.phone_pembeli || "-"}</dd>
            <dt>Produk</dt>
            <dd>{data.nama_produk} ({data.jumlah}x)</dd>
            <dt>Total</dt>
            <dd className="fw-bold text-accent">{formatRupiah(data.total_harga)}</dd>
            <dt>Metode Bayar</dt>
            <dd>{data.metode_pembayaran}</dd>
          </dl>

          <h3 className="h6 fw-bold mt-4 mb-3">Bukti Pembayaran</h3>
          {data.foto_bukti ? (
            <>
              <img
                src={getImageUrl(data.foto_bukti)}
                alt="Bukti pembayaran"
                className="bukti-bayar-img"
                onClick={() => setBuktiZoom(true)}
              />
              <p className="text-muted small mt-2 mb-0">Klik gambar untuk memperbesar.</p>
            </>
          ) : (
            <p style={{ color: "var(--ink-soft)" }}>Pembeli belum mengunggah bukti pembayaran.</p>
          )}
        </div>

        {/* ---- Kanan: verifikasi status ---- */}
        <div className="table-wrap detail-transaksi-panel">
          <h3 className="h6 fw-bold mb-3">Verifikasi Transaksi</h3>

          <button type="button" className="btn btn-accent btn-sm mb-3" onClick={verifikasiCepat} title="Verifikasi pembayaran dan proses pesanan">
            <i className="bi bi-check2-circle" aria-hidden="true"></i> Verifikasi Bayar &amp; Proses
          </button>

          <div className="mb-3">
            <label className="form-label">Status Pembayaran</label>
            <select
              className="form-select"
              value={data.pembayaran}
              onChange={(e) => handleUpdate("pembayaran", e.target.value)}
            >
              {STATUS_BAYAR.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label">Status Proses</label>
            <select
              className="form-select"
              value={data.status}
              onChange={(e) => handleUpdate("status", e.target.value)}
            >
              {STATUS_PROSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button type="button" className="btn btn-ghost btn-icon btn-icon-danger" onClick={handleHapus} title="Hapus transaksi" aria-label="Hapus transaksi">
            <i className="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {buktiZoom && (
        <div className="admin-modal-backdrop" onClick={() => setBuktiZoom(false)}>
          <div className="bukti-zoom-modal" onClick={(e) => e.stopPropagation()}>
            <img src={getImageUrl(data.foto_bukti)} alt="Bukti pembayaran" />
            <button type="button" className="bukti-zoom-close" onClick={() => setBuktiZoom(false)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}