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

  // Remove the unused settingSections array

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
          {state.language === "hi"
            ? "अपनी ऐप प्राथमिकताएं और खाता प्रबंधित करें"
            : "Manage your app preferences and account"}
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
                {getTranslation("accountInformation")}
              </Typography>
            </Box>
            <List disablePadding>
              <ListItem>
                <ListItemText
                  primary={getTranslation("name")}
                  secondary={state.user?.name || getTranslation("notSet")}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={getTranslation("phone")}
                  secondary={state.user?.phone || getTranslation("notSet")}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={getTranslation("farmName")}
                  secondary={state.user?.farmName || getTranslation("notSet")}
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
                  primary={getTranslation("weatherAlerts")}
                  secondary={getTranslation("weatherAlertsDesc")}
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
                  primary={getTranslation("diseaseAlerts")}
                  secondary={getTranslation("diseaseAlertsDesc")}
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
                  primary={getTranslation("irrigationReminders")}
                  secondary={getTranslation("irrigationRemindersDesc")}
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
                  primary={getTranslation("marketUpdates")}
                  secondary={getTranslation("marketUpdatesDesc")}
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
                {getTranslation("appInformation")}
              </Typography>
            </Box>

            <List disablePadding>
              <ListItem>
                <ListItemText
                  primary={getTranslation("version")}
                  secondary="1.0.0"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={getTranslation("lastUpdatedApp")}
                  secondary="January 2024"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={getTranslation("privacyPolicy")}
                  secondary={getTranslation("viewPrivacyPolicy")}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <ChevronRight />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={getTranslation("termsOfService")}
                  secondary={getTranslation("viewTerms")}
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
                {getTranslation("helpSupport")}
              </Typography>
            </Box>

            <List disablePadding>
              <ListItem>
                <ListItemText
                  primary={getTranslation("faq")}
                  secondary={getTranslation("frequentlyAsked")}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <ChevronRight />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={getTranslation("contactSupport")}
                  secondary={getTranslation("getHelp")}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <ChevronRight />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={getTranslation("tutorial")}
                  secondary={getTranslation("learnHowToUse")}
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
            {getTranslation("demoNotice")}
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
          {getTranslation("logout")}
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
