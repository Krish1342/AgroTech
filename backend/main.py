from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime

# Import routers
from api.routes import crops, soil, weather, predictions, users, data
from services.ml_models import get_ml_service
from services.weather_service import get_weather_service

# Global service instances
ml_service = None
weather_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global ml_service, weather_service
    print("Starting up Agrotech API...")
    
    # Initialize ML models and services
    ml_service = get_ml_service()
    weather_service = get_weather_service()
    
    print("✅ ML Service initialized")
    print("✅ Weather Service initialized")
    print("🚀 Agrotech API is ready!")
    
    yield
    
    # Shutdown
    print("Shutting down Agrotech API...")
    if weather_service:
        await weather_service.close_session()
    print("👋 Goodbye!")

app = FastAPI(
    title="Agrotech API",
    description="Advanced Agricultural Technology API for crop recommendation, soil analysis, and smart farming solutions",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],  # Include common dev ports
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(crops.router, prefix="/api/crops", tags=["Crop Recommendation"])
app.include_router(soil.router, prefix="/api/soil", tags=["Soil Analysis"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather Data"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Prediction History"])
app.include_router(users.router, prefix="/api/users", tags=["User Management"])
app.include_router(data.router, prefix="/api/data", tags=["Data Management"])

@app.get("/", tags=["Root"])
async def root():
    """
    Welcome endpoint with API information
    """
    return {
        "message": "Welcome to Agrotech API - Smart Farming Solutions",
        "version": "1.0.0",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc"
        },
        "endpoints": {
            "health_check": "/health",
            "crop_recommendation": "/api/crops",
            "soil_analysis": "/api/soil", 
            "weather_data": "/api/weather",
            "predictions": "/api/predictions",
            "user_management": "/api/users",
            "data_management": "/api/data"
        },
        "features": [
            "Crop recommendation based on soil and weather conditions",
            "Soil type classification from images",
            "Weather data and agricultural advisories",
            "Prediction history and analytics",
            "User authentication and profiles",
            "Data upload and validation"
        ]
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "ml_service": "ready" if ml_service else "not_initialized",
            "weather_service": "ready" if weather_service else "not_initialized"
        },
        "api_info": {
            "total_endpoints": len(app.routes),
            "environment": "development"
        }
    }

@app.get("/api", tags=["API Info"])
async def api_info():
    """
    API information and statistics
    """
    return {
        "api_name": "Agrotech API",
        "version": "1.0.0",
        "description": "Smart farming solutions with ML-powered crop recommendations and soil analysis",
        "total_routes": len(app.routes),
        "available_tags": [
            "Crop Recommendation",
            "Soil Analysis", 
            "Weather Data",
            "Prediction History",
            "User Management",
            "Data Management"
        ],
        "supported_features": {
            "crop_prediction": True,
            "soil_classification": True,
            "weather_integration": True,
            "user_authentication": True,
            "data_upload": True,
            "prediction_history": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
