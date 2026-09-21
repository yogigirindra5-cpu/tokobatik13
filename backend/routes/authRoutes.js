const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const {
  verifyToken,
  verifyRole,
} = require("../middlewares/authMiddleware");

const upload = require("../config/multer");

console.log("=== CEK AUTH ROUTES ===");
console.log("register:", typeof authController.register);
console.log("login:", typeof authController.login);
console.log("getProfile:", typeof authController.getProfile);
console.log("updateProfile:", typeof authController.updateProfile);
console.log("getAllUsers:", typeof authController.getAllUsers);
console.log("createUserAdmin:", typeof authController.createUserAdmin);
console.log("updateUserAdmin:", typeof authController.updateUserAdmin);
console.log("deleteUserAdmin:", typeof authController.deleteUserAdmin);

console.log("verifyToken:", typeof verifyToken);
console.log("verifyRole:", typeof verifyRole);

console.log("upload:", typeof upload);
console.log(
  "upload.single:",
  typeof upload?.single
);

// ======================================================
// PUBLIC
// ======================================================

router.post(
  "/register",
  upload.single("foto"),
  authController.register
);

router.post(
  "/login",
  authController.login
);

// ======================================================
// PROFILE
// ======================================================

router.get(
  "/profile",
  verifyToken,
  authController.getProfile
);

router.put(
  "/profile",
  verifyToken,
  upload.single("foto"),
  authController.updateProfile
);

// ======================================================
// ADMIN USERS
// ======================================================

router.get(
  "/users",
  verifyToken,
  verifyRole("admin"),
  authController.getAllUsers
);

router.post(
  "/users",
  verifyToken,
  verifyRole("admin"),
  upload.single("foto"),
  authController.createUserAdmin
);

router.put(
  "/users/:id",
  verifyToken,
  verifyRole("admin"),
  upload.single("foto"),
  authController.updateUserAdmin
);

router.delete(
  "/users/:id",
  verifyToken,
  verifyRole("admin"),
  authController.deleteUserAdmin
);

module.exports = router;