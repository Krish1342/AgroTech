import axios from 'axios'

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API service functions
export const cropService = {
  // Get crop recommendation
  recommend: async (data) => {
    const response = await api.post('/crops/recommend', data)
    return response.data
  },

  // Get crop information
  getCropInfo: async (cropName) => {
    const response = await api.get(`/crops/info/${cropName}`)
    return response.data
  },

  // Get all crops
  getAllCrops: async () => {
    const response = await api.get('/crops/all')
    return response.data
  },

  // Get fertilizer recommendation
  getFertilizerRecommendation: async (data) => {
    const response = await api.post('/crops/fertilizer', data)
    return response.data
  },

  // Get growing tips
  getGrowingTips: async (cropName) => {
    const response = await api.get(`/crops/growing-tips/${cropName}`)
    return response.data
  },

  // Get seasonal recommendations
  getSeasonalRecommendations: async (season, location) => {
    const response = await api.get('/crops/seasonal', {
      params: { season, location }
    })
    return response.data
  }
}

export const soilService = {
  // Classify soil from image
  classifyImage: async (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const response = await api.post('/soil/classify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Analyze soil health
  analyzeHealth: async (data) => {
    const response = await api.post('/soil/health', data)
    return response.data
  },

  // Get soil recommendations
  getRecommendations: async (soilType, location) => {
    const response = await api.get('/soil/recommendations', {
      params: { soil_type: soilType, location }
    })
    return response.data
  },

  // Get soil improvement tips
  getImprovementTips: async (soilType) => {
    const response = await api.get(`/soil/improvement/${soilType}`)
    return response.data
  }
}

export const weatherService = {
  // Get current weather
  getCurrentWeather: async (latitude, longitude) => {
    const response = await api.post('/weather/current', {
      latitude,
      longitude
    })
    return response.data
  },

  // Get weather forecast
  getForecast: async (latitude, longitude, days = 5) => {
    const response = await api.post('/weather/forecast', {
      latitude,
      longitude,
      days
    })
    return response.data
  },

  // Get agricultural advisories
  getAdvisories: async (latitude, longitude) => {
    const response = await api.post('/weather/advisories', {
      latitude,
      longitude
    })
    return response.data
  },

  // Get weather alerts
  getAlerts: async (latitude, longitude) => {
    const response = await api.post('/weather/alerts', {
      latitude,
      longitude
    })
    return response.data
  },

  // Get crop calendar
  getCropCalendar: async (latitude, longitude, cropType) => {
    const response = await api.post('/weather/crop-calendar', {
      latitude,
      longitude,
      crop_type: cropType
    })
    return response.data
  }
}

export const predictionService = {
  // Get prediction history
  getHistory: async (page = 1, per_page = 10, prediction_type = null) => {
    const response = await api.get('/predictions/history', {
      params: { page, per_page, prediction_type }
    })
    return response.data
  },

  // Get prediction statistics
  getStats: async () => {
    const response = await api.get('/predictions/stats')
    return response.data
  },

  // Get prediction details
  getDetails: async (predictionId) => {
    const response = await api.get(`/predictions/${predictionId}`)
    return response.data
  },

  // Delete prediction
  deletePrediction: async (predictionId) => {
    const response = await api.delete(`/predictions/${predictionId}`)
    return response.data
  },

  // Export predictions
  exportPredictions: async () => {
    const response = await api.get('/predictions/export/csv', {
      responseType: 'blob'
    })
    return response.data
  },

  // Create batch predictions
  createBatch: async (requests) => {
    const response = await api.post('/predictions/batch', requests)
    return response.data
  },

  // Get monthly trends
  getMonthlyTrends: async () => {
    const response = await api.get('/predictions/trends/monthly')
    return response.data
  },

  // Get recommendations based on history
  getRecommendations: async () => {
    const response = await api.get('/predictions/recommendations/based-on-history')
    return response.data
  }
}

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data)
    return response.data
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/users/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    })
    return response.data
  },

  // Get all users (admin)
  getAllUsers: async () => {
    const response = await api.get('/users/users')
    return response.data
  },

  // Get active sessions
  getSessions: async () => {
    const response = await api.get('/users/sessions')
    return response.data
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/users/account')
    return response.data
  },

  // Reset password
  resetPassword: async (email) => {
    const response = await api.post('/users/reset-password', { email })
    return response.data
  }
}

export const dataService = {
  // Upload CSV data
  uploadCSV: async (file, dataType, description) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('data_type', dataType)
    if (description) {
      formData.append('description', description)
    }
    
    const response = await api.post('/data/upload/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get uploaded datasets
  getDatasets: async () => {
    const response = await api.get('/data/datasets')
    return response.data
  },

  // Get dataset details
  getDatasetDetails: async (uploadId) => {
    const response = await api.get(`/data/datasets/${uploadId}`)
    return response.data
  },

  // Validate dataset
  validateDataset: async (uploadId, expectedColumns = null) => {
    const response = await api.post(`/data/validate/${uploadId}`, {
      expected_columns: expectedColumns
    })
    return response.data
  },

  // Transform dataset
  transformDataset: async (uploadId, transformations) => {
    const response = await api.post(`/data/transform/${uploadId}`, transformations)
    return response.data
  },

  // Export dataset
  exportDataset: async (uploadId, format = 'csv') => {
    const response = await api.get(`/data/export/${uploadId}`, {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    })
    return response.data
  },

  // Delete dataset
  deleteDataset: async (uploadId) => {
    const response = await api.delete(`/data/datasets/${uploadId}`)
    return response.data
  },

  // Get data statistics
  getStatistics: async () => {
    const response = await api.get('/data/statistics')
    return response.data
  },

  // Create sample data
  createSampleData: async () => {
    const response = await api.post('/data/sample-data')
    return response.data
  },

  // Get data schema
  getSchema: async (dataType) => {
    const response = await api.get(`/data/schema/${dataType}`)
    return response.data
  }
}

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export const formatError = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail
  } else if (error.response?.data?.message) {
    return error.response.data.message
  } else if (error.message) {
    return error.message
  } else {
    return 'An unexpected error occurred'
  }
}

export default api