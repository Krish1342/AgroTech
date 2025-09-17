import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack,
  CameraAlt,
  PhotoLibrary,
  Close,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const PhotoUploadPage = () => {
  const navigate = useNavigate();
  const { actions, state } = useAppContext();
  const fileInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleImageSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const mockResults = [
        {
          disease: "Healthy Plant",
          confidence: 95,
          severity: "None",
          treatment: "Continue current care routine",
          color: "#4caf50",
          icon: <CheckCircle />,
        },
        {
          disease: "Leaf Spot Disease",
          confidence: 87,
          severity: "Low",
          treatment: "Apply copper-based fungicide spray",
          color: "#ff9800",
          icon: <Warning />,
        },
        {
          disease: "Nutrient Deficiency",
          confidence: 78,
          severity: "Medium",
          treatment: "Apply balanced NPK fertilizer",
          color: "#f44336",
          icon: <ErrorIcon />,
        },
      ];

      const randomResult =
        mockResults[Math.floor(Math.random() * mockResults.length)];
      setAnalysisResult(randomResult);
      setIsAnalyzing(false);
      setShowResult(true);

      // Add to disease results
      actions.addDiseaseResult({
        fieldName: "Current Field",
        disease: randomResult.disease,
        confidence: randomResult.confidence,
        severity: randomResult.severity,
        treatment: randomResult.treatment,
        image: previewUrl,
      });

      // Show notification
      actions.addNotification({
        type: randomResult.disease === "Healthy Plant" ? "success" : "warning",
        message: `Analysis complete: ${randomResult.disease} detected`,
      });
    }, 3000);
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setShowResult(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "none":
        return "#4caf50";
      case "low":
        return "#ff9800";
      case "medium":
        return "#f44336";
      case "high":
        return "#d32f2f";
      default:
        return "#757575";
    }
  };

  return (
    <Box className="page">
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
          color: "white",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <IconButton
            onClick={() => navigate("/dashboard")}
            sx={{ color: "white", mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Disease Detection
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Take a photo of your crop to detect diseases and get treatment
          recommendations
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, pb: 10 }}>
        {/* Instructions */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            📱 Take a clear photo of the plant leaves or affected area for best
            results
          </Typography>
        </Alert>

        {/* Camera Interface */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 300,
                bgcolor: previewUrl ? "transparent" : "#000",
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: previewUrl ? `url(${previewUrl})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!previewUrl && (
                <Box sx={{ textAlign: "center", color: "white" }}>
                  <CameraAlt sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6">Tap to take photo</Typography>
                </Box>
              )}

              {previewUrl && (
                <IconButton
                  onClick={handleRetake}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.7)",
                    },
                  }}
                >
                  <Close />
                </IconButton>
              )}
            </Box>

            {/* Camera Controls */}
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}
            >
              <Button
                variant="contained"
                startIcon={<CameraAlt />}
                onClick={handleCameraClick}
                sx={{
                  background:
                    "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)",
                  },
                }}
              >
                {previewUrl ? "Retake Photo" : "Take Photo"}
              </Button>

              {previewUrl && (
                <Button
                  variant="contained"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  sx={{
                    background:
                      "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #45a049 0%, #3d8b40 100%)",
                    },
                  }}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </Button>
              )}
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelection}
              style={{ display: "none" }}
            />
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Analyzing Image...
              </Typography>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Our AI is examining the image for diseases and health indicators
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Recent Scans */}
        {state.diseaseResults.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Scans
              </Typography>
              {state.diseaseResults.slice(0, 3).map((result) => (
                <Box
                  key={result.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    mb: 1,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    bgcolor: "#fafafa",
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {result.disease}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {result.fieldName} •{" "}
                      {new Date(
                        result.date || result.timestamp
                      ).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Chip
                      label={`${result.confidence}%`}
                      size="small"
                      sx={{ mb: 0.5 }}
                    />
                    <br />
                    <Chip
                      label={result.severity}
                      size="small"
                      sx={{
                        bgcolor: `${getSeverityColor(result.severity)}20`,
                        color: getSeverityColor(result.severity),
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Results Dialog */}
      <Dialog
        open={showResult}
        onClose={() => setShowResult(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {analysisResult && (
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ color: analysisResult.color, mb: 2 }}>
                {React.cloneElement(analysisResult.icon, {
                  sx: { fontSize: 64 },
                })}
              </Box>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {analysisResult.disease}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Confidence: {analysisResult.confidence}%
              </Typography>

              <Chip
                label={`Severity: ${analysisResult.severity}`}
                sx={{
                  bgcolor: `${analysisResult.color}20`,
                  color: analysisResult.color,
                  fontWeight: 500,
                  mb: 3,
                }}
              />

              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Recommended Treatment:
                </Typography>
                <Typography variant="body2">
                  {analysisResult.treatment}
                </Typography>
              </Box>

              {analysisResult.disease !== "Healthy Plant" && (
                <Alert severity="warning" sx={{ textAlign: "left" }}>
                  <Typography variant="body2">
                    Early intervention is key to preventing spread. Monitor
                    surrounding plants and consider consulting with local
                    agricultural experts.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResult(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowResult(false);
              navigate("/chat");
            }}
            sx={{
              background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
            }}
          >
            Ask AI Expert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PhotoUploadPage;
