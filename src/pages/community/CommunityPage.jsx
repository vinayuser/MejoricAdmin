import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/UI/Table";
import {
  useGetQuery,
  useDeleteMutation,
  usePutMutation,
} from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";
import { toast } from "react-hot-toast";
import CommunityView from "./CommunityView";
import Pagination from "../../components/UI/Pagination";
import { formatDateTime } from "../../utils/formatters";

const CommunityPage = () => {
  const [communities, setCommunities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [unlockAmount, setUnlockAmount] = useState(100);
  const [priceDraft, setPriceDraft] = useState("100");
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
    `${API_ENDPOINTS.COMMUNITIES.GET_ALL}?page=${pagination.currentPage}&limit=${pagination.limit}`,
    ["communities", pagination.currentPage, pagination.limit],
  );

  const { data: pricingData, refetch: refetchPricing } = useGetQuery(
    API_ENDPOINTS.COMMUNITIES.GET_PRICING,
    ["community-pricing"],
  );

  const { mutate: updatePricing, isPending: isSavingPrice } = usePutMutation(
    API_ENDPOINTS.COMMUNITIES.UPDATE_PRICING,
  );

  const { mutate: deleteCommunity, isPending: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.COMMUNITIES.DELETE,
  );

  useEffect(() => {
    if (listData?.data?.data) {
      setCommunities(listData.data.data);
      setPagination((prev) => ({
        ...prev,
        currentPage: listData.data.page,
        totalPages: listData.data.totalPages,
        totalItems: listData.data.total,
      }));
    }
  }, [listData]);

  useEffect(() => {
    const amount = pricingData?.data?.unlockAmount;
    if (typeof amount === "number") {
      setUnlockAmount(amount);
      setPriceDraft(String(amount));
    }
  }, [pricingData]);

  const savePricing = (e) => {
    e.preventDefault();
    const n = Math.round(Number(priceDraft));
    if (!Number.isFinite(n) || n < 1) {
      toast.error("Enter a valid unlock price (₹1 or more)");
      return;
    }
    updatePricing(
      { unlockAmount: n },
      {
        onSuccess: (res) => {
          const saved = res?.data?.unlockAmount ?? n;
          setUnlockAmount(saved);
          setPriceDraft(String(saved));
          toast.success(`Unlock price set to ₹${saved}`);
          refetchPricing();
        },
        onError: (err) =>
          toast.error(
            err?.response?.data?.message || err?.message || "Failed to save",
          ),
      },
    );
  };

  const columns = [
    {
      key: "emoji",
      title: "",
      render: (row) => (
        <span className="text-2xl" title={row.name}>
          {row.emoji || "💬"}
        </span>
      ),
    },
    {
      key: "name",
      title: "Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: row.color || "#7c6ba8" }}
          />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (row) => (
        <div className="max-w-xs truncate text-slate-600">
          {row.description || "—"}
        </div>
      ),
    },
    {
      key: "memberCount",
      title: "Members",
      render: (row) => row.memberCount ?? 0,
    },
    {
      key: "isActive",
      title: "Status",
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            row.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (isListLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader size={64} color="#7c6ba8" className="mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6">
        <h3 className="font-semibold text-red-900">Error loading communities</h3>
        <p className="mt-1 text-sm text-red-800">{error.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Communities
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Manage peer communities. Users unlock once for ₹{unlockAmount}, then
          can join any community.
        </p>
      </div>

      <form
        onSubmit={savePricing}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold text-slate-900">
            One-time unlock price
          </h2>
          <p className="text-xs text-slate-500">
            Shown on the user Community page. Welcome wallet balance cannot pay
            this fee.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">₹</span>
            <input
              type="number"
              min={1}
              step={1}
              value={priceDraft}
              onChange={(e) => setPriceDraft(e.target.value)}
              className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSavingPrice}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSavingPrice ? "Saving…" : "Save price"}
        </button>
      </form>

      <Table
        title="Community management"
        description="Create and edit communities shown on the user app."
        addButtonText="Create community"
        columns={columns}
        data={communities}
        onAddNew={() => navigate("/communities/add")}
        onView={(row) => {
          setSelected(row);
          setIsViewOpen(true);
        }}
        onEdit={(row) => navigate(`/communities/update/${row._id}`)}
        onDelete={(row) => {
          if (!window.confirm(`Delete "${row.name}"?`)) return;
          deleteCommunity(row._id, {
            onSuccess: () => {
              toast.success("Community deleted");
              refetch();
            },
            onError: (err) =>
              toast.error(err?.message || "Failed to delete"),
          });
        }}
        isLoading={isDeleting}
      />
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Showing {communities.length} of {pagination.totalItems}
        </p>
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
        />
      </div>
      {isViewOpen && (
        <CommunityView
          community={selected}
          onClose={() => setIsViewOpen(false)}
        />
      )}
    </div>
  );
};

export default CommunityPage;
