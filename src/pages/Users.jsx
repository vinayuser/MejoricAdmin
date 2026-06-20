import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, RotateCcw, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Table from "../components/UI/Table";
import { useGetQuery, useDeleteMutation } from "../api/apiCall";
import API_ENDPOINTS from "../api/apiEndpoint";
import axiosInstance from "../api/axiosInstance";
import UserHistoryModal from "../components/UserHistoryModal";
import { formatDateTime } from "../utils/formatters";

const initialAddForm = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  password: "",
  confirmPassword: "",
  role: "user",
};

const fmtDate = formatDateTime;

const Users = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewUser, setViewUser] = useState(null);
  const [historyUser, setHistoryUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(initialAddForm);
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    address: "",
    isActive: true,
    role: "user",
  });
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useGetQuery(
    `${API_ENDPOINTS.USER.GET_ALL}?page=${page}&limit=${limit}${debouncedSearch ? `&search=${debouncedSearch}` : ""}${roleFilter !== "all" ? `&role=${roleFilter}` : ""}${statusFilter !== "all" ? `&isActive=${statusFilter === "active"}` : ""}`,
    ["user", page, limit, debouncedSearch, roleFilter, statusFilter],
  );

  const users = data?.data?.data || [];
  const totalUsers = data?.data?.total || 0;
  const totalPages = Math.max(1, data?.data?.totalPages || 1);

  const { mutate: removeUser, isPending: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.USER.DELETE,
    {
      onSuccess: (res) => {
        if (res?.success !== false) {
          toast.success("User removed successfully");
          queryClient.invalidateQueries({ queryKey: ["user"] });
        }
      },
      onError: (err) => {
        toast.error(
          err?.response?.data?.message || err?.message || "Delete failed",
        );
      },
    },
  );

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, body }) => {
      const { data: res } = await axiosInstance.put(
        `${API_ENDPOINTS.USER.UPDATE_PROFILE}?userId=${userId}`,
        body,
      );
      return res;
    },
    onSuccess: (res) => {
      if (res?.success !== false) {
        toast.success("User updated successfully");
        setEditUser(null);
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Update failed",
      );
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload) => {
      const { data: res } = await axiosInstance.post(
        API_ENDPOINTS.AUTH.REGISTER,
        payload,
      );
      return res;
    },
    onSuccess: (res) => {
      if (res?.success !== false) {
        toast.success(res?.message || "User created");
        setShowAdd(false);
        setAddForm(initialAddForm);
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Could not create user",
      );
    },
  });

  const columns = [
    {
      key: "name",
      title: "",
      render: (user) => (
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 uppercase">
              {user.name?.charAt(0) || "U"}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "fullName",
      title: "Name",
      render: (user) => (
        <span className="text-base text-slate-600">{user.name}</span>
      ),
    },
    {
      key: "email",
      title: "Email",
      render: (user) => (
        <span className="text-sm text-slate-500">{user.email}</span>
      ),
    },
    {
      key: "mobile",
      title: "Phone Number",
      render: (user) => (
        <span className="text-sm text-slate-500">{user.mobile || "—"}</span>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (user) => {
        const status = user.isActive ? "Active" : "Suspended";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
              user.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "isOnline",
      title: "Availability",
      render: (user) => {
        if (user.role !== "mate") return <span className="text-slate-300">—</span>;
        const isOnline = user.mate?.isAvailable;
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleOnline(user, isOnline);
              }}
              disabled={updateUserMutation.isPending}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                isOnline ? "bg-indigo-600" : "bg-slate-200"
              } ${updateUserMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  isOnline ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isOnline ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        );
      },
    },
    {
      key: "role",
      title: "Role",
      render: (user) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <svg
            className="h-3.5 w-3.5 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="capitalize">{user.role || "Manager"}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Joined",
      render: (user) => (
        <span className="text-slate-500 whitespace-nowrap">
          {fmtDate(user.createdAt)}
        </span>
      ),
    },
  ];

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name || "",
      mobile: user.mobile != null ? String(user.mobile) : "",
      address: user.address || "",
      isActive: user.isActive !== false,
      role: user.role || "user",
    });
  };

  const handleView = (user) => setViewUser(user);
  const handleHistory = (user) => setHistoryUser(user);
  const handleEdit = (user) => openEdit(user);

  const toggleOnline = (user, currentStatus) => {
    updateUserMutation.mutate({
      userId: user._id,
      body: { isOnline: !currentStatus },
    });
  };

  const handleDelete = (user) => {
    if (!user?._id) return;

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to remove ${user.name || "this user"}. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5", // indigo-600
      cancelButtonColor: "#ef4444", // red-500
      confirmButtonText: "Yes, delete it!",
      background: "#ffffff",
      borderRadius: "1rem",
      customClass: {
        title: "text-slate-900 font-bold",
        htmlContainer: "text-slate-600",
        confirmButton:
          "px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200/50",
        cancelButton: "px-6 py-2.5 rounded-xl font-bold",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        removeUser(user._id);
      }
    });
  };

  const handleAddNew = () => {
    setAddForm(initialAddForm);
    setShowAdd(true);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editUser?._id) return;
    updateUserMutation.mutate({
      userId: editUser._id,
      body: {
        name: editForm.name.trim(),
        mobile: editForm.mobile.trim(),
        address: editForm.address.trim(),
        isActive: editForm.isActive,
        role: editForm.role,
      },
    });
  };

  const submitAdd = (e) => {
    e.preventDefault();
    if (addForm.password !== addForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    createUserMutation.mutate({
      name: addForm.name.trim(),
      email: addForm.email.trim().toLowerCase(),
      mobile: addForm.mobile.trim(),
      address: addForm.address.trim(),
      password: addForm.password,
      confirmPassword: addForm.confirmPassword,
      role: addForm.role,
    });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const url = `${API_ENDPOINTS.USER.GET_ALL}?page=1&limit=10000${debouncedSearch ? `&search=${debouncedSearch}` : ""}${roleFilter !== "all" ? `&role=${roleFilter}` : ""}${statusFilter !== "all" ? `&isActive=${statusFilter === "active"}` : ""}`;
      const { data: res } = await axiosInstance.get(url);
      const allUsers = res?.data?.data || [];

      if (allUsers.length === 0) {
        toast.error("No users to export");
        return;
      }

      const exportData = allUsers.map((user) => ({
        Name: user.name,
        Email: user.email,
        Mobile: user.mobile || "—",
        Role: user.role,
        Status: user.isActive ? "Active" : "Suspended",
        Joined: fmtDate(user.createdAt),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(
        wb,
        `Users_Export_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success("Users list exported to Excel");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Failed to export users");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            User List
          </h1>
          <p className="text-sm text-slate-500">
            Manage your users and their roles here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : "Export Excel"}
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleAddNew}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Add User
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Filter users..."
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none appearance-none"
            style={{
              paddingRight: "2rem",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1rem",
            }}
          >
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none appearance-none"
            style={{
              paddingRight: "2rem",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1rem",
            }}
          >
            <option value="all">Role: All</option>
            <option value="user">User</option>
            <option value="mate">Mate</option>
            <option value="admin">Admin</option>
            <option value="guest">Guest</option>
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={users}
        onView={handleView}
        onHistory={handleHistory}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Pagination & Footer info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 border-t border-slate-50">
        <div className="flex items-center gap-4"></div>

        <div className="flex items-center gap-6">
          <span className="text-xs text-slate-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded hover:bg-slate-600/5 disabled:opacity-30"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded hover:bg-slate-600/5 disabled:opacity-30"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isDeleting && <p className="text-sm text-amber-700">Removing user…</p>}

      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setViewUser(null)}
            role="presentation"
            aria-hidden
          />
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-user-title"
          >
            <div className="flex justify-between items-start mb-4">
              <h2
                id="view-user-title"
                className="text-lg font-semibold text-slate-900"
              >
                User details
              </h2>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50/80 px-3 py-2 sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Name
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {viewUser.name || "—"}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50/80 px-3 py-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email
                </dt>
                <dd
                  className="mt-0.5 truncate text-slate-800"
                  title={viewUser.email}
                >
                  {viewUser.email || "—"}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50/80 px-3 py-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Mobile
                </dt>
                <dd className="mt-0.5 text-slate-800">
                  {viewUser.mobile ?? "—"}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50/80 px-3 py-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Role
                </dt>
                <dd className="mt-0.5 capitalize text-slate-800">
                  {viewUser.role || "user"}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50/80 px-3 py-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </dt>
                <dd className="mt-0.5 text-slate-800">
                  {viewUser.isActive ? "Active" : "Inactive"}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50/80 px-3 py-2 sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  User ID
                </dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-slate-700">
                  {viewUser._id}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50/80 px-3 py-2 sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Created
                </dt>
                <dd className="mt-0.5 text-slate-800">
                  {fmtDate(viewUser.createdAt)}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setViewUser(null);
                  openEdit(viewUser);
                }}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setEditUser(null)}
            role="presentation"
            aria-hidden
          />
          <form
            onSubmit={submitEdit}
            className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
          >
            <div className="mb-4 flex items-start justify-between">
              <h2
                id="edit-user-title"
                className="text-lg font-semibold text-slate-900"
              >
                Edit user
              </h2>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p
              className="mb-4 truncate rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600"
              title={editUser.email}
            >
              {editUser.email}
            </p>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mobile
            </label>
            <input
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={editForm.mobile}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, mobile: e.target.value }))
              }
            />
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Address
            </label>
            <textarea
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              rows={2}
              value={editForm.address}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, address: e.target.value }))
              }
            />
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={editForm.role}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, role: e.target.value }))
              }
            >
              <option value="user">User</option>
              <option value="mate">Mate</option>
              <option value="admin">Admin</option>
              <option value="guest">Guest</option>
            </select>
            <label className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
                checked={editForm.isActive}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              <span className="text-sm text-slate-700">Account active</span>
            </label>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="inline-flex min-w-[5rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="inline-flex min-w-[5rem] items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {updateUserMutation.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add user modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setShowAdd(false)}
            role="presentation"
            aria-hidden
          />
          <form
            onSubmit={submitAdd}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Add new user
              </h2>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name *
                </label>
                <input
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Mobile
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={addForm.mobile}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, mobile: e.target.value }))
                  }
                  placeholder="10-digit number (optional)"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={addForm.password}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Confirm password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={addForm.confirmPassword}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={addForm.address}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="Street, City, Zip Code"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Role *
                </label>
                <select
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={addForm.role}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  <option value="user">User</option>
                  <option value="mate">Mate</option>
                  <option value="admin">Admin</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Role: <span className="font-medium text-slate-700">user</span>.
              They can sign in with this email and password.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="inline-flex min-w-[5rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="inline-flex min-w-[5rem] items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {createUserMutation.isPending ? "Creating…" : "Create user"}
              </button>
            </div>
          </form>
        </div>
      )}

      {historyUser && (
        <UserHistoryModal
          user={historyUser}
          onClose={() => setHistoryUser(null)}
        />
      )}
    </div>
  );
};

export default Users;
