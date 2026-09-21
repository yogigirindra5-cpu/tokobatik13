import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { SITE, PUBLIC_NAV } from "../../constants.js";

export default function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const totalItem = items.reduce((sum, item) => sum + item.jumlah, 0);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  // NB: asumsi field role ada di user.role — ganti kalau nama field di AuthContext beda
  const isAdmin = user?.role === "admin";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo-toko">{SITE.nama_toko}</Link>

        <nav className="header-nav d-none d-lg-flex">
          {PUBLIC_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-right">
          <Link to="/keranjang" className="header-cart">
            🛒
            {totalItem > 0 && <span className="cart-badge">{totalItem}</span>}
          </Link>

          <div className="header-auth">
            {user ? (
              <div className="header-user" ref={dropdownRef}>
                <button
                  type="button"
                  className="header-user-btn"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <span className="header-user-avatar">👤</span>
                  <span className="header-user-name">{user.nama_d || user.uname}</span>
                  <span className="header-user-caret">{dropdownOpen ? "▲" : "▼"}</span>
                </button>

                {dropdownOpen && (
                  <div className="header-dropdown">
                    {isAdmin ? (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}>Dashboard Admin</Link>
                    ) : (
                      <>
                        <Link to="/pembeli/profil" onClick={() => setDropdownOpen(false)}>Profil Saya</Link>
                        <Link to="/pembeli/pesanan" onClick={() => setDropdownOpen(false)}>Pesanan Saya</Link>
                      </>
                    )}
                    <button type="button" onClick={handleLogout}>Keluar</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-accent btn-sm">Masuk</Link>
                <Link to="/daftar" className="btn btn-accent btn-sm">Daftar</Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="header-burger d-lg-none"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="header-mobile-nav d-lg-none">
          {PUBLIC_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              {item.label}
            </NavLink>
          ))}
          {!user && (
            <div className="header-auth mobile">
              <Link to="/login" className="btn btn-outline-accent btn-sm" onClick={() => setMenuOpen(false)}>Masuk</Link>
              <Link to="/daftar" className="btn btn-accent btn-sm" onClick={() => setMenuOpen(false)}>Daftar</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}