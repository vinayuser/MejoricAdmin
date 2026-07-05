import React from "react";
import {
  X,
  Phone,
  MessageSquare,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useGetQuery } from "../api/apiCall";
import API_ENDPOINTS from "../api/apiEndpoint";
import Loader from "./UI/Loader";
import { formatDateTime } from "../utils/formatters";

const StatCard = ({ label, value, sub }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    {sub ? <p className="mt-0.5 text-xs text-slate-500">{sub}</p> : null}
  </div>
);

function MateStatsModal({ mate, date, onClose }) {
  const mateUserId = mate?.mateUserId;
  const { data, isLoading } = useGetQuery(
    `${API_ENDPOINTS.MATE_AVAILABILITY.DAILY_STATS}/${mateUserId}/daily-stats?date=${date}`,
    ["mate-daily-stats", mateUserId, date],
    { enabled: Boolean(mateUserId && date) },
  );

  const stats = data?.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold capitalize text-slate-900">
              {mate?.name || stats?.mate?.name || "Mate"} — daily stats
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Service summary for {date} (IST)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader />
            </div>
          ) : !stats ? (
            <p className="py-12 text-center text-slate-500">No stats available.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    stats.mate?.isAvailable
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {stats.mate?.isAvailable ? (
                    <Wifi className="h-3 w-3" />
                  ) : (
                    <WifiOff className="h-3 w-3" />
                  )}
                  {stats.mate?.isAvailable ? "Online" : "Offline"}
                </span>
                <span className="text-sm text-slate-500">
                  {stats.mate?.mobile || "—"} · {stats.mate?.email || "—"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard
                  label="Customers served"
                  value={stats.customersServed}
                  sub="Unique users today"
                />
                <StatCard
                  label="Online today"
                  value={stats.availability?.totalOnlineFormatted || "0s"}
                />
                <StatCard
                  label="Total calls"
                  value={stats.calls?.total || 0}
                  sub={`${stats.calls?.uniqueCustomers || 0} customers`}
                />
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Phone className="h-4 w-4 text-indigo-500" />
                  Calls
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Audio" value={stats.calls?.audio || 0} />
                  <StatCard label="Video" value={stats.calls?.video || 0} />
                  <StatCard
                    label="Duration"
                    value={stats.calls?.totalDurationFormatted || "0s"}
                  />
                  <StatCard
                    label="Earnings"
                    value={`₹${stats.calls?.totalAmountDeducted || 0}`}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <MessageSquare className="h-4 w-4 text-indigo-500" />
                  Chats
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Sessions" value={stats.chats?.total || 0} />
                  <StatCard
                    label="Customers"
                    value={stats.chats?.uniqueCustomers || 0}
                  />
                  <StatCard
                    label="Messages"
                    value={stats.chats?.totalMessages || 0}
                  />
                  <StatCard
                    label="Duration"
                    value={stats.chats?.totalDurationFormatted || "0s"}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Stats include ended calls and chats for the selected IST date.
                Opened {formatDateTime(new Date())}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MateStatsModal;
