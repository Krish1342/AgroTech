import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { Language } from "@mui/icons-material";
import { useAppContext } from "../context/AppContext";

const LanguageSelector = ({
  variant = "outlined",
  showIcon = true,
  size = "medium",
}) => {
  const { state, actions } = useAppContext();

  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिंदी" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
    { code: "te", name: "Telugu", native: "తెలుగు" },
    { code: "mr", name: "Marathi", native: "मराठी" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "ml", name: "Malayalam", native: "മലയാളം" },
    { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "as", name: "Assamese", native: "অসমীয়া" },
    { code: "ur", name: "Urdu", native: "اردو" },
    { code: "sa", name: "Sanskrit", native: "संस्कृत" },
    { code: "ks", name: "Kashmiri", native: "कॉशुर" },
    { code: "sd", name: "Sindhi", native: "سنڌي" },
    { code: "ne", name: "Nepali", native: "नेपाली" },
    { code: "mai", name: "Maithili", native: "मैथिली" },
    { code: "kok", name: "Konkani", native: "कोंकणी" },
    { code: "mni", name: "Manipuri", native: "মৈতৈলোন্" },
    { code: "doi", name: "Dogri", native: "डोगरी" },
    { code: "bo", name: "Bodo", native: "बर'" },
    { code: "sat", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
  ];

  const handleLanguageChange = (event) => {
    actions.setLanguage(event.target.value);
  };

  return (
    <FormControl variant={variant} fullWidth size={size}>
      <InputLabel id="language-select-label">
        {showIcon && <Language sx={{ mr: 1, verticalAlign: "middle" }} />}
        Language / भाषा
      </InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={state.language || "en"}
        label="Language / भाषा"
        onChange={handleLanguageChange}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 400,
            },
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {lang.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                ({lang.native})
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
