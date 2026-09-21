-- =========================================================
-- Database: Toko Pengrajin Batik (Girindra)
-- Import file ini lewat Adminer: klik "Buat database baru" atau
-- masuk ke server (bukan database tertentu), buka tab "SQL command",
-- tempel semua isi file ini, klik Execute. Database dibuat otomatis.
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `toko_batik`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `toko_batik`;

DROP TABLE IF EXISTS `transaksi`;
DROP TABLE IF EXISTS `produk_batik`;
DROP TABLE IF EXISTS `kategori`;
DROP TABLE IF EXISTS `artikel`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nama_d` varchar(50) NOT NULL,
  `nama_b` varchar(50) NOT NULL,
  `kelamin` text NOT NULL,
  `lahir` text NOT NULL,
  `alamat` text NOT NULL,
  `phone` bigint NOT NULL,
  `email` varchar(30) UNIQUE NOT NULL,
  `role` ENUM ('admin', 'pembeli') NOT NULL DEFAULT 'pembeli',
  `uname` varchar(30) UNIQUE NOT NULL,
  `passwd` varchar(256) NOT NULL,
  `foto` varchar(500) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `kategori` (
  `id_kategori` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) UNIQUE NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `kategori` (`nama_kategori`) VALUES
  ('Kemeja Batik'),
  ('Dress Batik'),
  ('Kain Batik'),
  ('Sarung Batik');

CREATE TABLE `produk_batik` (
  `id_produk` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nama_produk` varchar(255) NOT NULL,
  `deskripsi` text NOT NULL,
  `harga` int NOT NULL,
  `stok` int NOT NULL DEFAULT 0,
  `ukuran` varchar(50),
  `bahan_kain` varchar(50),
  `gambar` varchar(500),
  `kategori` ENUM ('Kemeja Batik', 'Dress Batik', 'Kain Batik', 'Sarung Batik') NOT NULL DEFAULT 'Kemeja Batik',
  `status_produk` ENUM ('Tersedia', 'Habis') NOT NULL DEFAULT 'Tersedia',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `transaksi` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `id_pembeli` int NOT NULL,
  `id_produk` int NOT NULL,
  `nama_pembeli` varchar(50),
  `phone_pembeli` bigint,
  `jumlah` int NOT NULL DEFAULT 1,
  `total_harga` int NOT NULL,
  `metode_pembayaran` ENUM ('Bank Transfer', 'E-Wallet') NOT NULL DEFAULT 'Bank Transfer',
  `pembayaran` ENUM ('Belum', 'Dibayar') NOT NULL DEFAULT 'Belum',
  `status` ENUM ('Tertunda', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Tertunda',
  `alamat_kirim` text,
  `catatan` text,
  `foto_bukti` varchar(500),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_transaksi_user` FOREIGN KEY (`id_pembeli`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_transaksi_produk` FOREIGN KEY (`id_produk`) REFERENCES `produk_batik` (`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `artikel` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `judul` varchar(225) NOT NULL,
  `ringkasan` text NOT NULL,
  `isi` text NOT NULL,
  `gambar` varchar(500) NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- Akun admin default, langsung bisa dipakai login setelah import
-- Email   : admin@wastrasoga.id
-- Username: admin
-- Password: admin123   (sudah di-hash pakai bcrypt, JANGAN diubah manual)
-- =========================================================
INSERT INTO `users`
  (`nama_d`, `nama_b`, `kelamin`, `lahir`, `alamat`, `phone`, `email`, `role`, `uname`, `passwd`, `foto`)
VALUES
  ('Admin', 'Girindra', 'Laki-laki', '1995-01-01', 'Pekalongan, Jawa Tengah', 6281234567890,
   'admin@wastrasoga.id', 'admin', 'admin',
   '$2a$10$otF1FtEsaAK7TM1LDaALqexQKKLzjvtE3/d1.bvbXILVa0XSkhhle', '');

SET FOREIGN_KEY_CHECKS = 1;