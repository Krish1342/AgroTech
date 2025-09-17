import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { cropService } from "../services/api";
import {
  Brain,
  Loader,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Droplets,
  Thermometer,
} from "lucide-react";

const CropRecommendation = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    temperature: "",
    humidity: "",
    moisture: "",
    soil_type: "",
    nitrogen: "",
    potassium: "",
    phosphorous: "",
  });

  const soilTypes = [
    "Black Soil",
    "Red Soil",
    "Sandy Soil",
    "Clayey Soil",
    "Laterite Soil",
    "Peat Soil",
    "Cinder Soil",
    "Yellow Soil",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = {
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        moisture: parseFloat(formData.moisture),
        soil_type: formData.soil_type,
        nitrogen: parseFloat(formData.nitrogen),
        potassium: parseFloat(formData.potassium),
        phosphorous: parseFloat(formData.phosphorous),
      };

      const response = await cropService.recommend(data);
      setResult(response);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to get crop recommendation"
      );
    } finally {
      setLoading(false);
    }
  };

  const getSuitabilityColor = (suitability) => {
    switch (suitability) {
      case "Optimal":
        return "text-green-600 bg-green-100";
      case "Suitable":
        return "text-yellow-600 bg-yellow-100";
      case "Suboptimal":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getWaterRequirementColor = (requirement) => {
    switch (requirement) {
      case "High":
        return "text-blue-600 bg-blue-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
            AI-Powered Crop Recommendation
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Get personalized crop recommendations based on your soil conditions,
            climate, and nutrient levels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="form-section">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">
              Environmental Conditions
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Climate Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <Thermometer className="inline h-4 w-4 mr-1" />
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., 25"
                    min="-10"
                    max="50"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <Droplets className="inline h-4 w-4 mr-1" />
                    Humidity (%)
                  </label>
                  <input
                    type="number"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., 70"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              {/* Soil Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Soil Moisture (%)</label>
                  <input
                    type="number"
                    name="moisture"
                    value={formData.moisture}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., 40"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="label">Soil Type</label>
                  <select
                    name="soil_type"
                    value={formData.soil_type}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select soil type</option>
                    {soilTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nutrient Levels */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-800">
                  Soil Nutrient Levels (mg/kg)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Nitrogen (N)</label>
                    <input
                      type="number"
                      name="nitrogen"
                      value={formData.nitrogen}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., 80"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Phosphorous (P)</label>
                    <input
                      type="number"
                      name="phosphorous"
                      value={formData.phosphorous}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., 40"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Potassium (K)</label>
                    <input
                      type="number"
                      name="potassium"
                      value={formData.potassium}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., 120"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
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
                    <Brain className="h-5 w-5" />
                    <span>Get Recommendation</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {error && (
              <div className="alert-error">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Main Recommendation */}
                <div className="prediction-card">
                  <div className="prediction-header">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Recommended Crop
                      </h3>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm">
                          {Math.round(result.confidence * 100)}% Confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold text-primary-600 capitalize mb-2">
                        {result.recommended_crop}
                      </h2>
                      <div className="flex items-center justify-center space-x-4 text-sm text-neutral-600">
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>Season: {result.growing_season}</span>
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getWaterRequirementColor(
                            result.water_requirement
                          )}`}
                        >
                          {result.water_requirement} Water
                        </span>
                      </div>
                    </div>

                    {/* Suitability Factors */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {Object.entries(result.prediction_factors || {}).map(
                        ([factor, suitability]) => (
                          <div key={factor} className="text-center">
                            <div className="text-sm text-neutral-600 mb-1 capitalize">
                              {factor.replace("_", " ")}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getSuitabilityColor(
                                suitability
                              )}`}
                            >
                              {suitability}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Alternative Crops */}
                    {result.alternative_crops &&
                      result.alternative_crops.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-neutral-700 mb-2">
                            Alternative Options:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.alternative_crops.map((crop, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm capitalize"
                              >
                                {crop}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Model Information */}
                <div className="card p-4">
                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <span>Model Version: {result.model_version}</span>
                    <span>Analysis completed</span>
                  </div>
                </div>
              </div>
            )}

            {/* Information Panel */}
            {!result && !loading && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  How It Works
                </h3>
                <div className="space-y-3 text-sm text-neutral-600">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary-600" />
                    <span>
                      Our AI analyzes soil conditions, climate data, and
                      nutrient levels
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary-600" />
                    <span>
                      Machine learning models trained on agricultural best
                      practices
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary-600" />
                    <span>
                      Recommendations include confidence scores and alternatives
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary-600" />
                    <span>Optimized for maximum yield and sustainability</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auth Notice */}
        {!isAuthenticated() && (
          <div className="mt-12 text-center">
            <div className="card p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Want to save your recommendations?
              </h3>
              <p className="text-neutral-600 mb-4">
                Create an account to track your predictions and access advanced
                features.
              </p>
              <div className="flex space-x-3">
                <a href="/register" className="btn-primary flex-1">
                  Sign Up
                </a>
                <a href="/login" className="btn-outline flex-1">
                  Login
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendation;
