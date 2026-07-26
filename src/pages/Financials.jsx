import React, { useEffect, useMemo, useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  Users,
  Coins,
  Search,
  PiggyBank,
  CheckCircle,
  Clock,
  X,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  MessageSquare,
  Layers,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useGetQuery } from "../api/apiCall";
import API_ENDPOINTS from "../api/apiEndpoint";
import Pagination from "../components/UI/Pagination";

const chartCardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-900/5";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "users", label: "Users" },
  { id: "sessions", label: "Sessions & Payouts" },
];

const SOURCE_OPTIONS = [
  "all",
  "RAZORPAY",
  "ADMIN",
  "MOCK_PAYMENT",
  "CALL",
  "CHAT",
  "COMMUNITY",
  "THERAPY",
];

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fmtDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const durationLabel = (seconds) => {
  const s = Math.max(0, Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return r ? `${m}m ${r}s` : `${m}m`;
};

const sourceBadge = (source) => {
  const map = {
    RAZORPAY: "bg-blue-50 text-blue-700 border-blue-100",
    ADMIN: "bg-orange-50 text-orange-700 border-orange-100",
    MOCK_PAYMENT: "bg-cyan-50 text-cyan-700 border-cyan-100",
    CALL: "bg-violet-50 text-violet-700 border-violet-100",
    CHAT: "bg-indigo-50 text-indigo-700 border-indigo-100",
    COMMUNITY: "bg-emerald-50 text-emerald-700 border-emerald-100",
    THERAPY: "bg-pink-50 text-pink-700 border-pink-100",
  };
  return map[source] || "bg-slate-50 text-slate-600 border-slate-100";
};

const statusIcon = (status) => {
  if (status === "SUCCESS")
    return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (status === "FAILED" || status === "REVERSED")
    return <XCircle className="h-4 w-4 text-rose-500" />;
  return <Clock className="h-4 w-4 text-amber-500" />;
};

function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const Financials = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [txPage, setTxPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [limit] = useState(15);

  const [txSearch, setTxSearch] = useState("");
  const [txType, setTxType] = useState("all");
  const [txSource, setTxSource] = useState("all");
  const [txStatus, setTxStatus] = useState("all");
  const [txDateFrom, setTxDateFrom] = useState("");
  const [txDateTo, setTxDateTo] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("all");
  const [drawerPage, setDrawerPage] = useState(1);

  const debouncedTxSearch = useDebounced(txSearch);
  const debouncedUserSearch = useDebounced(userSearch);
  const debouncedSessionSearch = useDebounced(sessionSearch);

  useEffect(() => setTxPage(1), [
    debouncedTxSearch,
    txType,
    txSource,
    txStatus,
    txDateFrom,
    txDateTo,
  ]);
  useEffect(() => setUserPage(1), [debouncedUserSearch]);
  useEffect(() => setSessionPage(1), [debouncedSessionSearch]);
  useEffect(() => setDrawerPage(1), [selectedUser?._id, drawerTab]);

  const {
    data: overviewRes,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
    isFetching: overviewFetching,
  } = useGetQuery(
    API_ENDPOINTS.DASHBOARD.GET_FINANCIALS,
    ["financial-overview"],
    { refetchOnWindowFocus: true },
  );

  const txQuery = useMemo(() => {
    const p = new URLSearchParams({
      page: String(txPage),
      limit: String(limit),
    });
    if (debouncedTxSearch) p.set("search", debouncedTxSearch);
    if (txType !== "all") p.set("type", txType);
    if (txSource !== "all") p.set("source", txSource);
    if (txStatus !== "all") p.set("status", txStatus);
    if (txDateFrom) p.set("dateFrom", txDateFrom);
    if (txDateTo) p.set("dateTo", txDateTo);
    return p.toString();
  }, [
    txPage,
    limit,
    debouncedTxSearch,
    txType,
    txSource,
    txStatus,
    txDateFrom,
    txDateTo,
  ]);

  const {
    data: txRes,
    isLoading: txLoading,
    isFetching: txFetching,
  } = useGetQuery(
    `${API_ENDPOINTS.DASHBOARD.GET_FINANCIAL_TRANSACTIONS}?${txQuery}`,
    ["financial-transactions", txQuery],
    { enabled: activeTab === "transactions" },
  );

  const userQuery = useMemo(() => {
    const p = new URLSearchParams({
      page: String(userPage),
      limit: String(limit),
    });
    if (debouncedUserSearch) p.set("search", debouncedUserSearch);
    return p.toString();
  }, [userPage, limit, debouncedUserSearch]);

  const {
    data: usersRes,
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useGetQuery(
    `${API_ENDPOINTS.DASHBOARD.GET_FINANCIAL_USERS}?${userQuery}`,
    ["financial-users", userQuery],
    { enabled: activeTab === "users" },
  );

  const sessionQuery = useMemo(() => {
    const p = new URLSearchParams({
      page: String(sessionPage),
      limit: String(limit),
    });
    if (debouncedSessionSearch) p.set("search", debouncedSessionSearch);
    return p.toString();
  }, [sessionPage, limit, debouncedSessionSearch]);

  const {
    data: sessionsRes,
    isLoading: sessionsLoading,
    isFetching: sessionsFetching,
  } = useGetQuery(
    `${API_ENDPOINTS.DASHBOARD.GET_FINANCIAL_SESSIONS}?${sessionQuery}`,
    ["financial-sessions", sessionQuery],
    { enabled: activeTab === "sessions" },
  );

  const drawerQuery = useMemo(() => {
    if (!selectedUser?._id) return "";
    const p = new URLSearchParams({
      page: String(drawerPage),
      limit: "20",
      userId: String(selectedUser._id),
      status: "SUCCESS",
    });
    if (drawerTab === "recharges") {
      p.set("type", "CREDIT");
    } else if (drawerTab === "spends") {
      p.set("type", "DEBIT");
    }
    return p.toString();
  }, [selectedUser?._id, drawerPage, drawerTab]);

  const { data: drawerTxRes, isLoading: drawerTxLoading } = useGetQuery(
    `${API_ENDPOINTS.DASHBOARD.GET_FINANCIAL_TRANSACTIONS}?${drawerQuery}`,
    ["financial-user-tx", drawerQuery],
    { enabled: Boolean(selectedUser?._id && drawerQuery) },
  );

  const overview = overviewRes?.data?.overview || {};
  const timeline = overviewRes?.data?.timeline || [];
  const sourceBreakdown = overviewRes?.data?.sourceBreakdown || [];
  const statusBreakdown = overviewRes?.data?.statusBreakdown || {};

  const transactions = txRes?.data || [];
  const txPagination = txRes?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  const users = usersRes?.data || [];
  const usersPagination = usersRes?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  const sessions = sessionsRes?.data || [];
  const sessionsPagination = sessionsRes?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };
  const mateSharePercent =
    sessionsRes?.mateSharePercent || overview.mateSharePercent || 60;

  const drawerTx = drawerTxRes?.data || [];
  const drawerPagination = drawerTxRes?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  const openDrawer = (user) => {
    setSelectedUser(user);
    setDrawerTab("all");
    setDrawerPage(1);
    setTimeout(() => setIsDrawerOpen(true), 20);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  if (overviewLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-600">
            Loading financial records…
          </p>
        </div>
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-center">
        <h3 className="text-sm font-bold text-red-900">
          Failed to load financial data
        </h3>
        <p className="mt-1 text-sm text-red-600">
          {overviewError?.message || "Please check your network connection."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financials
          </h1>
          <p className="text-sm text-slate-500">
            Recharges, wallet ledger, session billing, community/therapy spends,
            and mate payouts — with full transaction history.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => refetchOverview()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${overviewFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={chartCardClass}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                  {overview.rechargeCount || 0} txns
                </span>
              </div>
              <p className="text-xs text-slate-500">Paid recharges</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {money(overview.totalRevenue)}
              </h3>
            </div>

            <div className={chartCardClass}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Coins className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                  {(overview.sessionSpendCount || 0) +
                    (overview.productSpendCount || 0)}{" "}
                  txns
                </span>
              </div>
              <p className="text-xs text-slate-500">Total user spends</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {money(overview.totalUserSpends)}
              </h3>
              <p className="mt-2 text-[11px] text-slate-500">
                Sessions {money(overview.sessionSpends)} · Products{" "}
                {money(overview.productSpends)}
              </p>
            </div>

            <div className={chartCardClass}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Users className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700">
                  {overview.mateSharePercent || 60}% share
                </span>
              </div>
              <p className="text-xs text-slate-500">Paid to mates</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {money(overview.totalMatePayout)}
              </h3>
              <p className="mt-2 text-[11px] text-slate-500">
                {overview.matePayoutCount || 0} payout credits
              </p>
            </div>

            <div className={chartCardClass}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                  Ledger
                </span>
              </div>
              <p className="text-xs text-slate-500">Net (recharges − payouts)</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {money(overview.netPlatformProfit)}
              </h3>
              <p className="mt-2 text-[11px] text-slate-500">
                {overview.transactionTotal || 0} total wallet rows
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={`${chartCardClass} lg:col-span-2`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    30-day cashflow
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recharges vs user spends vs mate payouts
                  </p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeline}>
                    <defs>
                      <linearGradient id="rechargeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(tick) => {
                        const parts = String(tick).split("-");
                        return parts.length === 3
                          ? `${parts[2]}/${parts[1]}`
                          : tick;
                      }}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="recharges"
                      name="Recharges"
                      fill="url(#rechargeGradient)"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="spends"
                      name="Spends"
                      stroke="#F43F5E"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="payouts"
                      name="Mate payouts"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className={chartCardClass}>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  By source
                </h3>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {sourceBreakdown.length === 0 ? (
                    <p className="text-xs text-slate-400">No ledger data yet.</p>
                  ) : (
                    sourceBreakdown.map((row) => (
                      <div
                        key={`${row.source}-${row.type}`}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
                      >
                        <div>
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${sourceBadge(row.source)}`}
                          >
                            {row.source}
                          </span>
                          <div className="mt-1 text-[10px] font-semibold uppercase text-slate-400">
                            {row.type} · {row.count} txns
                          </div>
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {money(row.total)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={chartCardClass}>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Status mix
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {["SUCCESS", "PENDING", "FAILED", "REVERSED"].map((st) => (
                    <div
                      key={st}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                    >
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        {st}
                      </div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        {statusBreakdown[st]?.count || 0}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {money(statusBreakdown[st]?.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTIONS */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Search name, email, description, order id…"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="all">All types</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
            <select
              value={txSource}
              onChange={(e) => setTxSource(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All sources" : s}
                </option>
              ))}
            </select>
            <select
              value={txStatus}
              onChange={(e) => setTxStatus(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REVERSED">Reversed</option>
            </select>
            <div className="flex gap-2 xl:col-span-6">
              <input
                type="date"
                value={txDateFrom}
                onChange={(e) => setTxDateFrom(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={txDateTo}
                onChange={(e) => setTxDateTo(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <p className="text-xs font-medium text-slate-500">
                Showing {transactions.length} of {txPagination.total} ledger
                entries
                {txFetching ? " · updating…" : ""}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Opening</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Closing</th>
                    <th className="px-4 py-3">Payment ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {txLoading ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                        Loading transactions…
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                        No transactions match these filters.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id || tx._id} className="hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                          {fmtDateTime(tx.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {tx.user?.name || tx.userId?.name || "—"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {tx.user?.email || tx.userId?.email || "—"}
                          </div>
                          <div className="text-[10px] uppercase text-slate-400">
                            {tx.user?.mobile || tx.userId?.mobile || ""} ·{" "}
                            {tx.user?.role || tx.userId?.role || ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              tx.type === "CREDIT"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {tx.type === "CREDIT" ? (
                              <ArrowDownLeft className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${sourceBadge(tx.source)}`}
                          >
                            {tx.source}
                          </span>
                        </td>
                        <td className="max-w-[220px] px-4 py-3 text-xs" title={tx.description}>
                          <div className="line-clamp-2">{tx.description || "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase">
                            {statusIcon(tx.status)}
                            {tx.status}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500">
                          {tx.openingBalance != null
                            ? money(tx.openingBalance)
                            : "—"}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-bold ${
                            tx.type === "CREDIT"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {tx.type === "CREDIT" ? "+" : "-"}
                          {money(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-slate-800">
                          {tx.closingBalance != null
                            ? money(tx.closingBalance)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500">
                          <div className="max-w-[140px] truncate" title={tx.reference?.razorpayPaymentId || tx.reference?.razorpayOrderId}>
                            {tx.reference?.razorpayPaymentId ||
                              tx.reference?.razorpayOrderId ||
                              "—"}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end border-t border-slate-100 px-4 py-3">
              <Pagination
                currentPage={txPagination.page}
                totalPages={txPagination.totalPages}
                onPageChange={setTxPage}
              />
            </div>
          </div>
        </div>
      )}

      {/* USERS */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user by name, email, or mobile…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3 text-xs text-slate-500">
              {usersPagination.total} users with wallet activity
              {usersFetching ? " · updating…" : ""}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3 text-emerald-600">Recharged</th>
                    <th className="px-5 py-3 text-rose-600">Spent</th>
                    <th className="px-5 py-3">Sessions / Products</th>
                    <th className="px-5 py-3">Wallet</th>
                    <th className="px-5 py-3">Last txn</th>
                    <th className="px-5 py-3 text-center">Ledger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                        Loading users…
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3">
                          <div className="font-semibold text-slate-900">
                            {u.userName || "—"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {u.userEmail || "—"}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {u.userMobile || ""}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                            {u.userRole || "user"}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-bold text-emerald-600">
                          {money(u.totalRecharged)}
                          <div className="text-[10px] font-medium text-slate-400">
                            {u.rechargeCount || 0} credits
                          </div>
                        </td>
                        <td className="px-5 py-3 font-semibold text-rose-600">
                          {money(u.totalSpent)}
                          <div className="text-[10px] font-medium text-slate-400">
                            {u.spendCount || 0} debits
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-600">
                          <div>Sessions {money(u.sessionSpent)}</div>
                          <div>Products {money(u.productSpent)}</div>
                        </td>
                        <td className="px-5 py-3 font-black text-slate-900">
                          {money(u.walletBalance)}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {fmtDateTime(u.lastTxnAt)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => openDrawer(u)}
                            className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                          >
                            View ledger
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end border-t border-slate-100 px-4 py-3">
              <Pagination
                currentPage={usersPagination.page}
                totalPages={usersPagination.totalPages}
                onPageChange={setUserPage}
              />
            </div>
          </div>
        </div>
      )}

      {/* SESSIONS */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                placeholder="Search mate, caller, email, or type…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
              Mate share {mateSharePercent}% · Platform {100 - mateSharePercent}%
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3 text-xs text-slate-500">
              {sessionsPagination.total} ended sessions
              {sessionsFetching ? " · updating…" : ""}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Mate</th>
                    <th className="px-4 py-3">Caller</th>
                    <th className="px-4 py-3 text-center">Duration</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-right">Charged</th>
                    <th className="px-4 py-3 text-right text-purple-600">
                      Mate ({mateSharePercent}%)
                    </th>
                    <th className="px-4 py-3 text-right text-indigo-600">
                      Platform
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessionsLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                        Loading sessions…
                      </td>
                    </tr>
                  ) : sessions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                        No sessions found.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                          {fmtDateTime(s.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                            {s.callType === "CHAT" ? (
                              <MessageSquare className="h-3 w-3" />
                            ) : s.callType === "VIDEO" ? (
                              <Layers className="h-3 w-3" />
                            ) : (
                              <Phone className="h-3 w-3" />
                            )}
                            {s.callType}
                          </span>
                          {s.isFreeSession && (
                            <div className="mt-1 text-[10px] font-bold uppercase text-amber-600">
                              Welcome credits
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {s.mateName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {s.mateEmail || s.mateMobile || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {s.callerName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {s.callerEmail || s.callerMobile || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs">
                          {durationLabel(s.duration)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500">
                          {s.ratePerMin != null ? `${money(s.ratePerMin)}/min` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {money(s.totalAmountDeducted)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-purple-600">
                          {money(s.mateShare)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-600">
                          {money(s.platformShare)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end border-t border-slate-100 px-4 py-3">
              <Pagination
                currentPage={sessionsPagination.page}
                totalPages={sessionsPagination.totalPages}
                onPageChange={setSessionPage}
              />
            </div>
          </div>
        </div>
      )}

      {/* USER LEDGER DRAWER */}
      {selectedUser && (
        <>
          <div
            className={`fixed inset-0 z-[999] bg-slate-900/50 transition-opacity duration-300 ${
              isDrawerOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            onClick={closeDrawer}
          />
          <div
            className={`fixed inset-y-0 right-0 z-[1000] flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 p-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedUser.userName || "User"}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedUser.userEmail || "—"}
                </p>
                <p className="text-xs text-slate-400">
                  {selectedUser.userMobile || ""}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-slate-100 bg-slate-50/60 p-4">
              <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                <div className="text-[9px] font-bold uppercase text-slate-400">
                  Recharged
                </div>
                <div className="text-sm font-bold text-emerald-600">
                  {money(selectedUser.totalRecharged)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                <div className="text-[9px] font-bold uppercase text-slate-400">
                  Spent
                </div>
                <div className="text-sm font-bold text-rose-600">
                  {money(selectedUser.totalSpent)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                <div className="text-[9px] font-bold uppercase text-slate-400">
                  Wallet
                </div>
                <div className="text-sm font-black text-slate-900">
                  {money(selectedUser.walletBalance)}
                </div>
              </div>
            </div>

            <div className="flex border-b border-slate-100">
              {[
                { id: "all", label: "All" },
                { id: "recharges", label: "Credits" },
                { id: "spends", label: "Debits" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDrawerTab(t.id)}
                  className={`flex-1 py-3 text-xs font-bold transition ${
                    drawerTab === t.id
                      ? "border-b-2 border-indigo-600 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50/30 p-4">
              {drawerTxLoading ? (
                <p className="py-10 text-center text-xs text-slate-400">
                  Loading ledger…
                </p>
              ) : drawerTx.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-white py-10 text-center text-xs text-slate-400">
                  No transactions in this view.
                </p>
              ) : (
                drawerTx.map((tx) => (
                  <div
                    key={tx.id || tx._id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${sourceBadge(tx.source)}`}
                        >
                          {tx.source}
                        </span>
                        <div className="mt-1.5 text-xs font-medium text-slate-800">
                          {tx.description || tx.type}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">
                          {fmtDateTime(tx.createdAt)}
                          {tx.openingBalance != null &&
                            tx.closingBalance != null && (
                              <>
                                {" "}
                                · {money(tx.openingBalance)} →{" "}
                                {money(tx.closingBalance)}
                              </>
                            )}
                        </div>
                      </div>
                      <div
                        className={`shrink-0 text-sm font-black ${
                          tx.type === "CREDIT"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {tx.type === "CREDIT" ? "+" : "-"}
                        {money(tx.amount)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 px-4 py-3">
              <Pagination
                currentPage={drawerPagination.page}
                totalPages={drawerPagination.totalPages}
                onPageChange={setDrawerPage}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Financials;
