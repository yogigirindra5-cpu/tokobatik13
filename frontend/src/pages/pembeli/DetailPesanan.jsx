import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../constants.js';
import { getToken, formatRupiah, formatTanggal, getImageUrl } from '../../utils.js';

export default function DetailPesanan() {
  const { id } = useParams();
  const location = useLocation();
  const [transaksi, setTransaksi] = useState(null);
  const [status, setStatus] = useState('loading');
  const [buktiFile, setBuktiFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const muatTransaksi = () => {
    fetch(`${API_BASE_URL}/api/transaksi/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Transaksi tidak ditemukan');
        return res.json();
      })
      .then((data) => {
        setTransaksi(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => { muatTransaksi(); }, [id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!buktiFile) {
      setError('Pilih file bukti pembayaran terlebih dahulu');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('foto_bukti', buktiFile);

      const res = await fetch(`${API_BASE_URL}/api/transaksi/${id}/bukti-bayar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengunggah bukti bayar');

      muatTransaksi();
      setBuktiFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading') return <p className="loading-row">Memuat pesanan...</p>;
  if (status === 'error' || !transaksi) {
    return <div className="empty-state"><h3>Pesanan tidak ditemukan</h3></div>;
  }

  return (
    <div className="container" style={{ padding: '40px 0 64px', maxWidth: 700 }}>
      {location.state?.message && (
        <div className="alert alert-success show">{location.state.message}</div>
      )}

      <h2>Pesanan #{transaksi.id_transaksi}</h2>
      <p className="text-muted">{formatTanggal(transaksi.created_at)}</p>

      <div className="checkout-card">
        <div className="summary-row"><span>Nama Produk</span><span>{transaksi.nama_produk}</span></div>
        <div className="summary-row"><span>Jumlah</span><span>{transaksi.jumlah}</span></div>
        <div className="summary-row"><span>Total</span><span>{formatRupiah(transaksi.total_harga)}</span></div>
        <div className="summary-row"><span>Metode Bayar</span><span>{transaksi.metode_pembayaran}</span></div>
        <div className="summary-row"><span>Status Pembayaran</span><span>{transaksi.pembayaran}</span></div>
        <div className="summary-row"><span>Status Pesanan</span><span>{transaksi.status}</span></div>
        <div className="summary-row"><span>Alamat Kirim</span><span>{transaksi.alamat_kirim}</span></div>
      </div>

{transaksi.pembayaran === 'Belum' && (
        <div className="checkout-card">
          <h3 className="checkout-card-title">Unggah Bukti Pembayaran</h3>
          {error && <div className="alert alert-error show">{error}</div>}
          <form onSubmit={handleUpload}>
            <div className="field">
              <input type="file" accept="image/*" onChange={(e) => setBuktiFile(e.target.files[0])} />
            </div>
            <button type="submit" className="btn btn-accent" disabled={uploading}>
              {uploading ? 'Mengunggah...' : 'Unggah Bukti'}
            </button>
          </form>
        </div>
      )}

      {transaksi.foto_bukti && (
        <div className="checkout-card">
          <h3 className="checkout-card-title">Bukti Pembayaran</h3>
          <img src={getImageUrl(transaksi.foto_bukti)} alt="Bukti bayar" style={{ maxWidth: '100%', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}