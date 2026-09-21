import React, {
  useEffect,
  useState,
} from "react";

import {
  apiFetch,
  formatRupiah,
  formatTanggal,
} from "../../utils.js";

export default function ListPembelian() {
  const [transaksi, setTransaksi] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadTransaksi();
  }, []);

  const loadTransaksi = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(
        "/transaksi"
      );

      console.log(
        "DATA TRANSAKSI:",
        data
      );

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (
        Array.isArray(data?.transaksi)
      ) {
        list = data.transaksi;
      } else if (
        Array.isArray(data?.transactions)
      ) {
        list = data.transactions;
      } else if (
        Array.isArray(data?.data)
      ) {
        list = data.data;
      }

      setTransaksi(list);
    } catch (error) {
      console.error(
        "GET TRANSAKSI ERROR:",
        error
      );

      setError(
        error.message ||
          "Gagal mengambil data transaksi"
      );

      setTransaksi([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-3 text-muted">
            Memuat data pembelian...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Data Pembelian
          </h2>

          <p className="text-muted mb-0">
            Daftar transaksi pembelian pelanggan
          </p>
        </div>

        <button
          type="button"
          className="btn btn-dark"
          onClick={loadTransaksi}
        >
          Refresh
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          <strong>
            Gagal memuat data
          </strong>

          <div className="mt-1">
            {error}
          </div>

          <button
            type="button"
            className="btn btn-sm btn-danger mt-3"
            onClick={loadTransaksi}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* DATA KOSONG */}
      {!error &&
        transaksi.length === 0 && (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">

              <h5>
                Belum ada data pembelian
              </h5>

              <p className="text-muted mb-0">
                Belum terdapat transaksi pembelian.
              </p>

            </div>
          </div>
        )}

      {/* TABEL */}
      {!error &&
        transaksi.length > 0 && (
          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="table-responsive">

                <table className="table table-bordered table-hover align-middle mb-0">

                  <thead>
                    <tr>
                      <th>
                        No
                      </th>

                      <th>
                        Pembeli
                      </th>

                      <th>
                        Produk
                      </th>

                      <th>
                        Jumlah
                      </th>

                      <th>
                        Total
                      </th>

                      <th>
                        Pembayaran
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Tanggal
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {transaksi.map(
                      (item, index) => {

                        const id =
                          item.id ??
                          item.id_transaksi ??
                          item.transaction_id ??
                          index;

                        const namaPembeli =
                          item.nama_pembeli ??
                          item.nama ??
                          item.username ??
                          "-";

                        const namaProduk =
                          item.nama_produk ??
                          item.produk ??
                          "-";

                        const jumlah =
                          item.jumlah ??
                          item.quantity ??
                          0;

                        const totalHarga =
                          item.total_harga ??
                          item.total ??
                          item.total_amount ??
                          0;

                        const metodePembayaran =
                          item.metode_pembayaran ??
                          item.payment_method ??
                          "-";

                        const status =
                          item.status ??
                          "-";

                        const tanggal =
                          item.created_at ??
                          item.tanggal ??
                          item.transaction_date ??
                          item.updated_at;

                        return (
                          <tr key={id}>

                            <td>
                              {index + 1}
                            </td>

                            <td>
                              {namaPembeli}
                            </td>

                            <td>
                              {namaProduk}
                            </td>

                            <td>
                              {jumlah}
                            </td>

                            <td>
                              {formatRupiah(
                                totalHarga
                              )}
                            </td>

                            <td>
                              {metodePembayaran}
                            </td>

                            <td>
                              <span className="badge bg-secondary">
                                {status}
                              </span>
                            </td>

                            <td>
                              {formatTanggal(
                                tanggal
                              )}
                            </td>

                          </tr>
                        );
                      }
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