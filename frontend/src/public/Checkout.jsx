// src/pages/Checkout.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, METODE_BAYAR, PAYMENT_DETAILS } from '../constants.js';
import { getToken, formatRupiah, getImageUrl } from '../utils.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const metodePembayaran = METODE_BAYAR.length ? METODE_BAYAR : ['Bank Transfer', 'E-Wallet'];

const detailMetode = {
  'Bank Transfer': { icon: 'bi-bank', description: 'Transfer ke rekening toko' },
  'E-Wallet': { icon: 'bi-wallet2', description: 'Bayar melalui dompet digital' },
};

function validateCheckout(user, selectedItems, metode) {
  if (!user?.nama_d?.trim()) return 'Lengkapi nama depan di profil sebelum checkout.';
  const phone = user?.phone == null ? '' : String(user.phone).trim();
  if (!phone) return 'Lengkapi nomor telepon di profil sebelum checkout.';
  if (!/^[0-9+\-\s()]{8,20}$/.test(phone)) {
    return 'Masukkan nomor telepon yang valid di profil sebelum checkout.';
  }
  if (!user?.alamat?.trim()) return 'Lengkapi alamat di profil sebelum checkout.';
  if (!metodePembayaran.includes(metode)) return 'Pilih metode pembayaran yang tersedia.';
  if (selectedItems.some((item) => !Number.isInteger(item.jumlah) || item.jumlah < 1)) {
    return 'Jumlah produk tidak valid. Silakan perbarui keranjang terlebih dahulu.';
  }

  return '';
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedItems, removeSelectedItems } = useCart();

  const [metode, setMetode] = useState(metodePembayaran[0]);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!selectedItems.length) {
    return (
      <div className="empty-state">
        <h3>Belum ada produk yang dipilih</h3>
        <p>Pilih produk yang ingin dibeli dari keranjang terlebih dahulu.</p>
        <Link to="/keranjang" className="btn btn-accent">Kembali ke Keranjang</Link>
      </div>
    );
  }

  const ongkir = 0;
  const totalHarga = selectedItems.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
  const total = totalHarga + ongkir;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateCheckout(user, selectedItems, metode);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const transaksi = [];
      for (const item of selectedItems) {
        const res = await fetch(`${API_BASE_URL}/api/transaksi`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            id_produk: item.id_produk,
            jumlah: item.jumlah,
            metode_pembayaran: metode,
            catatan,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal membuat transaksi');
        transaksi.push(data);
      }

      removeSelectedItems();
      navigate(`/pembeli/transaksi/${transaksi[0].id_transaksi}`, {
        state: { message: 'Transaksi berhasil dibuat, silakan lakukan pembayaran' },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-breadcrumb">
          <Link to="/keranjang">&larr; Kembali ke keranjang</Link>
        </div>

        <h2 className="checkout-title">Checkout</h2>

        {error && <div className="checkout-alert">{error}</div>}

        <div className="checkout-grid">
          <div className="checkout-main">
            <form onSubmit={handleSubmit} id="checkout-form">
              <div className="checkout-card">
                <h3 className="checkout-card-title">1. Data Penerima</h3>
                <p className="text-muted mb-2">Data penerima dan alamat diambil dari profil akun.</p>
                <p className="mb-1"><strong>{user?.nama_d}</strong> &middot; {user?.phone}</p>
                <p className="mb-0">{user?.alamat}</p>
                {!user?.alamat && (
                  <p className="text-danger small mt-2 mb-0">Lengkapi alamat di profil sebelum checkout.</p>
                )}
              </div>

              <div className="checkout-card">
                <h3 className="checkout-card-title">2. Pembayaran</h3>
                <div className="payment-options">
                  {metodePembayaran.map((m) => (
                    <label key={m} className={`payment-option ${metode === m ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="metode"
                        value={m}
                        checked={metode === m}
                        onChange={(e) => setMetode(e.target.value)}
                      />
                      <span className="payment-option-icon" aria-hidden="true">
                        <i className={`bi ${detailMetode[m]?.icon || 'bi-credit-card'}`}></i>
                      </span>
                      <span className="payment-option-copy">
                        <strong>{m}</strong>
                        <small>{detailMetode[m]?.description || 'Metode pembayaran tersedia'}</small>
                      </span>
                      <i className="bi bi-check-circle-fill payment-option-check" aria-hidden="true"></i>
                    </label>
                  ))}
                </div>
                {PAYMENT_DETAILS[metode] && (
                  <div className="payment-details">
                    <div className="payment-details-heading">
                      <i className="bi bi-info-circle" aria-hidden="true"></i>
                      Detail pembayaran
                    </div>
                    <div className="payment-details-row">
                      <span>{PAYMENT_DETAILS[metode].provider}</span>
                      <strong>{PAYMENT_DETAILS[metode].account}</strong>
                    </div>
                    <div className="payment-details-holder">
                      a.n. {PAYMENT_DETAILS[metode].holder}
                    </div>
                  </div>
                )}
              </div>

              <div className="checkout-card">
                <h3 className="checkout-card-title">3. Catatan (opsional)</h3>
                <div className="checkout-field" style={{ marginBottom: 0 }}>
                  <textarea
                    rows={2}
                    placeholder="Tulis pesan untuk penjual, misalnya request warna atau ukuran"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="checkout-side">
            <div className="checkout-card checkout-summary">
              <h3 className="checkout-card-title">Ringkasan Pesanan</h3>

              <div className="summary-item-list">
                {selectedItems.map((item) => (
                  <div key={item.id_produk} className="summary-item">
                    <div className="summary-thumb">
                      <img src={getImageUrl(item.gambar)} alt={item.nama_produk} />
                    </div>
                    <div className="summary-info">
                      <div className="summary-name">{item.nama_produk}</div>
                      <div className="summary-price">
                        {item.jumlah} x {formatRupiah(item.harga)}
                      </div>
                    </div>
                    <div className="summary-subtotal">
                      {formatRupiah(item.harga * item.jumlah)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatRupiah(totalHarga)}</span>
              </div>
              <div className="summary-row">
                <span>Ongkos Kirim</span>
                <span>{ongkir === 0 ? 'Dihitung admin' : formatRupiah(ongkir)}</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="btn btn-accent w-100 checkout-submit"
                disabled={submitting}
              >
                {submitting ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}