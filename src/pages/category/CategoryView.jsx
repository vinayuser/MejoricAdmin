const CategoryView = ({ category, onClose }) => {
  if (!category) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-view-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl ring-1 ring-slate-900/5">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="category-view-title"
                className="text-lg font-semibold text-slate-900"
              >
                Category details
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">Read-only</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200/80 hover:text-slate-800"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-[min(70vh,32rem)] space-y-4 overflow-y-auto px-5 py-5 text-sm text-slate-800">
          {category.image && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
              <img
                src={category.image}
                alt={category.name || "Category"}
                className="mx-auto max-h-48 w-auto object-contain"
              />
            </div>
          )}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Title
            </h3>
            <p className="mt-1 font-medium text-slate-900">
              {category.name || "—"}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Description
            </h3>
            <p className="mt-1 whitespace-pre-wrap text-slate-700">
              {category.description || "No description provided"}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Created
              </h3>
              <p className="mt-1 font-mono text-xs text-slate-800">
                {category?.createdAt
                  ? new Date(category.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Updated
              </h3>
              <p className="mt-1 font-mono text-xs text-slate-800">
                {category?.updatedAt
                  ? new Date(category.updatedAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
