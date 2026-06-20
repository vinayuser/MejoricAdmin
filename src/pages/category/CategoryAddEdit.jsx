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

const CategoryAddEdit = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: undefined,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { mutate: addCategory, isPending: isAdding } = usePostMutation(
    API_ENDPOINTS.CATEGORIES.CREATE,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(progress);
      },
    }
  );

  const { mutate: updateCategory, isPending: isUpdating } = usePutMutation(
    `${API_ENDPOINTS.CATEGORIES.UPDATE.replace(":id", id)}`,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(progress);
      },
    }
  );

  const { data: categoryData, isPending: isFetchingCategory } = useGetQuery(
    isEditMode && id
      ? `${API_ENDPOINTS.CATEGORIES.GET_ONE.replace(":id", id)}`
      : "/categories/getAll?limit=1",
    isEditMode ? ["category", id] : ["category", "add"],
    {
      enabled: isEditMode && Boolean(id),
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (isEditMode && categoryData) {
      const category = categoryData.data ?? categoryData.result ?? categoryData;
      if (category) {
        setFormData({
          name: category.name || "",
          description: category.description || "",
          //   image: "", // keep empty until new file selected
        });

        if (category.image) {
          const imageUrl = category.image.startsWith("http")
            ? category.image
            : `${process.env.REACT_APP_API_BASE_URL || ""}${category.image}`;
          setPreviewImage(imageUrl);
        }
      } else {
        toast.error("Failed to load category data");
      }
    }
  }, [isEditMode, categoryData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Title is required");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name.trim());
    formDataToSend.append("description", formData.description.trim());
    // Only append image if selected
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    // FormData ready to send

    setUploadProgress(0);

    const onSuccess = () => {
      setFormData({ name: "", description: "", image: undefined });
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadProgress(0);

      toast.success(
        isEditMode
          ? "Category updated successfully!"
          : "Category added successfully!"
      );
      setTimeout(() => navigate("/category"), 1000);
    };

    const onError = (error) => {
      const errorMessage =
        error.response?.data?.message || error.message || "Operation failed";
      toast.error(errorMessage);
      setUploadProgress(0);
    };

    try {
      if (isEditMode) {
        updateCategory(formDataToSend, { onSuccess, onError });
      } else {
        addCategory(formDataToSend, { onSuccess, onError });
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, image: undefined }));
      setPreviewImage(null);
      return;
    }

    // Simple file assignment without validation
    setFormData((prev) => ({ ...prev, image: file }));

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    setFormData((prev) => ({ ...prev, image: undefined }));
    setPreviewImage(null);
    toast.success("Image removed");
  };

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  if (isEditMode && isFetchingCategory) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader size={64} color="#4f46e5" className="mx-auto" />
          <p className="mt-3 text-sm text-slate-600">Loading category…</p>
        </div>
      </div>
    );
  }

  const isLoading = isAdding || isUpdating;
  const inputClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-2 py-2 sm:px-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {isEditMode ? "Edit category" : "New category"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? "Update the title, description, or image for this category."
            : "Add a title, optional description, and an image for listing."}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Web development"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                className={inputClass}
                required
                maxLength={100}
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.name.length}/100
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="description"
                placeholder="Short description for this category"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                className={`${inputClass} resize-y`}
                rows={4}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.description.length}/500
              </p>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Image
              </span>
              <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50">
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Choose file
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <span className="min-w-0 flex-1 truncate px-3 py-3 text-sm text-slate-600">
                  {formData.image?.name ||
                    (isEditMode && !formData.image
                      ? "Existing image will be kept if unchanged"
                      : "No file selected")}
                </span>
              </div>

              {isLoading && uploadProgress > 0 && (
                <div className="mt-3">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-center text-xs text-slate-600">
                    Uploading… {uploadProgress}%
                  </p>
                </div>
              )}

              {previewImage && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">Preview</p>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex justify-center rounded-lg border border-dashed border-slate-200 bg-white p-4">
                    <img
                      src={previewImage}
                      alt="Category preview"
                      className="max-h-48 w-auto object-contain"
                    />
                  </div>
                  {isEditMode && !formData.image && (
                    <p className="mt-2 text-center text-xs text-slate-500">
                      Currently stored image
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/category")}
              className="order-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:order-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="order-1 inline-flex min-w-[10rem] items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 sm:order-2"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isEditMode ? "Saving…" : "Adding…"}
                </span>
              ) : isEditMode ? (
                "Save changes"
              ) : (
                "Create category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryAddEdit;
