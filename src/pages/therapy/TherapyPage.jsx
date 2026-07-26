import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/UI/Table";
import { useGetQuery, useDeleteMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";
import { toast } from "react-hot-toast";
import Pagination from "../../components/UI/Pagination";
import { formatDateTime } from "../../utils/formatters";

const TherapyPage = () => {
  const [cohorts, setCohorts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });
  const navigate = useNavigate();

  const { data, isPending, error, refetch } = useGetQuery(
    `${API_ENDPOINTS.THERAPY.GET_ALL}?page=${pagination.currentPage}&limit=${pagination.limit}`,
    ["therapy-cohorts", pagination.currentPage, pagination.limit],
  );

  const { mutate: deleteCohort, isPending: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.THERAPY.DELETE,
  );

  useEffect(() => {
    if (data?.data?.data) {
      setCohorts(data.data.data);
      setPagination((prev) => ({
        ...prev,
        currentPage: data.data.page,
        totalPages: data.data.totalPages,
        totalItems: data.data.total,
      }));
    }
  }, [data]);

  const columns = [
    {
      key: "theme",
      title: "Theme",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: row.band || "#7c6ba8" }}
          />
          <div>
            <div className="font-medium">{row.theme}</div>
            <div className="text-xs text-slate-500">{row.tag}</div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      title: "Price",
      render: (row) => `₹${row.price}`,
    },
    {
      key: "seats",
      title: "Seats",
      render: (row) => `${row.takenSeats ?? 0}/${row.totalSeats ?? 0}`,
    },
    {
      key: "slots",
      title: "Slots",
      render: (row) => row.slots?.length ?? 0,
    },
    {
      key: "status",
      title: "Status",
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
          {row.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader size={64} color="#7c6ba8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">{error.message}</p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-red-700 px-3 py-1.5 text-sm text-white"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Group Therapy</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage cohorts, pricing, seats, and session slots. Enrolled users join
          only from Mejoric after purchase verification.
        </p>
      </div>
      <Table
        title="Therapy cohorts"
        description="Create open cohorts with schedule and meeting links."
        addButtonText="Create cohort"
        columns={columns}
        data={cohorts}
        onAddNew={() => navigate("/therapy/add")}
        onEdit={(row) => navigate(`/therapy/update/${row._id}`)}
        onDelete={(row) => {
          if (!window.confirm(`Delete "${row.theme}"?`)) return;
          deleteCohort(row._id, {
            onSuccess: () => {
              toast.success("Cohort deleted");
              refetch();
            },
            onError: (err) => toast.error(err?.message || "Delete failed"),
          });
        }}
        isLoading={isDeleting}
      />
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, currentPage: page }))
        }
      />
    </div>
  );
};

export default TherapyPage;
