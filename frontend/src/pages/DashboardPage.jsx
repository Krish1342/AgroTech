import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  IconButton,
  Button,
} from "@mui/material";
import {
  ArrowForward,
  Water,
  Thermostat,
  Opacity,
  Science,
  TrendingUp,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

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

// Field Card Component
const FieldCard = ({ field, onClick }) => {
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

  return (
    <Card
      className="field-card"
      sx={{
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #4caf50 0%, #2196f3 100%)",
        },
      }}
      onClick={() => onClick(field.id)}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Field Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#212121" }}>
            {field.name}
          </Typography>
          <Chip
            icon={getStatusIcon(field.status)}
            label={field.status.charAt(0).toUpperCase() + field.status.slice(1)}
            size="small"
            sx={{
              bgcolor: `${getStatusColor(field.status)}20`,
              color: getStatusColor(field.status),
              fontWeight: 500,
              fontSize: "0.75rem",
            }}
          />
        </Box>

        {/* Progress Circle */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <ProgressCircle
            value={field.overallHealth}
            color={getStatusColor(field.status)}
          />
        </Box>

        {/* Metrics Grid */}
        <Grid container spacing={1}>
          <Grid item xs={3}>
            <Box
              sx={{
                bgcolor: "#f8f9fa",
                borderRadius: 1,
                p: 1,
                textAlign: "center",
                border: "1px solid #e9ecef",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 0.5,
                }}
              >
                <Opacity sx={{ fontSize: 16, color: "#2196f3" }} />
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#212121", fontSize: "0.9rem" }}
              >
                {field.metrics.soilMoisture}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#757575",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                }}
              >
                Moisture
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box
              sx={{
                bgcolor: "#f8f9fa",
                borderRadius: 1,
                p: 1,
                textAlign: "center",
                border: "1px solid #e9ecef",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 0.5,
                }}
              >
                <Thermostat sx={{ fontSize: 16, color: "#ff9800" }} />
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#212121", fontSize: "0.9rem" }}
              >
                {field.metrics.temperature}°C
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#757575",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                }}
              >
                Temp
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box
              sx={{
                bgcolor: "#f8f9fa",
                borderRadius: 1,
                p: 1,
                textAlign: "center",
                border: "1px solid #e9ecef",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 0.5,
                }}
              >
                <Water sx={{ fontSize: 16, color: "#03a9f4" }} />
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#212121", fontSize: "0.9rem" }}
              >
                {field.metrics.humidity}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#757575",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                }}
              >
                Humidity
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box
              sx={{
                bgcolor: "#f8f9fa",
                borderRadius: 1,
                p: 1,
                textAlign: "center",
                border: "1px solid #e9ecef",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 0.5,
                }}
              >
                <Science sx={{ fontSize: 16, color: "#4caf50" }} />
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#212121", fontSize: "0.9rem" }}
              >
                {field.metrics.ph}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#757575",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                }}
              >
                pH
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Field Info */}
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e9ecef" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.8rem" }}
          >
            <strong>{field.crop}</strong> • {field.area} • Planted{" "}
            {new Date(field.plantedDate).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { state, getTranslation } = useAppContext();

  const handleFieldClick = (fieldId) => {
    navigate(`/field/${fieldId}`);
  };

  // Calculate overall farm health
  const overallHealth =
    state.fields.reduce((sum, field) => sum + field.overallHealth, 0) /
    state.fields.length;

  return (
    <Box className="page">
      {/* Header */}
      <Box
        className="header"
        sx={{
          background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
          color: "white",
          p: 3,
          borderRadius: "0 0 20px 20px",
        }}
      >
        <Typography variant="h4" className="header-title">
          Welcome back, {state.user?.name || "Farmer"}!
        </Typography>
        <Typography variant="body2" className="header-subtitle">
          {state.user?.farmName || "Farm"} • {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      {/* Content */}
      <Box className="page-content" sx={{ pb: 10 }}>
        {/* Overall Farm Health */}
        <Card sx={{ mb: 3, p: 2 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ textAlign: "center", fontWeight: 600 }}
            >
              Farm Health Overview
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <ProgressCircle
                value={Math.round(overallHealth)}
                size={100}
                color="#4caf50"
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              {state.fields.length} fields monitored • Last updated:{" "}
              {new Date().toLocaleTimeString()}
            </Typography>
          </CardContent>
        </Card>

        {/* Fields Section */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, px: 1 }}>
          {getTranslation("fields")} ({state.fields.length})
        </Typography>

        {/* Fields List */}
        <Box sx={{ mb: 3 }}>
          {state.fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              onClick={handleFieldClick}
            />
          ))}
        </Box>

        {/* Quick Actions */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, px: 1 }}>
          Quick Actions
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
              <Typography variant="caption">Photo Upload</Typography>
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
              <Typography variant="caption">AI Assistant</Typography>
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
