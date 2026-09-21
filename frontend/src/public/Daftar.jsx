// src/pages/Daftar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KELAMIN } from "../constants.js";
import { useAuth } from "../context/AuthContext.jsx";

const KOSONG = {
  nama_d: "",
  uname: "",
  email: "",
  telepon: "",
  alamat: "",
  jenis_kelamin: "",
  password: "",
  konfirmasi: "",
};

export default function Daftar() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(KOSONG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState(false);

  const ubah = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validasi = () => {
    if (!form.nama_d.trim() || !form.uname.trim() || !form.email.trim() || !form.telepon.trim() || !form.alamat.trim() || !form.password) {
      return "Semua kolom bertanda wajib diisi.";
    }
    if (form.password.length < 6) {
      return "Kata sandi minimal 6 karakter.";
    }
    if (form.password !== form.konfirmasi) {
      return "Konfirmasi kata sandi tidak cocok.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pesan = validasi();
    if (pesan) {
      setError(pesan);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await register({
        nama_d: form.nama_d.trim(),
        uname: form.uname.trim(),
        email: form.email.trim(),
        phone: form.telepon.trim(),
        alamat: form.alamat.trim(),
        kelamin: form.jenis_kelamin,
        passwd: form.password,
      });
      setSukses(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Pendaftaran gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (sukses) {
    return (
      <div className="auth-page">
        <div className="auth-card text-center">
          <div className="auth-sukses-ico">✓</div>
          <h1 className="auth-title">Pendaftaran Berhasil</h1>
          <p className="auth-desc">Akun kamu sudah dibuat. Mengalihkan ke halaman masuk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <span className="detail-eyebrow">Girindra</span>
        <h1 className="auth-title">Buat Akun Baru</h1>
        <p className="auth-desc">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                name="nama_d"
                className="form-control"
                placeholder="Nama lengkap kamu"
                value={form.nama_d}
                onChange={ubah}
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="uname"
                className="form-control"
                placeholder="Username unik"
                value={form.uname}
                onChange={ubah}
                disabled={loading}
              />
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="nama@email.com"
                value={form.email}
                onChange={ubah}
                disabled={loading}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label">No. HP</label>
              <input
                type="tel"
                name="telepon"
                className="form-control"
                placeholder="08xxxxxxxxxx"
                value={form.telepon}
                onChange={ubah}
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Alamat Lengkap</label>
              <textarea
                name="alamat"
                className="form-control"
                rows={3}
                placeholder="Alamat lengkap untuk pengiriman pesanan"
                value={form.alamat}
                onChange={ubah}
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Jenis Kelamin</label>
              <select
                name="jenis_kelamin"
                className="form-select"
                value={form.jenis_kelamin}
                onChange={ubah}
                disabled={loading}
              >
                <option value="">Pilih jenis kelamin</option>
                {KELAMIN.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label">Kata Sandi</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={ubah}
                disabled={loading}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label">Konfirmasi Kata Sandi</label>
              <input
                type="password"
                name="konfirmasi"
                className="form-control"
                placeholder="Ulangi kata sandi"
                value={form.konfirmasi}
                onChange={ubah}
                disabled={loading}
              />
            </div>
          </div>

          {error && <p className="text-danger small mt-3 mb-0">{error}</p>}

          <button type="submit" className="btn btn-accent w-100 mt-4" disabled={loading}>
            {loading ? "Memproses..." : "DAFTAR SEKARANG"}
          </button>
        </form>

        <Link to="/" className="auth-back-link">&larr; Kembali ke Beranda</Link>
      </div>
    </div>
  );
}