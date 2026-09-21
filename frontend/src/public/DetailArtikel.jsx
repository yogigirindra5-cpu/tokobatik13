import React, { useEffect, useState } from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  API_BASE_URL,
} from "../constants.js";

import {
  mediaUrl,
  formatTanggal,
  onImgError,
} from "../utils.js";

// ======================================================
// DETAIL ARTIKEL
// ======================================================

export default function DetailArtikel() {
  const { id } = useParams();

  const [artikel, setArtikel] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // AMBIL DETAIL ARTIKEL
  // ====================================================

  useEffect(() => {
    const fetchArtikel = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/artikel/${id}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Gagal mengambil artikel"
          );
        }

        setArtikel(
          data?.artikel ||
            data?.data ||
            data
        );
      } catch (err) {
        console.error(
          "DETAIL ARTIKEL ERROR:",
          err
        );

        setError(
          err.message ||
            "Gagal mengambil artikel"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtikel();
    }
  }, [id]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-3 text-muted">
            Memuat artikel...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !artikel) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h3>
            Artikel tidak ditemukan
          </h3>

          <p className="text-muted">
            {error ||
              "Data artikel tidak tersedia."}
          </p>

          <Link
            to="/artikel"
            className="btn btn-primary"
          >
            Kembali ke Artikel
          </Link>
        </div>
      </div>
    );
  }

  // ====================================================
  // DATA
  // ====================================================

  const judul =
    artikel.judul ||
    "Artikel Batik";

  const ringkasan =
    artikel.ringkasan ||
    "";

  const isi =
    artikel.isi ||
    "";

  const gambar =
    artikel.gambar ||
    null;

  const tanggal =
    artikel.created_at ||
    artikel.updated_at ||
    null;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="container py-5">

      {/* ================================================= */}
      {/* BACK */}
      {/* ================================================= */}

      <div className="mb-4">
        <Link
          to="/artikel"
          className="text-decoration-none"
        >
          ← Kembali ke Artikel
        </Link>
      </div>

      {/* ================================================= */}
      {/* ARTIKEL */}
      {/* ================================================= */}

      <article className="mx-auto">
        {/* JUDUL */}

        <h1 className="fw-bold mb-3">
          {judul}
        </h1>

        {/* TANGGAL */}

        {tanggal && (
          <div className="text-muted mb-4">
            {formatTanggal(tanggal)}
          </div>
        )}

        {/* GAMBAR */}

        {gambar && (
          <div className="mb-4">
            <img
              src={mediaUrl(gambar)}
              alt={judul}
              className="img-fluid rounded shadow-sm w-100"
              style={{
                maxHeight: "500px",
                objectFit: "cover",
              }}
              onError={onImgError}
            />
          </div>
        )}

        {/* RINGKASAN */}

        {ringkasan && (
          <div className="mb-4">
            <p className="lead">
              {ringkasan}
            </p>
          </div>
        )}

        {/* ISI */}

        <div
          className="artikel-content"
          style={{
            whiteSpace: "pre-line",
            lineHeight: "1.8",
          }}
        >
          {isi}
        </div>
      </article>

    </div>
  );
}