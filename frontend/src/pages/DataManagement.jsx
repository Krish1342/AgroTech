import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader,
  Database,
  BarChart3,
  Filter,
  Search,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { dataService } from "../services/api";

const DataManagement = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("all");
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map((file) => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError("Please select files to upload");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const uploadPromises = files.map(async (fileItem) => {
        const formData = new FormData();
        formData.append("file", fileItem.file);
        formData.append("file_type", getFileType(fileItem.file));
        formData.append("description", `Uploaded ${fileItem.name}`);

        try {
          const response = await dataService.uploadData(formData);
          return { ...fileItem, status: "success", response };
        } catch (err) {
          return { ...fileItem, status: "error", error: err.message };
        }
      });

      const results = await Promise.all(uploadPromises);
      setFiles(results);

      const successCount = results.filter((r) => r.status === "success").length;
      const errorCount = results.filter((r) => r.status === "error").length;

      if (successCount > 0) {
        setSuccess(`Successfully uploaded ${successCount} file(s)`);
        loadUploadedFiles();
      }
      if (errorCount > 0) {
        setError(`Failed to upload ${errorCount} file(s)`);
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadUploadedFiles = async () => {
    try {
      const response = await dataService.listFiles();
      setUploadedFiles(response.files || []);
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  const deleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await dataService.deleteFile(fileId);
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      setSuccess("File deleted successfully");
    } catch (err) {
      setError("Failed to delete file");
    }
  };

  const downloadFile = async (fileId, filename) => {
    try {
      const response = await dataService.downloadFile(fileId);

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download file");
    }
  };

  const exportData = async (format) => {
    setLoading(true);
    try {
      const response = await dataService.exportData(format);

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `agrotech_data.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`Data exported as ${format.toUpperCase()}`);
    } catch (err) {
      setError("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (file) => {
    if (file.name.includes("crop") || file.name.includes("soil"))
      return "agricultural";
    if (file.type.includes("image")) return "image";
    if (file.type.includes("csv") || file.type.includes("excel"))
      return "dataset";
    return "other";
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "image":
        return <Eye className="h-5 w-5 text-blue-500" />;
      case "dataset":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case "agricultural":
        return <Database className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredFiles = uploadedFiles.filter((file) => {
    const matchesSearch = file.filename
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      selectedFileType === "all" || file.file_type === selectedFileType;
    return matchesSearch && matchesType;
  });

  React.useEffect(() => {
    if (activeTab === "manage") {
      loadUploadedFiles();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Data Management
          </h1>
          <p className="mt-2 text-neutral-600">
            Upload, manage, and export your agricultural data
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b mb-8">
          {[
            { id: "upload", label: "Upload Data", icon: Upload },
            { id: "manage", label: "Manage Files", icon: Database },
            { id: "export", label: "Export Data", icon: Download },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="alert-success mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert-error mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                Upload Files
              </h2>

              {/* File Drop Zone */}
              <div
                className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors"
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                <div>
                  <p className="text-lg font-medium text-neutral-900">
                    Drop files here or click to browse
                  </p>
                  <p className="text-neutral-600 mt-1">
                    Supports CSV, Excel, Images, and other agricultural data
                    files
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary mt-4 inline-flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose Files</span>
                </button>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-neutral-900 mb-4">
                    Selected Files ({files.length})
                  </h3>
                  <div className="space-y-3">
                    {files.map((fileItem) => (
                      <div
                        key={fileItem.id}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(getFileType(fileItem.file))}
                          <div>
                            <p className="font-medium text-neutral-900">
                              {fileItem.name}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {formatFileSize(fileItem.size)} •{" "}
                              {getFileType(fileItem.file)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {fileItem.status === "success" && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {fileItem.status === "error" && (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          {fileItem.status === "pending" && (
                            <button
                              onClick={() => removeFile(fileItem.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={uploadFiles}
                    disabled={
                      loading || files.every((f) => f.status !== "pending")
                    }
                    className="w-full mt-4 btn-primary py-3 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span>Upload Files</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === "manage" && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Manage Files
                </h2>
                <button
                  onClick={loadUploadedFiles}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Database className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search files..."
                      className="w-full pl-10 input-field"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedFileType}
                    onChange={(e) => setSelectedFileType(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Types</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="image">Images</option>
                    <option value="dataset">Datasets</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Files List */}
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <p className="text-neutral-600 mb-2">No files found</p>
                  <p className="text-sm text-neutral-500">
                    Upload some files to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                    >
                      <div className="flex items-center space-x-4">
                        {getFileIcon(file.file_type)}
                        <div>
                          <h3 className="font-medium text-neutral-900">
                            {file.filename}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-neutral-600">
                            <span>{formatFileSize(file.file_size || 0)}</span>
                            <span>•</span>
                            <span className="capitalize">{file.file_type}</span>
                            <span>•</span>
                            <span>
                              {new Date(file.upload_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => downloadFile(file.id, file.filename)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                Export Data
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    format: "csv",
                    title: "CSV Export",
                    description:
                      "Export all data in comma-separated values format",
                    icon: FileSpreadsheet,
                    color: "text-green-600 bg-green-100",
                  },
                  {
                    format: "json",
                    title: "JSON Export",
                    description:
                      "Export all data in JSON format for API integration",
                    icon: FileText,
                    color: "text-blue-600 bg-blue-100",
                  },
                  {
                    format: "excel",
                    title: "Excel Export",
                    description: "Export all data in Microsoft Excel format",
                    icon: BarChart3,
                    color: "text-orange-600 bg-orange-100",
                  },
                  {
                    format: "pdf",
                    title: "PDF Report",
                    description: "Generate a comprehensive PDF report",
                    icon: FileText,
                    color: "text-red-600 bg-red-100",
                  },
                ].map((exportOption) => (
                  <div
                    key={exportOption.format}
                    className="border border-neutral-200 rounded-lg p-6 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-3 rounded-lg ${exportOption.color}`}>
                        <exportOption.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">
                          {exportOption.title}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">
                          {exportOption.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => exportData(exportOption.format)}
                      disabled={loading}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span>Export {exportOption.format.toUpperCase()}</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Export Information
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>
                    • Exports include all your uploaded data and analysis
                    results
                  </li>
                  <li>
                    • Personal information is included only in your exports
                  </li>
                  <li>• Large datasets may take a few moments to process</li>
                  <li>
                    • All exports are generated in real-time with current data
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataManagement;
