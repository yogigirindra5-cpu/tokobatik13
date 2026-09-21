// src/pages/DetailArtikel.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatTanggal, getImageUrl } from '../utils.js';
import { API_BASE_URL } from '../constants.js';

export default function DetailArtikel() {
  const { id } = useParams();
  const [artikel, setArtikel] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/artikel/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat artikel');
        return res.json();
      })
      .then((data) => {
        setArtikel(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [id]);

  if (status === 'loading') return <p className="loading-row">Memuat artikel...</p>;
  if (status === 'error' || !artikel) {
    return <div className="empty-state"><h3>Artikel tidak ditemukan</h3></div>;
  }

  return (
    <div className="container" style={{ maxWidth: 760, paddingBottom: 64 }}>
      <div className="article-date" style={{ marginTop: 24 }}>{formatTanggal(artikel.created_at)}</div>
      <h1>{artikel.judul}</h1>
      <div className="detail-visual" style={{ aspectRatio: '16/9', marginBottom: 24 }}>
        <img src={getImageUrl(artikel.gambar)} alt={artikel.judul} />
      </div>
      <div style={{ whiteSpace: 'pre-line', maxWidth: 'none' }}>{artikel.isi}</div>
      <p style={{ marginTop: 32 }}>
        <Link to="/artikel">&larr; Kembali ke semua artikel</Link>
      </p>
    </div>
  );
}