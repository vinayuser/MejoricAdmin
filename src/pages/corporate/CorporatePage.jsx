import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/UI/Table";
import { useGetQuery, useDeleteMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";
import { toast } from "react-hot-toast";
import Pagination from "../../components/UI/Pagination";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const CorporatePage = () => {
  const [corporates, setCorporates] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });
  const navigate = useNavigate();

  const {
    data: listData,
    isPending: isListLoading,
    refetch,
  } = useGetQuery(
    `${API_ENDPOINTS.CORPORATE.GET_ALL}?page=${pagination.currentPage}&limit=${pagination.limit}`,
    ["corporates", pagination.currentPage, pagination.limit],
  );

  const { data: overviewData } = useGetQuery(
    API_ENDPOINTS.CORPORATE.BILLING_OVERVIEW,
    ["corporate-billing-overview"],
  );

  const overview = overviewData?.data;

  const { mutate: deleteCorporate, isPending: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.CORPORATE.DELETE,
  );

  useEffect(() => {
    if (listData?.data?.data) {
      setCorporates(listData.data.data);
      setPagination((prev) => ({
        ...prev,
        currentPage: listData.data.page,
        totalPages: listData.data.totalPages,
        totalItems: listData.data.total,
      }));
    }
  }, [listData]);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete corporate account "${name}"?`)) return;
    deleteCorporate(id, {
      onSuccess: () => {
        toast.success("Corporate account deleted");
        refetch();
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Failed to delete"),
    });
  };

  const columns = [
    { key: "name", title: "Company" },
    {
      key: "emailDomain",
      title: "Email domain",
      render: (row) => `@${row.emailDomain}`,
    },
    {
      key: "monthlyPlatformFee",
      title: "Cycle fee",
      render: (row) => money(row.monthlyPlatformFee),
    },
    {
      key: "outstandingBalance",
      title: "Outstanding",
      render: (row) => (
        <span className={row.outstandingBalance > 0 ? "text-amber-700 font-medium" : ""}>
          {money(row.outstandingBalance)}
          {row.hasOverdue && (
            <span className="ml-1 text-xs text-red-600">(overdue)</span>
          )}
        </span>
      ),
    },
    {
      key: "audioMinutesRemaining",
      title: "Audio min",
      render: (row) => `${row.audioMinutesRemaining ?? 0} / ${row.audioMinutesTotal ?? 0}`,
    },
    {
      key: "videoMinutesRemaining",
      title: "Video min",
      render: (row) => `${row.videoMinutesRemaining ?? 0} / ${row.videoMinutesTotal ?? 0}`,
    },
    {
      key: "chatMinutesRemaining",
      title: "Chat min",
      render: (row) => `${row.chatMinutesRemaining ?? 0} / ${row.chatMinutesTotal ?? 0}`,
    },
    { key: "memberCount", title: "Users" },
    {
      key: "isActive",
      title: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  if (isListLoading && !corporates.length) return <Loader />;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Corporate accounts</h1>
          <p className="text-slate-500 text-sm mt-1">
            B2B contracts, invoicing, payments, and employee minute pools.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/corporate/add")}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          Add corporate account
        </button>
      </div>

      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[
            ["Active companies", overview.activeCorporates],
            ["Monthly recurring", money(overview.monthlyRecurringRevenue)],
            ["Outstanding", money(overview.totalOutstanding)],
            ["Collected", money(overview.totalCollected)],
            ["Overdue invoices", overview.overdueInvoices],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      <Table
        columns={columns}
        data={corporates}
        emptyMessage="No corporate accounts yet."
        onView={(row) => navigate(`/corporate/view/${row._id}`)}
        onEdit={(row) => navigate(`/corporate/update/${row._id}`)}
        onDelete={(row) => handleDelete(row._id, row.name)}
        isLoading={isDeleting}
      />

      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, currentPage: page }))
            }
          />
        </div>
      )}
    </div>
  );
};

export default CorporatePage;
