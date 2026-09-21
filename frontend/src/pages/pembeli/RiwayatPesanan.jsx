import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../constants.js';
import { getToken, formatRupiah, formatTanggal } from '../../utils.js';

export default function RiwayatPesanan() {
  const [transaksi, setTransaksi] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/transaksi`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat pesanan');
        return res.json();
      })
      .then((data) => {
        setTransaksi(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const statusClass = (s) => {
    if (s === 'Selesai') return 'chip-ok';
    if (s === 'Dibatalkan') return 'chip-off';
    return 'chip-pending';
  };

  return (
    <div className="container order-history-page" style={{ padding: '40px 0 64px' }}>
      <div className="order-history-heading">
        <span className="detail-eyebrow">Akun Saya</span>
        <h2>Riwayat Pesanan</h2>
        <p>Lihat status dan detail pesanan yang pernah kamu buat.</p>
      </div>

      {status === 'loading' && <p className="loading-row">Memuat pesanan...</p>}
      {status === 'error' && <p className="loading-row">Gagal memuat pesanan.</p>}

      {status === 'ready' && (
        transaksi.length ? (
          <div className="order-list">
            {transaksi.map((t) => (
                <Link key={t.id} to={`/pembeli/transaksi/${t.id}`} className="order-row">
                <div className="order-info">
                  <div className="order-id"><i className="bi bi-receipt" aria-hidden="true"></i> Pesanan #{t.id}</div>
                  <div className="order-date">{formatTanggal(t.created_at)}</div>
                </div>
                <div className="order-total">{formatRupiah(t.total_harga)}</div>
                <span className={`status-chip ${statusClass(t.status)}`}>{t.status}</span>
                <i className="bi bi-chevron-right order-arrow" aria-hidden="true"></i>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Belum ada pesanan</h3>
            <Link to="/produk" className="btn btn-primary">Mulai Belanja</Link>
          </div>
        )
      )}
    </div>
  );
}