import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePostMutation,
  useGetQuery,
  usePutMutation,
} from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { toast } from "react-hot-toast";
import Loader from "../../components/UI/Loader";
import RichTextEditor from "../../components/UI/RichTextEditor";

const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const emptyForm = {
  title: "",
  description: "",
  skills: "",
  location: "",
  isRemote: true,
  employmentType: "full-time",
  experience: "",
  department: "",
  salaryRange: "",
  isActive: true,
};

const CareerAddEdit = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const { data, isPending: isFetching } = useGetQuery(
    isEdit
      ? API_ENDPOINTS.CAREERS.GET_ONE.replace(":id", id)
      : "/careers/admin/getAll?limit=1",
    ["career-job", id],
    { enabled: isEdit },
  );

  const { mutate: createJob, isPending: isCreating } = usePostMutation(
    API_ENDPOINTS.CAREERS.CREATE,
  );
  const { mutate: updateJob, isPending: isUpdating } = usePutMutation(
    API_ENDPOINTS.CAREERS.UPDATE.replace(":id", id || ""),
  );

  useEffect(() => {
    const job = data?.data;
    if (!job || !isEdit) return;
    setForm({
      title: job.title || "",
      description: job.description || "",
      skills: (job.skills || []).join(", "),
      location: job.location || "",
      isRemote: Boolean(job.isRemote),
      employmentType: job.employmentType || "full-time",
      experience: job.experience || "",
      department: job.department || "",
      salaryRange: job.salaryRange || "",
      isActive: job.isActive !== false,
    });
  }, [data, isEdit]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const plain = form.description.replace(/<[^>]+>/g, "").trim();
    if (!plain) {
      toast.error("Description is required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      location: form.location.trim(),
      isRemote: form.isRemote,
      employmentType: form.employmentType,
      experience: form.experience.trim(),
      department: form.department.trim(),
      salaryRange: form.salaryRange.trim(),
      isActive: form.isActive,
    };

    const opts = {
      onSuccess: () => {
        toast.success(isEdit ? "Job updated" : "Job created");
        navigate("/careers");
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Failed to save"),
    };

    if (isEdit) updateJob(payload, opts);
    else createJob(payload, opts);
  };

  if (isEdit && isFetching) return <Loader />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/careers")}
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          ← Back to careers
        </button>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {isEdit ? "Edit job" : "Add job"}
        </h1>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Job title *
          </label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="e.g. Frontend Engineer"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Description *
          </label>
          <RichTextEditor
            value={form.description}
            onChange={(html) =>
              setForm((prev) => ({ ...prev, description: html }))
            }
            placeholder="Role overview, responsibilities, requirements…"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Skills (comma-separated)
          </label>
          <input
            name="skills"
            value={form.skills}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="React, Node.js, Communication"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Department
            </label>
            <input
              name="department"
              value={form.department}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="Engineering"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Employment type
            </label>
            <select
              name="employmentType"
              value={form.employmentType}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="Bengaluru / Anywhere"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Experience
            </label>
            <input
              name="experience"
              value={form.experience}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="2–4 years"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Salary range (optional)
          </label>
          <input
            name="salaryRange"
            value={form.salaryRange}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="₹8–12 LPA"
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isRemote"
              checked={form.isRemote}
              onChange={onChange}
              className="rounded border-slate-300"
            />
            Remote job
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={onChange}
              className="rounded border-slate-300"
            />
            Published (visible on careers page)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/careers")}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isCreating || isUpdating
              ? "Saving…"
              : isEdit
                ? "Update job"
                : "Create job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CareerAddEdit;
