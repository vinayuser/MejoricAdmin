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

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name (A–Z)" },
  { value: "name:desc", label: "Name (Z–A)" },
  { value: "email:asc", label: "Email (A–Z)" },
  { value: "age:asc", label: "Age (low to high)" },
  { value: "age:desc", label: "Age (high to low)" },
  { value: "city:asc", label: "City (A–Z)" },
  { value: "mobile:asc", label: "Phone (low to high)" },
];

const buildUsersQuery = ({
  page,
  limit,
  search,
  statusFilter,
  registeredDate,
  dateFrom,
  dateTo,
  sort,
}) => {
  const [sortBy, sortOrder] = (sort || "createdAt:desc").split(":");
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    role: "user",
    sortBy,
    sortOrder,
  });
  if (search) params.set("search", search);
  if (statusFilter !== "all") {
    params.set("isActive", statusFilter === "active" ? "true" : "false");
  }
  if (registeredDate) {
    params.set("registeredDate", registeredDate);
  } else {
    if (dateFrom) params.set("createdFrom", dateFrom);
    if (dateTo) params.set("createdTo", dateTo);
  }
  return params.toString();
};

const fmtDate = formatDateTime;

const boolLabel = (value) => (value ? "Yes" : "No");

const Users = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [registeredDate, setRegisteredDate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
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

  const queryString = buildUsersQuery({
    page,
    limit,
    search: debouncedSearch,
    statusFilter,
    registeredDate,
    dateFrom,
    dateTo,
    sort,
  });

  const queryClient = useQueryClient();
  const { data, isLoading } = useGetQuery(
    `${API_ENDPOINTS.USER.GET_ALL}?${queryString}`,
    [
      "user",
      page,
      limit,
      debouncedSearch,
      statusFilter,
      registeredDate,
      dateFrom,
      dateTo,
      sort,
    ],
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
      title: "Phone",
      render: (user) => (
        <span className="text-sm text-slate-500">{user.mobile || "—"}</span>
      ),
    },
    {
      key: "age",
      title: "Age",
      render: (user) => (
        <span className="text-sm text-slate-500">{user.age ?? "—"}</span>
      ),
    },
    {
      key: "city",
      title: "City",
      render: (user) => (
        <span className="text-sm text-slate-500 capitalize">{user.city || "—"}</span>
      ),
    },
    {
      key: "isMobileVerified",
      title: "Phone verified",
      render: (user) => (
        <span
          className={`text-xs font-semibold ${
            user.isMobileVerified ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {boolLabel(user.isMobileVerified)}
        </span>
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
    });
  };

  const handleView = (user) => setViewUser(user);
  const handleHistory = (user) => setHistoryUser(user);
  const handleEdit = (user) => openEdit(user);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setRegisteredDate("");
    setDateFrom("");
    setDateTo("");
    setSort("createdAt:desc");
    setPage(1);
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
      const url = `${API_ENDPOINTS.USER.GET_ALL}?${buildUsersQuery({
        page: 1,
        limit: 10000,
        search: debouncedSearch,
        statusFilter,
        registeredDate,
        dateFrom,
        dateTo,
        sort,
      })}`;
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
        Age: user.age ?? "—",
        City: user.city || "—",
        Address: user.address || "—",
        "Phone verified": boolLabel(user.isMobileVerified),
        "Email verified": boolLabel(user.isEmailVerified),
        Status: user.isActive ? "Active" : "Suspended",
        "Signed up as guest": boolLabel(user.createdAsGuest),
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
            Registered Users
          </h1>
          <p className="text-sm text-slate-500">
            App users who signed up — filter by date, sort, and view full details.
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
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email, phone, or city..."
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none"
          >
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Suspended</option>
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none min-w-[180px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Registered on
            </label>
            <input
              type="date"
              value={registeredDate}
              onChange={(e) => {
                setRegisteredDate(e.target.value);
                if (e.target.value) {
                  setDateFrom("");
                  setDateTo("");
                }
                setPage(1);
              }}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              From date
            </label>
            <input
              type="date"
              value={dateFrom}
              disabled={!!registeredDate}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              To date
            </label>
            <input
              type="date"
              value={dateTo}
              disabled={!!registeredDate}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Clear filters
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Showing {users.length} of {totalUsers} registered user
          {totalUsers === 1 ? "" : "s"}
          {registeredDate ? ` · joined on ${registeredDate}` : ""}
          {!registeredDate && (dateFrom || dateTo)
            ? ` · joined ${dateFrom || "…"} to ${dateTo || "…"}`
            : ""}
        </p>
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
              <DetailField label="Name" value={viewUser.name} className="sm:col-span-2" />
              <DetailField label="Email" value={viewUser.email} />
              <DetailField label="Mobile" value={viewUser.mobile ?? "—"} />
              <DetailField label="Age" value={viewUser.age ?? "—"} />
              <DetailField label="City" value={viewUser.city || "—"} capitalize />
              <DetailField
                label="Address"
                value={viewUser.address || "—"}
                className="sm:col-span-2"
              />
              <DetailField label="Date of birth" value={viewUser.dob || "—"} />
              <DetailField
                label="Status"
                value={viewUser.isActive ? "Active" : "Suspended"}
              />
              <DetailField
                label="Phone verified"
                value={boolLabel(viewUser.isMobileVerified)}
              />
              <DetailField
                label="Email verified"
                value={boolLabel(viewUser.isEmailVerified)}
              />
              <DetailField
                label="Signup completed"
                value={boolLabel(viewUser.isSignUpCompleted)}
              />
              <DetailField
                label="Started as guest"
                value={boolLabel(viewUser.createdAsGuest)}
              />
              <DetailField
                label="Free trial started"
                value={
                  viewUser.signupChatTrialStartedAt
                    ? fmtDate(viewUser.signupChatTrialStartedAt)
                    : "—"
                }
                className="sm:col-span-2"
              />
              <DetailField
                label="User ID"
                value={viewUser._id}
                mono
                className="sm:col-span-2"
              />
              <DetailField label="Registered" value={fmtDate(viewUser.createdAt)} />
              <DetailField label="Last updated" value={fmtDate(viewUser.updatedAt)} />
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
              className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              rows={2}
              value={editForm.address}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, address: e.target.value }))
              }
            />
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
            </div>
            <input type="hidden" name="role" value="user" />
            <p className="mt-2 text-xs text-slate-500">
              New accounts are created as app users. They can sign in with email and password.
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

function DetailField({ label, value, className = "", mono = false, capitalize = false }) {
  return (
    <div className={`rounded-lg bg-slate-50/80 px-3 py-2 ${className}`}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-slate-800 ${mono ? "break-all font-mono text-xs" : "font-medium"} ${capitalize ? "capitalize" : ""}`}
        title={typeof value === "string" ? value : undefined}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

export default Users;
