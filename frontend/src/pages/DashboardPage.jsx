import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
} from "@mui/material";
import { ArrowForward, Agriculture } from "@mui/icons-material";
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

const DashboardPage = () => {
  const navigate = useNavigate();
  const { state, getTranslation } = useAppContext();

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
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          {getTranslation("myFields")}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ px: 1 }}>
        {/* Fields Grid */}
        <Grid container spacing={2}>
          {state.fields.slice(0, 2).map((field, index) => (
            <Grid item xs={12} key={field.id}>
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
                onClick={() => handleFieldClick(field.id)}
              >
                {/* Field Image */}
                <Box
                  sx={{
                    display: "flex",
                    height: 140,
                  }}
                >
                  {/* Left side - Image */}
                  <Box
                    sx={{
                      width: "40%",
                      backgroundImage: `url(data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100" height="100" fill="${
                            index === 0 ? "#4caf50" : "#2e7d32"
                          }"/>
                          <text x="50" y="55" font-family="Arial" font-size="14" fill="white" text-anchor="middle">🌾</text>
                        </svg>
                      `)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                    }}
                  >
                    {/* Health Badge */}
                    <Chip
                      label={`${field.overallHealth}%`}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(255,255,255,0.9)",
                        color: getStatusColor(field.status),
                        fontWeight: 600,
                      }}
                    />

                    {/* Status Badge */}
                    <Chip
                      label={getStatusLabel(field.status, getTranslation)}
                      icon={
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: getStatusColor(field.status),
                          }}
                        />
                      }
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        bgcolor: "rgba(255,255,255,0.9)",
                        color: "#333",
                        fontSize: "0.7rem",
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
                        sx={{ fontWeight: 600, mb: 1, fontSize: "1rem" }}
                      >
                        {field.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {field.crop} • {field.area}
                      </Typography>

                      {/* Quick Stats */}
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 0.5,
                              bgcolor: "#f8f9fa",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#2196f3" }}
                            >
                              {field.metrics.soilMoisture}%
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
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
                              bgcolor: "#f8f9fa",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#ff9800" }}
                            >
                              {field.metrics.temperature}°C
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {getTranslation("temp")}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowForward />}
                      sx={{
                        borderColor: "#4caf50",
                        color: "#4caf50",
                        textTransform: "none",
                        fontSize: "0.8rem",
                        "&:hover": {
                          borderColor: "#45a049",
                          bgcolor: "rgba(76, 175, 80, 0.04)",
                        },
                      }}
                    >
                      {getTranslation("viewDetails")}
                    </Button>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

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
