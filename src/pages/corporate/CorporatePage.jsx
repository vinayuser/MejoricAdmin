import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/UI/Table";
import { useGetQuery, useDeleteMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";
import { toast } from "react-hot-toast";
import Pagination from "../../components/UI/Pagination";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const MinuteBar = ({ label, remaining, total, color }) => {
  const rem = Number(remaining) || 0;
  const tot = Number(total) || 0;
  const pct = tot > 0 ? Math.min(100, Math.round((rem / tot) * 100)) : 0;
  const low = tot > 0 && pct <= 20;

  return (
    <div className="min-w-[132px]">
      <div className="mb-0.5 flex items-center justify-between gap-2 text-[11px] leading-none">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="tabular-nums text-slate-700">
          <span className={`font-semibold ${low ? "text-amber-700" : "text-slate-900"}`}>
            {rem.toLocaleString("en-IN")}
          </span>
          <span className="text-slate-400">/{tot.toLocaleString("en-IN")}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${low ? "bg-amber-500" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

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
    error,
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

  const handleDelete = (row) => {
    if (!window.confirm(`Delete corporate account "${row.name}"?`)) return;
    deleteCorporate(row._id, {
      onSuccess: () => {
        toast.success("Corporate account deleted");
        refetch();
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Failed to delete"),
    });
  };

  const columns = [
    {
      key: "name",
      title: "Company",
      render: (row) => (
        <div className="min-w-[140px]">
          <div className="font-medium text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500">@{row.emailDomain}</div>
        </div>
      ),
    },
    {
      key: "billingContactEmail",
      title: "Owner email",
      render: (row) => (
        <span className="text-slate-700 break-all">
          {row.billingContactEmail || "—"}
        </span>
      ),
    },
    {
      key: "contract",
      title: "Contract",
      render: (row) => {
        if (row.contractExpired) {
          return (
            <div className="whitespace-nowrap">
              <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                Expired
              </span>
              {row.contractEndDate && (
                <div className="mt-1 text-[11px] text-slate-500">
                  Ended {new Date(row.contractEndDate).toLocaleDateString("en-IN")}
                </div>
              )}
            </div>
          );
        }
        if (row.contractRemainingDays == null) {
          return (
            <div className="whitespace-nowrap text-sm text-slate-600">
              Open-ended
            </div>
          );
        }
        const days = row.contractRemainingDays;
        const urgent = days <= 30;
        return (
          <div className="whitespace-nowrap">
            <div
              className={`text-sm font-semibold tabular-nums ${
                urgent ? "text-amber-700" : "text-slate-900"
              }`}
            >
              {days} day{days === 1 ? "" : "s"} left
            </div>
            {row.contractEndDate && (
              <div className="text-[11px] text-slate-500">
                Until {new Date(row.contractEndDate).toLocaleDateString("en-IN")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "billing",
      title: "Billing",
      render: (row) => (
        <div className="whitespace-nowrap">
          <div className="text-slate-800">{money(row.monthlyPlatformFee)}/mo</div>
          <div
            className={`text-xs ${
              row.outstandingBalance > 0
                ? "font-medium text-amber-700"
                : "text-slate-500"
            }`}
          >
            Due {money(row.outstandingBalance)}
            {row.hasOverdue ? " · overdue" : ""}
          </div>
        </div>
      ),
    },
    {
      key: "minutes",
      title: "Minutes left",
      render: (row) => (
        <div className="flex flex-col gap-2 py-0.5">
          <MinuteBar
            label="Audio"
            remaining={row.audioMinutesRemaining}
            total={row.audioMinutesTotal}
            color="bg-sky-500"
          />
          <MinuteBar
            label="Video"
            remaining={row.videoMinutesRemaining}
            total={row.videoMinutesTotal}
            color="bg-violet-500"
          />
          <MinuteBar
            label="Chat"
            remaining={row.chatMinutesRemaining}
            total={row.chatMinutesTotal}
            color="bg-emerald-500"
          />
        </div>
      ),
    },
    {
      key: "memberCount",
      title: "Users",
      render: (row) => (
        <span className="font-medium text-slate-800">{row.memberCount ?? 0}</span>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (row) => {
        if (row.contractExpired) {
          return (
            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
              Ended
            </span>
          );
        }
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              row.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];

  if (isListLoading && !corporates.length) {
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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Corporate accounts
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Manage B2B contracts, employee minute pools, and company owners.
        </p>
      </div>

      {overview && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {[
            ["Active companies", overview.activeCorporates],
            ["Monthly recurring", money(overview.monthlyRecurringRevenue)],
            ["Outstanding", money(overview.totalOutstanding)],
            ["Collected", money(overview.totalCollected)],
            ["Overdue invoices", overview.overdueInvoices],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-1.5 text-xl font-semibold text-slate-900">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      <Table
        title="Companies"
        description="Create and edit corporate contracts shown on corporate.mejoric.com."
        addButtonText="Add corporate account"
        columns={columns}
        data={corporates}
        emptyMessage="No corporate accounts yet."
        onAddNew={() => navigate("/corporate/add")}
        onView={(row) => navigate(`/corporate/view/${row._id}`)}
        onEdit={(row) => navigate(`/corporate/update/${row._id}`)}
        onDelete={handleDelete}
        isLoading={isDeleting}
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Showing {corporates.length} of {pagination.totalItems}
        </p>
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, currentPage: page }))
            }
          />
        )}
      </div>
    </div>
  );
};

export default CorporatePage;
