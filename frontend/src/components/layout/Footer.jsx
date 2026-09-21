import { Link } from 'react-router-dom';
import { SITE } from '../../constants.js';

export default function Footer() {
  const tahun = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>{SITE.nama_toko}</h4>
            <p>{SITE.tentang}</p>
          </div>
          <div>
            <h4>Tautan</h4>
            <ul>
              <li><Link to="/">Beranda</Link></li>
              <li><Link to="/produk">Katalog</Link></li>
              <li><Link to="/artikel">Cerita Batik</Link></li>
            </ul>
          </div>
          <div>
            <h4>Kontak</h4>
            <ul>
              <li>
                <i className="bi bi-geo-alt-fill" aria-hidden="true"></i> {SITE.alamat_toko}
              </li>
              <li>
                <a href={`mailto:${SITE.email_toko}`}>
                  <i className="bi bi-envelope-fill" aria-hidden="true"></i> {SITE.email_toko}
                </a>
              </li>
              <li>
                <a href={`tel:+${SITE.tlp_toko}`}>
                  <i className="bi bi-telephone-fill" aria-hidden="true"></i> {SITE.tlp_toko}
                </a>
              </li>
              <li>
                <a href={SITE.link_wa} target="_blank" rel="noreferrer">
                  <i className="bi bi-whatsapp" aria-hidden="true"></i> WhatsApp
                </a>
              </li>
              <li>
                <a href={SITE.link_ig} target="_blank" rel="noreferrer">
                  <i className="bi bi-instagram" aria-hidden="true"></i> @grndraprt
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {tahun} {SITE.nama_toko}. Semua hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}