export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tokobatik13.vercel.app';

export const SITE = {
  logo_toko: '',
  nama_toko: 'Girindra',
  tentang: 'Batik tulis & cap asli buatan tangan pengrajin Pekalongan - kemeja, dress, kain, hingga aksesoris batik.',
  foto_banner: '',
  alamat_toko: 'JETIS-BEDOHO-SOOKO-PONOROGO',
  email_toko: 'halo@girindra.id',
  tlp_toko: 6281234567890,
  bank: 'BCA 1234567890 A.N. Girindra',
  jam_buka: 8,
  jam_tutup: 20,
  logo_wa: '',
  logo_ig: '',
  logo_fb: '',
  link_wa: 'https://wa.me/6281234567890',
  link_ig: 'https://instagram.com/grndraprt',
};

export const PUBLIC_NAV = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/produk', label: 'Katalog' },
  { to: '/artikel', label: 'Cerita Batik' },
];

export const KELAMIN = ['Laki-laki', 'Perempuan'];

export const KATEGORI_PRODUK = [
  'Kemeja Batik',
  'Dress Batik',
  'Kain Batik',
  'Sarung Batik',
];

export const METODE_BAYAR = ['Bank Transfer', 'E-Wallet'];
export const PAYMENT_DETAILS = {
  'Bank Transfer': {
    provider: 'BCA',
    account: '1234567890',
    holder: 'Girindra',
  },
  'E-Wallet': {
    provider: 'GoPay / OVO / DANA',
    account: '6281234567890',
    holder: 'Girindra',
  },
};
export const SHIPPING = [];
export const STATUS_PROSES = ['Tertunda', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
export const STATUS_BAYAR = ['Belum', 'Dibayar'];