import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/UI/Table";
import { useGetQuery, useDeleteMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";
import { toast } from "react-hot-toast";
import CategoryView from "./CategoryView";
import CategoryAddEdit from "./CategoryAddEdit";
import Pagination from "../../components/UI/Pagination";
import { formatDateTime } from "../../utils/formatters";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });
  const navigate = useNavigate();

  const {
    data: categoryData,
    isPending: isListLoading,
    error,
    refetch,
  } = useGetQuery(
    `${API_ENDPOINTS.CATEGORIES.GET_ALL}?page=${pagination.currentPage}&limit=${pagination.limit}`,
    ["categories", pagination.currentPage, pagination.limit]
  );

  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteMutation(
    API_ENDPOINTS.CATEGORIES.DELETE
  );

  useEffect(() => {
    if (categoryData?.data?.data) {
      const categoriesArray = categoryData.data.data;
      setCategories(categoriesArray);

      setPagination((prev) => ({
        ...prev,
        currentPage: categoryData.data.page,
        totalPages: categoryData.data.totalPages,
        totalItems: categoryData.data.total,
      }));
    }
  }, [categoryData]);

  const columns = [
    {
      key: "image",
      title: "Image",
      render: (category) => (
        <img
          src={category.image || "/images/default.png"}
          alt={category.title}
          className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
        />
      ),
    },
    {
      key: "title",
      title: "Title",
      render: (category) => <span>{category.name || "No Title"}</span>,
    },
    {
      key: "description",
      title: "Description",
      render: (category) => (
        <div className="max-w-xs truncate text-slate-600">
          {category.description || "No Description"}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Created At",
      render: (category) => formatDateTime(category.createdAt),
    },
    {
      key: "updatedAt",
      title: "Updated At",
      render: (category) => formatDateTime(category.updatedAt),
    },
  ];

  const handleView = (category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleEdit = (category) => {
    navigate(`/categories/update/${category._id}`);
  };

  const handleDelete = (categoryToDelete) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategory(categoryToDelete._id, {
        onSuccess: () => {
          toast.success("Category deleted successfully!");
          refetch();
        },
        onError: (err) => {
          toast.error(`Error deleting category: ${err.message}`);
        },
      });
    }
  };

  const handleAddNew = () => {
    navigate("/category/add");
  };

  const handleSave = () => {
    setIsAddEditModalOpen(false);
    refetch();
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({
      ...prev,
      limit: newLimit,
      currentPage: 1,
    }));
  };

  if (isListLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <Loader size={64} color="#4f46e5" className="mx-auto" />
          <p className="mt-3 text-sm text-slate-600">Loading categories…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 ring-1 ring-red-900/5">
        <h3 className="font-semibold text-red-900">Error loading categories</h3>
        <p className="mt-1 text-sm text-red-800">{error.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-800"
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
          Categories
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Manage course categories, images, and descriptions. Use pagination to
          browse long lists.
        </p>
      </div>
      <Table
        title="Category management"
        description="View, create, and edit categories from the list below."
        addButtonText="Create category"
        columns={columns}
        data={categories}
        onAddNew={handleAddNew}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isDeleting}
      />
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Showing <span className="font-medium text-slate-900">{categories.length}</span>{" "}
          of <span className="font-medium text-slate-900">{pagination.totalItems}</span>{" "}
          categories
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="limit" className="text-sm font-medium text-slate-700">
              Per page
            </label>
            <select
              id="limit"
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {isViewModalOpen && (
        <CategoryView
          category={selectedCategory}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {isAddEditModalOpen && (
        <CategoryAddEdit
          category={selectedCategory}
          onSave={handleSave}
          onClose={() => setIsAddEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CategoryPage;
