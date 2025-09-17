import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Agriculture,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { actions, getTranslation, state } = useAppContext();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    farmName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLanguageChange = (e) => {
    actions.setLanguage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Basic validation
      if (!formData.name.trim() || !formData.phone.trim()) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.phone.length < 10) {
        throw new Error("Please enter a valid phone number");
      }

      // Simulate login
      const user = actions.login({
        name: formData.name,
        phone: formData.phone,
        farmName: formData.farmName || "My Farm",
      });

      if (user) {
        actions.addNotification({
          type: "success",
          message: `Welcome back, ${user.name}!`,
        });

        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Agriculture sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            {getTranslation("welcome")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your details to access your farm dashboard
          </Typography>
        </Box>

        {/* Language Selection */}
        <Box sx={{ mb: 3 }}>
          <FormLabel
            component="legend"
            sx={{ display: "flex", alignItems: "center", mb: 1 }}
          >
            <LanguageIcon sx={{ mr: 1, fontSize: 20 }} />
            {getTranslation("language")}
          </FormLabel>
          <RadioGroup
            row
            value={state.language}
            onChange={handleLanguageChange}
            sx={{ justifyContent: "center" }}
          >
            <FormControlLabel
              value="en"
              control={<Radio size="small" />}
              label="English"
              sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.9rem" } }}
            />
            <FormControlLabel
              value="hi"
              control={<Radio size="small" />}
              label="हिंदी"
              sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.9rem" } }}
            />
          </RadioGroup>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            required
            margin="normal"
            type="tel"
            placeholder="+91 98765 43210"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">📱</InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            name="farmName"
            label="Farm Name (Optional)"
            value={formData.farmName}
            onChange={handleInputChange}
            margin="normal"
            placeholder="e.g., Green Valley Farm"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">🌾</InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "1.1rem",
              textTransform: "none",
              background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #45a049 0%, #3d8b40 100%)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "Signing In..." : getTranslation("login")}
          </Button>
        </form>

        {/* Demo Info */}
        <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Demo Mode: Enter any name and phone number to access the app
          </Typography>
        </Box>

        {/* Footer */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center", mt: 3 }}
        >
          By continuing, you agree to our terms and privacy policy
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
