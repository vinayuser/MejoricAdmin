import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetQuery,
  useDeleteMutation,
  usePutMutation,
} from "../../api/apiCall";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import API_ENDPOINTS from "../../api/apiEndpoint";
import {
  Mail,
  Phone,
  Trash2,
  History,
  Pencil,
  Plus,
  Power,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Table from "../../components/UI/Table";
import UserHistoryModal from "../../components/UserHistoryModal";

const MateList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetQuery(
    `/users/getAll?page=1&limit=100&role=mate`,
    ["mates"],
  );
  const [historyUser, setHistoryUser] = React.useState(null);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, body }) => {
      const response = await axiosInstance.put(
        `${API_ENDPOINTS.USER.UPDATE_PROFILE}?userId=${userId}`,
        body,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Status updated!");
      refetch();
    },
    onError: (err) => {
      toast.error("Update failed: " + (err?.message || "Unknown error"));
    },
  });

  const toggleOnline = (mate) => {
    updateStatusMutation.mutate({
      userId: mate._id,
      body: { isOnline: !mate.isOnline },
    });
  };

  useEffect(() => {
    refetch();
  }, [location.state?.fromEdit, refetch]);

  const deleteMutation = useDeleteMutation(API_ENDPOINTS.MATES.DELETE, {
    onSuccess: () => {
      toast.success("Mate deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(
        "Failed to delete mate: " + (error?.message || "Unknown error"),
      );
    },
  });

  const handleDelete = (mate) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to remove ${mate.name}. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5", // indigo-600
      cancelButtonColor: "#ef4444", // red-500
      confirmButtonText: "Yes, delete it!",
      background: "#ffffff",
      borderRadius: "1rem",
      customClass: {
        title: "text-slate-900 font-bold",
        htmlContainer: "text-slate-600",
        confirmButton:
          "px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200/50",
        cancelButton: "px-6 py-2.5 rounded-xl font-bold",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(mate._id);
      }
    });
  };

  const columns = [
    {
      key: "profile",
      title: "Profile",
      render: (mate) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
            {mate.image || mate.category?.image ? (
              <img
                src={mate.image || mate.category?.image}
                alt={mate.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                {mate.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-900 capitalize">
              {mate.name}
            </span>
            <span className="text-xs text-slate-500 capitalize">
              {mate.role}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact",
      render: (mate) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Mail className="h-3 w-3 text-slate-400" />
            <span className="truncate max-w-[150px]">{mate.email || "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Phone className="h-3 w-3 text-slate-400" />
            <span>{mate.mobile || "—"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      title: "Price/Hour",
      render: (mate) => (
        <span className="text-sm font-bold text-emerald-600">
          {mate.mate?.priceUnit === "USD" ? "$" : "₹"}{" "}
          {mate.mate?.pricePerMin != null ? mate.mate.pricePerMin : "—"}
        </span>
      ),
    },
    {
      key: "isOnline",
      title: "Availability",
      render: (mate) => {
        if (mate.role !== "mate")
          return <span className="text-slate-300">—</span>;
        const isOnline = mate.mate?.isAvailable;
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateStatusMutation.mutate({
                  userId: mate._id,
                  body: { isOnline: !isOnline },
                });
              }}
              disabled={updateStatusMutation.isPending}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                isOnline ? "bg-indigo-600" : "bg-slate-200"
              } ${updateStatusMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  isOnline ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isOnline ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      render: (mate) => (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
              mate.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {mate.isActive ? "Active" : "Inactive"}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
              mate.isOnBoardingCompleted
                ? "bg-blue-50 text-blue-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {mate.isOnBoardingCompleted ? "Onboarded" : "Pending"}
          </span>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        Failed to load mates: {error?.message}
      </div>
    );
  }

  const mates = data?.data?.data || [];

  return (
    <div className="space-y-6">
      <Table
        title="Mates"
        description={`Total ${data?.data?.total || 0} mates found`}
        addButtonText="Add Mate"
        columns={columns}
        data={mates}
        onAddNew={() => navigate("/mate/add")}
        onEdit={(mate) => navigate(`/mate/edit/${mate._id}`)}
        onHistory={(mate) => setHistoryUser(mate)}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {historyUser && (
        <UserHistoryModal
          user={historyUser}
          onClose={() => setHistoryUser(null)}
        />
      )}
    </div>
  );
};

export default MateList;
