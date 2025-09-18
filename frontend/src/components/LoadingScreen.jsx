import React from "react";
import { Box, CircularProgress, Typography, Fade } from "@mui/material";
import { Agriculture } from "@mui/icons-material";

const LoadingScreen = ({ message = "Loading AgroTech..." }) => {
  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          zIndex: 9999,
        }}
      >
        {/* Logo Animation */}
        <Box
          sx={{
            position: "relative",
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
                "50%": {
                  transform: "scale(1.1)",
                  opacity: 0.7,
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
              },
            }}
          >
            <Agriculture
              sx={{
                fontSize: 80,
                color: "primary.main",
              }}
            />
          </Box>
          <CircularProgress
            size={120}
            thickness={2}
            sx={{
              color: "primary.light",
              animation: "rotate 2s linear infinite",
              "@keyframes rotate": {
                "0%": {
                  transform: "rotate(0deg)",
                },
                "100%": {
                  transform: "rotate(360deg)",
                },
              },
            }}
          />
        </Box>

        {/* App Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            mb: 2,
            textAlign: "center",
          }}
        >
          AgroTech
        </Typography>

        {/* Loading Message */}
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            textAlign: "center",
            mb: 1,
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>

        {/* Loading Dots */}
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                bgcolor: "primary.main",
                borderRadius: "50%",
                animation: `bounce 1.4s ease-in-out infinite both`,
                animationDelay: `${i * 0.16}s`,
                "@keyframes bounce": {
                  "0%, 80%, 100%": {
                    transform: "scale(0.6)",
                    opacity: 0.5,
                  },
                  "40%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>

        {/* Subtitle */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: "center",
            mt: 4,
            maxWidth: 300,
            px: 2,
          }}
        >
          Smart farming solutions powered by AI
        </Typography>
      </Box>
    </Fade>
  );
};

export default LoadingScreen;
