import { useEffect, useState } from "react";

import {
  API_BASE_URL,
} from "../../constants.js";

import {
  getToken,
  formatRupiah,
  formatTanggal,
} from "../../utils.js";

const namaBulan = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/*
|--------------------------------------------------------------------------
| AMBIL ARRAY DARI RESPONSE API
|--------------------------------------------------------------------------
*/

function ambilArray(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| LAPORAN BULANAN
|--------------------------------------------------------------------------
*/

function buatLaporanBulanan(transaksi) {
  const sekarang = new Date();

  const laporan = Array.from(
    { length: 6 },
    (_, index) => {
      const tanggal = new Date(
        sekarang.getFullYear(),
        sekarang.getMonth() -
          (5 - index),
        1
      );

      return {
        key: `${tanggal.getFullYear()}-${String(
          tanggal.getMonth() + 1
        ).padStart(2, "0")}`,

        label: `${namaBulan[tanggal.getMonth()]} ${String(
          tanggal.getFullYear()
        ).slice(-2)}`,

        pendapatan: 0,
        traffic: 0,
      };
    }
  );

  const laporanByKey = new Map(
    laporan.map((item) => [
      item.key,
      item,
    ])
  );

  transaksi.forEach((item) => {
    const tanggal = new Date(
      item.created_at ||
        item.tanggal ||
        item.transaction_date
    );

    if (
      Number.isNaN(
        tanggal.getTime()
      )
    ) {
      return;
    }

    const key = `${tanggal.getFullYear()}-${String(
      tanggal.getMonth() + 1
    ).padStart(2, "0")}`;

    const bulan =
      laporanByKey.get(key);

    if (!bulan) {
      return;
    }

    bulan.traffic += 1;

    if (
      item.pembayaran ===
      "Dibayar"
    ) {
      bulan.pendapatan +=
        Number(
          item.total_harga ||
            item.total ||
            0
        ) || 0;
    }
  });

  return laporan;
}

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

export default function Dashboard() {
  const [stats, setStats] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA DASHBOARD
  |--------------------------------------------------------------------------
  */

  async function loadDashboard() {
    try {
      setError("");

      const token = getToken();

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const [
        produkResponse,
        transaksiResponse,
        usersResponse,
        artikelResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE_URL}/produk`
        ).then(async (response) => {
          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Gagal mengambil produk"
            );
          }

          return data;
        }),

        fetch(
          `${API_BASE_URL}/transaksi`,
          {
            headers,
          }
        ).then(async (response) => {
          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Gagal mengambil transaksi"
            );
          }

          return data;
        }),

        fetch(
          `${API_BASE_URL}/auth/users`,
          {
            headers,
          }
        ).then(async (response) => {
          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Gagal mengambil user"
            );
          }

          return data;
        }),

        fetch(
          `${API_BASE_URL}/artikel`
        ).then(async (response) => {
          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Gagal mengambil artikel"
            );
          }

          return data;
        }),
      ]);

      /*
      |--------------------------------------------------------------------------
      | NORMALISASI DATA
      |--------------------------------------------------------------------------
      */

      const produk = ambilArray(
        produkResponse,
        [
          "produk",
          "products",
        ]
      );

      const transaksi =
        ambilArray(
          transaksiResponse,
          [
            "transaksi",
            "transactions",
          ]
        );

      const users = ambilArray(
        usersResponse,
        [
          "users",
          "user",
        ]
      );

      const artikel = ambilArray(
        artikelResponse,
        [
          "artikel",
          "articles",
        ]
      );

      console.log(
        "DATA DASHBOARD:",
        {
          produk,
          transaksi,
          users,
          artikel,
        }
      );

      /*
      |--------------------------------------------------------------------------
      | PRODUK TERJUAL
      |--------------------------------------------------------------------------
      */

      const transaksiDibayar =
        transaksi.filter(
          (item) =>
            item.pembayaran ===
            "Dibayar"
        );

      const produkTerjual =
        transaksiDibayar.reduce(
          (sum, item) =>
            sum +
            Number(
              item.jumlah ||
                item.quantity ||
                0
            ),
          0
        );

      /*
      |--------------------------------------------------------------------------
      | PENDAPATAN
      |--------------------------------------------------------------------------
      */

      const pendapatan =
        transaksiDibayar.reduce(
          (sum, item) =>
            sum +
            Number(
              item.total_harga ||
                item.total ||
                item.total_amount ||
                0
            ),
          0
        );

      /*
      |--------------------------------------------------------------------------
      | STATISTIK
      |--------------------------------------------------------------------------
      */

      const pembeliTerdaftar =
        users.filter(
          (user) =>
            user.role ===
            "pembeli"
        ).length;

      const produkDiKatalog =
        produk.filter(
          (item) =>
            item.status_produk ===
              "Tersedia" ||
            item.status_produk ===
              undefined
        ).length;

      const pesananAktif =
        transaksi.filter(
          (item) =>
            [
              "Tertunda",
              "Diproses",
              "Dikirim",
            ].includes(
              item.status
            )
        ).length;

      const belumDibayar =
        transaksi.filter(
          (item) =>
            item.pembayaran ===
            "Belum"
        ).length;

      const selesai =
        transaksi.filter(
          (item) =>
            item.status ===
            "Selesai"
        ).length;

      /*
      |--------------------------------------------------------------------------
      | SET STATS
      |--------------------------------------------------------------------------
      */

      setStats({
        pembeli_terdaftar:
          pembeliTerdaftar,

        total_transaksi:
          transaksi.length,

        produk_di_katalog:
          produkDiKatalog,

        produk_terjual:
          produkTerjual,

        total_artikel:
          artikel.length,

        pesanan_aktif:
          pesananAktif,

        belum_dibayar:
          belumDibayar,

        selesai,

        pendapatan,

        laporan_bulanan:
          buatLaporanBulanan(
            transaksi
          ),

        transaksi_terbaru:
          transaksi.slice(0, 5),
      });
    } catch (err) {
      console.error(
        "DASHBOARD ERROR:",
        err
      );

      setError(
        err.message ||
          "Gagal memuat data dashboard"
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="empty-state">
        <h3>
          Gagal memuat data
        </h3>

        <p>
          {error}
        </p>

        <button
          type="button"
          className="btn btn-dark"
          onClick={loadDashboard}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (!stats) {
    return (
      <div className="loading-row">
        Memuat statistik...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD
  |--------------------------------------------------------------------------
  */

  return (
    <div>

      {/* HEADER */}

      <div className="section-head">
        <h2>
          Dashboard Admin
        </h2>
      </div>

      {/* STATISTIK 1 */}

      <div className="stat-grid">

        <div className="stat-card">
          <div className="stat-card-label">
            Pembeli Terdaftar
          </div>

          <div className="stat-card-value">
            {
              stats.pembeli_terdaftar
            }
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Total Transaksi
          </div>

          <div className="stat-card-value">
            {
              stats.total_transaksi
            }
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Produk di Katalog
          </div>

          <div className="stat-card-value">
            {
              stats.produk_di_katalog
            }
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Produk Terjual
          </div>

          <div className="stat-card-value">
            {
              stats.produk_terjual
            }
          </div>
        </div>

      </div>

      {/* STATISTIK 2 */}

      <div
        className="stat-grid"
        style={{
          marginTop: 18,
        }}
      >

        <div className="stat-card">
          <div className="stat-card-label">
            Artikel
          </div>

          <div className="stat-card-value">
            {
              stats.total_artikel
            }
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Pesanan Aktif
          </div>

          <div className="stat-card-value">
            {
              stats.pesanan_aktif
            }
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Belum Dibayar
          </div>

          <div className="stat-card-value">
            {
              stats.belum_dibayar
            }
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-card-label">
            Selesai
          </div>

          <div className="stat-card-value">
            {stats.selesai}
          </div>
        </div>

      </div>

      {/* PENDAPATAN */}

      <div
        className="stat-card stat-card-success"
        style={{
          marginTop: 18,
        }}
      >

        <h3
          style={{
            marginBottom: 4,
          }}
        >
          Pendapatan
          (Dibayar)
        </h3>

        <p className="mt-0">
          Total dari pesanan
          dengan status
          pembayaran
          "Dibayar".
        </p>

        <div className="stat-card-value stat-card-value-lg">
          {formatRupiah(
            stats.pendapatan
          )}
        </div>

      </div>

      {/* LAPORAN */}

      <div className="report-grid">

        {/* PENDAPATAN PER BULAN */}

        <section className="report-card">

          <div className="report-card-head">

            <div>
              <h3>
                Pendapatan
                Per Bulan
              </h3>

              <p>
                Transaksi yang
                sudah dibayar
              </p>
            </div>

            <i
              className="bi bi-bar-chart-line"
              aria-hidden="true"
            ></i>

          </div>

          <div className="report-chart">

            {stats.laporan_bulanan.map(
              (bulan) => {

                const
                  pendapatanMaksimal =
                    Math.max(
                      ...stats.laporan_bulanan.map(
                        (item) =>
                          item.pendapatan
                      ),
                      1
                    );

                const tinggi =
                  bulan.pendapatan
                    ? Math.max(
                        (bulan.pendapatan /
                          pendapatanMaksimal) *
                          100,
                        8
                      )
                    : 3;

                return (
                  <div
                    className="report-column"
                    key={`pendapatan-${bulan.key}`}
                  >

                    <span className="report-value">
                      {bulan.pendapatan
                        ? formatRupiah(
                            bulan.pendapatan
                          )
                        : "-"}
                    </span>

                    <div className="report-bar-track">

                      <div
                        className="report-bar report-bar-income"
                        style={{
                          height: `${tinggi}%`,
                        }}
                      ></div>

                    </div>

                    <span className="report-label">
                      {bulan.label}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* TRAFFIC */}

        <section className="report-card">

          <div className="report-card-head">

            <div>
              <h3>
                Traffic Pembelian
              </h3>

              <p>
                Jumlah pesanan
                yang masuk
                per bulan
              </p>
            </div>

            <i
              className="bi bi-graph-up-arrow"
              aria-hidden="true"
            ></i>

          </div>

          <div className="report-chart">

            {stats.laporan_bulanan.map(
              (bulan) => {

                const
                  trafficMaksimal =
                    Math.max(
                      ...stats.laporan_bulanan.map(
                        (item) =>
                          item.traffic
                      ),
                      1
                    );

                const tinggi =
                  bulan.traffic
                    ? Math.max(
                        (bulan.traffic /
                          trafficMaksimal) *
                          100,
                        8
                      )
                    : 3;

                return (
                  <div
                    className="report-column"
                    key={`traffic-${bulan.key}`}
                  >

                    <span className="report-value">
                      {bulan.traffic}
                    </span>

                    <div className="report-bar-track">

                      <div
                        className="report-bar report-bar-traffic"
                        style={{
                          height: `${tinggi}%`,
                        }}
                      ></div>

                    </div>

                    <span className="report-label">
                      {bulan.label}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </section>

      </div>

      {/* TRANSAKSI TERBARU */}

      <div
        className="section-head"
        style={{
          marginTop: 40,
        }}
      >
        <h3>
          Transaksi Terbaru
        </h3>
      </div>

      <div className="table-wrap">

        <table className="admin-table">

          <thead>
            <tr>
              <th>
                Pembeli
              </th>

              <th>
                Produk
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

            {stats.transaksi_terbaru
              .length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="loading-row"
                >
                  Belum ada transaksi
                </td>
              </tr>
            )}

            {stats.transaksi_terbaru.map(
              (t, index) => (
                <tr
                  key={
                    t.id ||
                    t.id_transaksi ||
                    index
                  }
                >

                  <td>
                    {t.nama_pembeli ||
                      t.uname ||
                      t.username ||
                      "-"}
                  </td>

                  <td>
                    {t.nama_produk ||
                      "-"}
                  </td>

                  <td>
                    <span
                      className={`status-badge status-badge-${t.status}`}
                    >
                      {t.status ||
                        "-"}
                    </span>
                  </td>

                  <td>
                    {formatTanggal(
                      t.created_at ||
                        t.tanggal ||
                        t.transaction_date
                    )}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}