import { useEffect, useState } from 'react';
import { apiFetch, formatTanggal, getImageUrl } from '../../utils.js';

const kosong = { judul: '', ringkasan: '', isi: '' };

export default function ListArtikel() {
  const [artikelList, setArtikelList] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(kosong);
  const [gambar, setGambar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  const muatArtikel = () => {
    setStatus('loading');
    apiFetch('/artikel')
      .then((data) => {
        setArtikelList(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => { muatArtikel(); }, []);

  const bukaTambah = () => {
    setEditId(null);
    setForm(kosong);
    setGambar(null);
    setPreviewUrl('');
    setError('');
    setShowModal(true);
  };

  const bukaEdit = (a) => {
    setEditId(a.id);
    setForm({ judul: a.judul, ringkasan: a.ringkasan, isi: a.isi });
    setGambar(null);
    setPreviewUrl(getImageUrl(a.gambar));
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
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (gambar) formData.append('gambar', gambar);

      if (editId) {
        await apiFetch(`/artikel/${editId}`, { method: 'PUT', body: formData });
      } else {
        await apiFetch('/artikel', { method: 'POST', body: formData });
      }
      setShowModal(false);
      muatArtikel();
    } catch (err) {
      setError(err.data?.message || 'Gagal menyimpan artikel');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus artikel ini?')) return;
    try {
      await apiFetch(`/artikel/${id}`, { method: 'DELETE' });
      muatArtikel();
    } catch (err) {
      alert(err.data?.message || 'Gagal menghapus artikel');
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <span style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>Artikel cerita &amp; edukasi batik</span>
        <button className="btn btn-primary btn-sm" onClick={bukaTambah}>+ Tambah Artikel</button>
      </div>

      <div className="table-wrap">
        <table className="admin-table artikel-table">
          <thead>
            <tr><th>Gambar</th><th>Judul</th><th>Tanggal</th><th className="action-heading">Aksi</th></tr>
          </thead>
          <tbody>
            {status === 'loading' && <tr><td colSpan={4} className="loading-row">Memuat...</td></tr>}
            {status === 'error' && <tr><td colSpan={4} className="loading-row">Gagal memuat data</td></tr>}
            {status === 'ready' && artikelList.length === 0 && (
              <tr><td colSpan={4} className="loading-row">Belum ada artikel</td></tr>
            )}
            {status === 'ready' && artikelList.map((a) => (
              <tr key={a.id}>
                <td><div className="thumb-sm"><img src={getImageUrl(a.gambar)} alt="" /></div></td>
                <td>{a.judul}</td>
                <td>{formatTanggal(a.created_at)}</td>
                <td className="table-actions action-cell">
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => bukaEdit(a)}
                    title="Edit artikel"
                    aria-label={`Edit artikel ${a.judul}`}
                  >
                    <i className="bi bi-pencil-square" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-icon-danger"
                    onClick={() => handleDelete(a.id)}
                    title="Hapus artikel"
                    aria-label={`Hapus artikel ${a.judul}`}
                  >
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
              <h3>{editId ? 'Edit Artikel' : 'Tambah Artikel'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error show">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="judul">Judul</label>
                <input type="text" id="judul" name="judul" required value={form.judul} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="ringkasan">Ringkasan Singkat</label>
                <textarea id="ringkasan" name="ringkasan" required value={form.ringkasan} onChange={handleChange}></textarea>
              </div>
              <div className="field">
                <label htmlFor="isi">Isi Artikel</label>
                <textarea id="isi" name="isi" style={{ minHeight: 160 }} required value={form.isi} onChange={handleChange}></textarea>
              </div>
              <div className="field">
                <label htmlFor="gambar_artikel">Gambar Sampul</label>
                <input type="file" id="gambar_artikel" accept="image/*" onChange={handlePilihGambar} />
                {previewUrl && (
                  <div style={{ marginTop: 10 }}>
                    <div className="thumb-sm" style={{ width: 120, height: 80 }}>
                      <img src={previewUrl} alt="Preview" />
                    </div>
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary btn-block">Simpan Artikel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}