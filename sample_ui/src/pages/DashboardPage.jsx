import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  Paper,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  Add,
  Home,
  Assessment,
  Camera,
  Chat,
  Settings,
  ArrowForward,
} from "@mui/icons-material";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [navValue, setNavValue] = React.useState(0);

  const fields = [
    {
      id: 1,
      name: "Field 1",
      location: "North West Area",
      status: "Good",
      moisture: 70,
      metrics: {
        ph: 6.5,
        temp: "25°C",
        n: 80,
        k: 150,
      },
    },
    {
      id: 2,
      name: "Field 2",
      location: "South East Area",
      status: "Fair",
      moisture: 85,
      metrics: {
        ph: 7.2,
        temp: "28°C",
        n: 75,
        k: 140,
      },
    },
  ];

  const ProgressCircle = ({ value, size = 120 }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(value / 100) * circumference} ${circumference}`;

    return (
      <Box className="progress-circle" sx={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            className="progress-circle-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
          <circle
            className="progress-circle-fg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={strokeDasharray}
            style={{
              stroke: value > 60 ? "#4CAF50" : "#FF9800",
            }}
          />
        </svg>
        <Box className="progress-text">
          <Typography className="progress-value">{value}%</Typography>
          <Typography className="progress-label">Moisture</Typography>
        </Box>
      </Box>
    );
  };

  const FieldCard = ({ field }) => (
    <Paper className="field-card" elevation={2}>
      <Box className="field-header">
        <Box>
          <Typography className="field-name">{field.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {field.location}
          </Typography>
        </Box>
        <Box
          className={`field-status ${
            field.status === "Good" ? "status-good" : "status-fair"
          }`}
        >
          {field.status}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <ProgressCircle value={field.moisture} />

        <Box sx={{ flex: 1 }}>
          <Box className="metrics-grid">
            <Box className="metric-item">
              <Typography className="metric-value">
                {field.metrics.ph}
              </Typography>
              <Typography className="metric-label">pH</Typography>
            </Box>
            <Box className="metric-item">
              <Typography className="metric-value">
                {field.metrics.temp}
              </Typography>
              <Typography className="metric-label">Temp</Typography>
            </Box>
            <Box className="metric-item">
              <Typography className="metric-value">
                {field.metrics.n}
              </Typography>
              <Typography className="metric-label">N</Typography>
            </Box>
            <Box className="metric-item">
              <Typography className="metric-value">
                {field.metrics.k}
              </Typography>
              <Typography className="metric-label">K</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2, textAlign: "right" }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/field/${field.id}`)}
              style={{ fontSize: "14px", padding: "8px 16px" }}
            >
              View Details
              <ArrowForward sx={{ ml: 1, fontSize: 16 }} />
            </button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <div className="page">
      {/* Header */}
      <Box className="header">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography className="header-title">My Fields</Typography>
            <Typography className="header-subtitle">
              Monitor your crop health
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
            <Add />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box className="page-content">
        {fields.map((field) => (
          <FieldCard key={field.id} field={field} />
        ))}
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
        <BottomNavigationAction
          label="Home"
          icon={<Home />}
          className="nav-item"
        />
        <BottomNavigationAction
          label="My Crops"
          icon={<Assessment />}
          className="nav-item"
        />
        <BottomNavigationAction
          label="Advisory"
          icon={<Camera />}
          className="nav-item"
        />
        <BottomNavigationAction
          label="Chat"
          icon={<Chat />}
          className="nav-item"
        />
        <BottomNavigationAction
          label="Settings"
          icon={<Settings />}
          className="nav-item"
        />
      </BottomNavigation>
    </div>
  );
};

export default DashboardPage;
