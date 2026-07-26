import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/UI/Table";
import {
  useGetQuery,
  useDeleteMutation,
} from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";
import { toast } from "react-hot-toast";
import Pagination from "../../components/UI/Pagination";
import { formatDateTime } from "../../utils/formatters";

const EMPLOYMENT_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

/** Force Cloudinary to send Content-Disposition: attachment */
function cvDownloadUrl(url, fileName) {
  if (!url) return "#";
  const name = (fileName || "cv.pdf").replace(/[^\w.-]+/g, "_");
  if (url.includes("/upload/") && !url.includes("fl_attachment")) {
    return url.replace(
      "/upload/",
      `/upload/fl_attachment:${encodeURIComponent(name)}/`,
    );
  }
  return url;
}

const CareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [tab, setTab] = useState("jobs");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });
  const [appPagination, setAppPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });
  const [appStatus, setAppStatus] = useState("all");
  const navigate = useNavigate();

  const {
    data: listData,
    isPending: isListLoading,
    error,
    refetch,
  } = useGetQuery(
    `${API_ENDPOINTS.CAREERS.GET_ALL}?page=${pagination.currentPage}&limit=${pagination.limit}`,
    ["careers", pagination.currentPage, pagination.limit],
  );

  const {
    data: appsData,
    isPending: isAppsLoading,
    refetch: refetchApps,
  } = useGetQuery(
    `${API_ENDPOINTS.CAREERS.APPLICATIONS}?page=${appPagination.currentPage}&limit=${appPagination.limit}&status=${appStatus}`,
    ["career-apps", appPagination.currentPage, appPagination.limit, appStatus],
    { enabled: tab === "applications" },
  );

  const { mutate: deleteJob, isPending: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.CAREERS.DELETE,
  );

  useEffect(() => {
    if (listData?.data?.data) {
      setJobs(listData.data.data);
      setPagination((prev) => ({
        ...prev,
        currentPage: listData.data.page,
        totalPages: listData.data.totalPages,
        totalItems: listData.data.total,
      }));
    }
  }, [listData]);

  useEffect(() => {
    if (appsData?.data) {
      setAppPagination((prev) => ({
        ...prev,
        currentPage: appsData.data.page,
        totalPages: appsData.data.totalPages,
        totalItems: appsData.data.total,
      }));
    }
  }, [appsData]);

  const applications = appsData?.data?.data || [];

  const handleDelete = (id, title) => {
    if (!window.confirm(`Delete job "${title}"?`)) return;
    deleteJob(id, {
      onSuccess: () => {
        toast.success("Job deleted");
        refetch();
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Failed to delete"),
    });
  };

  const jobColumns = [
    {
      key: "title",
      title: "Title",
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <div className="text-xs text-slate-500">{row.department || "—"}</div>
        </div>
      ),
    },
    {
      key: "location",
      title: "Location",
      render: (row) => (
        <span>
          {row.isRemote ? "Remote" : row.location || "—"}
          {row.isRemote && row.location ? ` · ${row.location}` : ""}
        </span>
      ),
    },
    {
      key: "employmentType",
      title: "Type",
      render: (row) => EMPLOYMENT_LABELS[row.employmentType] || row.employmentType,
    },
    {
      key: "isActive",
      title: "Status",
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            row.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {row.isActive ? "Active" : "Hidden"}
        </span>
      ),
    },
    {
      key: "applicationCount",
      title: "Applications",
      render: (row) => row.applicationCount || 0,
    },
    {
      key: "createdAt",
      title: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "actions",
      title: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/careers/update/${row.id || row._id}`)}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => handleDelete(row.id || row._id, row.title)}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Careers</h1>
          <p className="text-sm text-slate-500">
            Manage job openings and review applications.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/careers/add")}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add job
        </button>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 self-start w-fit">
        {[
          { id: "jobs", label: "Jobs" },
          { id: "applications", label: "Applications" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${
              tab === t.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "jobs" && (
        <>
          {isListLoading ? (
            <Loader />
          ) : error ? (
            <p className="text-rose-600 text-sm">Failed to load jobs</p>
          ) : (
            <>
              <Table columns={jobColumns} data={jobs} />
              <div className="flex justify-end">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) =>
                    setPagination((p) => ({ ...p, currentPage: page }))
                  }
                />
              </div>
            </>
          )}
        </>
      )}

      {tab === "applications" && (
        <div className="space-y-4">
          <select
            value={appStatus}
            onChange={(e) => {
              setAppStatus(e.target.value);
              setAppPagination((p) => ({ ...p, currentPage: 1 }));
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>

          {isAppsLoading ? (
            <Loader />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">Why applying</th>
                    <th className="px-4 py-3">CV</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No applications yet
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id}>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{app.name}</div>
                          <div className="text-xs text-slate-500">{app.email}</div>
                          <div className="text-xs text-slate-400">{app.mobile}</div>
                        </td>
                        <td className="px-4 py-3">{app.jobTitle || "—"}</td>
                        <td className="max-w-xs px-4 py-3 text-xs text-slate-600">
                          <div className="line-clamp-3">{app.whyApplying}</div>
                        </td>
                        <td className="px-4 py-3">
                          {app.cvUrl ? (
                            <div className="flex flex-col gap-1">
                              <a
                                href={app.cvUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-indigo-600 hover:underline"
                              >
                                View CV
                              </a>
                              <a
                                href={cvDownloadUrl(app.cvUrl, app.cvFileName)}
                                download={app.cvFileName || "cv.pdf"}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-emerald-600 hover:underline"
                              >
                                Download CV
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <AppStatusSelect
                            applicationId={app.id}
                            value={app.status}
                            onUpdated={refetchApps}
                          />
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {formatDateTime(app.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="flex justify-end border-t px-4 py-3">
                <Pagination
                  currentPage={appPagination.currentPage}
                  totalPages={appPagination.totalPages}
                  onPageChange={(page) =>
                    setAppPagination((p) => ({ ...p, currentPage: page }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function AppStatusSelect({ applicationId, value, onUpdated }) {
  const [status, setStatus] = useState(value);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(value);
  }, [value]);

  const onChange = async (e) => {
    const next = e.target.value;
    setStatus(next);
    setBusy(true);
    try {
      const axiosInstance = (await import("../../api/axiosInstance")).default;
      await axiosInstance.put(
        `${API_ENDPOINTS.CAREERS.UPDATE_APPLICATION_STATUS}${applicationId}/status`,
        { status: next },
      );
      toast.success("Status updated");
      onUpdated?.();
    } catch (err) {
      setStatus(value);
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      value={status}
      disabled={busy}
      onChange={onChange}
      className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
    >
      <option value="pending">Pending</option>
      <option value="reviewed">Reviewed</option>
      <option value="shortlisted">Shortlisted</option>
      <option value="rejected">Rejected</option>
    </select>
  );
}

export default CareersPage;
