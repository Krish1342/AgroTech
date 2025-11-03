import axios from "axios";
import config from "../config/index.js";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // Chat/AI endpoints
  async sendChatMessage(message, context = {}) {
    try {
      const response = await api.post("/chat", {
        message,
        context,
      });
      return response.data;
    } catch (error) {
      console.error("Chat API error:", error);
      throw new Error("Failed to send message to AI assistant");
    }
  }

  async getChatHistory(limit = 10) {
    try {
      const response = await api.get(`/chat/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Chat history API error:", error);
      throw new Error("Failed to fetch chat history");
    }
  }

  // Weather endpoints
  async getCurrentWeather(lat, lng) {
    try {
      const response = await api.get(`/weather/current?lat=${lat}&lng=${lng}`);
      return response.data;
    } catch (error) {
      console.error("Current weather API error:", error);
      throw new Error("Failed to fetch current weather");
    }
  }

  async getWeatherForecast(lat, lng, days = 5) {
    try {
      const response = await api.get(
        `/weather/forecast?lat=${lat}&lng=${lng}&days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error("Weather forecast API error:", error);
      throw new Error("Failed to fetch weather forecast");
    }
  }

  async getWeatherByCity(city) {
    try {
      const response = await api.get(
        `/weather/city/${encodeURIComponent(city)}`
      );
      return response.data;
    } catch (error) {
      console.error("Weather by city API error:", error);
      throw new Error("Failed to fetch weather for city");
    }
  }

  // Field management endpoints
  async getFields() {
    try {
      const response = await api.get("/fields");
      return response.data;
    } catch (error) {
      console.error("Fields API error:", error);
      throw new Error("Failed to fetch fields");
    }
  }

  async getField(fieldId) {
    try {
      const response = await api.get(`/fields/${fieldId}`);
      return response.data;
    } catch (error) {
      console.error("Field API error:", error);
      throw new Error("Failed to fetch field details");
    }
  }

  async updateField(fieldId, data) {
    try {
      const response = await api.put(`/fields/${fieldId}`, data);
      return response.data;
    } catch (error) {
      console.error("Update field API error:", error);
      throw new Error("Failed to update field");
    }
  }

  async createField(fieldData) {
    try {
      const response = await api.post("/fields", fieldData);
      return response.data;
    } catch (error) {
      console.error("Create field API error:", error);
      throw new Error("Failed to create field");
    }
  }

  // Disease detection endpoints
  async analyzePhoto(imageFile, fieldId = null) {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (fieldId) {
        formData.append("field_id", fieldId);
      }

      const response = await api.post("/disease/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Photo analysis API error:", error);
      throw new Error("Failed to analyze photo");
    }
  }

  async getDiseaseHistory(limit = 20) {
    try {
      const response = await api.get(`/disease/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Disease history API error:", error);
      throw new Error("Failed to fetch disease detection history");
    }
  }

  // Market prices endpoints
  async getMarketPrices(location = null) {
    try {
      const params = location
        ? `?location=${encodeURIComponent(location)}`
        : "";
      const response = await api.get(`/market/prices${params}`);
      return response.data;
    } catch (error) {
      console.error("Market prices API error:", error);
      throw new Error("Failed to fetch market prices");
    }
  }

  // User/Auth endpoints
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error("Login API error:", error);
      throw new Error("Failed to login");
    }
  }

  async logout() {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("auth_token");
      return { success: true };
    } catch (error) {
      console.error("Logout API error:", error);
      // Still remove token locally even if server call fails
      localStorage.removeItem("auth_token");
      throw new Error("Failed to logout");
    }
  }

  async getUserProfile() {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      console.error("Profile API error:", error);
      throw new Error("Failed to fetch user profile");
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check API error:", error);
      throw new Error("Backend service unavailable");
    }
  }

  // ThingSpeak IoT endpoints
  async getCurrentSensorData() {
    try {
      const response = await api.get("/api/thingspeak/current");
      return response.data;
    } catch (error) {
      console.error("Current sensor data API error:", error);
      throw new Error("Failed to fetch current sensor data");
    }
  }

  async getHistoricalSensorData(results = 15) {
    try {
      const response = await api.get(
        `/api/thingspeak/historical?results=${results}`
      );
      return response.data;
    } catch (error) {
      console.error("Historical sensor data API error:", error);
      throw new Error("Failed to fetch historical sensor data");
    }
  }

  async getRecommendations() {
    try {
      const response = await api.get("/api/thingspeak/recommendations");
      return response.data;
    } catch (error) {
      console.error("Recommendations API error:", error);
      throw new Error("Failed to fetch recommendations");
    }
  }

  async getDeviceStatus() {
    try {
      const response = await api.get("/api/thingspeak/device-status");
      return response.data;
    } catch (error) {
      console.error("Device status API error:", error);
      throw new Error("Failed to fetch device status");
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();

export default apiService;
