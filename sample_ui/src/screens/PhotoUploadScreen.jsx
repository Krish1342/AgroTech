import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { diseaseDetectionResults } from "../data/mockData";
import {
  ArrowLeft,
  Camera,
  Upload,
  Image as ImageIcon,
  Loader,
  CheckCircle,
  AlertTriangle,
  Info,
  Leaf,
  Bug,
  Shield,
  Trash2,
  RotateCcw,
  Share,
} from "lucide-react";

const PhotoUploadScreen = () => {
  const navigate = useNavigate();
  const { getText } = useApp();
  const fileInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadMethod, setUploadMethod] = useState(null); // 'camera' or 'gallery'

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    setUploadMethod("camera");
    // In a real app, this would open the camera
    // For demo, we'll simulate it by opening file picker
    fileInputRef.current?.click();
  };

  const handleGalleryUpload = () => {
    setUploadMethod("gallery");
    fileInputRef.current?.click();
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);

    // Simulate AI analysis delay
    setTimeout(() => {
      const randomResult =
        diseaseDetectionResults[
          Math.floor(Math.random() * diseaseDetectionResults.length)
        ];
      setAnalysisResult(randomResult);
      setIsAnalyzing(false);
    }, 3000);
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setUploadMethod(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "none":
        return "text-green-600 bg-green-100";
      case "mild":
        return "text-yellow-600 bg-yellow-100";
      case "moderate":
        return "text-orange-600 bg-orange-100";
      case "severe":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityText = (severity) => {
    const severityMap = {
      none: { en: "Healthy", hi: "स्वस्थ" },
      mild: { en: "Mild", hi: "हल्का" },
      moderate: { en: "Moderate", hi: "मध्यम" },
      severe: { en: "Severe", hi: "गंभीर" },
    };

    return severityMap[severity]?.en || severity;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 pt-12 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full mr-4 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              {getText("Disease Detection", "रोग पहचान")}
            </h1>
            <p className="text-blue-100">
              {getText(
                "Upload a photo for AI analysis",
                "AI विश्लेषण के लिए फोटो अपलोड करें"
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Upload Section */}
        {!uploadedImage && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-blue-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {getText(
                  "Capture or Upload Plant Photo",
                  "पौधे की फोटो लें या अपलोड करें"
                )}
              </h2>

              <p className="text-gray-600 mb-6">
                {getText(
                  "Take a clear photo of the affected plant area for accurate disease detection",
                  "सटीक रोग का पता लगाने के लिए प्रभावित पौधे के क्षेत्र की स्पष्ट तस्वीर लें"
                )}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCameraCapture}
                  className="flex flex-col items-center p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Camera className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="font-medium text-blue-700">
                    {getText("Take Photo", "फोटो लें")}
                  </span>
                </button>

                <button
                  onClick={handleGalleryUpload}
                  className="flex flex-col items-center p-6 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-green-600 mb-2" />
                  <span className="font-medium text-green-700">
                    {getText("Upload from Gallery", "गैलरी से अपलोड करें")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture={uploadMethod === "camera" ? "environment" : undefined}
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Image Preview */}
        {uploadedImage && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {getText("Uploaded Image", "अपलोड की गई छवि")}
              </h3>

              <div className="flex space-x-2">
                <button
                  onClick={resetUpload}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded plant"
                className="w-full h-64 object-cover rounded-lg"
              />

              {!analysisResult && !isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <button
                    onClick={simulateAnalysis}
                    className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
                  >
                    <Bug className="w-5 h-5 mr-2" />
                    {getText(
                      "Analyze for Diseases",
                      "रोगों के लिए विश्लेषण करें"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Loading */}
        {isAnalyzing && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {getText("Analyzing Image...", "छवि का विश्लेषण कर रहे हैं...")}
              </h3>

              <p className="text-gray-600">
                {getText(
                  "Our AI is examining your plant for diseases and pests",
                  "हमारा AI आपके पौधे में रोगों और कीटों की जांच कर रहा है"
                )}
              </p>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full animate-pulse"
                    style={{ width: "70%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Detection Result */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {getText("Detection Result", "पहचान परिणाम")}
                </h3>

                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    {getText("Confidence", "आत्मविश्वास")}:
                  </span>
                  <span className="font-bold text-green-600">
                    {analysisResult.confidence}%
                  </span>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-4">
                  {analysisResult.severity === "none" ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <Bug className="w-8 h-8 text-white" />
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {getText(analysisResult.disease, analysisResult.diseaseHi)}
                  </h4>

                  <div className="flex items-center mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(
                        analysisResult.severity
                      )}`}
                    >
                      {getSeverityText(analysisResult.severity)}
                    </span>
                  </div>

                  <p className="text-gray-600">
                    {getText(
                      analysisResult.description,
                      analysisResult.descriptionHi
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="w-6 h-6 text-green-600 mr-2" />
                {getText("Recommended Actions", "सुझाए गए कार्य")}
              </h3>

              <div className="space-y-3">
                {(
                  getText(
                    analysisResult.recommendations,
                    analysisResult.recommendationsHi
                  ) || []
                ).map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-green-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {getText("Next Steps", "अगले कदम")}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/chat")}
                  className="flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <Info className="w-5 h-5 mr-2" />
                  {getText("Get AI Advice", "AI सलाह लें")}
                </button>

                <button
                  onClick={() => {
                    // In a real app, this would share the result
                    navigator.share?.({
                      title: "Disease Detection Result",
                      text: `Detected: ${analysisResult.disease} with ${analysisResult.confidence}% confidence`,
                    });
                  }}
                  className="flex items-center justify-center p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <Share className="w-5 h-5 mr-2" />
                  {getText("Share Result", "परिणाम साझा करें")}
                </button>

                <button
                  onClick={resetUpload}
                  className="flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  {getText("Analyze Another", "दूसरा विश्लेषण करें")}
                </button>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center justify-center p-4 bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <Leaf className="w-5 h-5 mr-2" />
                  {getText("Back to Fields", "खेतों में वापस जाएं")}
                </button>
              </div>
            </div>

            {/* Tips for better results */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                {getText(
                  "Tips for Better Results",
                  "बेहतर परिणामों के लिए सुझाव"
                )}
              </h4>

              <ul className="text-blue-700 text-sm space-y-1">
                <li>
                  •{" "}
                  {getText(
                    "Take photos in good lighting conditions",
                    "अच्छी रोशनी में तस्वीरें लें"
                  )}
                </li>
                <li>
                  •{" "}
                  {getText(
                    "Focus on affected areas of the plant",
                    "पौधे के प्रभावित क्षेत्रों पर ध्यान दें"
                  )}
                </li>
                <li>
                  •{" "}
                  {getText(
                    "Avoid blurry or distant shots",
                    "धुंधली या दूर की तस्वीरों से बचें"
                  )}
                </li>
                <li>
                  •{" "}
                  {getText(
                    "Include leaves, stems, or fruits showing symptoms",
                    "लक्षण दिखाने वाले पत्ते, तने या फल शामिल करें"
                  )}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!uploadedImage && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              {getText("How it works", "यह कैसे काम करता है")}
            </h4>

            <div className="grid grid-cols-1 gap-3 text-blue-700 text-sm">
              <div className="flex items-start">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  1
                </span>
                <p>
                  {getText(
                    "Upload a clear photo of your plant",
                    "अपने पौधे की स्पष्ट तस्वीर अपलोड करें"
                  )}
                </p>
              </div>

              <div className="flex items-start">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  2
                </span>
                <p>
                  {getText(
                    "Our AI analyzes the image for diseases",
                    "हमारा AI रोगों के लिए छवि का विश्लेषण करता है"
                  )}
                </p>
              </div>

              <div className="flex items-start">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  3
                </span>
                <p>
                  {getText(
                    "Get instant results with treatment recommendations",
                    "उपचार सुझावों के साथ तत्काल परिणाम प्राप्त करें"
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploadScreen;
