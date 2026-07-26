import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetQuery,
  usePostMutation,
  usePutMutation,
} from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";
import { toast } from "react-hot-toast";

const emptySlot = () => ({
  label: "",
  scheduledAt: "",
  durationMinutes: 90,
  meetingUrl: "",
  meetingPassword: "",
});

const TherapyAddEdit = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    theme: "",
    tag: "",
    band: "#7c6ba8",
    description: "",
    who: "",
    approach: "",
    psychologistLabel: "",
    dayLabel: "",
    sessionsCount: 6,
    durationMinutes: 90,
    price: 2400,
    totalSeats: 8,
    status: "open",
    isActive: true,
    waitlistEnabled: true,
    slots: [emptySlot()],
  });

  const { data, isPending } = useGetQuery(
    isEdit ? API_ENDPOINTS.THERAPY.GET_ONE.replace(":id", id) : "/therapy/admin/getAll?limit=1",
    isEdit ? ["therapy", id] : ["therapy-add"],
    { enabled: isEdit },
  );

  const { mutate: create, isPending: creating } = usePostMutation(
    API_ENDPOINTS.THERAPY.CREATE,
  );
  const { mutate: update, isPending: updating } = usePutMutation(
    API_ENDPOINTS.THERAPY.UPDATE.replace(":id", id),
  );

  useEffect(() => {
    if (!isEdit || !data?.data) return;
    const c = data.data;
    setForm({
      theme: c.theme || "",
      tag: c.tag || "",
      band: c.band || "#7c6ba8",
      description: c.description || "",
      who: c.who || "",
      approach: c.approach || "",
      psychologistLabel: c.psychologistLabel || "",
      dayLabel: c.dayLabel || "",
      sessionsCount: c.sessionsCount || 6,
      durationMinutes: c.durationMinutes || 90,
      price: c.price || 2400,
      totalSeats: c.totalSeats || 8,
      status: c.status || "open",
      isActive: c.isActive !== false,
      waitlistEnabled: c.waitlistEnabled !== false,
      slots:
        c.slots?.length > 0
          ? c.slots.map((s) => ({
              _id: s._id,
              label: s.label || "",
              scheduledAt: s.scheduledAt
                ? new Date(s.scheduledAt).toISOString().slice(0, 16)
                : "",
              durationMinutes: s.durationMinutes || 90,
              meetingUrl: s.meetingUrl || "",
              meetingPassword: s.meetingPassword || "",
            }))
          : [emptySlot()],
    });
  }, [isEdit, data]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateSlot = (index, key, value) => {
    setForm((prev) => {
      const slots = [...prev.slots];
      slots[index] = { ...slots[index], [key]: value };
      return { ...prev, slots };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.theme.trim()) {
      toast.error("Theme is required");
      return;
    }
    if (!form.price || Number(form.price) < 1) {
      toast.error("Set a valid cohort price");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      totalSeats: Number(form.totalSeats),
      sessionsCount: Number(form.sessionsCount),
      durationMinutes: Number(form.durationMinutes),
      slots: form.slots
        .filter((s) => s.scheduledAt)
        .map((s) => ({
          ...(s._id ? { _id: s._id } : {}),
          label: s.label,
          scheduledAt: new Date(s.scheduledAt).toISOString(),
          durationMinutes: Number(s.durationMinutes) || form.durationMinutes,
          meetingUrl: s.meetingUrl,
          meetingPassword: s.meetingPassword,
        })),
    };

    const onSuccess = () => {
      toast.success(isEdit ? "Cohort updated" : "Cohort created");
      navigate("/therapy");
    };
    const onError = (err) =>
      toast.error(err?.response?.data?.message || err?.message || "Failed");

    if (isEdit) update(payload, { onSuccess, onError });
    else create(payload, { onSuccess, onError });
  };

  if (isEdit && isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader size={48} color="#7c6ba8" />
      </div>
    );
  }

  const busy = creating || updating;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {isEdit ? "Edit cohort" : "Create therapy cohort"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Set price, seats, schedule, and optional Zoom/Meet links. Users only
          receive platform join links after payment.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block space-y-1">
          <span className="text-sm font-medium">Theme *</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.theme}
            onChange={(e) => setField("theme", e.target.value)}
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Tag</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.tag}
              onChange={(e) => setField("tag", e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Accent color</span>
            <input
              type="color"
              className="h-10 w-full rounded-lg border border-slate-200"
              value={form.band}
              onChange={(e) => setField("band", e.target.value)}
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Description</span>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Who it&apos;s for</span>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={2}
            value={form.who}
            onChange={(e) => setField("who", e.target.value)}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Approach</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.approach}
              onChange={(e) => setField("approach", e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Psychologist</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.psychologistLabel}
              onChange={(e) => setField("psychologistLabel", e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Price (₹) *</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Total seats *</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.totalSeats}
              onChange={(e) => setField("totalSeats", e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Day label</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Tuesdays"
              value={form.dayLabel}
              onChange={(e) => setField("dayLabel", e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Sessions</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.sessionsCount}
              onChange={(e) => setField("sessionsCount", e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Minutes / session</span>
            <input
              type="number"
              min={15}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.durationMinutes}
              onChange={(e) => setField("durationMinutes", e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
            />
            Active on user app
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.waitlistEnabled}
              onChange={(e) => setField("waitlistEnabled", e.target.checked)}
            />
            Enable waitlist when full
          </label>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Session slots
            </h2>
            <button
              type="button"
              className="text-sm font-medium text-slate-700 underline"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  slots: [...prev.slots, emptySlot()],
                }))
              }
            >
              + Add slot
            </button>
          </div>
          {form.slots.map((slot, index) => (
            <div
              key={slot._id || index}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Slot {index + 1}
                </span>
                {form.slots.length > 1 && (
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        slots: prev.slots.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-medium">Label</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder={`Session ${index + 1}`}
                    value={slot.label}
                    onChange={(e) => updateSlot(index, "label", e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium">Starts (local)</span>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={slot.scheduledAt}
                    onChange={(e) =>
                      updateSlot(index, "scheduledAt", e.target.value)
                    }
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-medium">
                  Meeting URL (Zoom/Meet — only after purchase gate)
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="https://zoom.us/j/..."
                  value={slot.meetingUrl}
                  onChange={(e) =>
                    updateSlot(index, "meetingUrl", e.target.value)
                  }
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium">Meeting password</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={slot.meetingPassword}
                  onChange={(e) =>
                    updateSlot(index, "meetingPassword", e.target.value)
                  }
                />
              </label>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/therapy")}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Saving…" : isEdit ? "Update cohort" : "Create cohort"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TherapyAddEdit;
