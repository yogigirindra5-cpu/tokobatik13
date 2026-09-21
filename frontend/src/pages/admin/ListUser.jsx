import {
  useEffect,
  useState,
} from "react";

import {
  apiFetch,
} from "../../utils.js";

export default function ListUser() {
  const [
    userList,
    setUserList,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await apiFetch(
            "/auth/users"
          );

        console.log(
          "DATA USERS:",
          data
        );

        // Backend mengirim:
        // {
        //   success: true,
        //   users: [...]
        // }

        const list =
          Array.isArray(data)
            ? data
            : data?.users || [];

        setUserList(list);

      } catch (error) {
        console.error(
          "GET USERS ERROR:",
          error
        );

        setError(
          error.message ||
            "Gagal mengambil data user"
        );

        setUserList([]);

      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="container py-4">
        <p>
          Memuat data user...
        </p>
      </div>
    );
  }

  return (
    <div className="container py-4">

      <h2 className="mb-4">
        Data User
      </h2>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!error &&
        userList.length === 0 && (
          <div className="alert alert-info">
            Belum ada user.
          </div>
        )}

      {userList.length > 0 && (
        <div className="table-responsive">

          <table className="table table-bordered table-hover">

            <thead>
              <tr>
                <th>No</th>
                <th>Nama Depan</th>
                <th>Nama Belakang</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Phone</th>
              </tr>
            </thead>

            <tbody>

              {userList.map(
                (user, index) => (
                  <tr
                    key={
                      user.id ||
                      index
                    }
                  >

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {user.nama_d ||
                        "-"}
                    </td>

                    <td>
                      {user.nama_b ||
                        "-"}
                    </td>

                    <td>
                      {user.email ||
                        "-"}
                    </td>

                    <td>
                      {user.uname ||
                        "-"}
                    </td>

                    <td>
                      {user.role ||
                        "-"}
                    </td>

                    <td>
                      {user.phone ||
                        "-"}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}