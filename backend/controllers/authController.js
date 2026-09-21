const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Register user baru (otomatis role: pembeli, kecuali diisi manual)
const register = async (req, res, next) => {
  try {
    const { nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, passwd } = req.body;

    if (!nama_d || !alamat || !phone || !email || !uname || !passwd) {
      return res.status(400).json({ message: 'Nama, alamat, nomor telepon, email, username, dan password wajib diisi' });
    }

    const existingEmail = await UserModel.getByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const existingUname = await UserModel.getByUsername(uname);
    if (existingUname) {
      return res.status(409).json({ message: 'Username sudah dipakai' });
    }

    const hashedPasswd = await bcrypt.hash(passwd, 10);
    const foto = req.file ? req.file.filename : '';

    const id = await UserModel.create({
      nama_d,
      nama_b: nama_b || '',
      kelamin: kelamin || '',
      lahir: lahir || '2000-01-01',
      alamat: alamat || '',
      phone: phone || '',
      email,
      role: 'pembeli',
      uname,
      passwd: hashedPasswd,
      foto
    });

    res.status(201).json({ message: 'Registrasi berhasil', id });
  } catch (err) {
    next(err);
  }
};

// Login pakai credential (email atau username) + password
const login = async (req, res, next) => {
  try {
    const { credential, passwd } = req.body;

    if (!credential || !passwd) {
      return res.status(400).json({ message: 'Email/username dan password wajib diisi' });
    }

    let user = await UserModel.getByEmail(credential);
    if (!user) {
      user = await UserModel.getByUsername(credential);
    }
    if (!user) {
      return res.status(401).json({ message: 'Email/username atau password salah' });
    }

    const isMatch = await bcrypt.compare(passwd, user.passwd);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email/username atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama_d: user.nama_d,
        nama_b: user.nama_b,
        alamat: user.alamat,
        phone: user.phone,
        email: user.email,
        role: user.role,
        uname: user.uname,
        foto: user.foto
      }
    });
  } catch (err) {
    next(err);
  }
};

// Ambil profil user yang sedang login (butuh token, req.user diisi middleware verifyToken)
const getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.getById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await UserModel.getById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const { nama_d, nama_b, kelamin, lahir, alamat, phone, passwd_lama, passwd_baru } = req.body;
    if (!nama_d || !alamat || !phone) {
      return res.status(400).json({ message: 'Nama, alamat, dan nomor telepon wajib diisi' });
    }

    if (passwd_baru) {
      if (!passwd_lama) {
        return res.status(400).json({ message: 'Password lama wajib diisi' });
      }
      const account = await UserModel.getByEmail(user.email);
      const validPassword = await bcrypt.compare(passwd_lama, account.passwd);
      if (!validPassword) {
        return res.status(400).json({ message: 'Password lama salah' });
      }
      if (passwd_baru.length < 6) {
        return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
      }
      await UserModel.updatePassword(req.user.id, await bcrypt.hash(passwd_baru, 10));
    }

    await UserModel.update(req.user.id, {
      nama_d,
      nama_b: nama_b || '',
      kelamin: kelamin || '',
      lahir: lahir || '2000-01-01',
      alamat,
      phone,
      foto: null,
    });

    res.json(await UserModel.getById(req.user.id));
  } catch (err) {
    next(err);
  }
};

// Admin: lihat semua user
const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Admin: buat user baru (bisa set role manual)
const createUserAdmin = async (req, res, next) => {
  try {
    const { nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, passwd } = req.body;

    if (!nama_d || !email || !uname || !passwd) {
      return res.status(400).json({ message: 'Nama, email, username, dan password wajib diisi' });
    }

    const hashedPasswd = await bcrypt.hash(passwd, 10);
    const foto = req.file ? req.file.filename : '';

    const id = await UserModel.create({
      nama_d,
      nama_b: nama_b || '',
      kelamin: kelamin || '',
      lahir: lahir || '2000-01-01',
      alamat: alamat || '',
      phone: phone || '',
      email,
      role: role || 'pembeli',
      uname,
      passwd: hashedPasswd,
      foto
    });

    res.status(201).json({ message: 'User berhasil dibuat', id });
  } catch (err) {
    next(err);
  }
};

// Admin: update data user (termasuk role, email, uname)
const updateUserAdmin = async (req, res, next) => {
  try {
    const foto = req.file ? req.file.filename : null;
    const affected = await UserModel.adminUpdate(req.params.id, { ...req.body, foto });
    if (!affected) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ message: 'User berhasil diupdate' });
  } catch (err) {
    next(err);
  }
};

// Admin: hapus user
const deleteUserAdmin = async (req, res, next) => {
  try {
    const affected = await UserModel.delete(req.params.id);
    if (!affected) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin
};