import React, { useState } from "react";
import Swal from "sweetalert2";

const ReportUploadModal = ({
  isOpen,
  onClose,
  selectedTest,
  onSubmit,
  isUploading = false,
  uploadError = null,
  uploadSuccess = false,
}) => {
  const [reportFiles, setReportFiles] = useState([]);
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [previewUrls, setPreviewUrls] = useState([]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    // Get the files from the input
    const files = Array.from(e.target.files);

    // Filter only image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length < files.length) {
      Swal.fire({
        title: "Invalid File Type",
        text: "Only image files are allowed. Non-image files have been excluded.",
        icon: "info",
        confirmButtonColor: "#4f46e5",
      });
    }

    if (imageFiles.length === 0) return;

    // Add new files to the existing array
    setReportFiles([...reportFiles, ...imageFiles]);

    // Generate preview URLs for the new files
    const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const handleRemoveFile = (index) => {
    // Remove file from array
    const updatedFiles = [...reportFiles];
    updatedFiles.splice(index, 1);
    setReportFiles(updatedFiles);

    // Remove preview URL and revoke object URL to free memory
    const updatedPreviews = [...previewUrls];
    URL.revokeObjectURL(previewUrls[index]);
    updatedPreviews.splice(index, 1);
    setPreviewUrls(updatedPreviews);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (reportFiles.length === 0) {
      Swal.fire({
        title: "No Files Selected",
        text: "Please upload at least one image file.",
        icon: "error",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    try {
      // For single file upload (first file as primary):
      if (reportFiles.length === 1) {
        const formData = new FormData();

        // Add the primary image with field name 'image' as required by API
        formData.append("image", reportFiles[0]);

        // Add test ID explicitly
        if (selectedTest && selectedTest._id) {
          formData.append("testId", selectedTest._id);
        }

        // Add additional metadata
        if (reportName) {
          formData.append("reportName", reportName);
        }

        if (reportDescription) {
          formData.append("reportDescription", reportDescription);
        }

        // Submit the form data
        await onSubmit(formData);
      }
      // For multiple files:
      else {
        // API requires image field, so we'll create multiple requests
        // First, confirm with user
        const result = await Swal.fire({
          title: "Multiple Uploads",
          text: `You're uploading ${reportFiles.length} files. This will create ${reportFiles.length} separate reports. Continue?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#4f46e5",
          cancelButtonColor: "#ef4444",
          confirmButtonText: "Yes, continue",
        });

        if (!result.isConfirmed) return;

        // We'll use the first file as main submission
        const mainFormData = new FormData();
        mainFormData.append("image", reportFiles[0]);
        mainFormData.append("testId", selectedTest._id);

        if (reportName) {
          mainFormData.append("reportName", reportName);
        }

        if (reportDescription) {
          mainFormData.append("reportDescription", reportDescription);
        }

        // Submit main form
        await onSubmit(mainFormData);

        // Alert user about additional files
        if (reportFiles.length > 1) {
          Swal.fire({
            title: "Partial Success",
            text: `First report uploaded. ${reportFiles.length - 1} additional images will need to be uploaded separately.`,
            icon: "info",
            confirmButtonColor: "#4f46e5",
          });
        }
      }

      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error("Error uploading reports:", error);
      // Error handling is now managed by the parent component
    }
  };

  const resetForm = () => {
    // Clean up any preview URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    // Reset state
    setReportName("");
    setReportDescription("");
    setReportFiles([]);
    setPreviewUrls([]);
  };

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Auto-generate report name from test name if available
  React.useEffect(() => {
    if (selectedTest?.testName && reportName === "") {
      setReportName(`${selectedTest.testName} Report`);
    }
  }, [selectedTest]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md border border-blue-500">
        <h2 className="text-2xl font-bold mb-4">Upload Test Reports</h2>
        <p className="mb-4">
          Test: <span className="font-semibold">{selectedTest?.testName}</span>{" "}
          | Patient:{" "}
          <span className="font-semibold">
            {selectedTest?.patientId?.name || "N/A"}
          </span>
        </p>

        <form onSubmit={handleSubmitReport}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="reportName"
            >
              Report Name *
            </label>
            <input
              id="reportName"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              required
              disabled={isUploading}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="reportDescription"
            >
              Report Description
            </label>
            <textarea
              id="reportDescription"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter report description"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows="3"
              disabled={isUploading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload Reports (Images Only) *
            </label>
            <input
              type="file"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileChange}
              accept="image/*"
              multiple
              disabled={isUploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-medium text-amber-600">Note:</span> The API
              requires images. Multiple images will be processed as separate
              reports.
            </p>
          </div>

          {/* Display selected files with preview */}
          {reportFiles.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-2">Selected Files:</h3>
              <ul className="bg-gray-50 p-2 rounded">
                {reportFiles.map((file, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-2">
                      {previewUrls[index] && (
                        <img
                          src={previewUrls[index]}
                          alt={`Preview ${index}`}
                          className="h-10 w-10 object-cover rounded"
                        />
                      )}
                      <span className="text-sm truncate max-w-xs">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Status messages */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              <p className="text-sm">{uploadError}</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              <p className="text-sm">Report uploaded successfully!</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center justify-center ${
                isUploading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-700"
              } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
              disabled={isUploading || reportFiles.length === 0}
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                "Upload Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportUploadModal;
