import React, { createContext, useReducer, useEffect } from "react";
import { fieldsData, languages } from "../data/mockData";
import { ActionTypes } from "../constants/actionTypes";

// Initial state
const initialState = {
  // App settings
  language: "en",
  isFirstTime: true,
  voiceEnabled: true,
  notifications: true,

  // Data
  fields: fieldsData,
  selectedField: null,

  // UI state
  loading: false,
  error: null,

  // Chat state
  chatHistory: [],
  isTyping: false,

  // Settings
  settings: {
    language: "en",
    notifications: true,
    voicePrompts: true,
    syncFrequency: "15",
    offlineCache: "2.3 MB",
  },
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
        settings: { ...state.settings, language: action.payload },
      };

    case ActionTypes.SET_FIRST_TIME:
      return {
        ...state,
        isFirstTime: action.payload,
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ActionTypes.UPDATE_FIELDS:
      return {
        ...state,
        fields: action.payload,
      };

    case ActionTypes.SELECT_FIELD:
      return {
        ...state,
        selectedField: action.payload,
      };

    case ActionTypes.ADD_CHAT_MESSAGE:
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload],
      };

    case ActionTypes.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload,
      };

    case ActionTypes.UPDATE_SETTING:
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.key]: action.payload.value,
        },
      };

    case ActionTypes.CLEAR_CACHE:
      return {
        ...state,
        settings: {
          ...state.settings,
          offlineCache: "0 MB",
        },
      };

    case ActionTypes.REFRESH_DATA: {
      // Simulate data refresh with slight variations
      const updatedFields = state.fields.map((field) => ({
        ...field,
        moisture: Math.max(
          20,
          Math.min(100, field.moisture + (Math.random() - 0.5) * 10)
        ),
        ph: Math.max(
          5.0,
          Math.min(8.0, field.ph + (Math.random() - 0.5) * 0.5)
        ),
        temperature: Math.max(
          15,
          Math.min(40, field.temperature + (Math.random() - 0.5) * 5)
        ),
        lastUpdated: new Date(),
      }));

      return {
        ...state,
        fields: updatedFields,
        loading: false,
      };
    }

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("agrotechSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      Object.entries(settings).forEach(([key, value]) => {
        dispatch({
          type: ActionTypes.UPDATE_SETTING,
          payload: { key, value },
        });
      });

      if (settings.language) {
        dispatch({
          type: ActionTypes.SET_LANGUAGE,
          payload: settings.language,
        });
      }

      if (settings.isFirstTime === false) {
        dispatch({
          type: ActionTypes.SET_FIRST_TIME,
          payload: false,
        });
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      "agrotechSettings",
      JSON.stringify({
        ...state.settings,
        isFirstTime: state.isFirstTime,
      })
    );
  }, [state.settings, state.isFirstTime]);

  // Action creators
  const actions = {
    setLanguage: (language) => {
      dispatch({ type: ActionTypes.SET_LANGUAGE, payload: language });
    },

    setFirstTime: (isFirstTime) => {
      dispatch({ type: ActionTypes.SET_FIRST_TIME, payload: isFirstTime });
    },

    setLoading: (loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    },

    selectField: (field) => {
      dispatch({ type: ActionTypes.SELECT_FIELD, payload: field });
    },

    addChatMessage: (message) => {
      dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: message });
    },

    setTyping: (isTyping) => {
      dispatch({ type: ActionTypes.SET_TYPING, payload: isTyping });
    },

    updateSetting: (key, value) => {
      dispatch({ type: ActionTypes.UPDATE_SETTING, payload: { key, value } });
    },

    clearCache: () => {
      dispatch({ type: ActionTypes.CLEAR_CACHE });
    },

    refreshData: () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      setTimeout(() => {
        dispatch({ type: ActionTypes.REFRESH_DATA });
      }, 1000);
    },
  };

  // Helper functions
  const getText = (text, textHi) => {
    return state.language === "hi" ? textHi || text : text;
  };

  const getCurrentLanguage = () => {
    return (
      languages.find((lang) => lang.code === state.language) || languages[0]
    );
  };

  const value = {
    ...state,
    ...actions,
    getText,
    getCurrentLanguage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
