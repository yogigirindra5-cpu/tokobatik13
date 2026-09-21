const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// ======================================================
// CREATE TOKEN
// ======================================================

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      uname: user.uname,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

// ======================================================
// REGISTER
// POST /api/auth/register
// ======================================================

async function register(req, res) {
  try {
    const {
      nama_d,
      nama_b,
      kelamin,
      lahir,
      alamat,
      phone,
      email,
      uname,
      passwd,
      role,
    } = req.body;

    if (!email || !uname || !passwd) {
      return res.status(400).json({
        success: false,
        message: "Email, username, dan password wajib diisi",
      });
    }

    // Cek username/email
    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
         OR uname = $2
      LIMIT 1
      `,
      [email, uname]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email atau username sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(
      passwd,
      10
    );

    const foto = req.file
      ? req.file.filename
      : null;

    const userRole =
      role === "admin"
        ? "admin"
        : "pembeli";

    const result = await pool.query(
      `
      INSERT INTO users (
        nama_d,
        nama_b,
        kelamin,
        lahir,
        alamat,
        phone,
        email,
        role,
        uname,
        passwd,
        foto
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11
      )
      RETURNING
        id,
        nama_d,
        nama_b,
        kelamin,
        lahir,
        alamat,
        phone,
        email,
        role,
        uname,
        foto
      `,
      [
        nama_d || null,
        nama_b || null,
        kelamin || null,
        lahir || null,
        alamat || null,
        phone || null,
        email,
        userRole,
        uname,
        hashedPassword,
        foto,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message:
          "Email atau username sudah digunakan",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal melakukan registrasi",
      error: error.message,
    });
  }
}

// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================

async function login(req, res) {
  try {
    const {
      credential,
      uname,
      passwd,
    } = req.body;

    const loginCredential =
      credential || uname;

    if (!loginCredential || !passwd) {
      return res.status(400).json({
        success: false,
        message:
          "Email/username dan password wajib diisi",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE uname = $1
         OR email = $1
      LIMIT 1
      `,
      [loginCredential]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Email/username atau password salah",
      });
    }

    const user = result.rows[0];

    const passwordValid =
      await bcrypt.compare(
        passwd,
        user.passwd
      );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Email/username atau password salah",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        nama_d: user.nama_d,
        nama_b: user.nama_b,
        kelamin: user.kelamin,
        lahir: user.lahir,
        alamat: user.alamat,
        phone: user.phone,
        email: user.email,
        uname: user.uname,
        role: user.role,
        foto: user.foto,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal melakukan login",
      error: error.message,
    });
  }
}

// ======================================================
// GET PROFILE
// GET /api/auth/profile
// ======================================================

async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        nama_d,
        nama_b,
        kelamin,
        lahir,
        alamat,
        phone,
        email,
        role,
        uname,
        foto
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil profile",
      error: error.message,
    });
  }
}

// ======================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ======================================================

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;

    const {
      nama_d,
      nama_b,
      kelamin,
      lahir,
      alamat,
      phone,
      email,
      uname,
      passwd,
    } = req.body;

    const foto = req.file
      ? req.file.filename
      : null;

    // Ambil user lama
    const existing = await pool.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const oldUser = existing.rows[0];

    let hashedPassword =
      oldUser.passwd;

    if (passwd && passwd.trim()) {
      hashedPassword =
        await bcrypt.hash(passwd, 10);
    }

    const finalEmail =
      email || oldUser.email;

    const finalUname =
      uname || oldUser.uname;

    const finalFoto =
      foto || oldUser.foto;

    const result = await pool.query(
      `
      UPDATE users
      SET
        nama_d = $1,
        nama_b = $2,
        kelamin = $3,
        lahir = $4,
        alamat = $5,
        phone = $6,
        email = $7,
        uname = $8,
        passwd = $9,
        foto = $10
      WHERE id = $11
      RETURNING
        id,
        nama_d,
        nama_b,
        kelamin,
        lahir,
        alamat,
        phone,
        email,
        role,
        uname,
        foto
      `,
      [
        nama_d ?? oldUser.nama_d,
        nama_b ?? oldUser.nama_b,
        kelamin ?? oldUser.kelamin,
        lahir ?? oldUser.lahir,
        alamat ?? oldUser.alamat,
        phone ?? oldUser.phone,
        finalEmail,
        finalUname,
        hashedPassword,
        finalFoto,
        userId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Profile berhasil diperbarui",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message:
          "Email atau username sudah digunakan",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui profile",
      error: error.message,
    });
  }
}

