import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Table from "../components/UI/Table";
import { useGetQuery, usePostMutation } from "../api/apiCall";
import API_ENDPOINTS from "../api/apiEndpoint";
import { formatDateTime } from "../utils/formatters";

const SOURCE_LABELS = {
  mate_chat: "Chat",
  mate_call: "Call",
  admin: "Admin",
};

const BlockedIps = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (debouncedSearch) query.set("search", debouncedSearch);

  const { data, isLoading, refetch } = useGetQuery(
    `${API_ENDPOINTS.MODERATION.BLOCKED_IPS}?${query.toString()}`,
    ["blocked-ips", page, limit, debouncedSearch],
  );

  const unblockMutation = usePostMutation(API_ENDPOINTS.MODERATION.UNBLOCK_IP, {
    onSuccess: (res) => {
      toast.success(res?.message || "IP unblocked");
      refetch();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to unblock IP",
      );
    },
  });

  const payload = data?.data || {};
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const totalPages = payload.totalPages || 1;
  const total = payload.total ?? rows.length;

  const handleUnblock = async (row) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Unblock this IP?",
      text: `${row.ip} — ${row.targetUserName || "Unknown user"} will regain access if no other blocks remain.`,
      showCancelButton: true,
      confirmButtonText: "Unblock",
      confirmButtonColor: "#0f172a",
    });
    if (!confirm.isConfirmed) return;
    unblockMutation.mutate({ id: row._id });
  };

  const columns = [
    {
      key: "ip",
      title: "IP",
      render: (row) => (
        <span className="font-mono text-sm font-semibold text-slate-900">
          {row.ip}
        </span>
      ),
    },
    {
      key: "targetUserName",
      title: "User",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 capitalize">
            {row.targetUserName || "—"}
          </span>
          <span className="text-xs text-slate-500 capitalize">
            {row.targetUserRole || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "blockedByName",
      title: "Blocked by",
      render: (row) => (
        <span className="text-sm text-slate-700 capitalize">
          {row.blockedByName || "—"}
        </span>
      ),
    },
    {
      key: "source",
      title: "Source",
      render: (row) => (
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {SOURCE_LABELS[row.source] || row.source || "—"}
        </span>
      ),
    },
    {
      key: "reason",
      title: "Reason",
      render: (row) => (
        <span className="text-sm text-slate-600 line-clamp-2 max-w-[220px]">
          {row.reason || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Date",
      render: (row) => (
        <span className="text-sm text-slate-600">
          {row.createdAt ? formatDateTime(row.createdAt) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Unblock",
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleUnblock(row);
          }}
          disabled={unblockMutation.isPending}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Unblock
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blocked IPs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Users blocked by mates from chat or calls (Cloudflare + platform).
          </p>
        </div>
        <div className="w-full sm:w-72">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Search
          </label>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="IP, name, reason…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>
      </div>

      <Table
        title={`Active blocks (${total})`}
        description="Unblocking removes the Cloudflare rule and restores the user if no other active blocks remain."
        columns={columns}
        data={rows}
        isLoading={isLoading}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BlockedIps;
