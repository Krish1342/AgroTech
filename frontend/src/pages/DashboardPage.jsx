import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  ArrowForward,
  Agriculture,
  Refresh,
  Sensors,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import apiService from "../services/api";

// Progress Circle Component
const ProgressCircle = ({
  value,
  size = 120,
  strokeWidth = 8,
  color = "#4caf50",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(value / 100) * circumference} ${circumference}`;

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: "stroke-dasharray 0.5s ease",
          }}
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          component="div"
          sx={{ fontWeight: 700, color: "#212121" }}
        >
          {value}%
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.75rem" }}
        >
          Health
        </Typography>
      </Box>
    </Box>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { state, getTranslation } = useAppContext();
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeviceData();
  }, []);

  const fetchDeviceData = async () => {
    try {
      setLoading(true);
      const [status, data] = await Promise.all([
        apiService.getDeviceStatus(),
        apiService.getCurrentSensorData(),
      ]);
      setDeviceStatus(status);
      setSensorData(data);
    } catch (error) {
      console.error("Error fetching device data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldClick = (fieldId) => {
    navigate(`/field/${fieldId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "#4caf50";
      case "good":
        return "#4caf50";
      case "fair":
        return "#ff9800";
      case "warning":
        return "#ff9800";
      default:
        return "#4caf50";
    }
  };

  const getStatusLabel = (status, getTranslation) => {
    const statusLabels = {
      excellent: getTranslation("excellent"),
      good: getTranslation("good"),
      fair: getTranslation("fair"),
      warning: getTranslation("warning"),
    };
    return statusLabels[status] || status;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 10,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          color: "white",
          p: 3,
          background: "#4caf50",
          marginBottom: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {getTranslation("myFields")}
          </Typography>
          <IconButton
            onClick={fetchDeviceData}
            sx={{ color: "white" }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              <Refresh />
            )}
          </IconButton>
        </Box>

        {/* Device Status */}
        {deviceStatus && (
          <Box sx={{ mt: 2 }}>
            <Chip
              icon={<Sensors />}
              label={
                deviceStatus.connected
                  ? "Device Connected"
                  : "Device Disconnected"
              }
              sx={{
                bgcolor: deviceStatus.connected
                  ? "rgba(76, 175, 80, 0.3)"
                  : "rgba(244, 67, 54, 0.3)",
                color: "white",
                fontWeight: 600,
                border: `2px solid ${
                  deviceStatus.connected ? "#fff" : "#ffcdd2"
                }`,
              }}
            />
            <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
              {deviceStatus.device_name || "AgroTech Sensor Node"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ px: 1 }}>
        {/* Single Field Card */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                borderRadius: 1.5,
                border: "1px solid #e0e0e0",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                },
              }}
              onClick={() => handleFieldClick(1)}
            >
              {/* Field Image */}
              <Box
                sx={{
                  display: "flex",
                  height: 180,
                }}
              >
                {/* Left side - Image */}
                <Box
                  sx={{
                    width: "40%",
                    backgroundImage: `url(data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="#4caf50"/>
                        <text x="50" y="55" font-family="Arial" font-size="14" fill="white" text-anchor="middle">🌾</text>
                      </svg>
                    `)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                  }}
                >
                  {/* Status Badge */}
                  <Chip
                    label="Live Monitoring"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      bgcolor: "rgba(255,255,255,0.95)",
                      color: "#4caf50",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.8 },
                      },
                    }}
                  />
                </Box>

                {/* Right side - Content */}
                <CardContent
                  sx={{
                    p: 2,
                    width: "60%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1, fontSize: "1.1rem" }}
                    >
                      My Field
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5 }}
                    >
                      IoT Monitored • 5 acres
                    </Typography>

                    {/* Quick Stats */}
                    {sensorData ? (
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 0.5,
                              bgcolor: "#e3f2fd",
                              borderRadius: 1,
                              border: "1px solid #2196f3",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#1976d2" }}
                            >
                              {sensorData.moisture?.toFixed(0) || "--"}%
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.65rem" }}
                            >
                              {getTranslation("moisture")}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 0.5,
                              bgcolor: "#fff3e0",
                              borderRadius: 1,
                              border: "1px solid #ff9800",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#f57c00" }}
                            >
                              {sensorData.temperature?.toFixed(1) || "--"}°C
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.65rem" }}
                            >
                              {getTranslation("temp")}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 0.5,
                              bgcolor: "#e8f5e9",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: "#2e7d32" }}
                            >
                              N: {sensorData.nitrogen?.toFixed(0) || "--"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 0.5,
                              bgcolor: "#fff3e0",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: "#e65100" }}
                            >
                              P: {sensorData.phosphorus?.toFixed(0) || "--"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 0.5,
                              bgcolor: "#e1f5fe",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: "#01579b" }}
                            >
                              K: {sensorData.potassium?.toFixed(0) || "--"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    ) : (
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    )}
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: "#4caf50",
                      color: "white",
                      textTransform: "none",
                      fontSize: "0.85rem",
                      "&:hover": {
                        bgcolor: "#45a049",
                      },
                    }}
                  >
                    {getTranslation("viewDetails")}
                  </Button>
                </CardContent>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Info Card */}
        <Card sx={{ mt: 3, bgcolor: "#f5f5f5" }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>📡 Real-Time Monitoring Active</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your IoT sensors are collecting live data on soil nutrients (NPK),
              moisture, temperature, and pH levels. Tap the field card above to
              view detailed analytics and AI-powered recommendations.
            </Typography>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, px: 1 }}>
            {getTranslation("quickActions")}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  borderColor: "#4caf50",
                  color: "#4caf50",
                  "&:hover": {
                    bgcolor: "#4caf5010",
                    borderColor: "#4caf50",
                  },
                }}
                onClick={() => navigate("/photo-upload")}
              >
                📷
                <Typography variant="caption">
                  {getTranslation("upload")}
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  borderColor: "#2196f3",
                  color: "#2196f3",
                  "&:hover": {
                    bgcolor: "#2196f310",
                    borderColor: "#2196f3",
                  },
                }}
                onClick={() => navigate("/chat")}
              >
                🤖
                <Typography variant="caption">
                  {getTranslation("chat")}
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
