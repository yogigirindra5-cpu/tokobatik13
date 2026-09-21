import { Routes, Route } from "react-router-dom";

import Home from "../public/Home.jsx";
import Login from "../public/Login.jsx";
import Daftar from "../public/Daftar.jsx";
import ListProduk from "../public/ListProduk.jsx";
import DetailProduk from "../public/DetailProduk.jsx";
import ListArtikelPublic from "../public/ListArtikel.jsx";
import DetailArtikel from "../public/DetailArtikel.jsx";
import Keranjang from "../public/Keranjang.jsx";
import Checkout from "../public/Checkout.jsx";

import RiwayatPesanan from "../pages/pembeli/RiwayatPesanan.jsx";
import DetailPesanan from "../pages/pembeli/DetailPesanan.jsx";
import ProfilSaya from "../pages/pembeli/ProfilSaya.jsx";

import Dashboard from "../pages/admin/Dashboard.jsx";
import ListProdukAdmin from "../pages/admin/ListProduk.jsx";
import ListKategori from "../pages/admin/ListKategori.jsx";
import ListPembelian from "../pages/admin/ListPembelian.jsx";
import DetailPembelian from "../pages/admin/DetailPembelian.jsx";
import ListArtikel from "../pages/admin/ListArtikel.jsx";
import ListUser from "../pages/admin/ListUser.jsx";

import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import AdminLayout from "../pages/admin/AdminLayout.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/daftar" element={<Daftar />} />
      <Route path="/produk" element={<ListProduk />} />
      <Route path="/produk/:id" element={<DetailProduk />} />
      <Route path="/artikel" element={<ListArtikelPublic />} />
      <Route path="/artikel/:id" element={<DetailArtikel />} />
      <Route path="/keranjang" element={<Keranjang />} />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pembeli/checkout/:id"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pembeli/pesanan"
        element={
          <ProtectedRoute>
            <RiwayatPesanan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pembeli/transaksi/:id"
        element={
          <ProtectedRoute>
            <DetailPesanan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pembeli/profil"
        element={
          <ProtectedRoute>
            <ProfilSaya />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="produk" element={<ListProdukAdmin />} />
        <Route path="kategori" element={<ListKategori />} />
        <Route path="pembelian" element={<ListPembelian />} />
        <Route path="pembelian/:id" element={<DetailPembelian />} />
        <Route path="artikel" element={<ListArtikel />} />
        <Route path="user" element={<ListUser />} />
      </Route>
    </Routes>
  );
}