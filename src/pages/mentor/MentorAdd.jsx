import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Lock,
  Image as ImageIcon,
  Briefcase,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import API_ENDPOINTS from "../../api/apiEndpoint";
import {
  MENTOR_LANGUAGE_OPTIONS,
  MENTOR_SPECIFICATION_OPTIONS,
  MENTOR_TYPE_OPTIONS,
} from "./mentorFormOptions";

const MentorAdd = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "00000000",
    bio: "",
    experience: 1,
    specifications: [],
    languages: [],
    mentorType: "emotional",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim() && !formData.mobile.trim()) {
      newErrors.email = "Email or mobile is required";
    } else if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (formData.languages.length === 0) {
      newErrors.languages = "Select at least one language";
    }
    if (!formData.mentorType) {
      newErrors.mentorType = "Select mentor type";
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
      if (formData.email) data.append("email", formData.email);
      if (formData.mobile) data.append("mobile", formData.mobile);
      data.append("password", formData.password);
      data.append("mentorType", formData.mentorType);
      data.append("bio", formData.bio || "");
      data.append("experience", Number(formData.experience) || 0);
      formData.languages.forEach((lang) => data.append("languages", lang));
      formData.specifications.forEach((spec) =>
        data.append("specifications", spec),
      );
      if (formData.image) data.append("image", formData.image);

      await axiosInstance.post(API_ENDPOINTS.MENTORS.CREATE, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await queryClient.invalidateQueries({ queryKey: ["mentors"] });
      toast.success("Mentor added successfully!");
      navigate("/mentors", { state: { fromCreate: true } });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to add mentor";
      toast.error(errorMessage);
      setErrors({ apiError: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
    if (file) setFormData((prev) => ({ ...prev, image: file }));
  };

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
              <h1 className="text-2xl font-bold text-slate-900">Add Mentor</h1>
              <p className="text-gray-500 text-sm">
                Create a mentor account for appointment bookings
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.apiError}
              </div>
            )}

            <Field label="Full Name" required error={errors.name}>
              <IconInput icon={User} name="name" value={formData.name} onChange={handleChange} placeholder="Enter mentor name" error={errors.name} />
            </Field>

            <Field label="Email Address" error={errors.email}>
              <IconInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" error={errors.email} />
            </Field>

            <Field label="Mobile Number">
              <IconInput icon={Phone} type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Enter mobile number" />
            </Field>

            <Field label="Password" required error={errors.password}>
              <IconInput icon={Lock} type="text" name="password" value={formData.password} onChange={handleChange} placeholder="Default: 00000000" error={errors.password} />
              <p className="text-xs text-slate-500 mt-1">
                Default password is <code>00000000</code>. Mentor can change it after login.
              </p>
            </Field>

            <Field label="Mentor Type" required error={errors.mentorType}>
              <select
                name="mentorType"
                value={formData.mentorType}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                  errors.mentorType ? "border-red-500" : "border-gray-300"
                }`}
              >
                {MENTOR_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Bio">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Short mentor bio"
              />
            </Field>

            <Field label="Experience (years)">
              <IconInput icon={Briefcase} type="number" name="experience" min="0" value={formData.experience} onChange={handleChange} placeholder="Years of experience" />
            </Field>

            <Field label="Languages" required error={errors.languages}>
              <ChipGroup
                options={MENTOR_LANGUAGE_OPTIONS}
                selected={formData.languages}
                onToggle={(value) => toggleArrayValue("languages", value)}
                activeClass="bg-purple-600 text-white border-purple-600"
              />
              {errors.languages && <p className="mt-1 text-sm text-red-500">{errors.languages}</p>}
            </Field>

            <Field label="Specializations">
              <ChipGroup
                options={MENTOR_SPECIFICATION_OPTIONS}
                selected={formData.specifications}
                onToggle={(value) => toggleArrayValue("specifications", value)}
                activeClass="bg-purple-600 text-white border-purple-600"
              />
            </Field>

            <Field label="Profile Image">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
              {formData.image && (
                <p className="mt-2 text-sm text-green-600">Selected: {formData.image.name}</p>
              )}
            </Field>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-lg hover:from-purple-700 hover:to-violet-600 disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSubmitting ? "Saving..." : "Save Mentor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && !children?.props?.error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

function IconInput({ icon: Icon, error, className = "", ...props }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        {...props}
        className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
      />
    </div>
  );
}

function ChipGroup({ options, selected, onToggle, activeClass }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={`px-3 py-2 rounded-lg border text-sm transition-all ${
            selected.includes(option)
              ? activeClass
              : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default MentorAdd;
