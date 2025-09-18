import React from "react";
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import {
  Dashboard,
  Agriculture,
  Chat,
  Settings,
  CameraAlt,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTranslation } = useAppContext();

  // Determine current value based on pathname
  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/") return 0;
    if (path.startsWith("/field")) return 1;
    if (path === "/photo-upload") return 2;
    if (path === "/chat") return 3;
    if (path === "/settings") return 4;
    return 0;
  };

  const handleNavigation = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate("/dashboard");
        break;
      case 1:
        navigate("/dashboard"); // Will show fields view
        break;
      case 2:
        navigate("/photo-upload");
        break;
      case 3:
        navigate("/chat");
        break;
      case 4:
        navigate("/settings");
        break;
      default:
        navigate("/dashboard");
    }
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "428px",
        zIndex: 1000,
        borderTop: "1px solid #e0e0e0",
      }}
      elevation={3}
    >
      <MuiBottomNavigation
        value={getCurrentValue()}
        onChange={handleNavigation}
        sx={{
          height: 64,
          "& .MuiBottomNavigationAction-root": {
            color: "#757575",
            "&.Mui-selected": {
              color: "#4caf50",
            },
          },
        }}
      >
        <BottomNavigationAction
          label={getTranslation("dashboard")}
          icon={<Dashboard />}
          sx={{
            minWidth: 0,
            padding: "6px 12px 8px",
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.625rem",
              fontWeight: 500,
            },
          }}
        />
        <BottomNavigationAction
          label={getTranslation("fields")}
          icon={<Agriculture />}
          sx={{
            minWidth: 0,
            padding: "6px 12px 8px",
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.625rem",
              fontWeight: 500,
            },
          }}
        />
        <BottomNavigationAction
          label={getTranslation("upload")}
          icon={<CameraAlt />}
          sx={{
            minWidth: 0,
            padding: "6px 12px 8px",
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.625rem",
              fontWeight: 500,
            },
          }}
        />
        <BottomNavigationAction
          label={getTranslation("chat")}
          icon={<Chat />}
          sx={{
            minWidth: 0,
            padding: "6px 12px 8px",
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.625rem",
              fontWeight: 500,
            },
          }}
        />
        <BottomNavigationAction
          label={getTranslation("settings")}
          icon={<Settings />}
          sx={{
            minWidth: 0,
            padding: "6px 12px 8px",
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.625rem",
              fontWeight: 500,
            },
          }}
        />
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavigation;