// ======================================================
// GET ALL USERS
// GET /api/auth/users
// ADMIN
// ======================================================

async function getAllUsers(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        nama_d,
        nama_b,
        kelamin,
        lahir,
        alamat,
        phone,
        email,
        role,
        uname,
        foto
      FROM users
      ORDER BY id DESC
      `
    );

    return res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data user",
      error: error.message,
    });
  }
}

// ======================================================
// CREATE USER ADMIN
// POST /api/auth/users
// ======================================================

async function createUserAdmin(req, res) {
  try {
    const {
      nama_d,
      nama_b,
      kelamin,
      lahir,
      alamat,
      phone,
      email,
      uname,
      passwd,
      role,
    } = req.body;

    if (!email || !uname || !passwd) {
      return res.status(400).json({
        success: false,
        message:
          "Email, username, dan password wajib diisi",
      });
    }

    const existing = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
         OR uname = $2
      LIMIT 1
      `,
      [email, uname]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Email atau username sudah digunakan",
      });
    }

    const hashedPassword =
      await bcrypt.hash(passwd, 10);

    const foto = req.file
      ? req.file.filename
      : null;

    const userRole =
      role === "admin"
        ? "admin"
        : "pembeli";

    const result = await pool.query(
      `
      INSERT INTO users (
        nama_d,
        nama_b,
        kelamin,
        lahir,
        alamat,
        phone,
        email,
        role,
        uname,
        passwd,
        foto
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11
      )
      RETURNING
        id,
        nama_d,
        nama_b,
        kelamin,
        lahir,
        alamat,
        phone,
        email,
        role,
        uname,
        foto
      `,
      [
        nama_d || null,
        nama_b || null,
        kelamin || null,
        lahir || null,
        alamat || null,
        phone || null,
        email,
        userRole,
        uname,
        hashedPassword,
        foto,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(
      "CREATE USER ADMIN ERROR:",
      error
    );

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message:
          "Email atau username sudah digunakan",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan user",
      error: error.message,
    });
  }
}

// ======================================================
// UPDATE USER ADMIN
// PUT /api/auth/users/:id
// ======================================================

async function updateUserAdmin(req, res) {
  try {
    const { id } = req.params;

    const {
      nama_d,
      nama_b,
      kelamin,
      lahir,
      alamat,
      phone,
      email,
      uname,
      passwd,
      role,
    } = req.body;

    const existing = await pool.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const oldUser = existing.rows[0];

    let hashedPassword =
      oldUser.passwd;

    if (passwd && passwd.trim()) {
      hashedPassword =
        await bcrypt.hash(passwd, 10);
    }

    const foto = req.file
      ? req.file.filename
      : oldUser.foto;

    const result = await pool.query(
      `
      UPDATE users
      SET
        nama_d = $1,
        nama_b = $2,
        kelamin = $3,
        lahir = $4,
        alamat = $5,
        phone = $6,
        email = $7,
        role = $8,
        uname = $9,
        passwd = $10,
        foto = $11
      WHERE id = $12
      RETURNING
        id,
        nama_d,
        nama_b,
        kelamin,
        lahir,
        alamat,
        phone,
        email,
        role,
        uname,
        foto
      `,
      [
        nama_d ?? oldUser.nama_d,
        nama_b ?? oldUser.nama_b,
        kelamin ?? oldUser.kelamin,
        lahir ?? oldUser.lahir,
        alamat ?? oldUser.alamat,
        phone ?? oldUser.phone,
        email ?? oldUser.email,
        role ?? oldUser.role,
        uname ?? oldUser.uname,
        hashedPassword,
        foto,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "User berhasil diperbarui",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(
      "UPDATE USER ADMIN ERROR:",
      error
    );

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message:
          "Email atau username sudah digunakan",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui user",
      error: error.message,
    });
  }
}

// ======================================================
// DELETE USER ADMIN
// DELETE /api/auth/users/:id
// ======================================================

async function deleteUserAdmin(req, res) {
  try {
    const { id } = req.params;

    // Jangan izinkan admin menghapus dirinya sendiri
    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message:
          "Admin yang sedang login tidak dapat menghapus dirinya sendiri",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, uname, email
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User berhasil dihapus",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(
      "DELETE USER ADMIN ERROR:",
      error
    );

    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message:
          "User tidak dapat dihapus karena masih digunakan pada transaksi",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus user",
      error: error.message,
    });
  }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
};