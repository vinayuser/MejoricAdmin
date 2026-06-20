import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, User, Mail, Phone, DollarSign, Briefcase, Heart, Lock, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { usePostMutation, useGetQuery, usePutMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Loader from "../../components/UI/Loader";

const MateAddEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "mate",
    fcmToken: "",
    categoryId: "",
    pricePerHour: "",
    experience: "",
    specifications: [],
    image: null,
    imagePreview: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch existing mate data if in edit mode
  const { data: mateData, isLoading: isFetching } = useGetQuery(
    isEditMode && id
      ? `/users/get/${id}`
      : "/users/getAll?limit=1",
    isEditMode && id ? ["mate", id] : ["mate", "new"],
    { enabled: isEditMode && Boolean(id) }
  );

  const createMate = usePostMutation(API_ENDPOINTS.MATES.CREATE);
  const updateEndpoint =
    isEditMode && id ? `/mates/update/${id}` : "/mates/_skip_update";
  const updateMate = usePutMutation(updateEndpoint);

  // Populate form with existing data when editing
  useEffect(() => {
    if (isEditMode && mateData?.data) {
      const mate = mateData.data;
      setFormData({
        name: mate.name || "",
        email: mate.email || "",
        mobile: mate.mobile ? String(mate.mobile) : "",
        password: "",
        role: mate.role || "mate",
        fcmToken: mate.fcmToken || "",
        categoryId: mate.mate?.categoryId || mate.categoryId || "",
        pricePerHour:
          mate.mate?.pricePerMin != null
            ? String(mate.mate.pricePerMin)
            : "",
        experience: mate.mate?.experience || mate.experience || "",
        specifications: mate.mate?.specifications || mate.specifications || [],
        image: null,
        imagePreview: mate.image || "",
      });
    }
  }, [isEditMode, mateData]);

  const specificationOptions = [
    "Love",
    "Relationship",
    "Career",
    "Finance",
    "Health",
    "Education",
    "Business",
    "Personal Growth"
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!isEditMode) {
      if (!formData.email.trim() && !formData.mobile.trim()) {
        newErrors.email = "Email or Mobile is required";
      } else if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.password.trim()) {
        newErrors.password = "Password is required";
      }
    }
    if (!formData.pricePerHour.trim()) {
      newErrors.pricePerHour = "Price per hour is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const submitData = new FormData();
        
        // Add basic fields
        submitData.append("name", formData.name);
        if (formData.email) submitData.append("email", formData.email);
        if (formData.mobile) submitData.append("mobile", formData.mobile);
        if (formData.password) submitData.append("password", formData.password);
        submitData.append("role", "mate");
        if (formData.fcmToken) submitData.append("fcmToken", formData.fcmToken);
        if (formData.categoryId) submitData.append("categoryId", formData.categoryId);
        if (formData.pricePerHour) submitData.append("pricePerHour", formData.pricePerHour);
        if (formData.experience) submitData.append("experience", formData.experience);
        if (formData.specifications.length > 0) {
          submitData.append("specifications", JSON.stringify(formData.specifications));
        }
        if (formData.image) {
          submitData.append("image", formData.image);
        }

        if (isEditMode) {
          await updateMate.mutateAsync(submitData);
          toast.success("Mate updated successfully!");
        } else {
          // For create, send as regular object
          const payload = {
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            password: formData.password,
            role: "mate",
            fcmToken: formData.fcmToken,
            categoryId: formData.categoryId,
            pricePerHour: formData.pricePerHour,
            experience: formData.experience,
            specifications: formData.specifications,
          };
          await createMate.mutateAsync(payload);
          toast.success("Mate added successfully!");
        }
        navigate("/mates");
      } catch (error) {
        toast.error(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} mate`);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSpecificationChange = (spec) => {
    setFormData((prev) => {
      const specs = prev.specifications.includes(spec)
        ? prev.specifications.filter((s) => s !== spec)
        : [...prev.specifications, spec];
      return { ...prev, specifications: specs };
    });
  };

  const isSubmitting = createMate.isPending || updateMate.isPending;

  if (isFetching) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/mates")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Mates List
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {isEditMode ? "Edit Mate" : "Add New Mate"}
              </h1>
              <p className="text-gray-500 text-sm">
                {isEditMode ? "Update the mate details" : "Fill in the details to create a new mate"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center overflow-hidden">
                  {formData.imagePreview ? (
                    <img
                      src={formData.imagePreview}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-600"
                >
                  <ImageIcon className="w-4 h-4" />
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">Click to upload profile image</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter mate's full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter mate's email"
                  disabled={isEditMode}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter mobile number"
                  disabled={isEditMode}
                />
              </div>
            </div>

            {/* Password */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            )}

            {/* Category ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category ID
              </label>
              <input
                type="text"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter category ID"
              />
            </div>

            {/* Price Per Hour */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Hour (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.pricePerHour ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter price per hour"
                  min="0"
                />
              </div>
              {errors.pricePerHour && (
                <p className="mt-1 text-sm text-red-500">{errors.pricePerHour}</p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience (Years)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter years of experience"
                  min="0"
                />
              </div>
            </div>

            {/* Specifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specifications
              </label>
              <div className="flex flex-wrap gap-2">
                {specificationOptions.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleSpecificationChange(spec)}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
                      formData.specifications.includes(spec)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* FCM Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FCM Token
              </label>
              <input
                type="text"
                name="fcmToken"
                value={formData.fcmToken}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter FCM token"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSubmitting ? "Saving..." : isEditMode ? "Update Mate" : "Save Mate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MateAddEdit;
