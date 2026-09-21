import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { API_BASE_URL } from "../constants.js";

import {
  mediaUrl,
  formatTanggal,
  onImgError,
} from "../utils.js";

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

  if (loading) {
    return (
      <div className="container py-5 text-center">
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
    );
  }

  return (
    <div className="container py-5">

      <div className="text-center mb-5">
        <h1 className="fw-bold">
          Artikel Batik
        </h1>

        <p className="text-muted">
          Informasi dan cerita seputar batik Indonesia
        </p>
      </div>

      {error && (
        <div className="alert alert-danger text-center">
          {error}

          <br />

          <button
            className="btn btn-sm btn-danger mt-3"
            onClick={loadArtikel}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!error && artikel.length === 0 && (
        <div className="text-center py-5">
          <h5>
            Belum ada artikel
          </h5>

          <p className="text-muted">
            Artikel belum tersedia.
          </p>
        </div>
      )}

      {!error && artikel.length > 0 && (
        <div className="row g-4">

          {artikel.map((item) => (
            <div
              className="col-12 col-md-6 col-lg-4"
              key={item.id}
            >
              <div className="card h-100 border-0 shadow-sm">

                <img
                  src={mediaUrl(item.gambar)}
                  alt={
                    item.judul ||
                    "Artikel Batik"
                  }
                  onError={onImgError}
                  className="card-img-top"
                  style={{
                    height: "220px",
                    objectFit: "cover",
                  }}
                />

                <div className="card-body d-flex flex-column">

                  <h5 className="card-title fw-bold">
                    {item.judul ||
                      "Tanpa Judul"}
                  </h5>

                  <small className="text-muted mb-2">
                    {formatTanggal(
                      item.created_at
                    )}
                  </small>

                  <p className="card-text text-muted">
                    {item.ringkasan ||
                      "Tidak ada ringkasan."}
                  </p>

                  <div className="mt-auto">

                    <Link
                      to={`/artikel/${item.id}`}
                      className="btn btn-dark"
                    >
                      Baca Selengkapnya
                    </Link>

                  </div>

                </div>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}