import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Video,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { useGetQuery } from "../../api/apiCall";
import Loader from "../UI/Loader";
import { formatDateTime } from "../../utils/formatters";

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

function DetailField({ label, value, className = "" }) {
  return (
    <div className={`rounded-lg bg-slate-50/80 px-3 py-2 ${className}`}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-800 break-words">{value || "—"}</dd>
    </div>
  );
}

function AppointmentCard({ booking }) {
  const [expanded, setExpanded] = useState(false);
  const guest = booking.guestDetails || {};

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-slate-50/80 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                STATUS_STYLES[booking.status] || STATUS_STYLES.scheduled
              }`}
            >
              {booking.status?.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-500">{booking.zoomProvider} meeting</span>
          </div>
          <p className="font-semibold text-slate-900">{guest.fullName || "Guest"}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateTime(booking.scheduledAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-purple-700 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {booking.slotLabel}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <div className="grid gap-3 sm:grid-cols-2 pt-4">
            <DetailField label="Guest name" value={guest.fullName} />
            <DetailField label="Guest email" value={guest.email} />
            <DetailField label="Guest phone" value={guest.phone} />
            <DetailField label="Gender" value={guest.gender} />
            <DetailField label="Age" value={guest.age} />
            <DetailField label="Budget" value={guest.budget} />
            <DetailField label="Referral" value={guest.referral} />
            <DetailField
              label="Booked user account"
              value={booking.user?.name || "Guest booking"}
            />
            <DetailField
              label="Account email"
              value={booking.user?.email}
              className="sm:col-span-2"
            />
            <DetailField
              label="Support needs"
              value={guest.supportNeeds}
              className="sm:col-span-2"
            />
            <DetailField label="Date key" value={booking.dateKey} />
            <DetailField
              label="Planned duration"
              value={booking.durationMinutes ? `${booking.durationMinutes} min` : "—"}
            />
            <DetailField
              label="Actual duration"
              value={formatDuration(booking.actualDurationSeconds)}
            />
            <DetailField label="Email status" value={booking.emailStatus} />
            <DetailField
              label="Actual start"
              value={formatDateTime(booking.actualStartTime)}
            />
            <DetailField
              label="Actual end"
              value={formatDateTime(booking.actualEndTime)}
            />
            <DetailField
              label="Meeting ID"
              value={booking.zoomMeetingId}
              className="sm:col-span-2"
            />
            <DetailField label="Passcode" value={booking.zoomPassword} />
            <DetailField
              label="Booking ID"
              value={booking._id}
              className="sm:col-span-2"
            />
            <DetailField
              label="Created"
              value={formatDateTime(booking.createdAt)}
            />
            <DetailField
              label="Updated"
              value={formatDateTime(booking.updatedAt)}
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {booking.zoomStartUrl && (
              <a
                href={booking.zoomStartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
              >
                <Video className="w-3.5 h-3.5" />
                Host link
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {booking.zoomJoinUrl && (
              <a
                href={booking.zoomJoinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50"
              >
                <Video className="w-3.5 h-3.5" />
                Participant link
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MentorViewModal({ mentor, onClose }) {
  const endpoint = `/bookings/admin/list?mentorId=${mentor._id}&page=1&limit=100`;
  const { data, isLoading } = useGetQuery(endpoint, ["mentor-bookings", mentor._id], {
    enabled: Boolean(mentor?._id),
  });

  const bookings = data?.data?.data || [];
  const total = data?.data?.total || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        role="presentation"
        aria-hidden
      />
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentor-view-title"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-14 w-14 overflow-hidden rounded-full border border-purple-100 bg-purple-50 shrink-0">
              {mentor.image ? (
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-purple-400">
                  {mentor.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2
                id="mentor-view-title"
                className="text-xl font-bold text-slate-900 capitalize truncate"
              >
                {mentor.name}
              </h2>
              <p className="text-sm text-purple-600 font-medium">Mentor details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Profile
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailField
                label="Email"
                value={mentor.email}
                className="sm:col-span-2"
              />
              <DetailField label="Mobile" value={mentor.mobile} />
              <DetailField
                label="Status"
                value={mentor.isActive ? "Active" : "Inactive"}
              />
              <DetailField
                label="Mentor type"
                value={mentor.mentor?.mentorType}
              />
              <DetailField
                label="Experience"
                value={
                  mentor.mentor?.experience != null
                    ? `${mentor.mentor.experience} years`
                    : "—"
                }
              />
              <DetailField
                label="Specializations"
                value={(mentor.mentor?.specifications || []).join(", ")}
                className="sm:col-span-2"
              />
              <DetailField label="Mentor ID" value={mentor._id} className="sm:col-span-2" />
            </dl>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Appointments
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {total} total
              </span>
            </div>

            {isLoading ? (
              <div className="py-10">
                <Loader />
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No appointments booked for this mentor yet.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <AppointmentCard key={booking._id} booking={booking} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
