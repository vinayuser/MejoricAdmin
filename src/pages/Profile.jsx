import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import API_ENDPOINTS from "../api/apiEndpoint";
import { usePutMutation } from "../api/apiCall";
import useAuth from "../hooks/useAuth";
import { updateProfile } from "../store/auth/authSlice";
import { formatDateTime } from "../utils/formatters";

const inputClass =
  "block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const ProfilePage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const userData = user || {};

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    mobile: userData?.mobile || "",
    address: userData?.address || "",
    image: userData?.image || "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        mobile: userData.mobile || "",
        address: userData.address || "",
        image: userData.image || "",
      });
    }
  }, [userData]);

  const updateProfileMutation = usePutMutation(
    API_ENDPOINTS.USER.UPDATE_PROFILE,
    {
      onSuccess: (res) => {
        const next = res?.data ?? res;
        dispatch(updateProfile(next));
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        setIsEditing(false);
      },
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const formatDate = formatDateTime;

  const saving = updateProfileMutation.isPending;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Your account details and preferences. Email is managed for security and
          cannot be changed here.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <div className="relative">
                {userData?.image ? (
                  <img
                    src={userData.image}
                    alt={userData.name || ""}
                    className="h-24 w-24 rounded-2xl border-2 border-white/20 object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10 text-3xl font-semibold text-white shadow-lg">
                    {userData?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {userData?.name || "User"}
                </h2>
                <p className="mt-0.5 text-sm capitalize text-slate-300">
                  {userData?.role || "role"}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-400">
                  {userData?._id
                    ? `ID · ${String(userData._id).slice(0, 10)}…`
                    : "—"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-white/20"
            >
              {isEditing ? "Cancel" : "Edit profile"}
            </button>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`}
                    disabled
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Contact support to change your email.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    id="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="image"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Profile image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    id="image"
                    value={formData.image}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://…"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Address
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Full address"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex min-w-[6rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-w-[6rem] items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>

              {updateProfileMutation.isError && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {updateProfileMutation.error?.message ||
                    "Update failed. Try again."}
                </div>
              )}
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div>
                <h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Personal
                </h3>
                <dl className="space-y-4 text-sm">
                  {[
                    ["Name", userData?.name || "—"],
                    ["Email", userData?.email || "—"],
                    ["Mobile", userData?.mobile || "—"],
                    [
                      "Role",
                      <span
                        key="r"
                        className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-slate-800 capitalize"
                      >
                        {userData?.role || "—"}
                      </span>,
                    ],
                    ["Address", userData?.address || "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="mt-0.5 font-medium text-slate-900 truncate" title={typeof v === 'string' ? v : undefined}>
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Account
                </h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-slate-500">User ID</dt>
                    <dd className="mt-0.5 break-all font-mono text-xs text-slate-800">
                      {userData?._id || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Created</dt>
                    <dd className="mt-0.5 text-slate-900">
                      {userData?.createdAt
                        ? formatDate(userData.createdAt)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Last updated</dt>
                    <dd className="mt-0.5 text-slate-900">
                      {userData?.updatedAt
                        ? formatDate(userData.updatedAt)
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
