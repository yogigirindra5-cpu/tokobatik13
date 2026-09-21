import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, STATUS_PROSES, STATUS_BAYAR } from '../../constants.js';
import { getToken, formatRupiah, formatTanggal, getImageUrl } from '../../utils.js';

export default function ListPembelian() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const muatTransaksi = () => {
    setStatus('loading');
    fetch(`${API_BASE_URL}/api/transaksi`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat transaksi');
        return res.json();
      })
      .then((data) => {
        setList(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => { muatTransaksi(); }, []);

  const handleUpdate = async (id, field, value) => {
    setError('');
    try {
      const url = field === 'status'
        ? `${API_BASE_URL}/api/transaksi/${id}/status`
        : `${API_BASE_URL}/api/transaksi/${id}/pembayaran`;

      const body = field === 'status'
        ? { status: value }
        : { status_bayar: value };

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengubah status');

      muatTransaksi();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleHapus = async (id) => {
    if (!confirm('Hapus transaksi ini?')) return;
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/transaksi/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus transaksi');
      muatTransaksi();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <span style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>Semua pesanan yang masuk dari pembeli</span>
      </div>

      {error && <div className="alert alert-error show">{error}</div>}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pembeli</th>
              <th>No HP</th>
              <th>Produk</th>
              <th>Total</th>
              <th>Metode Bayar</th>
              <th>Bukti Bayar</th>
              <th>Status Bayar</th>
              <th>Status Proses</th>
              <th>Tanggal</th>
              <th className="admin-action-heading">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' && <tr><td colSpan={10} className="loading-row">Memuat...</td></tr>}
            {status === 'error' && <tr><td colSpan={10} className="loading-row">Gagal memuat data</td></tr>}
            {status === 'ready' && list.length === 0 && (
              <tr><td colSpan={10} className="loading-row">Belum ada transaksi</td></tr>
            )}
            {status === 'ready' && list.map((t) => (
              <tr key={t.id}>
                <td>{t.nama_pembeli || t.uname}</td>
                <td>{t.phone_pembeli || '-'}</td>
                <td>{t.nama_produk} ({t.jumlah}x)</td>
                <td>{formatRupiah(t.total_harga)}</td>
                <td>{t.metode_pembayaran}</td>
                <td>
                  {t.foto_bukti ? (
                    <a href={getImageUrl(t.foto_bukti)} target="_blank" rel="noreferrer">
                      <div className="thumb-sm">
                        <img src={getImageUrl(t.foto_bukti)} alt="Bukti bayar" />
                      </div>
                    </a>
                  ) : (
                    <span style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>Belum ada</span>
                  )}
                </td>
                <td>
                  <select
                    value={t.pembayaran}
                    onChange={(e) => handleUpdate(t.id, 'pembayaran', e.target.value)}
                    style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}>
                    {STATUS_BAYAR.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <select
                    value={t.status}
                    onChange={(e) => handleUpdate(t.id, 'status', e.target.value)}
                    style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}>
                    {STATUS_PROSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>{formatTanggal(t.created_at)}</td>
                <td className="table-actions admin-action-cell">
                  <div className="admin-action-buttons">
                    <Link to={`/admin/pembelian/${t.id}`} className="btn btn-ghost btn-icon" title="Lihat detail" aria-label={`Lihat detail transaksi ${t.id}`}>
                      <i className="bi bi-eye" aria-hidden="true"></i>
                    </Link>
                    <button className="btn btn-ghost btn-icon btn-icon-danger" onClick={() => handleHapus(t.id)} title="Hapus transaksi" aria-label={`Hapus transaksi ${t.id}`}>
                      <i className="bi bi-trash3" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}