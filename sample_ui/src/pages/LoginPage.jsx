import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login API call
    setTimeout(() => {
      setLoading(false);
      onLogin(); // Set authentication state
      navigate("/welcome"); // Navigate to welcome page
    }, 1000);
  };

  const handleDemoLogin = () => {
    setEmail("demo@agrotech.com");
    setPassword("demo123");

    // Auto-login with demo credentials
    setTimeout(() => {
      onLogin(); // Set authentication state
      navigate("/welcome"); // Navigate to welcome page
    }, 500);
  };

  return (
    <div
      className="page"
      style={{
        background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
      }}
    >
      <Container maxWidth="sm" sx={{ pt: 8, pb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "80vh",
            justifyContent: "center",
          }}
        >
          {/* Logo and App Name */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h3" sx={{ color: "white" }}>
                🌱
              </Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{ color: "white", fontWeight: "bold", mb: 1 }}
            >
              Agrotech
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)" }}>
              Smart Farming Solutions
            </Typography>
          </Box>

          {/* Login Form */}
          <Paper
            elevation={8}
            sx={{
              p: 4,
              width: "100%",
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              variant="h5"
              sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}
            >
              Welcome Back
            </Typography>

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "16px",
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleDemoLogin}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "16px",
                }}
              >
                Demo Login
              </Button>
            </form>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?
                <Button
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    ml: 1,
                  }}
                >
                  Sign Up
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default LoginPage;
