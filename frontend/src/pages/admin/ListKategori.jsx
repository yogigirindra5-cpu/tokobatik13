import { useEffect, useState } from "react";
import { apiFetch } from "../../utils.js";

export default function ListKategori() {
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [namaKategori, setNamaKategori] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [editingNama, setEditingNama] =
    useState("");

  // ======================================================
  // AMBIL DATA KATEGORI
  // ======================================================

  const loadKategori = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(
        "/kategori"
      );

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.kategori)
          ? data.kategori
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setKategori(list);
    } catch (error) {
      console.error(
        "GET KATEGORI ERROR:",
        error
      );

      setError(
        error?.message ||
          "Gagal mengambil data kategori"
      );

      setKategori([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKategori();
  }, []);

  // ======================================================
  // TAMBAH KATEGORI
  // ======================================================

  const handleTambah = async (e) => {
    e.preventDefault();

    const nama = namaKategori.trim();

    if (!nama) {
      alert("Nama kategori wajib diisi");
      return;
    }

    try {
      await apiFetch("/kategori", {
        method: "POST",
        body: JSON.stringify({
          nama_kategori: nama,
        }),
      });

      setNamaKategori("");

      await loadKategori();

      alert("Kategori berhasil ditambahkan");
    } catch (error) {
      console.error(
        "CREATE KATEGORI ERROR:",
        error
      );

      alert(
        error?.message ||
          "Gagal menambahkan kategori"
      );
    }
  };

  // ======================================================
  // MULAI EDIT
  // ======================================================

  const handleEdit = (item) => {
    setEditingId(item.id_kategori);
    setEditingNama(
      item.nama_kategori || ""
    );
  };

  // ======================================================
  // BATAL EDIT
  // ======================================================

  const handleBatalEdit = () => {
    setEditingId(null);
    setEditingNama("");
  };

  // ======================================================
  // SIMPAN EDIT
  // ======================================================

  const handleUpdate = async (id) => {
    const nama = editingNama.trim();

    if (!nama) {
      alert("Nama kategori wajib diisi");
      return;
    }

    try {
      await apiFetch(
        `/kategori/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            nama_kategori: nama,
          }),
        }
      );

      handleBatalEdit();

      await loadKategori();

      alert("Kategori berhasil diperbarui");
    } catch (error) {
      console.error(
        "UPDATE KATEGORI ERROR:",
        error
      );

      alert(
        error?.message ||
          "Gagal memperbarui kategori"
      );
    }
  };

  // ======================================================
  // HAPUS KATEGORI
  // ======================================================

  const handleDelete = async (id) => {
    const yakin = window.confirm(
      "Yakin ingin menghapus kategori ini?"
    );

    if (!yakin) {
      return;
    }

    try {
      await apiFetch(
        `/kategori/${id}`,
        {
          method: "DELETE",
        }
      );

      await loadKategori();

      alert("Kategori berhasil dihapus");
    } catch (error) {
      console.error(
        "DELETE KATEGORI ERROR:",
        error
      );

      alert(
        error?.message ||
          "Gagal menghapus kategori"
      );
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-3">
            Memuat data kategori...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="container-fluid py-4">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Data Kategori
          </h2>

          <p className="text-muted mb-0">
            Kelola kategori produk batik.
          </p>
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* ==================================================
          TAMBAH KATEGORI
      ================================================== */}

      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Tambah Kategori
          </h5>

          <form
            onSubmit={handleTambah}
          >
            <div className="row g-2">

              <div className="col-md-9">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nama kategori"
                  value={namaKategori}
                  onChange={(e) =>
                    setNamaKategori(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="col-md-3">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                >
                  Tambah Kategori
                </button>
              </div>

            </div>
          </form>

        </div>
      </div>

      {/* ==================================================
          TABEL
      ================================================== */}

      <div className="card shadow-sm">
        <div className="card-body">

          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle mb-0">

              <thead className="table-dark">
                <tr>
                  <th
                    style={{
                      width: "80px",
                    }}
                  >
                    No
                  </th>

                  <th>
                    Nama Kategori
                  </th>

                  <th
                    style={{
                      width: "250px",
                    }}
                  >
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>

                {kategori.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-4 text-muted"
                    >
                      Belum ada kategori.
                    </td>
                  </tr>
                ) : (
                  kategori.map(
                    (item, index) => {

                      const id =
                        item.id_kategori;

                      const isEditing =
                        editingId === id;

                      return (
                        <tr key={id}>

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="form-control"
                                value={
                                  editingNama
                                }
                                onChange={(e) =>
                                  setEditingNama(
                                    e.target.value
                                  )
                                }
                                autoFocus
                              />
                            ) : (
                              item.nama_kategori
                            )}
                          </td>

                          <td>

                            {isEditing ? (
                              <div className="d-flex gap-2">

                                <button
                                  type="button"
                                  className="btn btn-success btn-sm"
                                  onClick={() =>
                                    handleUpdate(
                                      id
                                    )
                                  }
                                >
                                  Simpan
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={
                                    handleBatalEdit
                                  }
                                >
                                  Batal
                                </button>

                              </div>
                            ) : (
                              <div className="d-flex gap-2">

                                <button
                                  type="button"
                                  className="btn btn-warning btn-sm"
                                  onClick={() =>
                                    handleEdit(
                                      item
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() =>
                                    handleDelete(
                                      id
                                    )
                                  }
                                >
                                  Hapus
                                </button>

                              </div>
                            )}

                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>

            </table>
          </div>

        </div>
      </div>

    </div>
  );
}