import { useEffect, useState } from "react";
import { apiFetch } from "../../utils.js";

const KOSONG = { nama_kategori: "" };

export default function ListKategori() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(KOSONG);
  const [editId, setEditId] = useState(null);
  const [simpanLoading, setSimpanLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [hapusTarget, setHapusTarget] = useState(null);
  const [cari, setCari] = useState("");

  const muatData = () => {
    setLoading(true);
    setError("");
    apiFetch("/kategori")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    muatData();
  }, []);

  const bukaTambah = () => {
    setEditId(null);
    setForm(KOSONG);
    setFormError("");
  };

  const bukaEdit = (item) => {
    setEditId(item.id_kategori);
    setForm({ nama_kategori: item.nama_kategori });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nama = form.nama_kategori.trim();

    if (!nama) {
      setFormError("Nama kategori tidak boleh kosong.");
      return;
    }

    const duplikat = data.some(
      (k) =>
        k.nama_kategori.toLowerCase() === nama.toLowerCase() &&
        k.id_kategori !== editId
    );
    if (duplikat) {
      setFormError("Kategori dengan nama ini sudah ada.");
      return;
    }

    setSimpanLoading(true);
    setFormError("");

    try {
      if (editId) {
        const updated = await apiFetch(`/kategori/${editId}`, {
          method: "PUT",
          body: JSON.stringify({ nama_kategori: nama }),
        });
        setData((prev) =>
          prev.map((k) => (k.id_kategori === editId ? { ...k, ...updated } : k))
        );
      } else {
        const created = await apiFetch("/kategori", {
          method: "POST",
          body: JSON.stringify({ nama_kategori: nama }),
        });
        setData((prev) => [...prev, created]);
      }
      bukaTambah();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSimpanLoading(false);
    }
  };

  const konfirmasiHapus = async () => {
    if (!hapusTarget) return;
    try {
      await apiFetch(`/kategori/${hapusTarget.id_kategori}`, { method: "DELETE" });
      setData((prev) => prev.filter((k) => k.id_kategori !== hapusTarget.id_kategori));
      if (editId === hapusTarget.id_kategori) bukaTambah();
    } catch (err) {
      setError(err.message);
    } finally {
      setHapusTarget(null);
    }
  };

  const hasil = data.filter((k) =>
    k.nama_kategori.toLowerCase().includes(cari.trim().toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Kategori Produk</h1>
          <p className="text-muted mb-0">Kelola daftar kategori yang tersedia di katalog.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* ---- Form tambah/edit ---- */}
        <div className="col-12 col-lg-4">
          <div className="admin-card">
            <h2 className="h6 fw-bold mb-3">
              {editId ? "Edit Kategori" : "Tambah Kategori"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nama Kategori</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Kemeja Batik"
                  value={form.nama_kategori}
                  onChange={(e) => setForm({ nama_kategori: e.target.value })}
                  disabled={simpanLoading}
                  autoFocus
                />
              </div>

              {formError && <p className="text-danger small mb-3">{formError}</p>}

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-accent flex-grow-1" disabled={simpanLoading}>
                  {simpanLoading ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Kategori"}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={bukaTambah}
                    disabled={simpanLoading}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ---- Daftar kategori ---- */}
        <div className="col-12 col-lg-8">
          <div className="admin-card">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h2 className="h6 fw-bold mb-0">Daftar Kategori ({data.length})</h2>
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ maxWidth: 220 }}
                placeholder="Cari kategori..."
                value={cari}
                onChange={(e) => setCari(e.target.value)}
              />
            </div>

            {loading && <p className="text-muted text-center py-4">Memuat kategori...</p>}
            {error && <p className="text-danger text-center py-4">{error}</p>}

            {!loading && !error && (
              hasil.length ? (
                <div className="table-responsive">
                  <table className="table admin-table align-middle">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>No</th>
                        <th>Nama Kategori</th>
                        <th className="admin-action-heading" style={{ width: 140 }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hasil.map((k, i) => (
                        <tr key={k.id_kategori}>
                          <td>{i + 1}</td>
                          <td>{k.nama_kategori}</td>
                          <td className="admin-action-cell">
                            <div className="admin-action-buttons">
                              <button
                                type="button"
                                className="btn btn-ghost btn-icon"
                                onClick={() => bukaEdit(k)}
                                title="Edit kategori"
                                aria-label={`Edit kategori ${k.nama_kategori}`}
                              >
                                <i className="bi bi-pencil-square" aria-hidden="true"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-icon btn-icon-danger"
                                onClick={() => setHapusTarget(k)}
                                title="Hapus kategori"
                                aria-label={`Hapus kategori ${k.nama_kategori}`}
                              >
                                <i className="bi bi-trash3" aria-hidden="true"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">
                  {cari ? "Kategori tidak ditemukan." : "Belum ada kategori."}
                </p>
              )
            )}
          </div>
        </div>
      </div>

      {/* ---- Modal konfirmasi hapus ---- */}
      {hapusTarget && (
        <div className="admin-modal-backdrop" onClick={() => setHapusTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="h6 fw-bold mb-2">Hapus Kategori?</h3>
            <p className="text-muted mb-4">
              Yakin ingin menghapus kategori <strong>{hapusTarget.nama_kategori}</strong>? Produk
              yang masih memakai kategori ini sebaiknya dipindahkan dulu.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setHapusTarget(null)}>
                Batal
              </button>
              <button type="button" className="btn btn-danger" onClick={konfirmasiHapus}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}