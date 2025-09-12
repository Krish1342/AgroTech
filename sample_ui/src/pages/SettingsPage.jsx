import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  ArrowBack,
  Mic,
  Person,
  Notifications,
  Language,
  Devices,
  Help,
  Info,
  Logout,
  ChevronRight,
  Home,
  Assessment,
  Camera,
  Chat,
  Settings,
} from "@mui/icons-material";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [navValue, setNavValue] = React.useState(4);
  const [notifications, setNotifications] = useState(true);
  const [voiceAssistant, setVoiceAssistant] = useState(true);

  const handleLogout = () => {
    // In a real app, this would clear auth tokens and redirect to login
    navigate("/login");
  };

  const settingsItems = [
    {
      icon: <Person />,
      title: "Profile",
      subtitle: "Manage your account details",
      action: "navigate",
      path: "/profile",
    },
    {
      icon: <Notifications />,
      title: "Notifications",
      subtitle: "Push notifications for alerts",
      action: "toggle",
      value: notifications,
      onChange: setNotifications,
    },
    {
      icon: <Language />,
      title: "Language",
      subtitle: "English (US)",
      action: "navigate",
      path: "/language",
    },
    {
      icon: <Mic />,
      title: "Voice Assistant",
      subtitle: "Enable voice commands",
      action: "toggle",
      value: voiceAssistant,
      onChange: setVoiceAssistant,
    },
    {
      icon: <Devices />,
      title: "Connected Devices",
      subtitle: "2 sensors connected",
      action: "navigate",
      path: "/devices",
    },
  ];

  const otherItems = [
    {
      icon: <Help />,
      title: "Help & Support",
      subtitle: "Get help and contact support",
      action: "navigate",
      path: "/help",
    },
    {
      icon: <Info />,
      title: "About",
      subtitle: "App version and information",
      action: "navigate",
      path: "/about",
    },
    {
      icon: <Logout />,
      title: "Sign Out",
      subtitle: "Sign out of your account",
      action: "logout",
    },
  ];

  const handleItemClick = (item) => {
    if (item.action === "navigate") {
      navigate(item.path);
    } else if (item.action === "logout") {
      handleLogout();
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <Box className="header header-gray">
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
            <Typography className="header-title">Settings</Typography>
            <Typography className="header-subtitle">
              Manage your preferences
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box className="page-content">
        {/* User Profile */}
        <Paper className="card">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: "#4CAF50",
                fontSize: "1.5rem",
              }}
            >
              JD
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                John Doe
              </Typography>
              <Typography variant="body2" color="text.secondary">
                john.doe@email.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Farmer since 2015
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Settings */}
        <Paper className="card">
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Settings
          </Typography>

          <List sx={{ p: 0 }}>
            {settingsItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    px: 0,
                    cursor: item.action === "navigate" ? "pointer" : "default",
                    "&:hover": {
                      backgroundColor:
                        item.action === "navigate"
                          ? "rgba(0,0,0,0.04)"
                          : "transparent",
                    },
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <ListItemIcon sx={{ color: "text.secondary" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={item.subtitle}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  {item.action === "toggle" ? (
                    <Switch
                      checked={item.value}
                      onChange={(e) => item.onChange(e.target.checked)}
                      color="primary"
                    />
                  ) : item.action === "navigate" ? (
                    <ChevronRight sx={{ color: "text.secondary" }} />
                  ) : null}
                </ListItem>
                {index < settingsItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Other Options */}
        <Paper className="card">
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Other
          </Typography>

          <List sx={{ p: 0 }}>
            {otherItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    px: 0,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.04)",
                    },
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        item.title === "Sign Out"
                          ? "error.main"
                          : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={item.subtitle}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      color:
                        item.title === "Sign Out" ? "error.main" : "inherit",
                    }}
                  />
                  <ChevronRight
                    sx={{
                      color:
                        item.title === "Sign Out"
                          ? "error.main"
                          : "text.secondary",
                    }}
                  />
                </ListItem>
                {index < otherItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* App Version */}
        <Box sx={{ textAlign: "center", mt: 4, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            AgroTech App v1.0.0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Built with ❤️ for farmers
          </Typography>
        </Box>
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

export default SettingsPage;
