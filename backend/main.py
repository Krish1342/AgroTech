from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Dict, Any, Optional

# Load environment variables from .env file
load_dotenv()

# Import services
from services.chatbot import get_chatbot, health_check as chatbot_health_check
from services.weather import get_weather_service


# Models for requests
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None


class WeatherRequest(BaseModel):
    lat: float
    lng: float


class WeatherCityRequest(BaseModel):
    city: str


# Global service instances
chatbot_service = None
weather_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global chatbot_service, weather_service
    print("Starting up Agrotech API...")

    # Initialize services
    try:
        chatbot_service = get_chatbot()
        weather_service = get_weather_service()
        print("✅ Chatbot Service initialized")
        print("✅ Weather Service initialized")
    except Exception as e:
        print(f"⚠️ Warning: Service initialization error: {e}")

    print("🚀 Agrotech API is ready!")

    yield

    # Shutdown
    print("Shutting down Agrotech API...")
    print("👋 Goodbye!")


app = FastAPI(
    title=os.getenv("APP_NAME", "Agrotech API"),
    description="Advanced Agricultural Technology API for crop recommendation, soil analysis, and smart farming solutions",
    version=os.getenv("APP_VERSION", "1.0.0"),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "*",
    ],  # Include common dev ports
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
from api.routes import thingspeak

app.include_router(thingspeak.router, prefix="/api/thingspeak", tags=["ThingSpeak"])
# app.include_router(crops.router, prefix="/api/crops", tags=["Crop Recommendation"])


# Chat endpoints
@app.post("/chat", tags=["Chat"])
async def send_chat_message(request: ChatRequest):
    """Send a message to the AI chatbot"""
    try:
        if not chatbot_service:
            raise HTTPException(status_code=503, detail="Chatbot service not available")

        response = chatbot_service.chat(
            message=request.message,
            context=request.context,
            session_id=request.session_id,
        )

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@app.get("/chat/history", tags=["Chat"])
async def get_chat_history(session_id: str, limit: int = 10):
    """Get chat history for a session"""
    try:
        if not chatbot_service:
            raise HTTPException(status_code=503, detail="Chatbot service not available")

        history = chatbot_service.get_chat_history(session_id, limit)
        return {"history": history, "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat history error: {str(e)}")


# Weather endpoints
@app.get("/weather/current", tags=["Weather"])
async def get_current_weather(lat: float, lng: float):
    """Get current weather for given coordinates"""
    try:
        if not weather_service:
            raise HTTPException(status_code=503, detail="Weather service not available")

        weather_data = await weather_service.get_current_weather(lat, lng)
        return weather_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather error: {str(e)}")


@app.get("/weather/forecast", tags=["Weather"])
async def get_weather_forecast(lat: float, lng: float, days: int = 5):
    """Get weather forecast for given coordinates"""
    try:
        if not weather_service:
            raise HTTPException(status_code=503, detail="Weather service not available")

        forecast_data = await weather_service.get_weather_forecast(lat, lng, days)
        return forecast_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather forecast error: {str(e)}")


@app.get("/weather/city/{city}", tags=["Weather"])
async def get_weather_by_city(city: str):
    """Get current weather by city name"""
    try:
        if not weather_service:
            raise HTTPException(status_code=503, detail="Weather service not available")

        weather_data = await weather_service.get_weather_by_city(city)
        return weather_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather error: {str(e)}")


@app.get("/", tags=["Root"])
async def root():
    """
    Welcome endpoint with API information
    """
    return {
        "message": "Welcome to Agrotech API - Smart Farming Solutions",
        "version": "1.0.0",
        "documentation": {"swagger_ui": "/docs", "redoc": "/redoc"},
        "endpoints": {
            "health_check": "/health",
            "crop_recommendation": "/api/crops",
            "soil_analysis": "/api/soil",
            "weather_data": "/api/weather",
            "predictions": "/api/predictions",
            "user_management": "/api/users",
            "data_management": "/api/data",
        },
        "features": [
            "Crop recommendation based on soil and weather conditions",
            "Soil type classification from images",
            "Weather data and agricultural advisories",
            "Prediction history and analytics",
            "User authentication and profiles",
            "Data upload and validation",
        ],
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
            "chatbot_service": "ready" if chatbot_service else "not_initialized",
            "weather_service": "ready" if weather_service else "not_initialized",
        },
        "api_info": {"total_endpoints": len(app.routes), "environment": "development"},
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
            "Data Management",
        ],
        "supported_features": {
            "crop_prediction": True,
            "soil_classification": True,
            "weather_integration": True,
            "user_authentication": True,
            "data_upload": True,
            "prediction_history": True,
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "True").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info"),
    )
