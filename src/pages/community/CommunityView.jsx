const CommunityView = ({ community, onClose }) => {
  if (!community) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Community details
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Read-only</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/80"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[min(70vh,32rem)] space-y-4 overflow-y-auto px-5 py-5 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{community.emoji || "💬"}</span>
            <div>
              <p className="font-semibold text-slate-900">{community.name}</p>
              <p className="text-xs text-slate-500">
                {community.memberCount ?? 0} members ·{" "}
                {community.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Description
            </h3>
            <p className="mt-1 text-slate-800">{community.description || "—"}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Who it&apos;s for
            </h3>
            <p className="mt-1 text-slate-800">{community.who || "—"}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Color
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="inline-block h-5 w-5 rounded-full border border-slate-200"
                style={{ background: community.color || "#9043B5" }}
              />
              <span>{community.color || "#9043B5"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
