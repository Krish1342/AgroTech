import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  Paper,
  IconButton,
  Chip,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  ArrowBack,
  Mic,
  Home,
  Assessment,
  Camera,
  Chat,
  Settings,
} from "@mui/icons-material";
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
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState("moisture");
  const [navValue, setNavValue] = React.useState(1);

  // Mock data for the chart
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Moisture %",
        data:
          selectedMetric === "moisture"
            ? [65, 68, 70, 72, 69, 71, 70]
            : [6.2, 6.4, 6.8, 6.5, 6.7, 6.8, 6.8],
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        fill: true,
        tension: 0.4,
      },
      ...(selectedMetric === "ph"
        ? [
            {
              label: "pH",
              data: [6.2, 6.4, 6.8, 6.5, 6.7, 6.8, 6.8],
              borderColor: "#4CAF50",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ]
        : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  const latestReadings = [
    { label: "Soil Moisture", value: "65%", status: "good" },
    { label: "pH Level", value: "6.8", status: "good" },
    { label: "Temperature", value: "25°C", status: "good" },
    { label: "Nitrogen (N)", value: "30°C", status: "warning" },
  ];

  return (
    <div className="page">
      {/* Header */}
      <Box className="header header-blue">
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
            <Typography className="header-title">Field Details</Typography>
            <Typography className="header-subtitle">Last 7 Days</Typography>
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
        {/* Metric Selection */}
        <Paper className="card">
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Moisture & pH
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <Chip
              label="Moisture"
              onClick={() => setSelectedMetric("moisture")}
              color={selectedMetric === "moisture" ? "primary" : "default"}
              variant={selectedMetric === "moisture" ? "filled" : "outlined"}
            />
            <Chip
              label="pH"
              onClick={() => setSelectedMetric("ph")}
              color={selectedMetric === "ph" ? "primary" : "default"}
              variant={selectedMetric === "ph" ? "filled" : "outlined"}
            />
          </Box>

          <Box sx={{ height: 250 }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Paper>

        {/* Latest Readings */}
        <Paper className="card">
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Latest Readings
          </Typography>

          {latestReadings.map((reading, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 2,
                borderBottom:
                  index < latestReadings.length - 1
                    ? "1px solid #e0e0e0"
                    : "none",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {reading.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {reading.value}
                </Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor:
                      reading.status === "good" ? "#4CAF50" : "#FF9800",
                  }}
                />
              </Box>
            </Box>
          ))}
        </Paper>
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

export default FieldDetailsPage;
