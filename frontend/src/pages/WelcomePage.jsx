import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { Agriculture, ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const WelcomePage = () => {
  const navigate = useNavigate();
  const { state, getTranslation } = useAppContext();

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [state.isAuthenticated, navigate]);

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
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
        {/* Logo/Icon */}
        <Box sx={{ mb: 4 }}>
          <Agriculture sx={{ fontSize: 80, mb: 2 }} />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: "2rem", sm: "2.5rem" },
            }}
          >
            AgroTech
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              fontWeight: 400,
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Smart Farming Solutions
          </Typography>
        </Box>

        {/* Welcome Message */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 600,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            {getTranslation("welcome")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: 0.9,
              lineHeight: 1.6,
              fontSize: { xs: "0.9rem", sm: "1rem" },
              mb: 2,
            }}
          >
            Monitor your fields, detect diseases, get AI-powered
            recommendations, and optimize your farming operations with our smart
            agriculture platform.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Join thousands of farmers already using AgroTech to increase their
            yield and reduce costs.
          </Typography>
        </Box>

        {/* Features List */}
        <Box sx={{ mb: 6 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              textAlign: "left",
            }}
          >
            {[
              "🌾 Real-time field monitoring",
              "🔍 AI-powered disease detection",
              "💧 Smart irrigation management",
              "📊 Data-driven insights",
              "🌤️ Weather integration",
              "📱 Mobile-first design",
            ].map((feature, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  opacity: 0.9,
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                }}
              >
                {feature}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Get Started Button */}
        <Button
          variant="contained"
          size="large"
          onClick={handleGetStarted}
          endIcon={<ArrowForward />}
          sx={{
            bgcolor: "white",
            color: "#4caf50",
            fontWeight: 600,
            py: 1.5,
            px: 4,
            borderRadius: 3,
            fontSize: { xs: "1rem", sm: "1.1rem" },
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
          Get Started
        </Button>

        {/* Footer */}
        <Typography
          variant="caption"
          sx={{
            mt: 4,
            opacity: 0.7,
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
          }}
        >
          Made with ❤️ for farmers
        </Typography>
      </Container>
    </Box>
  );
};

export default WelcomePage;
