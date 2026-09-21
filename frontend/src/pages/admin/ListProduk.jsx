import { useEffect, useState } from 'react';
import { API_BASE_URL, KATEGORI_PRODUK } from '../../constants.js';
import { getToken, formatRupiah, getImageUrl } from '../../utils.js';

const kosong = {
  nama_produk: '', deskripsi: '', harga: '', stok: '', ukuran: '', bahan_kain: '',
  kategori: KATEGORI_PRODUK[0], status_produk: 'Tersedia',
};

export default function ListProduk() {
  const [produkList, setProdukList] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(kosong);
  const [gambar, setGambar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const muatProduk = () => {
    setStatus('loading');
    fetch(`${API_BASE_URL}/produk`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat produk');
        return res.json();
      })
      .then((data) => {
        setProdukList(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => { muatProduk(); }, []);

  const bukaTambah = () => {
    setEditId(null);
    setForm(kosong);
    setGambar(null);
    setPreviewUrl('');
    setError('');
    setShowModal(true);
  };

  const bukaEdit = (p) => {
    setEditId(p.id_produk);
    setForm({
      nama_produk: p.nama_produk,
      deskripsi: p.deskripsi,
      harga: p.harga,
      stok: p.stok,
      ukuran: p.ukuran || '',
      bahan_kain: p.bahan_kain || '',
      kategori: p.kategori,
      status_produk: p.status_produk,
    });
    setGambar(null);
    setPreviewUrl(getImageUrl(p.gambar));
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePilihGambar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGambar(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (gambar) formData.append('gambar', gambar);

      const url = editId
        ? `${API_BASE_URL}/produk/${editId}`
        : `${API_BASE_URL}/produk`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan produk');

      setShowModal(false);
      muatProduk();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/produk/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus produk');
      muatProduk();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <span style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>Daftar produk yang dijual di katalog</span>
        <button className="btn btn-primary btn-sm" onClick={bukaTambah}>+ Tambah Produk</button>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Foto</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Status</th><th className="admin-action-heading">Aksi</th></tr>
          </thead>
          <tbody>
            {status === 'loading' && <tr><td colSpan={7} className="loading-row">Memuat...</td></tr>}
            {status === 'error' && <tr><td colSpan={7} className="loading-row">Gagal memuat data</td></tr>}
            {status === 'ready' && produkList.length === 0 && (
              <tr><td colSpan={7} className="loading-row">Belum ada produk</td></tr>
            )}
            {status === 'ready' && produkList.map((p) => (
              <tr key={p.id_produk}>
                <td><div className="thumb-sm"><img src={getImageUrl(p.gambar)} alt="" /></div></td>
                <td>{p.nama_produk}</td>
                <td>{p.kategori}</td>
                <td>{formatRupiah(p.harga)}</td>
                <td>{p.stok}</td>
                <td><span className={`status-badge status-badge-${p.status_produk}`}>{p.status_produk}</span></td>
                <td className="table-actions admin-action-cell">
                  <button className="btn btn-ghost btn-icon" onClick={() => bukaEdit(p)} title="Edit produk" aria-label={`Edit produk ${p.nama_produk}`}>
                    <i className="bi bi-pencil-square" aria-hidden="true"></i>
                  </button>
                  <button className="btn btn-ghost btn-icon btn-icon-danger" onClick={() => handleDelete(p.id_produk)} title="Hapus produk" aria-label={`Hapus produk ${p.nama_produk}`}>
                    <i className="bi bi-trash3" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop show">
          <div className="modal">
            <div className="modal-head">
              <h3>{editId ? 'Edit Produk' : 'Tambah Produk'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error show">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="nama_produk">Nama Produk</label>
                <input type="text" id="nama_produk" name="nama_produk" required value={form.nama_produk} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="deskripsi">Deskripsi</label>
                <textarea id="deskripsi" name="deskripsi" required value={form.deskripsi} onChange={handleChange}></textarea>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="harga">Harga (Rp)</label>
                  <input type="number" id="harga" name="harga" min={0} required value={form.harga} onChange={handleChange} />
                </div>
                <div className="field">
                  <label htmlFor="stok">Stok</label>
                  <input type="number" id="stok" name="stok" min={0} required value={form.stok} onChange={handleChange} />
                </div>
              </div>
              <div className="field">
                  <label htmlFor="kategori">Kategori</label>
                  <select id="kategori" name="kategori" value={form.kategori} onChange={handleChange}>
                    {KATEGORI_PRODUK.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="ukuran">Ukuran (opsional)</label>
                  <input type="text" id="ukuran" name="ukuran" placeholder="S / M / L / All Size" value={form.ukuran} onChange={handleChange} />
                </div>
                <div className="field">
                  <label htmlFor="bahan_kain">Bahan Kain (opsional)</label>
                  <input type="text" id="bahan_kain" name="bahan_kain" placeholder="Katun primis, sutra, dll." value={form.bahan_kain} onChange={handleChange} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="status_produk">Status</label>
                <select id="status_produk" name="status_produk" value={form.status_produk} onChange={handleChange}>
                  <option>Tersedia</option>
                  <option>Habis</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="gambar">Foto Produk</label>
                <input type="file" id="gambar" accept="image/*" onChange={handlePilihGambar} />
                {previewUrl && (
                  <div style={{ marginTop: 10 }}>
                    <div className="thumb-sm" style={{ width: 90, height: 90 }}>
                      <img src={previewUrl} alt="Preview" />
                    </div>
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}