import { useEffect, useState } from 'react';
import { apiFetch, formatTanggal } from '../../utils.js';
import { KELAMIN } from '../../constants.js';

const ROLE = ['pembeli', 'admin'];

export default function ListUser() {
  const [userList, setUserList] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    nama_d: '', nama_b: '', kelamin: KELAMIN[0], lahir: '', alamat: '',
    phone: '', email: '', role: 'pembeli', uname: '', passwd: '',
  });
  const [error, setError] = useState('');

  const muatUser = () => {
    setStatus('loading');
    apiFetch('/auth/users')
      .then((data) => {
        setUserList(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => { muatUser(); }, []);

  const bukaEdit = (u) => {
    setEditId(u.id);
    setForm({
      nama_d: u.nama_d, nama_b: u.nama_b, kelamin: u.kelamin,
      lahir: u.lahir ? u.lahir.slice(0, 10) : '', alamat: u.alamat,
      phone: u.phone, email: u.email, role: u.role, uname: u.uname, passwd: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { passwd, ...payload } = form; // backend belum support ganti password lewat endpoint ini
      await apiFetch(`/auth/users/${editId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setShowModal(false);
      muatUser();
    } catch (err) {
      setError(err.data?.message || 'Gagal menyimpan data user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      await apiFetch(`/auth/users/${id}`, { method: 'DELETE' });
      muatUser();
    } catch (err) {
      alert(err.data?.message || 'Gagal menghapus user');
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <span style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>Kelola akun pengguna</span>
      </div>

      <div className="table-wrap">
        <table className="admin-table admin-user-table">
          <thead>
            <tr><th>Nama</th><th>Username</th><th>Email</th><th>Role</th><th>Terdaftar</th><th className="admin-action-heading">Aksi</th></tr>
          </thead>
          <tbody>
            {status === 'loading' && <tr><td colSpan={6} className="loading-row">Memuat...</td></tr>}
            {status === 'error' && <tr><td colSpan={6} className="loading-row">Gagal memuat data</td></tr>}
            {status === 'ready' && userList.length === 0 && (
              <tr><td colSpan={6} className="loading-row">Belum ada user</td></tr>
            )}
            {status === 'ready' && userList.map((u) => (
              <tr key={u.id}>
                <td>{u.nama_d} {u.nama_b}</td>
                <td>{u.uname}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{formatTanggal(u.created_at)}</td>
                <td className="table-actions admin-action-cell">
                  <button className="btn btn-ghost btn-icon" onClick={() => bukaEdit(u)} title="Edit user" aria-label={`Edit user ${u.uname}`}>
                    <i className="bi bi-pencil-square" aria-hidden="true"></i>
                  </button>
                  <button className="btn btn-ghost btn-icon btn-icon-danger" onClick={() => handleDelete(u.id)} title="Hapus user" aria-label={`Hapus user ${u.uname}`}>
                    <i className="bi bi-trash3" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop show">
          <div className="modal">
            <div className="modal-head">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error show">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="nama_d">Nama Depan</label>
                  <input type="text" id="nama_d" name="nama_d" required value={form.nama_d} onChange={handleChange} />
                </div>
                <div className="field">
                  <label htmlFor="nama_b">Nama Belakang</label>
                  <input type="text" id="nama_b" name="nama_b" required value={form.nama_b} onChange={handleChange} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="kelamin">Jenis Kelamin</label>
                  <select id="kelamin" name="kelamin" value={form.kelamin} onChange={handleChange}>
                    {KELAMIN.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="lahir">Tanggal Lahir</label>
                  <input type="date" id="lahir" name="lahir" required value={form.lahir} onChange={handleChange} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="alamat">Alamat</label>
                <textarea id="alamat" name="alamat" required value={form.alamat} onChange={handleChange}></textarea>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="phone">Nomor HP</label>
                  <input type="tel" id="phone" name="phone" required value={form.phone} onChange={handleChange} />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" required value={form.email} onChange={handleChange} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="uname">Username</label>
                  <input type="text" id="uname" name="uname" required value={form.uname} onChange={handleChange} />
                </div>
                <div className="field">
                  <label htmlFor="role">Role</label>
                  <select id="role" name="role" value={form.role} onChange={handleChange}>
                    {ROLE.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block">Simpan User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}