import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { API_BASE_URL } from "../../constants.js";

import {
  mediaUrl,
  formatTanggal,
  onImgError,
} from "../../utils.js";

export default function ListArtikel() {
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadArtikel();
  }, []);

  async function loadArtikel() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/artikel`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal mengambil artikel"
        );
      }

      const hasil = Array.isArray(data)
        ? data
        : Array.isArray(data?.artikel)
          ? data.artikel
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setArtikel(hasil);
    } catch (err) {
      console.error(
        "LOAD ARTIKEL ERROR:",
        err
      );

      setError(
        err.message ||
          "Gagal mengambil artikel"
      );

      setArtikel([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Kelola Artikel
          </h2>

          <p className="text-muted mb-0">
            Daftar artikel batik
          </p>
        </div>

        <Link
          to="/admin/artikel/tambah"
          className="btn btn-dark"
        >
          Tambah Artikel
        </Link>

      </div>

      {loading && (
        <div className="text-center py-5">

          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3">
            Memuat artikel...
          </p>

        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">

          <strong>
            Gagal mengambil artikel
          </strong>

          <div>
            {error}
          </div>

          <button
            className="btn btn-sm btn-danger mt-3"
            onClick={loadArtikel}
          >
            Coba Lagi
          </button>

        </div>
      )}

      {!loading &&
        !error &&
        artikel.length === 0 && (
          <div className="card border-0 shadow-sm">

            <div className="card-body text-center py-5">

              <h5>
                Belum ada artikel
              </h5>

              <p className="text-muted">
                Silakan tambahkan artikel baru.
              </p>

              <Link
                to="/admin/artikel/tambah"
                className="btn btn-dark"
              >
                Tambah Artikel
              </Link>

            </div>

          </div>
        )}

      {!loading &&
        !error &&
        artikel.length > 0 && (

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Gambar</th>
                      <th>Judul</th>
                      <th>Ringkasan</th>
                      <th>Tanggal</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>

                    {artikel.map(
                      (item, index) => (

                        <tr key={item.id}>

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <img
                              src={mediaUrl(
                                item.gambar
                              )}
                              alt={
                                item.judul ||
                                "Artikel"
                              }
                              onError={
                                onImgError
                              }
                              style={{
                                width: "90px",
                                height: "65px",
                                objectFit:
                                  "cover",
                                borderRadius:
                                  "8px",
                              }}
                            />
                          </td>

                          <td>
                            <strong>
                              {item.judul ||
                                "Tanpa Judul"}
                            </strong>
                          </td>

                          <td>
                            {item.ringkasan ||
                              "-"}
                          </td>

                          <td>
                            {formatTanggal(
                              item.created_at
                            )}
                          </td>

                          <td>

                            <div className="d-flex gap-2">

                              <Link
                                to={`/artikel/${item.id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Lihat
                              </Link>

                              <Link
                                to={`/admin/artikel/edit/${item.id}`}
                                className="btn btn-sm btn-outline-warning"
                              >
                                Edit
                              </Link>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}