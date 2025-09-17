import React, { useState, useEffect } from "react";
import {
  Upload,
  Camera,
  Loader,
  AlertCircle,
  CheckCircle,
  Droplets,
  Thermometer,
  BarChart3,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";
import { soilService } from "../services/api";

const SoilAnalysis = () => {
  const [activeTab, setActiveTab] = useState("analysis");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [soilData, setSoilData] = useState({
    ph: "",
    moisture: "",
    temperature: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    organic_matter: "",
    location: "",
  });
  const [recommendations, setRecommendations] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      const response = await soilService.getAnalysisHistory();
      setHistory(response.data || []);
    } catch (err) {
      console.error("Failed to load analysis history:", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setError("");
      } else {
        setError("Please select a valid image file");
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await soilService.classifySoil(formData);
      setResult(response);

      // Load recommendations for the detected soil type
      if (response.soil_type) {
        const recResponse = await soilService.getSoilRecommendations(
          response.soil_type
        );
        setRecommendations(recResponse);
      }

      loadAnalysisHistory();
    } catch (err) {
      setError("Failed to analyze soil image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeSoilData = async () => {
    setLoading(true);
    setError("");

    try {
      const analysisData = {
        ...soilData,
        ph: parseFloat(soilData.ph) || null,
        moisture: parseFloat(soilData.moisture) || null,
        temperature: parseFloat(soilData.temperature) || null,
        nitrogen: parseFloat(soilData.nitrogen) || null,
        phosphorus: parseFloat(soilData.phosphorus) || null,
        potassium: parseFloat(soilData.potassium) || null,
        organic_matter: parseFloat(soilData.organic_matter) || null,
      };

      const response = await soilService.analyzeSoil(analysisData);
      setResult(response);
      setRecommendations(response.recommendations);
      loadAnalysisHistory();
    } catch (err) {
      setError("Failed to analyze soil data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSoilData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getSoilHealthColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getSoilHealthLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Soil Analysis
          </h1>
          <p className="mt-2 text-neutral-600">
            Analyze your soil health through image recognition or manual data
            input
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b mb-8">
          {[
            { id: "analysis", label: "Image Analysis", icon: Camera },
            { id: "manual", label: "Manual Data", icon: BarChart3 },
            { id: "history", label: "History", icon: Calendar },
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

        {/* Error Alert */}
        {error && (
          <div className="alert-error mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Analysis Tab */}
            {activeTab === "analysis" && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                  Soil Image Analysis
                </h2>

                {/* File Upload */}
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Soil sample"
                        className="mx-auto max-h-64 rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setResult(null);
                        }}
                        className="text-neutral-500 hover:text-neutral-700"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                      <div>
                        <p className="text-lg font-medium text-neutral-900">
                          Upload soil image
                        </p>
                        <p className="text-neutral-600">
                          Drag and drop or click to select
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="soil-image"
                      />
                      <label
                        htmlFor="soil-image"
                        className="btn-primary cursor-pointer inline-flex items-center space-x-2"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Choose Image</span>
                      </label>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <div className="mt-6">
                    <button
                      onClick={analyzeImage}
                      disabled={loading}
                      className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-5 w-5" />
                          <span>Analyze Soil</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Manual Data Tab */}
            {activeTab === "manual" && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                  Manual Soil Data Analysis
                </h2>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">pH Level</label>
                      <input
                        type="number"
                        name="ph"
                        value={soilData.ph}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="6.5"
                        min="0"
                        max="14"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="label">Moisture (%)</label>
                      <input
                        type="number"
                        name="moisture"
                        value={soilData.moisture}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="25"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="label">Temperature (°C)</label>
                      <input
                        type="number"
                        name="temperature"
                        value={soilData.temperature}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="22"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="label">Nitrogen (ppm)</label>
                      <input
                        type="number"
                        name="nitrogen"
                        value={soilData.nitrogen}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="50"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="label">Phosphorus (ppm)</label>
                      <input
                        type="number"
                        name="phosphorus"
                        value={soilData.phosphorus}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="30"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="label">Potassium (ppm)</label>
                      <input
                        type="number"
                        name="potassium"
                        value={soilData.potassium}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="200"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="label">Organic Matter (%)</label>
                      <input
                        type="number"
                        name="organic_matter"
                        value={soilData.organic_matter}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="3.5"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="label">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={soilData.location}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Field A, Section 1"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={analyzeSoilData}
                    disabled={loading}
                    className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-5 w-5" />
                        <span>Analyze Soil Data</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                  Analysis History
                </h2>

                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                    <p className="text-neutral-600">No analysis history yet</p>
                    <p className="text-sm text-neutral-500">
                      Your soil analyses will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((analysis, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:bg-neutral-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-primary-600" />
                            <span className="font-medium">
                              {analysis.analysis_type || "Soil Analysis"}
                            </span>
                          </div>
                          <span className="text-sm text-neutral-500">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {analysis.soil_type && (
                          <p className="text-sm text-neutral-600 mb-2">
                            Soil Type: {analysis.soil_type}
                          </p>
                        )}
                        {analysis.health_score && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-neutral-600">
                              Health Score:
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getSoilHealthColor(
                                analysis.health_score
                              )}`}
                            >
                              {analysis.health_score}% -{" "}
                              {getSoilHealthLabel(analysis.health_score)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Results */}
          <div className="space-y-6">
            {result && (
              <>
                {/* Analysis Results */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Analysis Results
                  </h3>

                  {result.soil_type && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-neutral-700">
                        Soil Type
                      </label>
                      <div className="mt-1 text-lg font-semibold text-primary-600">
                        {result.soil_type}
                      </div>
                    </div>
                  )}

                  {result.confidence && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-neutral-700">
                        Confidence
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <div className="flex-1 bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${result.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {result.confidence}%
                        </span>
                      </div>
                    </div>
                  )}

                  {result.health_score && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-neutral-700">
                        Health Score
                      </label>
                      <div className="mt-1">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getSoilHealthColor(
                            result.health_score
                          )}`}
                        >
                          {result.health_score}% -{" "}
                          {getSoilHealthLabel(result.health_score)}
                        </span>
                      </div>
                    </div>
                  )}

                  {result.properties && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-neutral-900">
                        Properties
                      </h4>
                      {Object.entries(result.properties).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-neutral-600 capitalize">
                            {key.replace("_", " ")}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {recommendations && (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Recommendations
                    </h3>

                    {recommendations.suitable_crops && (
                      <div className="mb-4">
                        <h4 className="font-medium text-neutral-900 mb-2">
                          Suitable Crops
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recommendations.suitable_crops.map((crop, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {recommendations.management_tips && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-900">
                          Management Tips
                        </h4>
                        <ul className="space-y-1 text-sm text-neutral-600">
                          {recommendations.management_tips.map((tip, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Quick Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Soil Health Indicators
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-neutral-600">Moisture</span>
                  </div>
                  <span className="text-sm font-medium">
                    Critical for growth
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-neutral-600">pH Balance</span>
                  </div>
                  <span className="text-sm font-medium">Affects nutrients</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-neutral-600">Nutrients</span>
                  </div>
                  <span className="text-sm font-medium">NPK levels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilAnalysis;
