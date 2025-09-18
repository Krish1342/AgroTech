# AgroTech - Smart Farming Management System

A comprehensive agricultural management application that combines AI-powered farming assistance, real-time weather monitoring, disease detection, and field management in a modern, mobile-first interface.

## 🌟 Features

### 🤖 AI-Powered Farming Assistant

- **Intelligent Chat Interface**: Get expert farming advice through natural language conversations
- **Groq AI Integration**: Powered by Llama3 for accurate agricultural insights
- **Contextual Recommendations**: AI considers your specific crops, location, and weather conditions
- **Disease Identification**: AI-assisted disease detection from plant photos
- **Treatment Suggestions**: Personalized treatment and prevention recommendations

### 🌤️ Weather Intelligence

- **Real-time Weather Data**: Current conditions and 5-day forecasts via OpenWeatherMap API
- **Farming-Specific Insights**: Weather recommendations tailored for agricultural activities
- **Irrigation Scheduling**: Smart watering recommendations based on weather patterns
- **Seasonal Planning**: Long-term weather insights for crop planning

### 🏥 Disease Detection & Management

- **Photo Upload**: Capture or upload images of crops for analysis
- **AI Disease Detection**: Automated identification of plant diseases and health issues
- **Confidence Scoring**: Reliability indicators for detection results
- **Treatment Plans**: Detailed treatment and prevention strategies
- **Historical Tracking**: Maintain records of all disease detections

### 🌱 Field Management

- **Multi-Field Support**: Manage multiple fields with individual tracking
- **Health Monitoring**: Real-time health scores and status indicators
- **Crop Lifecycle Tracking**: Monitor growth stages and harvest timing
- **Soil Analytics**: pH, moisture, temperature, and nutrient monitoring
- **Visual Dashboard**: Intuitive health meters and progress tracking

### 📱 Modern Mobile Interface

- **Mobile-First Design**: Optimized for smartphones and tablets
- **Material-UI Components**: Clean, professional interface
- **Responsive Layout**: Works perfectly on all screen sizes
- **Progressive Web App**: Install on device home screen
- **Offline Capabilities**: Core features work without internet

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for backend)
- API Keys:
  - [Groq API Key](https://console.groq.com/keys) for AI features
  - [OpenWeatherMap API Key](https://openweathermap.org/api) for weather data

### Frontend Setup

1. **Clone and Navigate**

   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:

   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Access Application**
   Open http://localhost:5173 in your browser

### Backend Setup

1. **Navigate to Backend**

   ```bash
   cd backend
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure your settings:

   ```env
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   SECRET_KEY=your_secret_key_here
   ```

3. **Install Dependencies & Start**

   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

4. **API Access**
   Backend API available at http://localhost:8000

## 🔧 Configuration

### Feature Flags

Control which features are enabled through environment variables:

```env
# Core Features
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_WEATHER=true
VITE_ENABLE_DISEASE_DETECTION=true

# Optional Features
VITE_ENABLE_MARKET_PRICES=false
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_MAPS=false

# Development
VITE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=true
```

### Location Settings

Set default location for weather and regional recommendations:

```env
VITE_DEFAULT_LATITUDE=28.6139
VITE_DEFAULT_LONGITUDE=77.2090
VITE_DEFAULT_LOCATION=Delhi, India
```

## 📁 Project Structure

```
AgroTech/
├── frontend/                 # React Frontend Application
│   ├── src/
│   │   ├── components/       # Reusable UI Components
│   │   │   ├── BottomNavigation.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   └── ...
│   │   ├── pages/           # Application Pages
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── PhotoUploadPage.jsx
│   │   │   └── ...
│   │   ├── services/        # API Integration Services
│   │   │   ├── groqService.js    # AI Chat Service
│   │   │   └── weatherService.js # Weather API Service
│   │   ├── context/         # React Context for State Management
│   │   │   └── AppContext.jsx
│   │   ├── config/          # Application Configuration
│   │   │   └── index.js
│   │   ├── data/           # Mock Data and Constants
│   │   │   └── mockData.js
│   │   └── constants/       # Application Constants
│   └── package.json
├── backend/                 # FastAPI Backend
│   ├── main.py             # Main Application Entry
│   ├── models/             # ML Models and Notebooks
│   │   ├── crop_and_soil.ipynb
│   │   └── soil_types.ipynb
│   └── requirements.txt
├── data/                   # Dataset and Resources
│   ├── crop_and_soil_dataset.csv
│   └── Soil types/         # Soil Classification Images
└── README.md
```

## 🔑 API Services

### Groq AI Service

- **Purpose**: Agricultural expertise and chat assistance
- **Model**: Llama3-8B-8192 for optimal farming knowledge
- **Features**:
  - Field-specific advice
  - Disease identification assistance
  - Crop management recommendations
  - Weather-based farming tips

### Weather Service

- **Provider**: OpenWeatherMap API
- **Features**:
  - Current weather conditions
  - 5-day weather forecasts
  - Agricultural weather insights
  - Location-based recommendations

## 🛡️ Security & Best Practices

### Environment Variables

- All sensitive API keys use `VITE_` prefix for frontend exposure
- Backend environment variables are kept separate
- `.env` files are gitignored to prevent accidental commits
- Comprehensive `.env.example` files document all required variables

### Development Practices

- TypeScript-ready configuration
- ESLint configuration for code quality
- Component-based architecture
- Responsive design principles
- Progressive Web App capabilities

## 🔍 Troubleshooting

### Common Issues

1. **API Key Errors**

   - Verify API keys are correctly set in `.env` file
   - Ensure keys have proper permissions and aren't rate-limited
   - Check that `VITE_` prefix is used for frontend variables

2. **Build Issues**

   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`
   - Verify Node.js version is 18+

3. **Weather Data Not Loading**

   - Confirm OpenWeatherMap API key is valid
   - Check browser console for CORS or network errors
   - Verify internet connection for API calls

4. **AI Chat Not Responding**
   - Validate Groq API key and account status
   - Check browser network tab for API call failures
   - Ensure sufficient API quota remaining

## 📱 Usage Guide

### Getting Started

1. **Login**: Use the simple login system with your farm details
2. **Dashboard**: View overall farm health and field status
3. **Field Management**: Add and monitor individual fields
4. **AI Chat**: Ask questions about farming practices
5. **Disease Detection**: Upload photos for AI analysis
6. **Weather Monitoring**: Check current and forecast conditions

### Best Practices

- **Regular Monitoring**: Check field health indicators daily
- **Photo Quality**: Use clear, well-lit photos for disease detection
- **AI Assistance**: Provide specific context in chat queries
- **Weather Planning**: Use forecasts for irrigation and activity planning

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Groq**: For providing powerful AI language models
- **OpenWeatherMap**: For comprehensive weather data APIs
- **Material-UI**: For beautiful React components
- **React Team**: For the excellent frontend framework
- **FastAPI**: For the high-performance backend framework

---

**AgroTech** - Empowering farmers with AI-driven insights and modern technology for sustainable agriculture. 🌱
