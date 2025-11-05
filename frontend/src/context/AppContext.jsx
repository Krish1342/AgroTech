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
        welcome: "Welcome to AgroTech",
        welcomeToAgrotech: "Welcome to AgroTech",
        smartFarmingAssistant: "Smart Farming Assistant",
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
        welcome: "एग्रोटेक में आपका स्वागत है",
        welcomeToAgrotech: "एग्रोटेक में आपका स्वागत है",
        smartFarmingAssistant: "स्मार्ट खेती सहायक",
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
      bn: {
        // Bengali translations
        welcome: "এগ্রোটেকে স্বাগতম",
        welcomeToAgrotech: "এগ্রোটেকে স্বাগতম",
        smartFarmingAssistant: "স্মার্ট কৃষি সহায়ক",
        selectLanguage: "আপনার পছন্দের ভাষা নির্বাচন করুন",
        continue: "চালিয়ে যান",
        login: "লগইন",
        logout: "লগআউট",
        enableVoiceGuidance: "সহজ সেটআপের জন্য ভয়েস গাইডেন্স সক্ষম করুন",
        dashboard: "হোম",
        fields: "ক্ষেত্র",
        chat: "চ্যাট",
        settings: "সেটিংস",
        myFields: "আমার ক্ষেত্র",
        language: "ভাষা",
        fullName: "পুরো নাম",
        phoneNumber: "ফোন নম্বর",
        farmName: "খামারের নাম",
        enterDetails: "আপনার ফার্ম ড্যাশবোর্ড অ্যাক্সেস করতে আপনার বিবরণ লিখুন",
        viewDetails: "বিস্তারিত দেখুন",
        health: "স্বাস্থ্য",
        excellent: "চমৎকার",
        good: "ভাল",
        accountInformation: "অ্যাকাউন্ট তথ্য",
        notifications: "বিজ্ঞপ্তি",
      },
      te: {
        // Telugu translations
        welcome: "ఎగ్రోటెక్‌కు స్వాగతం",
        welcomeToAgrotech: "ఎగ్రోటెక్‌కు స్వాగతం",
        smartFarmingAssistant: "స్మార్ట్ వ్యవసాయ సహాయకుడు",
        selectLanguage: "మీ ఇష్టమైన భాషను ఎంచుకోండి",
        continue: "కొనసాగించు",
        login: "లాగిన్",
        logout: "లాగ్అవుట్",
        enableVoiceGuidance:
          "సులభమైన సెటప్ కోసం వాయిస్ గైడెన్స్‌ను ప్రారంభించండి",
        dashboard: "హోమ్",
        fields: "పొలాలు",
        chat: "చాట్",
        settings: "సెట్టింగ్స్",
        myFields: "నా పొలాలు",
        language: "భాష",
        fullName: "పూర్తి పేరు",
        phoneNumber: "ఫోన్ నంబర్",
        farmName: "పొలం పేరు",
        enterDetails:
          "మీ ఫారమ్ డ్యాష్‌బోర్డ్‌ని యాక్సెస్ చేయడానికి మీ వివరాలను నమోదు చేయండి",
        viewDetails: "వివరాలను చూడండి",
        health: "ఆరోగ్యం",
        excellent: "అద్భుతమైన",
        good: "మంచి",
        accountInformation: "ఖాతా సమాచారం",
        notifications: "నోటిఫికేషన్‌లు",
      },
      mr: {
        // Marathi translations
        welcome: "एग्रोटेकमध्ये आपले स्वागत आहे",
        welcomeToAgrotech: "एग्रोटेकमध्ये आपले स्वागत आहे",
        smartFarmingAssistant: "स्मार्ट शेती सहाय्यक",
        selectLanguage: "आपली पसंतीची भाषा निवडा",
        continue: "सुरू ठेवा",
        login: "लॉगिन",
        logout: "लॉगआउट",
        enableVoiceGuidance: "सुलभ सेटअपसाठी व्हॉइस मार्गदर्शन सक्षम करा",
        dashboard: "मुख्यपृष्ठ",
        fields: "शेत",
        chat: "चॅट",
        settings: "सेटिंग्ज",
        myFields: "माझी शेत",
        language: "भाषा",
        fullName: "पूर्ण नाव",
        phoneNumber: "फोन नंबर",
        farmName: "शेताचे नाव",
        enterDetails:
          "आपल्या फार्म डॅशबोर्डवर प्रवेश करण्यासाठी आपले तपशील प्रविष्ट करा",
        viewDetails: "तपशील पहा",
        health: "आरोग्य",
        excellent: "उत्कृष्ट",
        good: "चांगले",
        accountInformation: "खाते माहिती",
        notifications: "सूचना",
      },
      ta: {
        // Tamil translations
        welcome: "அக்ரோடெக்கிற்கு வரவேற்கிறோம்",
        welcomeToAgrotech: "அக்ரோடெக்கிற்கு வரவேற்கிறோம்",
        smartFarmingAssistant: "ஸ்மார்ட் விவசாய உதவியாளர்",
        selectLanguage: "உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்",
        continue: "தொடரவும்",
        login: "உள்நுழைக",
        logout: "வெளியேறு",
        enableVoiceGuidance: "எளிதான அமைவிற்கு குரல் வழிகாட்டுதலை இயக்கவும்",
        dashboard: "முகப்பு",
        fields: "வயல்கள்",
        chat: "அரட்டை",
        settings: "அமைப்புகள்",
        myFields: "எனது வயல்கள்",
        language: "மொழி",
        fullName: "முழு பெயர்",
        phoneNumber: "தொலைபேசி எண்",
        farmName: "பண்ணை பெயர்",
        enterDetails:
          "உங்கள் பண்ணை டாஷ்போர்டை அணுக உங்கள் விவரங்களை உள்ளிடவும்",
        viewDetails: "விவரங்களைக் காண்க",
        health: "ஆரோக்யம்",
        excellent: "சிறந்த",
        good: "நல்லது",
        accountInformation: "கணக்கு தகவல்",
        notifications: "அறிவிப்புகள்",
      },
      gu: {
        // Gujarati translations
        welcome: "એગ્રોટેકમાં આપનું સ્વાગત છે",
        welcomeToAgrotech: "એગ્રોટેકમાં આપનું સ્વાગત છે",
        smartFarmingAssistant: "સ્માર્ટ ખેતી સહાયક",
        selectLanguage: "તમારી પસંદગીની ભાષા પસંદ કરો",
        continue: "ચાલુ રાખો",
        login: "લોગિન",
        logout: "લોગઆઉટ",
        enableVoiceGuidance: "સરળ સેટઅપ માટે વૉઇસ માર્ગદર્શન સક્ષમ કરો",
        dashboard: "હોમ",
        fields: "ખેતરો",
        chat: "ચેટ",
        settings: "સેટિંગ્સ",
        myFields: "મારા ખેતરો",
        language: "ભાષા",
        fullName: "પૂરું નામ",
        phoneNumber: "ફોન નંબર",
        farmName: "ખેતરનું નામ",
        enterDetails:
          "તમારા ફાર્મ ડેશબોર્ડને ઍક્સેસ કરવા માટે તમારી વિગતો દાખલ કરો",
        viewDetails: "વિગતો જુઓ",
        health: "આરોગ્ય",
        excellent: "ઉત્કૃષ્ટ",
        good: "સારું",
        accountInformation: "એકાઉન્ટ માહિતી",
        notifications: "સૂચનાઓ",
      },
      kn: {
        // Kannada translations
        welcome: "ಅಗ್ರೋಟೆಕ್‌ಗೆ ಸುಸ್ವಾಗತ",
        welcomeToAgrotech: "ಅಗ್ರೋಟೆಕ್‌ಗೆ ಸುಸ್ವಾಗತ",
        smartFarmingAssistant: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ",
        selectLanguage: "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        continue: "ಮುಂದುವರಿಸಿ",
        login: "ಲಾಗಿನ್",
        logout: "ಲಾಗ್ಔಟ್",
        enableVoiceGuidance:
          "ಸುಲಭ ಸೆಟಪ್‌ಗಾಗಿ ವಾಯ್ಸ್ ಮಾರ್ಗದರ್ಶನವನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ",
        dashboard: "ಮುಖಪುಟ",
        fields: "ಹೊಲಗಳು",
        chat: "ಚಾಟ್",
        settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
        myFields: "ನನ್ನ ಹೊಲಗಳು",
        language: "ಭಾಷೆ",
        fullName: "ಪೂರ್ಣ ಹೆಸರು",
        phoneNumber: "ಫೋನ್ ಸಂಖ್ಯೆ",
        farmName: "ಫಾರ್ಮ್ ಹೆಸರು",
        enterDetails:
          "ನಿಮ್ಮ ಫಾರ್ಮ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅನ್ನು ಪ್ರವೇಶಿಸಲು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ",
        viewDetails: "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
        health: "ಆರೋಗ್ಯ",
        excellent: "ಅತ್ಯುತ್ತಮ",
        good: "ಒಳ್ಳೆಯದು",
        accountInformation: "ಖಾತೆ ಮಾಹಿತಿ",
        notifications: "ಅಧಿಸೂಚನೆಗಳು",
      },
      ml: {
        // Malayalam translations
        welcome: "അഗ്രോടെക്കിലേക്ക് സ്വാഗതം",
        welcomeToAgrotech: "അഗ്രോടെക്കിലേക്ക് സ്വാഗതം",
        smartFarmingAssistant: "സ്മാർട്ട് കൃഷി സഹായി",
        selectLanguage: "നിങ്ങളുടെ ഇഷ്ടപ്പെട്ട ഭാഷ തിരഞ്ഞെടുക്കുക",
        continue: "തുടരുക",
        login: "ലോഗിൻ",
        logout: "ലോഗൗട്ട്",
        enableVoiceGuidance:
          "എളുപ്പമുള്ള സജ്ജീകരണത്തിനായി വോയ്‌സ് ഗൈഡൻസ് പ്രവർത്തനക്ഷമമാക്കുക",
        dashboard: "ഹോം",
        fields: "വയലുകൾ",
        chat: "ചാറ്റ്",
        settings: "ക്രമീകരണങ്ങൾ",
        myFields: "എന്റെ വയലുകൾ",
        language: "ഭാഷ",
        fullName: "മുഴുവൻ പേര്",
        phoneNumber: "ഫോൺ നമ്പർ",
        farmName: "ഫാം പേര്",
        enterDetails:
          "നിങ്ങളുടെ ഫാം ഡാഷ്‌ബോർഡ് ആക്‌സസ് ചെയ്യാൻ നിങ്ങളുടെ വിശദാംശങ്ങൾ നൽകുക",
        viewDetails: "വിശദാംശങ്ങൾ കാണുക",
        health: "ആരോഗ്യം",
        excellent: "മികച്ചത്",
        good: "നല്ലത്",
        accountInformation: "അക്കൗണ്ട് വിവരം",
        notifications: "അറിയിപ്പുകൾ",
      },
      or: {
        // Odia translations
        welcome: "ଏଗ୍ରୋଟେକ୍‌କୁ ସ୍ୱାଗତ",
        welcomeToAgrotech: "ଏଗ୍ରୋଟେକ୍‌କୁ ସ୍ୱାଗତ",
        smartFarmingAssistant: "ସ୍ମାର୍ଟ କୃଷି ସହାୟକ",
        selectLanguage: "ଆପଣଙ୍କର ପସନ୍ଦିତ ଭାଷା ବାଛନ୍ତୁ",
        continue: "ଜାରି ରଖନ୍ତୁ",
        login: "ଲଗଇନ୍",
        logout: "ଲଗଆଉଟ୍",
        enableVoiceGuidance: "ସହଜ ସେଟଅପ୍ ପାଇଁ ଭଏସ୍ ଗାଇଡେନ୍ସ ସକ୍ଷମ କରନ୍ତୁ",
        dashboard: "ହୋମ୍",
        fields: "କ୍ଷେତ୍ରଗୁଡିକ",
        chat: "ଚାଟ୍",
        settings: "ସେଟିଂସ୍",
        myFields: "ମୋର କ୍ଷେତ୍ରଗୁଡିକ",
        language: "ଭାଷା",
        fullName: "ସମ୍ପୂର୍ଣ୍ଣ ନାମ",
        phoneNumber: "ଫୋନ୍ ନମ୍ବର",
        farmName: "ଫାର୍ମ ନାମ",
        enterDetails:
          "ଆପଣଙ୍କର ଫାର୍ମ ଡ୍ୟାସବୋର୍ଡ ଆକ୍ସେସ କରିବାକୁ ଆପଣଙ୍କର ବିବରଣୀ ପ୍ରବିଷ୍ଟ କରନ୍ତୁ",
        viewDetails: "ବିବରଣୀ ଦେଖନ୍ତୁ",
        health: "ସ୍ୱାସ୍ଥ୍ୟ",
        excellent: "ଉତ୍କୃଷ୍ଟ",
        good: "ଭଲ",
        accountInformation: "ଖାତା ସୂଚନା",
        notifications: "ବିଜ୍ଞପ୍ତିଗୁଡିକ",
      },
      pa: {
        // Punjabi translations
        welcome: "ਐਗਰੋਟੈਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ",
        welcomeToAgrotech: "ਐਗਰੋਟੈਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ",
        smartFarmingAssistant: "ਸਮਾਰਟ ਖੇਤੀ ਸਹਾਇਕ",
        selectLanguage: "ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ",
        continue: "ਜਾਰੀ ਰੱਖੋ",
        login: "ਲੌਗਇਨ",
        logout: "ਲੌਗਆਉਟ",
        enableVoiceGuidance: "ਆਸਾਨ ਸੈੱਟਅੱਪ ਲਈ ਵੌਇਸ ਮਾਰਗਦਰਸ਼ਨ ਯੋਗ ਕਰੋ",
        dashboard: "ਹੋਮ",
        fields: "ਖੇਤ",
        chat: "ਗੱਲਬਾਤ",
        settings: "ਸੈਟਿੰਗਾਂ",
        myFields: "ਮੇਰੇ ਖੇਤ",
        language: "ਭਾਸ਼ਾ",
        fullName: "ਪੂਰਾ ਨਾਮ",
        phoneNumber: "ਫ਼ੋਨ ਨੰਬਰ",
        farmName: "ਫਾਰਮ ਦਾ ਨਾਮ",
        enterDetails:
          "ਆਪਣੇ ਫਾਰਮ ਡੈਸ਼ਬੋਰਡ ਤੱਕ ਪਹੁੰਚ ਕਰਨ ਲਈ ਆਪਣੀਆਂ ਵੇਰਵੇ ਦਰਜ ਕਰੋ",
        viewDetails: "ਵੇਰਵੇ ਵੇਖੋ",
        health: "ਸਿਹਤ",
        excellent: "ਸ਼ਾਨਦਾਰ",
        good: "ਚੰਗਾ",
        accountInformation: "ਖਾਤਾ ਜਾਣਕਾਰੀ",
        notifications: "ਸੂਚਨਾਵਾਂ",
      },
      as: {
        // Assamese translations
        welcome: "এগ্ৰোটেকলৈ স্বাগতম",
        welcomeToAgrotech: "এগ্ৰোটেকলৈ স্বাগতম",
        smartFarmingAssistant: "স্মাৰ্ট কৃষি সহায়ক",
        selectLanguage: "আপোনাৰ পছন্দৰ ভাষা নিৰ্বাচন কৰক",
        continue: "অব্যাহত ৰাখক",
        login: "লগইন",
        logout: "লগআউট",
        enableVoiceGuidance: "সহজ ছেটআপৰ বাবে ভয়েচ গাইডেন্স সামৰ্থবান কৰক",
        dashboard: "হোম",
        fields: "পথাৰ",
        chat: "চেট",
        settings: "ছেটিংছ",
        myFields: "মোৰ পথাৰ",
        language: "ভাষা",
        fullName: "সম্পূৰ্ণ নাম",
        phoneNumber: "ফোন নম্বৰ",
        farmName: "ফাৰ্মৰ নাম",
        enterDetails:
          "আপোনাৰ ফাৰ্ম ডেশ্বব'ৰ্ড এক্সেছ কৰিবলৈ আপোনাৰ বিৱৰণ প্ৰৱিষ্ট কৰক",
        viewDetails: "বিৱৰণ চাওক",
        health: "স্বাস্থ্য",
        excellent: "উৎকৃষ্ট",
        good: "ভাল",
        accountInformation: "একাউণ্ট তথ্য",
        notifications: "জাননী",
      },
      ur: {
        // Urdu translations
        welcome: "ایگرو ٹیک میں خوش آمدید",
        welcomeToAgrotech: "ایگرو ٹیک میں خوش آمدید",
        smartFarmingAssistant: "سمارٹ فارمنگ اسسٹنٹ",
        selectLanguage: "اپنی پسندیدہ زبان منتخب کریں",
        continue: "جاری رکھیں",
        login: "لاگ ان",
        logout: "لاگ آؤٹ",
        enableVoiceGuidance: "آسان سیٹ اپ کے لیے وائس گائیڈنس کو فعال کریں",
        dashboard: "ہوم",
        fields: "کھیت",
        chat: "چیٹ",
        settings: "ترتیبات",
        myFields: "میرے کھیت",
        language: "زبان",
        fullName: "پورا نام",
        phoneNumber: "فون نمبر",
        farmName: "فارم کا نام",
        enterDetails:
          "اپنے فارم ڈیش بورڈ تک رسائی کے لیے اپنی تفصیلات درج کریں",
        viewDetails: "تفصیلات دیکھیں",
        health: "صحت",
        excellent: "بہترین",
        good: "اچھا",
        accountInformation: "اکاؤنٹ کی معلومات",
        notifications: "اطلاعات",
      },
      sa: {
        // Sanskrit translations
        welcome: "एग्रोटेक् इत्यत्र स्वागतम्",
        welcomeToAgrotech: "एग्रोटेक् इत्यत्र स्वागतम्",
        smartFarmingAssistant: "स्मार्ट कृषि सहायकः",
        selectLanguage: "भवतः रोचितां भाषां चिनोतु",
        continue: "चलतु",
        login: "प्रवेशः",
        logout: "निर्गमः",
        enableVoiceGuidance: "सुलभस्य स्थापनार्थं वाक्-निर्देशनं सक्रियं करोतु",
        dashboard: "गृहपृष्ठम्",
        fields: "क्षेत्राणि",
        chat: "संवादः",
        settings: "व्यवस्थाः",
        myFields: "मम क्षेत्राणि",
        language: "भाषा",
        fullName: "पूर्णं नाम",
        phoneNumber: "दूरभाषसङ्ख्या",
        farmName: "कृषिक्षेत्रनाम",
      },
      ks: {
        // Kashmiri translations
        welcome: "ایگرو ٹیک میں خوش آمدید",
        welcomeToAgrotech: "ایگرو ٹیک میں خوش آمدید",
        smartFarmingAssistant: "سمارٹ کھیتی باری معاون",
        selectLanguage: "پننُک پسندیٖدٕ زبان ژأریو",
        continue: "جأری تھأیو",
        login: "لاگ اِن",
        logout: "لاگ آوٗٹ",
        enableVoiceGuidance: "آسان سیٹ اپ خٲطرٕ وایس گایڈنس فعال کریو",
        dashboard: "ہوم",
        fields: "کھیت",
        chat: "چیٹ",
        settings: "سیٹنگ",
        myFields: "میٚنۍ کھیت",
        language: "زبان",
      },
      sd: {
        // Sindhi translations
        welcome: "ايگرو ٽيڪ ۾ ڀلي ڪري آيا",
        welcomeToAgrotech: "ايگرو ٽيڪ ۾ ڀلي ڪري آيا",
        smartFarmingAssistant: "سمارٽ فارمنگ اسسٽنٽ",
        selectLanguage: "پنهنجي پسنديده ٻولي چونڊيو",
        continue: "جاري رکو",
        login: "لاگ ان",
        logout: "لاگ آئوٽ",
        enableVoiceGuidance: "آسان سيٽ اپ لاءِ آواز جي رهنمائي کي فعال ڪريو",
        dashboard: "هوم",
        fields: "فارم",
        chat: "چيٽ",
        settings: "سيٽنگون",
        myFields: "منهنجا فارم",
        language: "ٻولي",
      },
      ne: {
        // Nepali translations
        welcome: "एग्रोटेकमा स्वागत छ",
        welcomeToAgrotech: "एग्रोटेकमा स्वागत छ",
        smartFarmingAssistant: "स्मार्ट खेती सहायक",
        selectLanguage: "आफ्नो मनपर्ने भाषा छान्नुहोस्",
        continue: "जारी राख्नुहोस्",
        login: "लगइन",
        logout: "लगआउट",
        enableVoiceGuidance:
          "सजिलो सेटअपको लागि भ्वाइस मार्गदर्शन सक्षम गर्नुहोस्",
        dashboard: "होम",
        fields: "खेतहरू",
        chat: "च्याट",
        settings: "सेटिङहरू",
        myFields: "मेरो खेतहरू",
        language: "भाषा",
        fullName: "पूरा नाम",
        phoneNumber: "फोन नम्बर",
        farmName: "फार्म नाम",
      },
      mai: {
        // Maithili translations
        welcome: "एग्रोटेक मे स्वागत अछि",
        welcomeToAgrotech: "एग्रोटेक मे स्वागत अछि",
        smartFarmingAssistant: "स्मार्ट खेती सहायक",
        selectLanguage: "अपन पसंदक भाषा चुनू",
        continue: "जारी राखू",
        login: "लॉगिन",
        logout: "लॉगआउट",
        enableVoiceGuidance: "सहज सेटअप लेल वॉयस मार्गदर्शन सक्षम करू",
        dashboard: "होम",
        fields: "खेत सभ",
        chat: "चैट",
        settings: "सेटिंग सभ",
        myFields: "हमर खेत सभ",
        language: "भाषा",
      },
      kok: {
        // Konkani translations
        welcome: "एग्रोटेकांत येवकार",
        welcomeToAgrotech: "एग्रोटेकांत येवकार",
        smartFarmingAssistant: "स्मार्ट शेती सहाय्यक",
        selectLanguage: "तुमची आवडीची भास निवडात",
        continue: "चालू दवरात",
        login: "लॉगिन",
        logout: "लॉगआउट",
        enableVoiceGuidance: "सोंपें सेटअपाक वॉयस मार्गदर्शन सक्षम करात",
        dashboard: "घर",
        fields: "शेतां",
        chat: "गप्पा",
        settings: "सेटिंग",
        myFields: "म्हजीं शेतां",
        language: "भास",
      },
      mni: {
        // Manipuri translations
        welcome: "এগ্রোটেকতা তরাং ওকচরি",
        welcomeToAgrotech: "এগ্রোটেকতা তরাং ওকচরি",
        smartFarmingAssistant: "স্মার্ট লৌশিং পুন্সিজা",
        selectLanguage: "নখোয়গী পাম্বা লোল খনবিয়ু",
        continue: "চত্থদুনা চংশিল্লু",
        login: "লগইন",
        logout: "লগআউট",
        enableVoiceGuidance: "লায়না সেটআপ শিজিন্নবা ভয়েস গাইডেন্স হাংদোকউ",
        dashboard: "হোম",
        fields: "লৌবুক শিংশিং",
        chat: "ঙাংগানবা",
        settings: "সেটিংশিং",
        myFields: "ঐগী লৌবুকশিং",
        language: "লোল",
      },
      doi: {
        // Dogri translations
        welcome: "एग्रोटेक च स्वागत ऐ",
        welcomeToAgrotech: "एग्रोटेक च स्वागत ऐ",
        smartFarmingAssistant: "स्मार्ट खेती सहायक",
        selectLanguage: "अपनी पसंद दी भाशा चुनो",
        continue: "जारी रक्खो",
        login: "लॉगिन",
        logout: "लॉगआउट",
        enableVoiceGuidance: "सौखे सेटअप आस्तै वॉयस मार्गदर्शन सक्षम करो",
        dashboard: "होम",
        fields: "खेत",
        chat: "गल्ल-बात",
        settings: "सेटिंग",
        myFields: "मेरे खेत",
        language: "भाशा",
      },
      bo: {
        // Bodo translations
        welcome: "एग्रोटेकआव मोजां",
        welcomeToAgrotech: "एग्रोटेकआव मोजां",
        smartFarmingAssistant: "स्मार्ट हांफिन गोहो सायथिनाय",
        selectLanguage: "नोंथांनि गोबां भाषा सायख",
        continue: "लांनो थां",
        login: "लगिन",
        logout: "लगआउट",
        enableVoiceGuidance:
          "गासिनो सेटआप थांनो खौ भ्वाइस गाइडेन्स एनेबल खालाम",
        dashboard: "होम",
        fields: "नुंथि खुंगा",
        chat: "गेजेराव",
        settings: "सेटिं",
        myFields: "आंनि नुंथि खुंगा",
        language: "राव",
      },
      sat: {
        // Santali translations
        welcome: "ᱮᱜᱽᱨᱳᱴᱮᱠ ᱨᱮ ᱡᱚᱦᱟᱨ",
        welcomeToAgrotech: "ᱮᱜᱽᱨᱳᱴᱮᱠ ᱨᱮ ᱡᱚᱦᱟᱨ",
        smartFarmingAssistant: "ᱥᱢᱟᱨᱴ ᱪᱟᱥ ᱜᱚᱲᱚᱣᱤᱭᱟᱹ",
        selectLanguage: "ᱟᱢᱟᱜ ᱠᱩᱥᱤᱭᱟᱜ ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ",
        continue: "ᱞᱟᱦᱟᱭ ᱢᱮ",
        login: "ᱞᱚᱜᱤᱱ",
        logout: "ᱞᱚᱜᱟᱣᱴ",
        enableVoiceGuidance: "ᱟᱞᱜᱟ ᱥᱮᱴᱚᱯ ᱞᱟᱹᱜᱤᱫ ᱥᱟᱲᱮ ᱪᱮᱫᱟᱜ ᱮᱢ ᱢᱮ",
        dashboard: "ᱚᱲᱟᱜ",
        fields: "ᱠᱷᱮᱛ",
        chat: "ᱜᱟᱞᱢᱟᱨᱟᱣ",
        settings: "ᱥᱮᱴᱤᱝ",
        myFields: "ᱤᱧᱟᱜ ᱠᱷᱮᱛ",
        language: "ᱯᱟᱹᱨᱥᱤ",
      },
    };

    return (
      translations[state.language]?.[key] || translations["en"]?.[key] || key
    );
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
