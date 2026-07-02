import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useGetQuery, useDeleteMutation } from "../../api/apiCall";
import axiosInstance from "../../api/axiosInstance";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { Mail, Phone } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Table from "../../components/UI/Table";
import MentorViewModal from "../../components/mentor/MentorViewModal";

const MentorList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMentor, setViewMentor] = useState(null);
  const { data, isLoading, error, refetch } = useGetQuery(
    `${API_ENDPOINTS.MENTORS.GET_ALL}?page=1&limit=100`,
    ["mentors"],
  );

  useEffect(() => {
    refetch();
  }, [location.state?.fromEdit, location.state?.fromCreate, refetch]);

  const deleteMutation = useDeleteMutation(API_ENDPOINTS.MENTORS.DELETE, {
    onSuccess: () => {
      toast.success("Mentor deleted successfully!");
      refetch();
    },
    onError: (err) => {
      toast.error(
        "Failed to delete mentor: " + (err?.message || "Unknown error"),
      );
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (mentorId) => {
      const response = await axiosInstance.put(
        `${API_ENDPOINTS.MENTORS.RESET_PASSWORD}/${mentorId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password reset to 00000000");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reset password",
      );
    },
  });

  const handleDelete = (mentor) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to remove ${mentor.name}. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(mentor._id);
      }
    });
  };

  const handleResetPassword = (mentor) => {
    Swal.fire({
      title: "Reset password?",
      html: `Reset password for <strong>${mentor.name}</strong> to <code>00000000</code>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, reset it",
    }).then((result) => {
      if (result.isConfirmed) {
        resetPasswordMutation.mutate(mentor._id);
      }
    });
  };

  const columns = [
    {
      key: "profile",
      title: "Profile",
      render: (mentor) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-purple-100 bg-purple-50">
            {mentor.image ? (
              <img
                src={mentor.image}
                alt={mentor.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-purple-400">
                {mentor.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-900 capitalize">
              {mentor.name}
            </span>
            <span className="text-xs text-purple-600 font-medium">Mentor</span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact",
      render: (mentor) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Mail className="h-3 w-3 text-slate-400" />
            <span className="truncate max-w-[150px]">{mentor.email || "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Phone className="h-3 w-3 text-slate-400" />
            <span>{mentor.mobile || "—"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "mentorType",
      title: "Type",
      render: (mentor) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
            mentor.mentor?.mentorType === "professional"
              ? "bg-blue-50 text-blue-700"
              : "bg-purple-50 text-purple-700"
          }`}
        >
          {mentor.mentor?.mentorType || "—"}
        </span>
      ),
    },
    {
      key: "specializations",
      title: "Specializations",
      render: (mentor) => (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {(mentor.mentor?.specifications || []).slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700"
            >
              {spec}
            </span>
          ))}
          {(mentor.mentor?.specifications || []).length === 0 && (
            <span className="text-slate-400 text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      key: "experience",
      title: "Experience",
      render: (mentor) => (
        <span className="text-sm text-slate-700">
          {mentor.mentor?.experience != null
            ? `${mentor.mentor.experience} yrs`
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (mentor) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
            mentor.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {mentor.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        Failed to load mentors: {error?.message}
      </div>
    );
  }

  const mentors = data?.data?.data || [];

  return (
    <div className="space-y-6">
      <Table
        title="Mentors"
        description={`Total ${data?.data?.total || 0} mentors found`}
        addButtonText="Add Mentor"
        columns={columns}
        data={mentors}
        onAddNew={() => navigate("/mentor/add")}
        onView={(mentor) => setViewMentor(mentor)}
        onEdit={(mentor) => navigate(`/mentor/edit/${mentor._id}`)}
        onResetPassword={handleResetPassword}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {viewMentor && (
        <MentorViewModal mentor={viewMentor} onClose={() => setViewMentor(null)} />
      )}
    </div>
  );
};

export default MentorList;
