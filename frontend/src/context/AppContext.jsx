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
  chatHistory: [], // Empty chat history - starts fresh
  quickActions: mockData.quickActions,
  connectedDevices: mockData.connectedDevices,
  settings: mockData.settingsOptions,
  loading: false,
  error: null,
  notifications: [],
  currentPage: "dashboard",
  isInitialized: false,
  isLoading: true,
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

    case ACTION_TYPES.SET_INITIALIZED:
      return {
        ...state,
        isInitialized: action.payload,
        isLoading: false,
      };

    case ACTION_TYPES.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
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
    const initializeApp = async () => {
      try {
        dispatch({ type: ACTION_TYPES.SET_IS_LOADING, payload: true });

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

        // Simulate some initialization time
        await new Promise((resolve) => setTimeout(resolve, 1000));

        dispatch({ type: ACTION_TYPES.SET_INITIALIZED, payload: true });
      } catch (error) {
        console.error("App initialization error:", error);
        dispatch({
          type: ACTION_TYPES.SET_ERROR,
          payload: "Failed to initialize app",
        });
        dispatch({ type: ACTION_TYPES.SET_INITIALIZED, payload: true });
      }
    };

    initializeApp();
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
    // Comprehensive translation system
    const translations = {
      en: {
        // Navigation
        dashboard: "Home",
        fields: "Fields",
        chat: "Chat",
        settings: "Settings",
        upload: "Upload",
        home: "Home",

        // Welcome & Auth
        welcome: "Welcome",
        welcomeToAgrotech: "Welcome to AgroTech",
        login: "Login",
        demoLogin: "Demo Login",
        selectLanguage: "Select your preferred language",
        language: "Language",
        voiceOnboarding: "Voice Onboarding",
        enableVoiceGuidance: "Enable voice guidance for easy setup",
        continue: "Continue",

        // User Info
        fullName: "Full Name",
        phoneNumber: "Phone Number",
        farmName: "Farm Name",
        farmNameOptional: "Farm Name (Optional)",
        enterDetails: "Enter your details to access your farm dashboard",
        demoMode:
          "Demo Mode: Enter any name and phone number to access the app",

        // Dashboard
        myFields: "My Fields",
        deviceDashboard: "Device Dashboard",
        farmHealthOverview: "Farm Health Overview",
        fieldsMonitored: "fields monitored",
        lastUpdated: "Last updated",
        quickActions: "Quick Actions",

        // Field Details
        fieldDetails: "Field Details",
        fieldHealth: "Field Health",
        overallHealth: "Overall Health",
        currentConditions: "Current Conditions",
        soilMoisture: "Soil Moisture",
        temperature: "Temperature",
        humidity: "Humidity",
        ph: "pH Level",
        trends: "7-Day Trends",
        fieldInformation: "Field Information",
        crop: "Crop",
        planted: "Planted",
        expectedHarvest: "Expected Harvest",
        soilType: "Soil Type",
        irrigation: "Irrigation",
        lastFertilizer: "Last Fertilizer",
        takePhoto: "Take Photo",
        askAI: "Ask AI",

        // Disease Detection
        diseaseDetection: "Disease Detection",
        diseaseDetectionDesc:
          "Take a photo of your crop to detect diseases and get treatment recommendations",
        tapToTakePhoto: "Tap to take photo",
        retakePhoto: "Retake Photo",
        analyze: "Analyze",
        analyzing: "Analyzing...",
        analyzingDesc:
          "Our AI is examining the image for diseases and health indicators",
        recentScans: "Recent Scans",
        confidence: "Confidence",
        severity: "Severity",
        treatment: "Recommended Treatment",
        askAIExpert: "Ask AI Expert",

        // Chat Assistant
        aiCropAdvisor: "AI Crop Advisor",
        aiFarmAssistant: "AI Farm Assistant",
        askAboutFarm: "Ask me anything about your farm and crops",
        quickQuestions: "Quick questions:",
        whatWeatherForecast: "What's the weather forecast?",
        whenWaterCrops: "When should I water my crops?",
        checkFieldHealth: "Check my field health",
        currentMarketPrices: "Current market prices",
        diseasePreventionTips: "Disease prevention tips",
        askAboutCrops: "Ask about crops, weather, or farming tips...",

        // Settings
        accountInformation: "Account Information",
        name: "Name",
        phone: "Phone",
        notSet: "Not set",
        appInformation: "App Information",
        version: "Version",
        lastUpdatedApp: "Last Updated",
        privacyPolicy: "Privacy Policy",
        viewPrivacyPolicy: "View our privacy policy",
        termsOfService: "Terms of Service",
        viewTerms: "View terms and conditions",
        helpSupport: "Help & Support",
        faq: "FAQ",
        frequentlyAsked: "Frequently asked questions",
        contactSupport: "Contact Support",
        getHelp: "Get help from our team",
        tutorial: "Tutorial",
        learnHowToUse: "Learn how to use the app",
        demoNotice:
          "This is a demo version of AgroTech. All data is simulated for demonstration purposes.",
        logout: "Logout",

        // Notifications
        notifications: "Notifications",
        weatherAlerts: "Weather Alerts",
        weatherAlertsDesc:
          "Get notified about weather changes affecting your crops",
        diseaseAlerts: "Disease Alerts",
        diseaseAlertsDesc: "Receive alerts when diseases are detected",
        irrigationReminders: "Irrigation Reminders",
        irrigationRemindersDesc: "Get reminders for watering your crops",
        marketUpdates: "Market Updates",
        marketUpdatesDesc: "Stay updated with crop prices and market trends",

        // Status & Health
        health: "Health",
        excellent: "Excellent",
        good: "Good",
        fair: "Fair",
        warning: "Warning",
        healthy: "Healthy",
        moisture: "Moisture",
        temp: "Temp",

        // Actions & Buttons
        viewDetails: "View Details",
        playAudioInHindi: "Play Audio in Hindi",
        backToDashboard: "Back to Dashboard",
        close: "Close",

        // Time & Status
        today: "Today",
        yesterday: "Yesterday",
        weekAgo: "1 week ago",
        online: "Online",
        offline: "Offline",

        // Misc
        confidenceLevel: "Confidence Level",
        recommendedAction: "Recommended Action",
        applyFungicide: "Apply fungicide immediately to prevent further spread",
        consultExpert:
          "Consult with an agricultural expert for specific guidance",
        welcomeBack: "Welcome back",
      },
      hi: {
        // Navigation
        dashboard: "होम",
        fields: "खेत",
        chat: "चैट",
        settings: "सेटिंग्स",
        upload: "अपलोड",
        home: "होम",

        // Welcome & Auth
        welcome: "स्वागत",
        welcomeToAgrotech: "एग्रोटेक में आपका स्वागत है",
        login: "लॉगिन",
        demoLogin: "डेमो लॉगिन",
        selectLanguage: "अपनी पसंदीदा भाषा चुनें",
        language: "भाषा",
        voiceOnboarding: "वॉयस ऑनबोर्डिंग",
        enableVoiceGuidance: "आसान सेटअप के लिए वॉयस गाइडेंस सक्षम करें",
        continue: "जारी रखें",

        // User Info
        fullName: "पूरा नाम",
        phoneNumber: "फोन नंबर",
        farmName: "खेत का नाम",
        farmNameOptional: "खेत का नाम (वैकल्पिक)",
        enterDetails:
          "अपने फार्म डैशबोर्ड तक पहुंचने के लिए अपना विवरण दर्ज करें",
        demoMode:
          "डेमो मोड: ऐप तक पहुंचने के लिए कोई भी नाम और फोन नंबर दर्ज करें",

        // Dashboard
        myFields: "मेरे खेत",
        deviceDashboard: "डिवाइस डैशबोर्ड",
        farmHealthOverview: "फार्म स्वास्थ्य अवलोकन",
        fieldsMonitored: "खेत निगरानी में",
        lastUpdated: "अंतिम अपडेट",
        quickActions: "त्वरित कार्य",

        // Field Details
        fieldDetails: "खेत विवरण",
        fieldHealth: "खेत स्वास्थ्य",
        overallHealth: "समग्र स्वास्थ्य",
        currentConditions: "वर्तमान स्थितियां",
        soilMoisture: "मिट्टी की नमी",
        temperature: "तापमान",
        humidity: "आर्द्रता",
        ph: "पीएच स्तर",
        trends: "7-दिन के रुझान",
        fieldInformation: "खेत की जानकारी",
        crop: "फसल",
        planted: "रोपा गया",
        expectedHarvest: "अपेक्षित फसल",
        soilType: "मिट्टी का प्रकार",
        irrigation: "सिंचाई",
        lastFertilizer: "अंतिम उर्वरक",
        takePhoto: "फोटो लें",
        askAI: "AI से पूछें",

        // Disease Detection
        diseaseDetection: "रोग का पता लगाना",
        diseaseDetectionDesc:
          "बीमारियों का पता लगाने और उपचार की सिफारिशें प्राप्त करने के लिए अपनी फसल की तस्वीर लें",
        tapToTakePhoto: "फोटो लेने के लिए टैप करें",
        retakePhoto: "फोटो फिर से लें",
        analyze: "विश्लेषण करें",
        analyzing: "विश्लेषण कर रहे हैं...",
        analyzingDesc:
          "हमारा AI बीमारियों और स्वास्थ्य संकेतकों के लिए छवि की जांच कर रहा है",
        recentScans: "हाल के स्कैन",
        confidence: "विश्वास",
        severity: "गंभीरता",
        treatment: "अनुशंसित उपचार",
        askAIExpert: "AI विशेषज्ञ से पूछें",

        // Chat Assistant
        aiCropAdvisor: "AI फसल सलाहकार",
        aiFarmAssistant: "AI फार्म सहायक",
        askAboutFarm: "अपने खेत और फसलों के बारे में मुझसे कुछ भी पूछें",
        quickQuestions: "त्वरित प्रश्न:",
        whatWeatherForecast: "मौसम का पूर्वानुमान क्या है?",
        whenWaterCrops: "मुझे अपनी फसलों को कब पानी देना चाहिए?",
        checkFieldHealth: "मेरे खेत का स्वास्थ्य जांचें",
        currentMarketPrices: "वर्तमान बाजार कीमतें",
        diseasePreventionTips: "रोग रोकथाम के सुझाव",
        askAboutCrops:
          "अपनी फसलों, मौसम, या खेती के सुझावों के बारे में पूछें...",

        // Settings
        accountInformation: "खाता जानकारी",
        name: "नाम",
        phone: "फोन",
        notSet: "सेट नहीं",
        appInformation: "ऐप जानकारी",
        version: "संस्करण",
        lastUpdatedApp: "अंतिम अपडेट",
        privacyPolicy: "गोपनीयता नीति",
        viewPrivacyPolicy: "हमारी गोपनीयता नीति देखें",
        termsOfService: "सेवा की शर्तें",
        viewTerms: "नियम और शर्तें देखें",
        helpSupport: "सहायता और समर्थन",
        faq: "पूछे जाने वाले प्रश्न",
        frequentlyAsked: "अक्सर पूछे जाने वाले प्रश्न",
        contactSupport: "सहायता से संपर्क करें",
        getHelp: "हमारी टीम से सहायता प्राप्त करें",
        tutorial: "ट्यूटोरियल",
        learnHowToUse: "ऐप का उपयोग करना सीखें",
        demoNotice:
          "यह एग्रोटेक का डेमो संस्करण है। सभी डेटा प्रदर्शन उद्देश्यों के लिए सिमुलेटेड है।",
        logout: "लॉगआउट",

        // Notifications
        notifications: "सूचनाएं",
        weatherAlerts: "मौसम अलर्ट",
        weatherAlertsDesc:
          "आपकी फसलों को प्रभावित करने वाले मौसम परिवर्तनों के बारे में सूचित रहें",
        diseaseAlerts: "रोग अलर्ट",
        diseaseAlertsDesc: "बीमारियों का पता चलने पर अलर्ट प्राप्त करें",
        irrigationReminders: "सिंचाई अनुस्मारक",
        irrigationRemindersDesc:
          "अपनी फसलों को पानी देने के लिए अनुस्मारक प्राप्त करें",
        marketUpdates: "बाजार अपडेट",
        marketUpdatesDesc: "फसल कीमतों और बाजार रुझानों के साथ अपडेट रहें",

        // Status & Health
        health: "स्वास्थ्य",
        excellent: "उत्कृष्ट",
        good: "अच्छा",
        fair: "ठीक",
        warning: "चेतावनी",
        healthy: "स्वस्थ",
        moisture: "नमी",
        temp: "तापमान",

        // Actions & Buttons
        viewDetails: "विवरण देखें",
        playAudioInHindi: "हिंदी में ऑडियो चलाएं",
        backToDashboard: "डैशबोर्ड पर वापस",
        close: "बंद करें",

        // Time & Status
        today: "आज",
        yesterday: "कल",
        weekAgo: "1 सप्ताह पहले",
        online: "ऑनलाइन",
        offline: "ऑफलाइन",

        // Misc
        confidenceLevel: "विश्वास स्तर",
        recommendedAction: "अनुशंसित कार्य",
        applyFungicide: "आगे फैलने से रोकने के लिए तुरंत कवकनाशी लगाएं",
        consultExpert: "विशिष्ट मार्गदर्शन के लिए कृषि विशेषज्ञ से सलाह लें",
        welcomeBack: "वापसी पर स्वागत है",
      },
    };

    return translations[state.language]?.[key] || key;
  };

  const contextValue = {
    state,
    actions,
    getFieldById,
    getTranslation,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    user: state.user,
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
