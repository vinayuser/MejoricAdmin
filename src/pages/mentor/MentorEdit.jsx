import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Image as ImageIcon,
  Briefcase,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { useGetQuery } from "../../api/apiCall";
import Loader from "../../components/UI/Loader";
import {
  MENTOR_LANGUAGE_OPTIONS,
  MENTOR_SPECIFICATION_OPTIONS,
  MENTOR_TYPE_OPTIONS,
} from "./mentorFormOptions";

const MentorEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    bio: "",
    experience: "",
    specifications: [],
    languages: [],
    mentorType: "emotional",
    image: null,
    imagePreview: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: mentorData, isLoading: isFetching } = useGetQuery(
    `${API_ENDPOINTS.MENTORS.GET_ONE}/${id}`,
    ["mentor", id],
  );

  useEffect(() => {
    if (mentorData?.data) {
      const mentor = mentorData.data;
      setFormData({
        name: mentor.name || "",
        email: mentor.email || "",
        mobile: mentor.mobile ? String(mentor.mobile) : "",
        bio: mentor.mentor?.bio || "",
        experience: mentor.mentor?.experience ?? "",
        specifications: mentor.mentor?.specifications || [],
        languages: (mentor.mentor?.languages || []).map((l) => l.toLowerCase()),
        mentorType: mentor.mentor?.mentorType || "emotional",
        image: null,
        imagePreview: mentor.image || "",
        isActive: mentor.isActive !== false,
      });
    }
  }, [mentorData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.languages.length === 0) {
      newErrors.languages = "Select at least one language";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("bio", formData.bio || "");
      data.append("experience", Number(formData.experience) || 0);
      data.append("isActive", formData.isActive);
      data.append("mentorType", formData.mentorType);
      formData.languages.forEach((lang) => data.append("languages", lang));
      formData.specifications.forEach((spec) =>
        data.append("specifications", spec),
      );
      if (formData.image instanceof File) {
        data.append("image", formData.image);
      }

      await axiosInstance.put(`${API_ENDPOINTS.MENTORS.UPDATE}/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Mentor updated successfully!");
      navigate("/mentors", { state: { fromEdit: true } });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update mentor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
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

  if (isFetching) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/mentors")}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Mentors List
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-violet-500 rounded-lg mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Mentor</h1>
              <p className="text-gray-500 text-sm">Update mentor profile details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-2">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                  {formData.imagePreview ? (
                    <img
                      src={formData.imagePreview}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-purple-400" />
                  )}
                </div>
                <label
                  htmlFor="mentor-image-upload"
                  className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-purple-700"
                >
                  <ImageIcon className="w-4 h-4" />
                  <input
                    id="mentor-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.mobile}
                  disabled
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience (years)
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="experience"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mentor Type <span className="text-red-500">*</span>
              </label>
              <select
                name="mentorType"
                value={formData.mentorType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              >
                {MENTOR_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {MENTOR_LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleArrayValue("languages", lang)}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      formData.languages.includes(lang)
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
              {errors.languages && (
                <p className="mt-1 text-sm text-red-500">{errors.languages}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specializations
              </label>
              <div className="flex flex-wrap gap-2">
                {MENTOR_SPECIFICATION_OPTIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleArrayValue("specifications", spec)}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      formData.specifications.includes(spec)
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Active mentor account
              </span>
            </label>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSubmitting ? "Updating..." : "Update Mentor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentorEdit;
