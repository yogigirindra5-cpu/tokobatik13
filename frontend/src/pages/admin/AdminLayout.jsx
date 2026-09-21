import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const menu = [
    { to: '/admin', label: 'Dashboard', icon: 'bi-grid-1x2-fill', end: true },
    { to: '/admin/produk', label: 'Kelola Produk', icon: 'bi-bag-fill' },
    { to: '/admin/kategori', label: 'Kelola Kategori', icon: 'bi-tags-fill' },
    { to: '/admin/pembelian', label: 'Kelola Pembelian', icon: 'bi-receipt' },
    { to: '/admin/artikel', label: 'Kelola Artikel', icon: 'bi-newspaper' },
    { to: '/admin/user', label: 'Kelola User', icon: 'bi-people-fill' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <h3>Admin Panel</h3>
          <p className="admin-sidebar-user">{user?.nama_d}</p>

          <nav>
            {menu.map((item) => {
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link key={`${item.to}-${item.label}`} to={item.to} className={isActive ? 'active' : ''}>
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <button className="admin-logout-btn" onClick={logout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Keluar</span>
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}