import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Container,
  Box,
  FormControlLabel,
  Switch,
  Paper,
} from "@mui/material";
import { CheckCircle, Mic, MicOff } from "@mui/icons-material";

const WelcomePage = ({ onComplete }) => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [voiceOnboarding, setVoiceOnboarding] = useState(false);

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  ];

  const handleContinue = () => {
    onComplete();
    navigate("/dashboard");
  };

  return (
    <div
      className="page"
      style={{ minHeight: "100vh", backgroundColor: "white" }}
    >
      <Container maxWidth="sm" sx={{ pt: 4, pb: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 400, color: "text.secondary" }}
            className="hindi-font"
          >
            स्वागत
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
            Select your preferred language
          </Typography>

          {languages.map((lang) => (
            <Box
              key={lang.code}
              className={`language-option ${
                selectedLanguage === lang.code ? "selected" : ""
              }`}
              onClick={() => setSelectedLanguage(lang.code)}
              sx={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(76, 175, 80, 0.02)",
                },
              }}
            >
              <div
                className={`language-radio ${
                  selectedLanguage === lang.code ? "selected" : ""
                }`}
              >
                {selectedLanguage === lang.code && (
                  <CheckCircle
                    sx={{
                      position: "absolute",
                      top: "-2px",
                      left: "-2px",
                      width: 24,
                      height: 24,
                      color: "primary.main",
                    }}
                  />
                )}
              </div>
              <div className="language-info">
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {lang.nativeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {lang.name}
                </Typography>
              </div>
            </Box>
          ))}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "2px solid #e0e0e0",
              borderRadius: 3,
              backgroundColor: "#fafafa",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {voiceOnboarding ? (
                  <Mic sx={{ color: "primary.main", mr: 2 }} />
                ) : (
                  <MicOff sx={{ color: "text.secondary", mr: 2 }} />
                )}
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Voice Onboarding
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enable voice assistance features
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={voiceOnboarding}
                onChange={(e) => setVoiceOnboarding(e.target.checked)}
                color="primary"
              />
            </Box>
          </Paper>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleContinue}
          startIcon={<CheckCircle />}
          sx={{
            py: 2,
            borderRadius: 3,
            fontWeight: 600,
            textTransform: "none",
            fontSize: "16px",
            mb: 2,
          }}
        >
          Get Started
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate("/dashboard")}
          sx={{
            py: 1.5,
            fontWeight: 500,
            textTransform: "none",
            color: "text.secondary",
          }}
        >
          Skip for now
        </Button>
      </Container>
    </div>
  );
};

export default WelcomePage;
