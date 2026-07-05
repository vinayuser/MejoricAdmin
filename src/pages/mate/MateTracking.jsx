import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Clock,
  Radio,
  RefreshCw,
  Search,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Pagination from "../../components/UI/Pagination";
import MateStatsModal from "../../components/MateStatsModal";
import { useMateTrackingSocket } from "../../hooks/useMateTrackingSocket";
import { formatDateTime } from "../../utils/formatters";

const PAGE_SIZE = 10;

const formatDuration = (totalSeconds) => {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const formatLiveTimer = (totalSeconds) => {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

const liveSessionSeconds = (startedAt) => {
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt)) / 1000));
};

const todayIST = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};

const buildQuery = (base, { date, page, limit, search }) => {
  const params = new URLSearchParams({
    date,
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set("search", search.trim());
  return `${base}?${params.toString()}`;
};

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative max-w-xs">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

function TableFooter({ page, totalPages, total, onPageChange }) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page {page} of {totalPages} · {total} total
      </p>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}

function MateTracking() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(todayIST());
  const [tick, setTick] = useState(0);

  const [onlinePage, setOnlinePage] = useState(1);
  const [onlineSearch, setOnlineSearch] = useState("");
  const [onlineDebounced, setOnlineDebounced] = useState("");

  const [activityPage, setActivityPage] = useState(1);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityDebounced, setActivityDebounced] = useState("");

  const [summaryPage, setSummaryPage] = useState(1);
  const [summarySearch, setSummarySearch] = useState("");
  const [summaryDebounced, setSummaryDebounced] = useState("");

  const [statsMate, setStatsMate] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setOnlineDebounced(onlineSearch);
      setOnlinePage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [onlineSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      setActivityDebounced(activitySearch);
      setActivityPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [activitySearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSummaryDebounced(summarySearch);
      setSummaryPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [summarySearch]);

  useEffect(() => {
    setOnlinePage(1);
    setActivityPage(1);
    setSummaryPage(1);
  }, [selectedDate]);

  const handleSocketUpdate = useCallback(
    (payload) => {
      if (!payload?.dayKey || payload.dayKey === selectedDate) {
        queryClient.invalidateQueries({ queryKey: ["mate-tracking"] });
      }
    },
    [queryClient, selectedDate],
  );

  const { connected } = useMateTrackingSocket(handleSocketUpdate);

  const listParams = { date: selectedDate, limit: PAGE_SIZE };

  const { data: overviewRes, refetch, isFetching } = useGetQuery(
    buildQuery(API_ENDPOINTS.MATE_AVAILABILITY.OVERVIEW, {
      ...listParams,
      page: 1,
      search: "",
    }),
    ["mate-tracking", "overview", selectedDate],
    { refetchInterval: 30000 },
  );

  const { data: onlineRes, isLoading: onlineLoading } = useGetQuery(
    buildQuery(API_ENDPOINTS.MATE_AVAILABILITY.ONLINE, {
      ...listParams,
      page: onlinePage,
      search: onlineDebounced,
    }),
    ["mate-tracking", "online", selectedDate, onlinePage, onlineDebounced],
    { refetchInterval: 30000 },
  );

  const { data: activityRes, isLoading: activityLoading } = useGetQuery(
    buildQuery(API_ENDPOINTS.MATE_AVAILABILITY.ACTIVITY, {
      ...listParams,
      page: activityPage,
      search: activityDebounced,
    }),
    ["mate-tracking", "activity", selectedDate, activityPage, activityDebounced],
    { refetchInterval: 30000 },
  );

  const { data: summaryRes, isLoading: summaryLoading } = useGetQuery(
    buildQuery(API_ENDPOINTS.MATE_AVAILABILITY.SUMMARY, {
      ...listParams,
      page: summaryPage,
      search: summaryDebounced,
    }),
    ["mate-tracking", "summary", selectedDate, summaryPage, summaryDebounced],
    { refetchInterval: 30000 },
  );

  const onlineCount = overviewRes?.data?.onlineCount ?? 0;
  const totalMates = overviewRes?.data?.totalMates ?? 0;

  const onlineItems = useMemo(() => {
    void tick;
    const rows = onlineRes?.data?.items || [];
    return rows.map((row) => {
      const liveSeconds = liveSessionSeconds(row.currentSessionStartedAt);
      const totalToday = (row.closedSecondsToday || 0) + liveSeconds;
      return {
        ...row,
        liveSessionTimer: formatLiveTimer(liveSeconds),
        totalTodayFormatted: formatDuration(totalToday),
      };
    });
  }, [onlineRes, tick]);

  const onlinePagination = onlineRes?.data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  const activityItems = useMemo(() => {
    void tick;
    return (activityRes?.data?.items || []).map((row) => {
      if (row.isActive) {
        const seconds = liveSessionSeconds(row.at);
        return {
          ...row,
          durationLabel: formatLiveTimer(seconds),
          isLive: true,
        };
      }
      return {
        ...row,
        durationLabel:
          row.activity === "offline" && row.durationSeconds
            ? formatDuration(row.durationSeconds)
            : "—",
        isLive: false,
      };
    });
  }, [activityRes, tick]);

  const activityPagination = activityRes?.data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  const summaryItems = useMemo(() => {
    void tick;
    return (summaryRes?.data?.items || []).map((row) => {
      const liveSeconds = row.isAvailable
        ? liveSessionSeconds(row.currentSessionStartedAt)
        : 0;
      const totalToday = (row.closedSecondsToday || 0) + liveSeconds;
      return {
        ...row,
        currentSessionFormatted: row.isAvailable
          ? formatLiveTimer(liveSeconds)
          : "—",
        totalTodayFormatted: formatDuration(totalToday),
      };
    });
  }, [summaryRes, tick]);

  const summaryPagination = summaryRes?.data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mate availability tracking
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live online mates, activity log, and per-mate daily service stats.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              connected
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <Radio className={`h-3 w-3 ${connected ? "animate-pulse" : ""}`} />
            {connected ? "Live" : "Connecting…"}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Online now
          </p>
          <p className="mt-1 text-3xl font-bold text-emerald-900">{onlineCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total mates
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{totalMates}</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Tracking date (IST)
          </p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-2 h-9 w-full rounded-md border border-indigo-200 bg-white px-2 text-sm"
          />
        </div>
      </div>

      {/* Currently online */}
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-emerald-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-emerald-900">
              Currently online
            </h2>
            <p className="text-sm text-emerald-700/80">Live session timers</p>
          </div>
          <SearchBar
            value={onlineSearch}
            onChange={setOnlineSearch}
            placeholder="Search mate…"
          />
        </div>
        {onlineLoading ? (
          <div className="py-16 text-center text-slate-500">Loading…</div>
        ) : onlineItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No mates online.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 font-semibold text-slate-600">Mate</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Phone</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Session started
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Live timer
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Online today
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {onlineItems.map((row) => (
                    <tr key={row.mateUserId} className="bg-emerald-50/30 hover:bg-emerald-50/50">
                      <td className="px-4 py-3 font-medium capitalize text-slate-900">
                        {row.name || "—"}
                        {row.isBusy && (
                          <span className="ml-2 text-xs text-amber-600">(Busy)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.mobile || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateTime(row.currentSessionStartedAt)}
                      </td>
                      <td className="px-4 py-3 font-mono text-base font-bold text-emerald-700">
                        {row.liveSessionTimer}
                      </td>
                      <td className="px-4 py-3 font-semibold text-indigo-700">
                        {row.totalTodayFormatted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TableFooter
              page={onlinePagination.page}
              totalPages={onlinePagination.totalPages}
              total={onlinePagination.total}
              onPageChange={setOnlinePage}
            />
          </>
        )}
      </div>

      {/* Activity log */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Activity log</h2>
            <p className="text-sm text-slate-500">Online / offline events</p>
          </div>
          <SearchBar
            value={activitySearch}
            onChange={setActivitySearch}
            placeholder="Search mate…"
          />
        </div>
        {activityLoading ? (
          <div className="py-16 text-center text-slate-500">Loading…</div>
        ) : activityItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No activity for this date.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 font-semibold text-slate-600">Mate</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Activity</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Duration</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityItems.map((row) => (
                    <tr
                      key={row.id}
                      className={
                        row.isLive ? "bg-emerald-50/50 hover:bg-emerald-50" : "hover:bg-slate-50/50"
                      }
                    >
                      <td className="px-4 py-3 font-medium capitalize text-slate-900">
                        {row.mateName || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                            row.activity === "online"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {row.activity === "online" ? (
                            <Wifi className="h-3 w-3" />
                          ) : (
                            <WifiOff className="h-3 w-3" />
                          )}
                          {row.activity === "online" ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.isLive ? (
                          <span className="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-700">
                            <Clock className="h-3.5 w-3.5 animate-pulse" />
                            {row.durationLabel}
                          </span>
                        ) : (
                          <span className="font-mono text-slate-700">{row.durationLabel}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateTime(row.at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TableFooter
              page={activityPagination.page}
              totalPages={activityPagination.totalPages}
              total={activityPagination.total}
              onPageChange={setActivityPage}
            />
          </>
        )}
      </div>

      {/* Mate summary */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Mate summary</h2>
            <p className="text-sm text-slate-500">
              Click a mate to view daily service stats
            </p>
          </div>
          <SearchBar
            value={summarySearch}
            onChange={setSummarySearch}
            placeholder="Search mate…"
          />
        </div>
        {summaryLoading ? (
          <div className="py-16 text-center text-slate-500">Loading…</div>
        ) : summaryItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No mates found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 font-semibold text-slate-600">Mate</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Last change
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Session
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Online today
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Stats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaryItems.map((row) => (
                    <tr
                      key={row.mateUserId}
                      className={
                        row.isAvailable ? "bg-emerald-50/20 hover:bg-emerald-50/40" : "hover:bg-slate-50/50"
                      }
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium capitalize text-slate-900">
                          {row.name || "—"}
                        </p>
                        <p className="text-xs text-slate-500">{row.mobile || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                            row.isAvailable
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {row.isAvailable ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateTime(row.lastChangeAt)}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-700">
                        {row.currentSessionFormatted}
                      </td>
                      <td className="px-4 py-3 font-semibold text-indigo-700">
                        {row.totalTodayFormatted}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setStatsMate(row)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                          View stats
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TableFooter
              page={summaryPagination.page}
              totalPages={summaryPagination.totalPages}
              total={summaryPagination.total}
              onPageChange={setSummaryPage}
            />
          </>
        )}
      </div>

      {statsMate && (
        <MateStatsModal
          mate={statsMate}
          date={selectedDate}
          onClose={() => setStatsMate(null)}
        />
      )}
    </div>
  );
}

export default MateTracking;
