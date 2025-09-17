import React from "react";
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
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FieldDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFieldById } = useAppContext();

  const field = getFieldById(id);

  if (!field) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Field not found</Typography>
        <Button onClick={() => navigate("/dashboard")} sx={{ mt: 2 }}>
          Back to Dashboard
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

  // Mock chart data
  const chartData = {
    labels: ["Jan 15", "Jan 16", "Jan 17", "Jan 18", "Jan 19", "Jan 20"],
    datasets: [
      {
        label: "Soil Moisture (%)",
        data: [60, 62, 58, 65, 63, 65],
        borderColor: "#2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        tension: 0.4,
      },
      {
        label: "Temperature (°C)",
        data: [20, 22, 21, 22, 23, 22],
        borderColor: "#ff9800",
        backgroundColor: "rgba(255, 152, 0, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: {
            size: 11,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

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
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {field.name}
          </Typography>
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
            icon={getStatusIcon(field.status)}
            label={field.status.charAt(0).toUpperCase() + field.status.slice(1)}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 500,
            }}
          />
          <Typography variant="body2">
            {field.crop} • {field.area}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, pb: 10 }}>
        {/* Health Score */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Field Health Score
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={field.overallHealth}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: getStatusColor(field.status),
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: getStatusColor(field.status) }}
              >
                {field.overallHealth}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Based on soil conditions, weather, and crop health indicators
            </Typography>
          </CardContent>
        </Card>

        {/* Current Metrics */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Current Conditions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                    border: "1px solid #e9ecef",
                    textAlign: "center",
                  }}
                >
                  <Opacity sx={{ fontSize: 24, color: "#2196f3", mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {field.metrics.soilMoisture}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Soil Moisture
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                    border: "1px solid #e9ecef",
                    textAlign: "center",
                  }}
                >
                  <Thermostat sx={{ fontSize: 24, color: "#ff9800", mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {field.metrics.temperature}°C
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Temperature
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                    border: "1px solid #e9ecef",
                    textAlign: "center",
                  }}
                >
                  <Water sx={{ fontSize: 24, color: "#03a9f4", mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {field.metrics.humidity}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Humidity
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                    border: "1px solid #e9ecef",
                    textAlign: "center",
                  }}
                >
                  <Science sx={{ fontSize: 24, color: "#4caf50", mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {field.metrics.ph}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    pH Level
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Trends Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              7-Day Trends
            </Typography>
            <Box sx={{ height: 200 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>

        {/* Field Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Field Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Agriculture sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2">
                    <strong>Crop:</strong> {field.crop}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2">
                    <strong>Planted:</strong>{" "}
                    {new Date(field.plantedDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2">
                    <strong>Expected Harvest:</strong>{" "}
                    {new Date(field.expectedHarvest).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Soil Type:</strong> {field.soilType}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Irrigation:</strong> {field.irrigation}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Last Fertilizer:</strong> {field.fertilizer}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

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
              📷 Take Photo
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
