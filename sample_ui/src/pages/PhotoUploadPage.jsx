import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  IconButton,
  Button,
  Alert,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  ArrowBack,
  Mic,
  CameraAlt,
  PhotoLibrary,
  Home,
  Assessment,
  Camera,
  Chat,
  Settings,
} from "@mui/icons-material";

const PhotoUploadPage = () => {
  const navigate = useNavigate();
  const [navValue, setNavValue] = React.useState(2);
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        // Simulate AI analysis
        setTimeout(() => {
          setAnalysisResult({
            disease: "Leaf Blight",
            confidence: "85%",
            severity: "Moderate",
            treatment:
              "Apply fungicide spray every 7 days for 3 weeks. Remove affected leaves immediately.",
          });
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <Box className="header header-orange">
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            onClick={() => navigate("/dashboard")}
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              mr: 2,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography className="header-title">Disease Detection</Typography>
            <Typography className="header-subtitle">
              Take or upload a photo of your crop
            </Typography>
          </Box>
          <IconButton
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            <Mic />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box className="page-content">
        {!selectedImage ? (
          <Paper className="card" sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Upload Image for Analysis
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxWidth: 300,
                mx: "auto",
              }}
            >
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="camera-input"
                type="file"
                capture="camera"
                onChange={handleImageUpload}
              />
              <label htmlFor="camera-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CameraAlt />}
                  fullWidth
                  sx={{
                    py: 2,
                    backgroundColor: "#FF9800",
                    "&:hover": {
                      backgroundColor: "#F57C00",
                    },
                  }}
                >
                  Take Photo
                </Button>
              </label>

              <input
                accept="image/*"
                style={{ display: "none" }}
                id="gallery-input"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="gallery-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoLibrary />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Choose from Gallery
                </Button>
              </label>
            </Box>

            <Typography variant="body2" sx={{ mt: 3, color: "text.secondary" }}>
              Our AI will analyze your crop image and provide disease detection
              results
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Image Preview */}
            <Paper className="card">
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Uploaded Image
              </Typography>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <img
                  src={selectedImage}
                  alt="Uploaded crop"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setSelectedImage(null)}
              >
                Upload Different Image
              </Button>
            </Paper>

            {/* Analysis Results */}
            {analysisResult ? (
              <Paper className="card">
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Analysis Results
                </Typography>

                <Alert severity="warning" sx={{ mb: 2 }}>
                  Disease detected in your crop
                </Alert>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Disease:
                    </Typography>
                    <Typography variant="body1" color="error">
                      {analysisResult.disease}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Confidence:
                    </Typography>
                    <Typography variant="body1">
                      {analysisResult.confidence}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Severity:
                    </Typography>
                    <Typography variant="body1" color="warning.main">
                      {analysisResult.severity}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                      Recommended Treatment:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: "#f5f5f5",
                        p: 2,
                        borderRadius: 1,
                        lineHeight: 1.6,
                      }}
                    >
                      {analysisResult.treatment}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={() => navigate("/chat")}
                >
                  Chat with Expert
                </Button>
              </Paper>
            ) : (
              <Paper className="card" sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Analyzing Image...
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    border: "3px solid #e0e0e0",
                    borderTop: "3px solid #FF9800",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    mx: "auto",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ mt: 2, color: "text.secondary" }}
                >
                  Please wait while our AI analyzes your image
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation
        className="bottom-nav"
        value={navValue}
        onChange={(event, newValue) => {
          setNavValue(newValue);
          const routes = [
            "/dashboard",
            "/field/1",
            "/upload",
            "/chat",
            "/settings",
          ];
          navigate(routes[newValue]);
        }}
        sx={{
          "& .MuiBottomNavigationAction-root": {
            "&.Mui-selected": {
              color: "primary.main",
            },
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="My Crops" icon={<Assessment />} />
        <BottomNavigationAction label="Advisory" icon={<Camera />} />
        <BottomNavigationAction label="Chat" icon={<Chat />} />
        <BottomNavigationAction label="Settings" icon={<Settings />} />
      </BottomNavigation>
    </div>
  );
};

export default PhotoUploadPage;
