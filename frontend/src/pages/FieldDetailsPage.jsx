import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  LinearProgress,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack,
  LocationOn,
  CalendarToday,
  Agriculture,
  Water,
  Thermostat,
  Opacity,
  Science,
  Warning,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Refresh,
  CheckCircleOutline,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import apiService from "../services/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FieldDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFieldById, getTranslation } = useAppContext();

  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const field = getFieldById(id);

  // Fetch data from ThingSpeak
  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [current, historical, recs] = await Promise.all([
        apiService.getCurrentSensorData(),
        apiService.getHistoricalSensorData(15),
        apiService.getRecommendations(),
      ]);

      setCurrentData(current);
      setHistoricalData(historical);
      setRecommendations(recs);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!field) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">
          {getTranslation("fieldDetails")} not found
        </Typography>
        <Button onClick={() => navigate("/dashboard")} sx={{ mt: 2 }}>
          {getTranslation("backToDashboard")}
        </Button>
      </Box>
    );
  }

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "fair":
      case "warning":
        return <Warning sx={{ fontSize: 16 }} />;
      default:
        return <CheckCircle sx={{ fontSize: 16 }} />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp sx={{ fontSize: 16, color: "#4caf50" }} />;
      case "decreasing":
        return <TrendingDown sx={{ fontSize: 16, color: "#f44336" }} />;
      default:
        return <TrendingFlat sx={{ fontSize: 16, color: "#9e9e9e" }} />;
    }
  };

  // Prepare chart data from historical data
  const prepareChartData = () => {
    if (!historicalData || !historicalData.data) {
      return null;
    }

    const data = historicalData.data.slice(-10); // Last 10 readings

    return {
      labels: data.map((d) => {
        const date = new Date(d.timestamp);
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }),
      datasets: [
        {
          label: "Nitrogen (N)",
          data: data.map((d) => d.nitrogen),
          borderColor: "#2196f3",
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Phosphorus (P)",
          data: data.map((d) => d.phosphorus),
          borderColor: "#ff9800",
          backgroundColor: "rgba(255, 152, 0, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Potassium (K)",
          data: data.map((d) => d.potassium),
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const prepareMoistureChartData = () => {
    if (!historicalData || !historicalData.data) {
      return null;
    }

    const data = historicalData.data.slice(-10);

    return {
      labels: data.map((d) => {
        const date = new Date(d.timestamp);
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }),
      datasets: [
        {
          label: "Soil Moisture (%)",
          data: data.map((d) => d.moisture),
          borderColor: "#03a9f4",
          backgroundColor: "rgba(3, 169, 244, 0.2)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Temperature (°C)",
          data: data.map((d) => d.temperature),
          borderColor: "#ff5722",
          backgroundColor: "rgba(255, 87, 34, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: {
            size: 10,
          },
          padding: 10,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          font: {
            size: 9,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  if (loading && !currentData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const nutrientChartData = prepareChartData();
  const moistureChartData = prepareMoistureChartData();

  return (
    <Box className="page">
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
          color: "white",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            onClick={() => navigate("/dashboard")}
            sx={{ color: "white", mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
            {field.name}
          </Typography>
          <IconButton
            onClick={() => fetchData(true)}
            disabled={refreshing}
            sx={{ color: "white" }}
          >
            {refreshing ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              <Refresh />
            )}
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Chip
            icon={<CheckCircleOutline />}
            label="Live Data"
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 500,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.7 },
              },
            }}
          />
          <Typography variant="body2">{field.area}</Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, pb: 10 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Current Sensor Readings */}
        {currentData && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Real-Time Sensor Data
                </Typography>
                <Chip
                  label="Live"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#e3f2fd",
                      borderRadius: 2,
                      textAlign: "center",
                      border: "2px solid #2196f3",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#1976d2" }}
                    >
                      NITROGEN
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, my: 0.5 }}>
                      {currentData.nitrogen?.toFixed(1) || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      kg/ha
                    </Typography>
                    {historicalData?.trends?.nitrogen && (
                      <Box sx={{ mt: 0.5 }}>
                        {getTrendIcon(historicalData.trends.nitrogen)}
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#fff3e0",
                      borderRadius: 2,
                      textAlign: "center",
                      border: "2px solid #ff9800",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#f57c00" }}
                    >
                      PHOSPHORUS
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, my: 0.5 }}>
                      {currentData.phosphorus?.toFixed(1) || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      kg/ha
                    </Typography>
                    {historicalData?.trends?.phosphorus && (
                      <Box sx={{ mt: 0.5 }}>
                        {getTrendIcon(historicalData.trends.phosphorus)}
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#e8f5e9",
                      borderRadius: 2,
                      textAlign: "center",
                      border: "2px solid #4caf50",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#388e3c" }}
                    >
                      POTASSIUM
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, my: 0.5 }}>
                      {currentData.potassium?.toFixed(1) || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      kg/ha
                    </Typography>
                    {historicalData?.trends?.potassium && (
                      <Box sx={{ mt: 0.5 }}>
                        {getTrendIcon(historicalData.trends.potassium)}
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#e1f5fe",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Opacity sx={{ fontSize: 20, color: "#03a9f4", mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {currentData.moisture?.toFixed(1) || "N/A"}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Moisture
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#fce4ec",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Thermostat
                      sx={{ fontSize: 20, color: "#e91e63", mb: 0.5 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {currentData.temperature?.toFixed(1) || "N/A"}°C
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Temperature
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#f3e5f5",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Science sx={{ fontSize: 20, color: "#9c27b0", mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {currentData.ph?.toFixed(1) || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      pH Level
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {historicalData?.average && (
                <Box
                  sx={{ mt: 2, p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, display: "block", mb: 1 }}
                  >
                    15-Reading Averages:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="caption">
                        N:{" "}
                        {historicalData.average.nitrogen?.toFixed(1) || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption">
                        P:{" "}
                        {historicalData.average.phosphorus?.toFixed(1) || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption">
                        K:{" "}
                        {historicalData.average.potassium?.toFixed(1) || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* NPK Trends Chart */}
        {nutrientChartData && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Nutrient Trends (NPK)
              </Typography>
              <Box sx={{ height: 220 }}>
                <Line data={nutrientChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Moisture & Temperature Chart */}
        {moistureChartData && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Environmental Conditions
              </Typography>
              <Box sx={{ height: 200 }}>
                <Line data={moistureChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Section */}
        {recommendations && (
          <>
            {/* Soil Health */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Soil Health Status
                  </Typography>
                  <Chip
                    label={recommendations.soil_health}
                    color={
                      recommendations.soil_health.includes("Good")
                        ? "success"
                        : "warning"
                    }
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {recommendations.reasoning}
                </Typography>
              </CardContent>
            </Card>

            {/* Fertilizer Recommendation */}
            <Card sx={{ mb: 3, bgcolor: "#e8f5e9" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Agriculture
                    sx={{ fontSize: 28, color: "#4caf50", mr: 1.5 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Fertilizer Recommendation
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "#2e7d32", mb: 2 }}
                >
                  {recommendations.fertilizer_recommendation}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Recommended Actions:
                </Typography>
                <List dense>
                  {recommendations.actions.map((action, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleOutline
                          sx={{ fontSize: 18, color: "#4caf50" }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={action}
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { fontSize: "0.875rem" },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Crop Suggestion */}
            <Card sx={{ mb: 3, bgcolor: "#fff3e0" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Agriculture
                    sx={{ fontSize: 28, color: "#ff9800", mr: 1.5 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Crop Suggestion
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "#e65100", mb: 1 }}
                >
                  {recommendations.crop_suggestion}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on current soil nutrient profile and environmental
                  conditions. These crops will perform optimally in your field.
                </Typography>
              </CardContent>
            </Card>
          </>
        )}

        {/* Actions */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #45a049 0%, #3d8b40 100%)",
                },
              }}
              onClick={() => navigate("/photo-upload")}
            >
              📷 Soil Analysis
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                py: 1.5,
                borderColor: "#2196f3",
                color: "#2196f3",
                "&:hover": {
                  bgcolor: "#2196f310",
                  borderColor: "#2196f3",
                },
              }}
              onClick={() => navigate("/chat")}
            >
              🤖 Ask AI
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FieldDetailsPage;
