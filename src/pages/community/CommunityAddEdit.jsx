import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePostMutation,
  useGetQuery,
  usePutMutation,
} from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { toast } from "react-hot-toast";
import Loader from "../../components/UI/Loader";

/** Icons shown on community cards — admin picks one for the card header */
const COMMUNITY_ICONS = [
  { emoji: "🌀", label: "Spiral" },
  { emoji: "🌧️", label: "Rain" },
  { emoji: "🗣️", label: "Voice" },
  { emoji: "💼", label: "Work" },
  { emoji: "🔋", label: "Energy" },
  { emoji: "⚡", label: "Bolt" },
  { emoji: "🔮", label: "Crystal" },
  { emoji: "🪞", label: "Mirror" },
  { emoji: "🌱", label: "Growth" },
  { emoji: "🤱", label: "Parent" },
  { emoji: "🌙", label: "Night" },
  { emoji: "🕊️", label: "Peace" },
  { emoji: "🌿", label: "Leaf" },
  { emoji: "🏳️‍🌈", label: "Pride" },
  { emoji: "📚", label: "Study" },
  { emoji: "☕", label: "Cafe" },
  { emoji: "💬", label: "Chat" },
  { emoji: "🤝", label: "Support" },
  { emoji: "💜", label: "Heart" },
  { emoji: "🌊", label: "Wave" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "🧠", label: "Mind" },
  { emoji: "🏠", label: "Home" },
  { emoji: "✨", label: "Spark" },
];

const CommunityAddEdit = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    who: "",
    emoji: "💬",
    color: "#7c6ba8",
    isActive: true,
    image: undefined,
  });
  const [previewImage, setPreviewImage] = useState(null);

  const { mutate: addCommunity, isPending: isAdding } = usePostMutation(
    API_ENDPOINTS.COMMUNITIES.CREATE,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  const { mutate: updateCommunity, isPending: isUpdating } = usePutMutation(
    `${API_ENDPOINTS.COMMUNITIES.UPDATE.replace(":id", id)}`,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  const { data: communityData, isPending: isFetching } = useGetQuery(
    isEditMode && id
      ? `${API_ENDPOINTS.COMMUNITIES.GET_ONE.replace(":id", id)}`
      : "/communities/admin/getAll?limit=1",
    isEditMode ? ["community", id] : ["community", "add"],
    {
      enabled: isEditMode && Boolean(id),
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (!isEditMode || !communityData) return;
    const c = communityData.data ?? communityData;
    if (!c) return;
    setFormData({
      name: c.name || "",
      description: c.description || "",
      who: c.who || "",
      emoji: c.emoji || "💬",
      color: c.color || "#7c6ba8",
      isActive: c.isActive !== false,
      image: undefined,
    });
    if (c.image) setPreviewImage(c.image);
  }, [isEditMode, communityData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const body = new FormData();
    body.append("name", formData.name.trim());
    body.append("description", formData.description.trim());
    body.append("who", formData.who.trim());
    body.append("emoji", formData.emoji || "💬");
    body.append("color", formData.color || "#7c6ba8");
    body.append("isActive", String(formData.isActive));
    if (formData.image) body.append("image", formData.image);

    const onSuccess = () => {
      toast.success(isEditMode ? "Community updated" : "Community created");
      setTimeout(() => navigate("/communities"), 600);
    };
    const onError = (error) => {
      toast.error(
        error.response?.data?.message || error.message || "Operation failed",
      );
    };

    if (isEditMode) updateCommunity(body, { onSuccess, onError });
    else addCommunity(body, { onSuccess, onError });
  };

  if (isEditMode && isFetching) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader size={48} color="#4f46e5" />
      </div>
    );
  }

  const busy = isAdding || isUpdating;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {isEditMode ? "Edit community" : "Create community"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Communities appear on the user Community page after activation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Name *</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={formData.name}
            onChange={(e) =>
              setFormData((p) => ({ ...p, name: e.target.value }))
            }
            required
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Who it&apos;s for</span>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={2}
            value={formData.who}
            onChange={(e) =>
              setFormData((p) => ({ ...p, who: e.target.value }))
            }
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-700">
              Card icon
            </span>
            <span className="text-2xl" title="Selected">
              {formData.emoji || "💬"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Shown on the community card (top-left), like on the user app.
          </p>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
            {COMMUNITY_ICONS.map((icon) => {
              const selected = formData.emoji === icon.emoji;
              return (
                <button
                  key={icon.emoji}
                  type="button"
                  title={icon.label}
                  onClick={() =>
                    setFormData((p) => ({ ...p, emoji: icon.emoji }))
                  }
                  className={`flex h-11 items-center justify-center rounded-xl border text-xl transition ${
                    selected
                      ? "border-slate-900 bg-slate-900/5 ring-2 ring-slate-900"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {icon.emoji}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Accent color</span>
          <input
            type="color"
            className="h-10 w-full cursor-pointer rounded-lg border border-slate-200"
            value={formData.color}
            onChange={(e) =>
              setFormData((p) => ({ ...p, color: e.target.value }))
            }
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((p) => ({ ...p, isActive: e.target.checked }))
            }
          />
          Active (visible on user app)
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Image</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setFormData((p) => ({ ...p, image: file }));
              setPreviewImage(URL.createObjectURL(file));
            }}
          />
          {previewImage && (
            <img
              src={previewImage}
              alt=""
              className="mt-2 h-24 w-24 rounded-lg object-cover"
            />
          )}
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/communities")}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Saving…" : isEditMode ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityAddEdit;
