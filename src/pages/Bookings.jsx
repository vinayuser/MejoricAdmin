import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Search,
  Video,
  User,
  Mail,
  Phone,
  Filter,
} from "lucide-react";
import { useGetQuery } from "../api/apiCall";
import Loader from "../components/UI/Loader";
import { formatDateTime } from "../utils/formatters";

const STATUS_STYLES = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-600",
  no_show: "bg-red-100 text-red-700",
};

function formatDuration(seconds) {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

const Bookings = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const queryKey = ["admin-bookings", page, status, search];
  const endpoint = `/bookings/admin/list?page=${page}&limit=20${
    status ? `&status=${status}` : ""
  }${search ? `&search=${encodeURIComponent(search)}` : ""}`;

  const { data, isLoading, isFetching } = useGetQuery(endpoint, queryKey);

  const result = data?.data || {};
  const bookings = result.data || [];
  const stats = result.stats || {};
  const totalPages = result.totalPages || 1;

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mentor Bookings</h1>
        <p className="text-slate-500 mt-1">
          Track scheduled sessions, Zoom meeting duration, and participant details.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Scheduled" value={stats.totalScheduled || 0} />
        <StatCard label="In progress" value={stats.totalInProgress || 0} />
        <StatCard label="Completed" value={stats.totalCompleted || 0} />
        <StatCard
          label="Total meeting time"
          value={`${Math.ceil((stats.totalDurationSeconds || 0) / 60)} min`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border-b border-slate-100">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No show</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16">
            <Loader />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Mentor</th>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Zoom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-4 align-top">
                      <div className="font-semibold text-slate-900">
                        {booking.guestDetails?.fullName}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 mt-1">
                        <Mail className="w-3 h-3" />
                        {booking.guestDetails?.email}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 mt-1">
                        <Phone className="w-3 h-3" />
                        {booking.guestDetails?.phone}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-2">
                        {booking.mentor?.image ? (
                          <img
                            src={booking.mentor.image}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-900 capitalize">
                            {booking.mentor?.name || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {booking.mentor?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateTime(booking.scheduledAt)}
                      </div>
                      <div className="flex items-center gap-1 text-purple-600 font-medium mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.slotLabel}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-semibold text-slate-900">
                        {formatDuration(booking.actualDurationSeconds)}
                      </div>
                      {booking.actualStartTime && (
                        <div className="text-xs text-slate-500 mt-1">
                          Started: {formatDateTime(booking.actualStartTime)}
                        </div>
                      )}
                      {booking.actualEndTime && (
                        <div className="text-xs text-slate-500">
                          Ended: {formatDateTime(booking.actualEndTime)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          STATUS_STYLES[booking.status] || STATUS_STYLES.scheduled
                        }`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">
                        {booking.zoomProvider} meeting
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-mono text-xs text-slate-700">
                        {booking.zoomMeetingId || "—"}
                      </div>
                      {booking.zoomJoinUrl && (
                        <a
                          href={booking.zoomJoinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 text-xs font-semibold mt-2 hover:underline"
                        >
                          <Video className="w-3 h-3" />
                          Join link
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
            {isFetching && !isLoading ? " · Updating..." : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );
}

export default Bookings;
