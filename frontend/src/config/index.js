// App Configuration
const config = {
  // API Configuration
  api: {
    groqApiKey: import.meta.env.VITE_GROQ_API_KEY,
    openWeatherApiKey: import.meta.env.VITE_OPENWEATHER_API_KEY,
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },

  // App Information
  app: {
    name: import.meta.env.VITE_APP_NAME || "AgroTech",
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    environment: import.meta.env.VITE_APP_ENV || "development",
  },

  // Feature Flags
  features: {
    weather: import.meta.env.VITE_ENABLE_WEATHER === "true",
    aiChat: import.meta.env.VITE_ENABLE_AI_CHAT !== "false", // Default true
    diseaseDetection: import.meta.env.VITE_ENABLE_DISEASE_DETECTION !== "false", // Default true
    marketPrices: import.meta.env.VITE_ENABLE_MARKET_PRICES === "true",
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    maps: import.meta.env.VITE_ENABLE_MAPS === "true",
  },

  // Debug Configuration
  debug: {
    enabled: import.meta.env.VITE_DEBUG_MODE === "true",
    logLevel: import.meta.env.VITE_LOG_LEVEL || "info",
  },

  // Default Location
  location: {
    latitude: parseFloat(import.meta.env.VITE_DEFAULT_LATITUDE) || 28.6139,
    longitude: parseFloat(import.meta.env.VITE_DEFAULT_LONGITUDE) || 77.209,
    defaultLocation: import.meta.env.VITE_DEFAULT_LOCATION || "Delhi, India",
  },

  // UI Configuration
  ui: {
    theme: import.meta.env.VITE_THEME_MODE || "light",
    language: import.meta.env.VITE_LANGUAGE || "en",
    currency: import.meta.env.VITE_CURRENCY || "INR",
  },

  // Development Configuration
  development: {
    mockApiDelay: parseInt(import.meta.env.VITE_MOCK_API_DELAY) || 1000,
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA !== "false", // Default true
  },

  // Storage Keys
  storage: {
    userKey: "agrotech_user",
    languageKey: "agrotech_language",
    settingsKey: "agrotech_settings",
    themeKey: "agrotech_theme",
  },

  // API Endpoints
  endpoints: {
    weather: {
      current: "https://api.openweathermap.org/data/2.5/weather",
      forecast: "https://api.openweathermap.org/data/2.5/forecast",
    },
    groq: {
      chat: "https://api.groq.com/openai/v1/chat/completions",
    },
  },

  // Application Limits
  limits: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxChatHistory: 100,
    maxNotifications: 10,
    chatTimeout: 30000, // 30 seconds
  },

  // Validation Functions
  validate: {
    hasApiKeys() {
      return !!(this.api.groqApiKey && this.api.openWeatherApiKey);
    },
    isProduction() {
      return this.app.environment === "production";
    },
    isDevelopment() {
      return this.app.environment === "development";
    },
  },

  // Utility Functions
  utils: {
    getApiKey(service) {
      switch (service) {
        case "groq":
          return config.api.groqApiKey;
        case "weather":
          return config.api.openWeatherApiKey;
        default:
          return null;
      }
    },

    isFeatureEnabled(feature) {
      return config.features[feature] || false;
    },

    log(level, message, data) {
      if (!config.debug.enabled) return;

      const levels = ["error", "warn", "info", "debug"];
      const currentLevel = levels.indexOf(config.debug.logLevel);
      const messageLevel = levels.indexOf(level);

      if (messageLevel <= currentLevel) {
        console[level](`[${config.app.name}] ${message}`, data || "");
      }
    },
  },
};

// Bind validation functions to config
config.validate.hasApiKeys = config.validate.hasApiKeys.bind(config);
config.validate.isProduction = config.validate.isProduction.bind(config);
config.validate.isDevelopment = config.validate.isDevelopment.bind(config);

export default config;
