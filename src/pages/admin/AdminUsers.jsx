import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import AdminLayout from "./AdminLayout.jsx";

const roleOptions = [
  { value: "CANDIDATE", label: "Ứng viên" },
  { value: "RECRUITER", label: "Nhà tuyển dụng" },
  { value: "ADMIN", label: "Admin" }
];

const formatDate = (value) => {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có";
  return date.toLocaleDateString("vi-VN");
};

const pageSizeOptions = [10, 20, 50];

const AdminUsers = () => {
  // users la danh sach goc tra ve tu backend sau khi da loc role o server neu co.
  const [users, setUsers] = useState([]);
  // role dung cho filter server-side: /api/admin/users?role=RECRUITER.
  const [role, setRole] = useState("");
  // query dung cho search nhanh tren client theo name/email/phone.
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // loading/error giup UI biet dang fetch, fetch loi, hay da co data.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionUserId, setActionUserId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      // Backend hien co ho tro optional query param role trong AdminController.getUsers().
      const path = role ? `/api/admin/users?role=${role}` : "/api/admin/users";
      const data = await apiRequest(path);
      // Luon ep ve array de table khong crash neu backend tra null/shape bat ngo.
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Moi lan admin doi role filter thi fetch lai tu backend.
    loadUsers();
  }, [role]);

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return users;

    // Search client-side chi loc tren tap users dang co, de UI phan hoi nhanh khi go.
    return users.filter((user) =>
      [user.name, user.email, user.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value))
    );
  }, [users, query]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, role, pageSize]);

  const updateUserRole = async (userId, nextRole) => {
    setActionUserId(userId);
    setError("");
    setMessage("");

    try {
      await apiRequest(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: nextRole })
      });
      setMessage("Đã cập nhật vai trò tài khoản.");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Không thể cập nhật vai trò");
    } finally {
      setActionUserId(null);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(`Xoa tai khoan ${user.email || user.name || user.id}?`);
    if (!confirmed) return;

    setActionUserId(user.id);
    setError("");
    setMessage("");

    try {
      await apiRequest(`/api/admin/users/${user.id}`, { method: "DELETE" });
      setMessage("Đã xóa tài khoản.");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Không thể xóa tài khoản");
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <AdminLayout
      title="Quản lý tài khoản"
      description="Tìm kiếm, phân quyền và xử lý tài khoản người dùng."
    >
      <section className="admin-users-toolbar">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm theo tên, email, số điện thoại"
          aria-label="Tìm kiếm tài khoản"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          aria-label="Lọc theo vai trò"
        >
          <option value="">Tất cả vai trò</option>
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="admin-page-size">
          Hiển thị
          <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </section>

      {loading ? <p className="admin-state">Đang tải tài khoản...</p> : null}
      {!loading && error ? <p className="admin-state error">{error}</p> : null}
      {!loading && message ? <p className="admin-state success">{message}</p> : null}

      {!loading && !error ? (
        <section className="admin-users-table">
          <div className="admin-users-row admin-users-head">
            <span>Người dùng</span>
            <span>Liên hệ</span>
            <span>Ngày tạo</span>
            <span>Vai trò</span>
            <span>Thao tác</span>
          </div>

          {filteredUsers.length === 0 ? (
            <p className="admin-users-empty">Không có tài khoản phù hợp.</p>
          ) : (
            paginatedUsers.map((user) => (
              <div key={user.id} className="admin-users-row">
                <div>
                  <strong>{user.name || "Chưa có tên"}</strong>
                  <span className="label-value-line"><span>ID:</span><span>{user.id}</span></span>
                </div>
                <div>
                  <strong>{user.email || "Chưa có email"}</strong>
                  <span>{user.phone || "Chưa có số điện thoại"}</span>
                </div>
                <span>{formatDate(user.createdAt)}</span>
                <select
                  value={user.role || ""}
                  onChange={(event) => updateUserRole(user.id, event.target.value)}
                  disabled={actionUserId === user.id}
                  aria-label={`Đổi vai trò ${user.email || user.name || user.id}`}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="admin-danger-action"
                  onClick={() => deleteUser(user)}
                  disabled={actionUserId === user.id}
                >
                  Xóa
                </button>
              </div>
            ))
          )}
          {filteredUsers.length > 0 ? (
            <div className="admin-pagination">
              <span>
                Hiển thị {pageStart + 1}-{Math.min(pageStart + pageSize, filteredUsers.length)} / {filteredUsers.length}
              </span>
              <div>
                <button type="button" disabled={currentPage <= 1} onClick={() => setPage(1)}>Đầu</button>
                <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Trước</button>
                <strong>Trang {currentPage}/{totalPages}</strong>
                <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Sau</button>
                <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)}>Cuối</button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </AdminLayout>
  );
};

export default AdminUsers;
