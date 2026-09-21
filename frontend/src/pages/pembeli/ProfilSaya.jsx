import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../constants.js';
import { getToken } from '../../utils.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProfilSaya() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    nama_d: '', nama_b: '', kelamin: '', lahir: '', alamat: '', phone: '',
  });
  const [passwdLama, setPasswdLama] = useState('');
  const [passwdBaru, setPasswdBaru] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pesan, setPesan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        nama_d: user.nama_d || '',
        nama_b: user.nama_b || '',
        kelamin: user.kelamin || '',
        lahir: user.lahir ? user.lahir.slice(0, 10) : '',
        alamat: user.alamat || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPesan('');
    setSubmitting(true);

    try {
      const body = { ...form };
      if (passwdBaru) {
        body.passwd_lama = passwdLama;
        body.passwd_baru = passwdBaru;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memperbarui profil');

      updateUser(data);
      setPesan('Profil berhasil diperbarui');
      setPasswdLama('');
      setPasswdBaru('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0 64px', maxWidth: 600 }}>
      <h2>Profil Saya</h2>

      {pesan && <div className="alert alert-success show">{pesan}</div>}
      {error && <div className="alert alert-error show">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card" style={{ margin: 0, maxWidth: 'none' }}>
        <div className="field">
          <label>Nama Depan</label>
          <input name="nama_d" value={form.nama_d} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Nama Belakang</label>
          <input name="nama_b" value={form.nama_b} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Jenis Kelamin</label>
          <select name="kelamin" value={form.kelamin} onChange={handleChange}>
            <option value="">Pilih</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div className="field">
          <label>Tanggal Lahir</label>
          <input type="date" name="lahir" value={form.lahir} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Alamat</label>
          <textarea name="alamat" rows={3} value={form.alamat} onChange={handleChange} />
        </div>
        <div className="field">
          <label>No HP</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>

        <hr style={{ margin: '20px 0' }} />
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>Ubah password (opsional)</p>
        <div className="field">
          <label>Password Lama</label>
          <input type="password" value={passwdLama} onChange={(e) => setPasswdLama(e.target.value)} />
        </div>
        <div className="field">
          <label>Password Baru</label>
          <input type="password" value={passwdBaru} onChange={(e) => setPasswdBaru(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-accent btn-block" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}