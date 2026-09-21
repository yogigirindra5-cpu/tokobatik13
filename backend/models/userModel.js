const db = require('../config/db');

const UserModel = {
  getAll: async () => {
    const [rows] = await db.query(
      'SELECT id, nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, foto, created_at FROM users'
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      'SELECT id, nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, foto, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  getByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  getByUsername: async (uname) => {
    const [rows] = await db.query('SELECT * FROM users WHERE uname = ?', [uname]);
    return rows[0];
  },

  create: async (data) => {
    const {
      nama_d, nama_b, kelamin, lahir, alamat, phone,
      email, role, uname, passwd, foto
    } = data;

    const [result] = await db.query(
      `INSERT INTO users
        (nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, passwd, foto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama_d, nama_b, kelamin, lahir, alamat, phone, email, role || 'pembeli', uname, passwd, foto || '']
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { nama_d, nama_b, kelamin, lahir, alamat, phone, foto } = data;
    const [result] = await db.query(
      `UPDATE users
       SET nama_d = ?, nama_b = ?, kelamin = ?, lahir = ?, alamat = ?, phone = ?, foto = COALESCE(?, foto)
       WHERE id = ?`,
      [nama_d, nama_b, kelamin, lahir, alamat, phone, foto, id]
    );
    return result.affectedRows;
  },

  adminUpdate: async (id, data) => {
    const {
      nama_d, nama_b, kelamin, lahir, alamat, phone,
      email, role, uname, foto
    } = data;
    const [result] = await db.query(
      `UPDATE users
       SET nama_d = ?, nama_b = ?, kelamin = ?, lahir = ?, alamat = ?, phone = ?,
           email = ?, role = ?, uname = ?, foto = COALESCE(?, foto)
       WHERE id = ?`,
      [nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, foto, id]
    );
    return result.affectedRows;
  },

  updatePassword: async (id, hashedPassword) => {
    const [result] = await db.query('UPDATE users SET passwd = ? WHERE id = ?', [hashedPassword, id]);
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = UserModel;