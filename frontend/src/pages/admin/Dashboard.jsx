import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../constants.js';
import { getToken, formatRupiah, formatTanggal } from '../../utils.js';

const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function buatLaporanBulanan(transaksi) {
  const sekarang = new Date();
  const laporan = Array.from({ length: 6 }, (_, index) => {
    const tanggal = new Date(sekarang.getFullYear(), sekarang.getMonth() - (5 - index), 1);
    return {
      key: `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, '0')}`,
      label: `${namaBulan[tanggal.getMonth()]} ${String(tanggal.getFullYear()).slice(-2)}`,
      pendapatan: 0,
      traffic: 0,
    };
  });

  const laporanByKey = new Map(laporan.map((item) => [item.key, item]));
  transaksi.forEach((item) => {
    const tanggal = new Date(item.created_at);
    if (Number.isNaN(tanggal.getTime())) return;

    const key = `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, '0')}`;
    const bulan = laporanByKey.get(key);
    if (!bulan) return;

    bulan.traffic += 1;
    if (item.pembayaran === 'Dibayar') {
      bulan.pendapatan += Number(item.total_harga) || 0;
    }
  });

  return laporan;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };

    Promise.all([
      fetch(`${API_BASE_URL}/produk`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/transaksi`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/auth/users`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/artikel`).then((r) => r.json()),
    ])
      .then(([produk, transaksi, users, artikel]) => {
        const produkTerjual = transaksi
          .filter((t) => t.pembayaran === 'Dibayar')
          .reduce((sum, t) => sum + Number(t.jumlah), 0);

        const pendapatan = transaksi
          .filter((t) => t.pembayaran === 'Dibayar')
          .reduce((sum, t) => sum + Number(t.total_harga), 0);

        setStats({
          pembeli_terdaftar: users.filter((u) => u.role === 'pembeli').length,
          total_transaksi: transaksi.length,
          produk_di_katalog: produk.filter((p) => p.status_produk === 'Tersedia').length,
          produk_terjual: produkTerjual,
          total_artikel: artikel.length,
          pesanan_aktif: transaksi.filter((t) => ['Tertunda', 'Diproses', 'Dikirim'].includes(t.status)).length,
          belum_dibayar: transaksi.filter((t) => t.pembayaran === 'Belum').length,
          selesai: transaksi.filter((t) => t.status === 'Selesai').length,
          pendapatan,
          laporan_bulanan: buatLaporanBulanan(transaksi),
          transaksi_terbaru: transaksi.slice(0, 5),
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="empty-state">
        <h3>Gagal memuat data</h3>
        <p>{error}</p>
      </div>
    );
  }
  if (!stats) return <p className="loading-row">Memuat statistik...</p>;

  return (
    <div>
      <div className="section-head">
        <h2>Dashboard Admin</h2>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">Pembeli Terdaftar</div>
          <div className="stat-card-value">{stats.pembeli_terdaftar}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Transaksi</div>
          <div className="stat-card-value">{stats.total_transaksi}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Produk di Katalog</div>
          <div className="stat-card-value">{stats.produk_di_katalog}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Produk Terjual</div>
          <div className="stat-card-value">{stats.produk_terjual}</div>
        </div>
      </div>

      <div className="stat-grid" style={{ marginTop: 18 }}>
        <div className="stat-card">
          <div className="stat-card-label">Artikel</div>
          <div className="stat-card-value">{stats.total_artikel}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Pesanan Aktif</div>
          <div className="stat-card-value">{stats.pesanan_aktif}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Belum Dibayar</div>
          <div className="stat-card-value">{stats.belum_dibayar}</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-card-label">Selesai</div>
          <div className="stat-card-value">{stats.selesai}</div>
        </div>
      </div>

      <div className="stat-card stat-card-success" style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 4 }}>Pendapatan (Dibayar)</h3>
        <p className="mt-0">Total dari pesanan dengan status pembayaran &quot;Dibayar&quot;.</p>
        <div className="stat-card-value stat-card-value-lg">
          {formatRupiah(stats.pendapatan)}
        </div>
      </div>

      <div className="report-grid">
        <section className="report-card">
          <div className="report-card-head">
            <div>
              <h3>Pendapatan Per Bulan</h3>
              <p>Transaksi yang sudah dibayar</p>
            </div>
            <i className="bi bi-bar-chart-line" aria-hidden="true"></i>
          </div>
          <div className="report-chart">
            {stats.laporan_bulanan.map((bulan) => {
              const pendapatanMaksimal = Math.max(...stats.laporan_bulanan.map((item) => item.pendapatan), 1);
              const tinggi = bulan.pendapatan ? Math.max((bulan.pendapatan / pendapatanMaksimal) * 100, 8) : 3;
              return (
                <div className="report-column" key={`pendapatan-${bulan.key}`}>
                  <span className="report-value">{bulan.pendapatan ? formatRupiah(bulan.pendapatan) : '-'}</span>
                  <div className="report-bar-track">
                    <div className="report-bar report-bar-income" style={{ height: `${tinggi}%` }}></div>
                  </div>
                  <span className="report-label">{bulan.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="report-card">
          <div className="report-card-head">
            <div>
              <h3>Traffic Pembelian</h3>
              <p>Jumlah pesanan yang masuk per bulan</p>
            </div>
            <i className="bi bi-graph-up-arrow" aria-hidden="true"></i>
          </div>
          <div className="report-chart">
            {stats.laporan_bulanan.map((bulan) => {
              const trafficMaksimal = Math.max(...stats.laporan_bulanan.map((item) => item.traffic), 1);
              const tinggi = bulan.traffic ? Math.max((bulan.traffic / trafficMaksimal) * 100, 8) : 3;
              return (
                <div className="report-column" key={`traffic-${bulan.key}`}>
                  <span className="report-value">{bulan.traffic}</span>
                  <div className="report-bar-track">
                    <div className="report-bar report-bar-traffic" style={{ height: `${tinggi}%` }}></div>
                  </div>
                  <span className="report-label">{bulan.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="section-head" style={{ marginTop: 40 }}>
        <h3>Transaksi Terbaru</h3>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Pembeli</th><th>Produk</th><th>Status</th><th>Tanggal</th></tr>
          </thead>
          <tbody>
            {stats.transaksi_terbaru.length === 0 && (
              <tr><td colSpan={4} className="loading-row">Belum ada transaksi</td></tr>
            )}
            {stats.transaksi_terbaru.map((t) => (
              <tr key={t.id}>
                <td>{t.nama_pembeli || t.uname}</td>
                <td>{t.nama_produk}</td>
                <td><span className={`status-badge status-badge-${t.status}`}>{t.status}</span></td>
                <td>{formatTanggal(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}