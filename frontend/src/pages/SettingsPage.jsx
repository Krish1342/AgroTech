import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Divider,
  Button,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  Language,
  Notifications,
  Security,
  Help,
  Info,
  ExitToApp,
  ChevronRight,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { state, actions, getTranslation } = useAppContext();

  const handleLanguageChange = (event) => {
    actions.setLanguage(event.target.value);
    actions.addNotification({
      type: "success",
      message: `Language changed to ${
        event.target.value === "en" ? "English" : "हिंदी"
      }`,
    });
  };

  const handleNotificationToggle = (setting) => {
    const newSettings = {
      ...state.settings,
      notifications: {
        ...state.settings.notifications,
        [setting]: !state.settings.notifications[setting],
      },
    };
    actions.updateSettings(newSettings);
  };

  const handleLogout = () => {
    actions.logout();
    actions.addNotification({
      type: "info",
      message: "You have been logged out successfully",
    });
    navigate("/login");
  };

  const settingSections = [
    {
      title: "Account",
      icon: <Person />,
      items: [
        {
          label: "Profile Information",
          value: state.user?.name || "Not set",
          action: () => {},
        },
        {
          label: "Phone Number",
          value: state.user?.phone || "Not set",
          action: () => {},
        },
        {
          label: "Farm Name",
          value: state.user?.farmName || "Not set",
          action: () => {},
        },
      ],
    },
  ];

  return (
    <Box className="page">
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #607d8b 0%, #546e7a 100%)",
          color: "white",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <IconButton
            onClick={() => navigate("/dashboard")}
            sx={{ color: "white", mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {getTranslation("settings")}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Manage your app preferences and account
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, pb: 10 }}>
        {/* Account Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Person sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Account Information
              </Typography>
            </Box>
            <List disablePadding>
              <ListItem>
                <ListItemText
                  primary="Name"
                  secondary={state.user?.name || "Not set"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Phone"
                  secondary={state.user?.phone || "Not set"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Farm Name"
                  secondary={state.user?.farmName || "Not set"}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Language sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {getTranslation("language")}
              </Typography>
            </Box>
            <RadioGroup value={state.language} onChange={handleLanguageChange}>
              <FormControlLabel
                value="en"
                control={<Radio />}
                label="English"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                value="hi"
                control={<Radio />}
                label="हिंदी (Hindi)"
              />
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Notifications sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {getTranslation("notifications")}
              </Typography>
            </Box>

            <List disablePadding>
              <ListItem>
                <ListItemText
                  primary="Weather Alerts"
                  secondary="Get notified about weather changes affecting your crops"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={
                      state.settings.notifications?.weatherAlerts || false
                    }
                    onChange={() => handleNotificationToggle("weatherAlerts")}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Disease Alerts"
                  secondary="Receive alerts when diseases are detected"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={
                      state.settings.notifications?.diseaseAlerts || false
                    }
                    onChange={() => handleNotificationToggle("diseaseAlerts")}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Irrigation Reminders"
                  secondary="Get reminders for watering your crops"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={
                      state.settings.notifications?.irrigationReminders || false
                    }
                    onChange={() =>
                      handleNotificationToggle("irrigationReminders")
                    }
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemText
                  primary="Market Updates"
                  secondary="Stay updated with crop prices and market trends"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={
                      state.settings.notifications?.marketUpdates || false
                    }
                    onChange={() => handleNotificationToggle("marketUpdates")}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Info sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                App Information
              </Typography>
            </Box>

            <List disablePadding>
              <ListItem>
                <ListItemText primary="Version" secondary="1.0.0" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Last Updated" secondary="January 2024" />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Privacy Policy"
                  secondary="View our privacy policy"
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <ChevronRight />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Terms of Service"
                  secondary="View terms and conditions"
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <ChevronRight />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Help sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Help & Support
              </Typography>
            </Box>

            <List disablePadding>
              <ListItem>
                <ListItemText
                  primary="FAQ"
                  secondary="Frequently asked questions"
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <ChevronRight />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Contact Support"
                  secondary="Get help from our team"
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <ChevronRight />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Tutorial"
                  secondary="Learn how to use the app"
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <ChevronRight />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This is a demo version of AgroTech. All data is simulated for
            demonstration purposes.
          </Typography>
        </Alert>

        {/* Logout Button */}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<ExitToApp />}
          onClick={handleLogout}
          sx={{
            py: 1.5,
            borderColor: "#f44336",
            color: "#f44336",
            "&:hover": {
              bgcolor: "#f4433610",
              borderColor: "#f44336",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
