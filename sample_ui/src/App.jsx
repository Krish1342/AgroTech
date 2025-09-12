import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Import pages
import LoginPage from "./pages/LoginPage";
import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/DashboardPage";
import FieldDetailsPage from "./pages/FieldDetailsPage";
import PhotoUploadPage from "./pages/PhotoUploadPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#4CAF50",
    },
    secondary: {
      main: "#2196F3",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isFirstTime, setIsFirstTime] = React.useState(true);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <div className="mobile-container">
          <Router>
            <Routes>
              <Route
                path="/login"
                element={<LoginPage onLogin={() => setIsAuthenticated(true)} />}
              />
              <Route
                path="/welcome"
                element={
                  isAuthenticated ? (
                    <WelcomePage onComplete={() => setIsFirstTime(false)} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    <DashboardPage />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/field/:id"
                element={
                  isAuthenticated ? (
                    <FieldDetailsPage />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/upload"
                element={
                  isAuthenticated ? (
                    <PhotoUploadPage />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/chat"
                element={
                  isAuthenticated ? (
                    <ChatPage />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/settings"
                element={
                  isAuthenticated ? (
                    <SettingsPage />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/"
                element={
                  <Navigate
                    to={
                      !isAuthenticated
                        ? "/login"
                        : isFirstTime
                        ? "/welcome"
                        : "/dashboard"
                    }
                    replace
                  />
                }
              />
            </Routes>
          </Router>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
