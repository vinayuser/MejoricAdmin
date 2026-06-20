import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  Heart,
  Lock,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";

const MateAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "mate",
    fcmToken: "sdfsdfsdfsdfsd",
    pricePerMin: 12,
    priceUnit: "RUPEE",
bio:"",
    languages: [],

    image: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languageOptions = ["hindi", "english"];

  const priceUnitOptions = ["RUPEE", "USD"];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim() && !formData.mobile.trim()) {
      newErrors.email = "Email or Mobile is required";
    } else if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Create FormData
        const data = new FormData();

        data.append("name", formData.name);
        if (formData.email) data.append("email", formData.email);
        if (formData.mobile) data.append("mobile", formData.mobile);
        if (formData.bio) data.append("bio", formData.bio);

        data.append("password", formData.password);
        data.append("role", "mate");
        if (formData.fcmToken) data.append("fcmToken", formData.fcmToken);

        if (formData.pricePerMin)
          data.append("pricePerMin", Number(formData.pricePerMin));
        if (formData.priceUnit) data.append("priceUnit", formData.priceUnit);

        // Handle languages (multiple values with same key)
        if (formData.languages.length > 0) {
          formData.languages.forEach((lang) => {
            data.append("languages", lang);
          });
        }

        if (formData.image) {
          data.append("image", formData.image);
        }

        // POST /auth/register
        await axiosInstance.post("/auth/register", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Mate added successfully!");
        navigate("/mates");
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to add mate";
        toast.error(errorMessage);
        setErrors({ apiError: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.apiError) {
      setErrors((prev) => ({ ...prev, apiError: "" }));
    }
  };

  const handleLanguageChange = (lang) => {
    setFormData((prev) => {
      const langs = prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang];
      return { ...prev, languages: langs };
    });
    if (errors.apiError) {
      setErrors((prev) => ({ ...prev, apiError: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
    if (errors.apiError) {
      setErrors((prev) => ({ ...prev, apiError: "" }));
    }
  };

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
              <p className="text-gray-500 text-sm">
                Fill in the details to create a new mate profile
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.apiError}
              </div>
            )}

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
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
                />
              </div>
            </div>

            {/* Password */}
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

            {/* Price Per Min */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Unit
                </label>
                <select
                  name="priceUnit"
                  value={formData.priceUnit}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  {priceUnitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <input
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter Bio"
              />
            </div>
            {/* Experience */}

            {/* Languages - Multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages{" "}
                <span className="text-gray-500 text-xs">(Select multiple)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      formData.languages.includes(lang)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
              {formData.languages.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected: {formData.languages.join(", ")}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or GIF</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              {formData.image && (
                <p className="mt-2 text-sm text-green-500">
                  Selected: {formData.image.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSubmitting ? "Saving..." : "Save Mate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MateAdd;
