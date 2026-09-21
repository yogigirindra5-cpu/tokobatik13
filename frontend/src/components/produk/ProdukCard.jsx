import { Link } from 'react-router-dom';
import { formatRupiah, getImageUrl } from '../../utils.js';

export default function ProdukCard({ produk, layout = 'grid' }) {
  const habis = produk.status_produk === 'Habis';

  if (layout === 'list') {
    return (
      <Link to={`/produk/${produk.id_produk}`} className="product-list-item">
        <div className="product-list-thumb">
          <img src={getImageUrl(produk.gambar)} alt={produk.nama_produk} />
        </div>
        <div className="product-list-info">
          <span className="product-list-kategori">{produk.kategori}</span>
          <h3>{produk.nama_produk}</h3>
          <p className="text-muted small">{produk.bahan_kain || 'Batik pilihan'}</p>
        </div>
        <div className="product-list-price">
          <span className={`status-chip ${habis ? 'chip-off' : 'chip-ok'}`}>{produk.status_produk}</span>
          <strong>{formatRupiah(produk.harga)}</strong>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/produk/${produk.id_produk}`} className="card product-card h-100 text-decoration-none">
      <div className="position-relative product-thumb">
        <img src={getImageUrl(produk.gambar)} alt={produk.nama_produk} />
        <span className={`badge status-chip position-absolute top-0 end-0 m-2 ${habis ? 'bg-danger' : 'bg-success'}`}>
          {produk.status_produk}
        </span>
        <span className="badge kategori-chip position-absolute bottom-0 start-0 m-2">{produk.kategori}</span>
      </div>
      <div className="card-body">
        <h3 className="h6 mb-1">{produk.nama_produk}</h3>
        <p className="text-muted small mb-3">{produk.bahan_kain || 'Batik pilihan'}</p>
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold text-accent">{formatRupiah(produk.harga)}</span>
          <span className="btn btn-outline-accent btn-sm">Lihat</span>
        </div>
      </div>
    </Link>
  );
}