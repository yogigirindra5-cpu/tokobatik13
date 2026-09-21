// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [credential, setCredential] = useState('');
  const [passwd, setPasswd] = useState('');
  const [showPasswd, setShowPasswd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credential.trim() || !passwd) {
      setError('Email/username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const role = await login(credential.trim(), passwd);
      const tujuan = redirect || location.state?.from || (role === 'admin' ? '/admin' : '/');
      navigate(tujuan, { replace: true });
    } catch (err) {
      setError(err.message || 'Email/username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Masuk ke Akun</h1>
        <p className="auth-desc">
          Belum punya akun?{' '}
          <Link to={redirect ? `/daftar?redirect=${encodeURIComponent(redirect)}` : '/daftar'}>
            Daftar di sini
          </Link>
        </p>

        {location.state?.message && (
          <div className="auth-alert auth-alert-success">{location.state.message}</div>
        )}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="credential">Email atau Username</label>
            <input
              type="text"
              id="credential"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="passwd">Password</label>
            <div className="auth-password-field">
              <input
                type={showPasswd ? 'text' : 'password'}
                id="passwd"
                value={passwd}
                onChange={(e) => setPasswd(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-toggle-eye"
                onClick={() => setShowPasswd((v) => !v)}
              >
                {showPasswd ? 'SEMBUNYIKAN' : 'LIHAT'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-accent w-100" disabled={loading}>
            {loading ? 'MEMPROSES...' : 'MASUK'}
          </button>
        </form>

        <Link to="/" className="auth-back-link">&larr; Kembali ke Beranda</Link>
      </div>
    </div>
  );
}