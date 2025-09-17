import React, { createContext, useContext, useReducer, useEffect } from "react";
import mockData from "../data/mockData";
import { ACTION_TYPES } from "../constants/actionTypes";

// Initial state
const initialState = {
  user: null,
  language: "en",
  isAuthenticated: false,
  currentLocation: null,
  fields: mockData.fieldsData,
  diseaseResults: mockData.diseaseDetectionResults,
  chatHistory: mockData.chatHistory,
  quickActions: mockData.quickActions,
  connectedDevices: mockData.connectedDevices,
  settings: mockData.settingsOptions,
  loading: false,
  error: null,
  notifications: [],
  currentPage: "dashboard",
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case ACTION_TYPES.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
      };

    case ACTION_TYPES.SET_CURRENT_LOCATION:
      return {
        ...state,
        currentLocation: action.payload,
      };

    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };

    case ACTION_TYPES.UPDATE_FIELD:
      return {
        ...state,
        fields: state.fields.map((field) =>
          field.id === action.payload.id
            ? { ...field, ...action.payload.data }
            : field
        ),
      };

    case ACTION_TYPES.ADD_CHAT_MESSAGE:
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload],
      };

    case ACTION_TYPES.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case ACTION_TYPES.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload,
      };

    case ACTION_TYPES.LOGIN:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };

    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        currentLocation: null,
      };

    case ACTION_TYPES.UPDATE_DEVICE_STATUS:
      return {
        ...state,
        connectedDevices: state.connectedDevices.map((device) =>
          device.id === action.payload.id
            ? { ...device, status: action.payload.status }
            : device
        ),
      };

    case ACTION_TYPES.ADD_DISEASE_RESULT:
      return {
        ...state,
        diseaseResults: [action.payload, ...state.diseaseResults],
      };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("agrotech_user");
    const savedLanguage = localStorage.getItem("agrotech_language");
    const savedSettings = localStorage.getItem("agrotech_settings");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: ACTION_TYPES.SET_USER, payload: user });
      } catch (error) {
        console.error("Error parsing saved user:", error);
      }
    }

    if (savedLanguage) {
      dispatch({ type: ACTION_TYPES.SET_LANGUAGE, payload: savedLanguage });
    }

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: ACTION_TYPES.UPDATE_SETTINGS, payload: settings });
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("agrotech_user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("agrotech_user");
    }
  }, [state.user]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem("agrotech_language", state.language);
  }, [state.language]);

  // Save settings
  useEffect(() => {
    localStorage.setItem("agrotech_settings", JSON.stringify(state.settings));
  }, [state.settings]);

  // Action creators
  const actions = {
    setUser: (user) => dispatch({ type: ACTION_TYPES.SET_USER, payload: user }),

    setLanguage: (language) =>
      dispatch({ type: ACTION_TYPES.SET_LANGUAGE, payload: language }),

    setCurrentLocation: (location) =>
      dispatch({ type: ACTION_TYPES.SET_CURRENT_LOCATION, payload: location }),

    setLoading: (loading) =>
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading }),

    setError: (error) =>
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error }),

    addNotification: (notification) => {
      const id = Date.now();
      dispatch({
        type: ACTION_TYPES.ADD_NOTIFICATION,
        payload: { ...notification, id },
      });

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id });
      }, 5000);
    },

    removeNotification: (id) =>
      dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id }),

    updateField: (id, data) =>
      dispatch({ type: ACTION_TYPES.UPDATE_FIELD, payload: { id, data } }),

    addChatMessage: (message) => {
      const newMessage = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...message,
      };
      dispatch({ type: ACTION_TYPES.ADD_CHAT_MESSAGE, payload: newMessage });
    },

    updateSettings: (settings) =>
      dispatch({ type: ACTION_TYPES.UPDATE_SETTINGS, payload: settings }),

    setCurrentPage: (page) =>
      dispatch({ type: ACTION_TYPES.SET_CURRENT_PAGE, payload: page }),

    login: (credentials) => {
      // Simulate login logic
      const user = {
        id: 1,
        name: credentials.name || "Farm Owner",
        email: credentials.email || "farmer@example.com",
        phone: credentials.phone || "+91 98765 43210",
        farmName: "Green Valley Farm",
        location: "Punjab, India",
        avatar: null,
      };
      dispatch({ type: ACTION_TYPES.LOGIN, payload: user });
      return user;
    },

    logout: () => {
      dispatch({ type: ACTION_TYPES.LOGOUT });
      localStorage.removeItem("agrotech_user");
    },

    updateDeviceStatus: (id, status) =>
      dispatch({
        type: ACTION_TYPES.UPDATE_DEVICE_STATUS,
        payload: { id, status },
      }),

    addDiseaseResult: (result) => {
      const newResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...result,
      };
      dispatch({ type: ACTION_TYPES.ADD_DISEASE_RESULT, payload: newResult });
    },
  };

  // Helper functions
  const getFieldById = (id) => {
    return state.fields.find((field) => field.id === parseInt(id));
  };

  const getTranslation = (key) => {
    // Simple translation system - in real app would use i18n library
    const translations = {
      en: {
        dashboard: "Dashboard",
        fields: "My Fields",
        chat: "AI Assistant",
        settings: "Settings",
        upload: "Upload Photo",
        welcome: "Welcome to AgroTech",
        login: "Login",
        language: "Language",
        notifications: "Notifications",
        connectedDevices: "Connected Devices",
        fieldHealth: "Field Health",
        overallHealth: "Overall Health",
        soilMoisture: "Soil Moisture",
        temperature: "Temperature",
        humidity: "Humidity",
        ph: "pH Level",
      },
      hi: {
        dashboard: "डैशबोर्ड",
        fields: "मेरे खेत",
        chat: "AI सहायक",
        settings: "सेटिंग्स",
        upload: "फोटो अपलोड करें",
        welcome: "एग्रोटेक में आपका स्वागत है",
        login: "लॉगिन",
        language: "भाषा",
        notifications: "सूचनाएं",
        connectedDevices: "जुड़े उपकरण",
        fieldHealth: "खेत की स्वास्थ्य",
        overallHealth: "समग्र स्वास्थ्य",
        soilMoisture: "मिट्टी की नमी",
        temperature: "तापमान",
        humidity: "आर्द्रता",
        ph: "पीएच स्तर",
      },
    };

    return translations[state.language]?.[key] || key;
  };

  const contextValue = {
    state,
    actions,
    getFieldById,
    getTranslation,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export default AppContext;
