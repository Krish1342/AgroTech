import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  Agriculture,
  ArrowForward,
  Language,
  Check,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const WelcomePage = () => {
  const navigate = useNavigate();
  const { state, actions, getTranslation } = useAppContext();
  const [selectedLanguage, setSelectedLanguage] = useState(
    state.language || "en"
  );

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [state.isAuthenticated, navigate]);

  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिंदी" },
  ];

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    actions.setLanguage(langCode);
  };

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Agriculture sx={{ fontSize: 60, mb: 2, color: "white" }} />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: "white",
            }}
          >
            {getTranslation("welcome")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              mb: 4,
            }}
          >
            {state.language === "hi" ? "स्वागत" : "Welcome"}
          </Typography>
        </Box>

        {/* Language Selection Card */}
        <Card
          sx={{
            mb: 4,
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#2e7d32", fontWeight: 600 }}
            >
              {getTranslation("selectLanguage")}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={
                    selectedLanguage === lang.code ? "contained" : "outlined"
                  }
                  onClick={() => handleLanguageSelect(lang.code)}
                  sx={{
                    py: 2,
                    px: 3,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 500,
                    border: "2px solid #4caf50",
                    backgroundColor:
                      selectedLanguage === lang.code
                        ? "#4caf50"
                        : "transparent",
                    color: selectedLanguage === lang.code ? "white" : "#4caf50",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    "&:hover": {
                      backgroundColor:
                        selectedLanguage === lang.code
                          ? "#45a049"
                          : "rgba(76, 175, 80, 0.1)",
                      borderColor: "#45a049",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Language sx={{ fontSize: 20 }} />
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {lang.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {lang.native}
                      </Typography>
                    </Box>
                  </Box>
                  {selectedLanguage === lang.code && (
                    <Check sx={{ fontSize: 20 }} />
                  )}
                </Button>
              ))}
            </Box>

            {/* Voice Onboarding Option */}
            <Box
              sx={{ mt: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <input type="checkbox" id="voiceOnboarding" />
                <label htmlFor="voiceOnboarding">
                  <Typography variant="body2" sx={{ color: "#2e7d32" }}>
                    Voice Onboarding
                  </Typography>
                </label>
              </Box>
              <Typography variant="caption" sx={{ color: "#666" }}>
                {getTranslation("enableVoiceGuidance")}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Get Started Button */}
        <Button
          variant="contained"
          size="large"
          onClick={handleGetStarted}
          endIcon={<ArrowForward />}
          sx={{
            bgcolor: "white",
            color: "#2e7d32",
            fontWeight: 600,
            py: 1.5,
            px: 4,
            borderRadius: 3,
            fontSize: "1.1rem",
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            "&:hover": {
              bgcolor: "#f5f5f5",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            },
            transition: "all 0.3s ease",
          }}
        >
          {getTranslation("continue")}
        </Button>
      </Container>
    </Box>
  );
};

export default WelcomePage;
