import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import BottomNavigation from "./components/BottomNavigation";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import FieldDetailsPage from "./pages/FieldDetailsPage";
import PhotoUploadPage from "./pages/PhotoUploadPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import "./index.css";

// Material-UI theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
    },
    secondary: {
      main: "#2196f3",
      light: "#64b5f6",
      dark: "#1976d2",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans Devanagari", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { state } = useAppContext();
  return state.user ? children : <Navigate to="/login" replace />;
}

// App content component
function AppContent() {
  const { state } = useAppContext();

  return (
    <div className="app">
      <Container
        maxWidth="sm"
        disableGutters
        className="mobile-container"
        sx={{
          maxWidth: "428px !important",
          minHeight: "100vh",
          bgcolor: "background.paper",
          boxShadow: { sm: "0 0 20px rgba(0,0,0,0.1)" },
          position: "relative",
        }}
      >
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/field/:id"
            element={
              <ProtectedRoute>
                <FieldDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/photo-upload"
            element={
              <ProtectedRoute>
                <PhotoUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>

        {state.user && <BottomNavigation />}
      </Container>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
