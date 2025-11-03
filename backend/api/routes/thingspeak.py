from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import statistics
import requests
import os
import sys
from pathlib import Path

# Add backend directory to path to import thingspeak_client
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from thingspeak_client import (
    get_latest_feed,
    get_model_input_dict,
    get_recommendations,
)

# Import weather service
try:
    from services.weather import get_weather_service

    WEATHER_SERVICE_AVAILABLE = True
except ImportError:
    WEATHER_SERVICE_AVAILABLE = False

router = APIRouter()

# ThingSpeak configuration
THINGSPEAK_CHANNEL_ID = os.getenv("THINGSPEAK_CHANNEL_ID")
THINGSPEAK_READ_API_KEY = os.getenv("THINGSPEAK_READ_API_KEY", "")


class SensorData(BaseModel):
    nitrogen: Optional[float]
    phosphorus: Optional[float]
    potassium: Optional[float]
    moisture: Optional[float]
    ph: Optional[float]
    temperature: Optional[float]
    timestamp: Optional[str]


class RecommendationResponse(BaseModel):
    fertilizer_recommendation: str
    crop_suggestion: str
    reasoning: str
    soil_health: str
    actions: List[str]


class HistoricalDataResponse(BaseModel):
    data: List[Dict[str, Any]]
    average: Dict[str, Optional[float]]
    trends: Dict[str, str]


@router.get("/current", response_model=SensorData)
async def get_current_data():
    """
    Get the latest sensor data from ThingSpeak (N, P, K, Moisture, pH)
    Temperature comes from weather API
    """
    try:
        data = get_model_input_dict()

        # Get temperature from weather API (default location or first available)
        temperature = None
        if WEATHER_SERVICE_AVAILABLE:
            try:
                weather_service = get_weather_service()
                # Using default location - you can make this configurable
                default_lat = float(os.getenv("DEFAULT_LATITUDE", "28.6139"))
                default_lng = float(os.getenv("DEFAULT_LONGITUDE", "77.2090"))
                weather_data = await weather_service.get_current_weather(
                    default_lat, default_lng
                )
                temperature = weather_data.get("current", {}).get("temperature")
            except Exception as e:
                print(f"Warning: Could not fetch weather temperature: {e}")

        return SensorData(
            nitrogen=data.get("N"),
            phosphorus=data.get("P"),
            potassium=data.get("K"),
            moisture=data.get("Moisture"),
            ph=data.get("pH"),
            temperature=temperature,
            timestamp=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch sensor data: {str(e)}"
        )


@router.get("/historical")
async def get_historical_data(results: int = Query(15, ge=1, le=100)):
    """
    Get historical data from ThingSpeak (last N readings)
    """
    try:
        if not THINGSPEAK_CHANNEL_ID:
            raise HTTPException(
                status_code=503, detail="ThingSpeak channel not configured"
            )

        url = f"https://api.thingspeak.com/channels/{THINGSPEAK_CHANNEL_ID}/feeds.json?results={results}"
        if THINGSPEAK_READ_API_KEY:
            url += f"&api_key={THINGSPEAK_READ_API_KEY}"

        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        feeds = data.get("feeds", [])

        # Process feeds (only 5 sensor fields, no temperature)
        processed_feeds = []
        for feed in feeds:
            processed_feeds.append(
                {
                    "nitrogen": (
                        float(feed.get("field1") or 0) if feed.get("field1") else None
                    ),
                    "phosphorus": (
                        float(feed.get("field2") or 0) if feed.get("field2") else None
                    ),
                    "potassium": (
                        float(feed.get("field3") or 0) if feed.get("field3") else None
                    ),
                    "moisture": (
                        float(feed.get("field4") or 0) if feed.get("field4") else None
                    ),
                    "ph": (
                        float(feed.get("field5") or 0) if feed.get("field5") else None
                    ),
                    "temperature": None,  # Will be filled from weather API
                    "timestamp": feed.get("created_at"),
                }
            )

        # Get current temperature from weather API
        current_temperature = None
        if WEATHER_SERVICE_AVAILABLE:
            try:
                weather_service = get_weather_service()
                default_lat = float(os.getenv("DEFAULT_LATITUDE", "28.6139"))
                default_lng = float(os.getenv("DEFAULT_LONGITUDE", "77.2090"))
                weather_data = await weather_service.get_current_weather(
                    default_lat, default_lng
                )
                current_temperature = weather_data.get("current", {}).get("temperature")
                # Apply current temperature to all recent readings
                for feed in processed_feeds:
                    feed["temperature"] = current_temperature
            except Exception as e:
                print(f"Warning: Could not fetch weather temperature: {e}")

        # Calculate averages
        def safe_avg(values):
            filtered = [v for v in values if v is not None]
            return statistics.mean(filtered) if filtered else None

        averages = {
            "nitrogen": safe_avg([f["nitrogen"] for f in processed_feeds]),
            "phosphorus": safe_avg([f["phosphorus"] for f in processed_feeds]),
            "potassium": safe_avg([f["potassium"] for f in processed_feeds]),
            "moisture": safe_avg([f["moisture"] for f in processed_feeds]),
            "ph": safe_avg([f["ph"] for f in processed_feeds]),
            "temperature": current_temperature,  # Current weather temperature
        }

        # Calculate trends (simple: compare first half vs second half)
        def calculate_trend(values):
            filtered = [v for v in values if v is not None]
            if len(filtered) < 4:
                return "stable"
            mid = len(filtered) // 2
            first_half_avg = statistics.mean(filtered[:mid])
            second_half_avg = statistics.mean(filtered[mid:])
            diff_percent = ((second_half_avg - first_half_avg) / first_half_avg) * 100

            if diff_percent > 5:
                return "increasing"
            elif diff_percent < -5:
                return "decreasing"
            else:
                return "stable"

        trends = {
            "nitrogen": calculate_trend([f["nitrogen"] for f in processed_feeds]),
            "phosphorus": calculate_trend([f["phosphorus"] for f in processed_feeds]),
            "potassium": calculate_trend([f["potassium"] for f in processed_feeds]),
            "moisture": calculate_trend([f["moisture"] for f in processed_feeds]),
            "ph": calculate_trend([f["ph"] for f in processed_feeds]),
            "temperature": "stable",  # Weather temperature doesn't trend with sensor data
        }

        return {"data": processed_feeds, "average": averages, "trends": trends}

    except requests.HTTPError as he:
        raise HTTPException(status_code=502, detail=f"ThingSpeak API error: {str(he)}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch historical data: {str(e)}"
        )


@router.get("/recommendations", response_model=RecommendationResponse)
async def get_smart_recommendations():
    """
    Get intelligent crop and fertilizer recommendations based on current sensor data
    Temperature from weather API, other sensors from ThingSpeak
    """
    try:
        # Get current sensor data (N, P, K, Moisture, pH)
        data = get_model_input_dict()
        N = data.get("N")
        P = data.get("P")
        K = data.get("K")
        moisture = data.get("Moisture")
        ph = data.get("pH")

        # Get temperature from weather API
        temp = 25  # Default fallback
        if WEATHER_SERVICE_AVAILABLE:
            try:
                weather_service = get_weather_service()
                default_lat = float(os.getenv("DEFAULT_LATITUDE", "28.6139"))
                default_lng = float(os.getenv("DEFAULT_LONGITUDE", "77.2090"))
                weather_data = await weather_service.get_current_weather(
                    default_lat, default_lng
                )
                temp = weather_data.get("current", {}).get("temperature", 25)
            except Exception as e:
                print(
                    f"Warning: Could not fetch weather temperature for recommendations: {e}"
                )

        # Default values if data is missing
        N = N if N is not None else 0
        P = P if P is not None else 0
        K = K if K is not None else 0
        moisture = moisture if moisture is not None else 0
        ph = ph if ph is not None else 7.0

        # Fertilizer Recommendation Logic
        fertilizer_rec = ""
        actions = []

        if N < 30:
            fertilizer_rec = "High-Nitrogen Fertilizer (Urea or Ammonium Nitrate)"
            actions.append(
                f"Apply Urea at 50-75 kg/acre to boost nitrogen levels (Currently: {N:.1f} kg/ha)"
            )
        elif N > 80:
            fertilizer_rec = "Reduce Nitrogen Application"
            actions.append(
                f"Nitrogen levels are high ({N:.1f} kg/ha). Skip nitrogen fertilizers this cycle"
            )

        if P < 15:
            if fertilizer_rec:
                fertilizer_rec += " + High-Phosphorus Fertilizer (DAP or SSP)"
            else:
                fertilizer_rec = (
                    "High-Phosphorus Fertilizer (DAP or Single Super Phosphate)"
                )
            actions.append(
                f"Apply DAP at 40-60 kg/acre for phosphorus boost (Currently: {P:.1f} kg/ha)"
            )
        elif P > 60:
            actions.append(
                f"Phosphorus levels are optimal ({P:.1f} kg/ha). No additional P needed"
            )

        if K < 20:
            if fertilizer_rec:
                fertilizer_rec += " + Potassium Fertilizer (MOP)"
            else:
                fertilizer_rec = "Potassium Fertilizer (Muriate of Potash)"
            actions.append(
                f"Apply MOP at 30-50 kg/acre for potassium (Currently: {K:.1f} kg/ha)"
            )
        elif K > 70:
            actions.append(
                f"Potassium levels are excellent ({K:.1f} kg/ha). Maintain current practices"
            )

        if not fertilizer_rec:
            fertilizer_rec = "Balanced NPK Fertilizer (10-26-26 or 15-15-15)"
            actions.append(
                "All nutrient levels are optimal. Use balanced NPK for maintenance"
            )

        # Crop Recommendation Logic
        crop_suggestion = ""
        reasoning = ""

        # High N, moderate P,K -> Leafy crops
        if N > 40 and P < 40 and K < 40:
            crop_suggestion = "Leafy Vegetables (Spinach, Lettuce, Cabbage)"
            reasoning = (
                "High nitrogen supports vigorous leaf growth. Ideal for leafy crops."
            )

        # High P, High K -> Fruiting crops
        elif P > 30 and K > 30:
            crop_suggestion = "Fruiting Crops (Tomatoes, Peppers, Eggplant)"
            reasoning = (
                "High phosphorus and potassium promote flowering and fruit development."
            )

        # Low N, High P -> Root crops
        elif N < 40 and P > 25:
            crop_suggestion = "Root Vegetables (Potatoes, Carrots, Radish)"
            reasoning = (
                "Moderate nitrogen with good phosphorus supports root development."
            )

        # Balanced nutrients -> Grains
        elif 30 <= N <= 70 and 15 <= P <= 50 and 20 <= K <= 60:
            crop_suggestion = "Cereals (Wheat, Rice, Maize)"
            reasoning = "Balanced nutrient profile is ideal for grain crops."

        # High overall nutrients -> Heavy feeders
        elif N > 60 and P > 40 and K > 50:
            crop_suggestion = "Heavy Feeders (Pumpkin, Squash, Cucumber)"
            reasoning = "Rich soil nutrients can support high-demand crops."

        # Default fallback
        else:
            crop_suggestion = "Legumes (Beans, Peas, Lentils)"
            reasoning = (
                "Legumes can fix nitrogen and improve soil health for future crops."
            )

        # Soil Health Assessment
        soil_health = "Good"
        health_factors = []

        # Check pH
        if 6.0 <= ph <= 7.5:
            health_factors.append("pH is optimal")
        elif ph < 5.5:
            soil_health = "Acidic - Needs Lime"
            health_factors.append(
                f"pH is too acidic ({ph:.1f}). Apply lime to raise pH"
            )
            actions.append(
                "Apply agricultural lime at 200-300 kg/acre to neutralize acidity"
            )
        elif ph > 8.0:
            soil_health = "Alkaline - Needs Sulfur"
            health_factors.append(
                f"pH is too alkaline ({ph:.1f}). Apply sulfur to lower pH"
            )
            actions.append(
                "Apply elemental sulfur at 50-100 kg/acre to reduce alkalinity"
            )

        # Check moisture
        if moisture < 30:
            health_factors.append("Soil moisture is low - Increase irrigation")
            actions.append(
                f"Increase irrigation frequency. Current moisture: {moisture:.1f}%"
            )
        elif moisture > 80:
            health_factors.append("Soil moisture is high - Risk of waterlogging")
            actions.append(
                f"Reduce irrigation or improve drainage. Current moisture: {moisture:.1f}%"
            )
        else:
            health_factors.append("Moisture levels are optimal")

        # Check temperature
        if temp < 15:
            health_factors.append("Soil temperature is low - Growth may be slow")
        elif temp > 35:
            health_factors.append("Soil temperature is high - Consider mulching")
            actions.append("Apply organic mulch to regulate soil temperature")
        else:
            health_factors.append("Temperature is favorable for crop growth")

        # Overall nutrient status
        avg_nutrient = (N + P + K) / 3
        if avg_nutrient > 50:
            health_factors.append("Overall nutrient levels are rich")
        elif avg_nutrient < 30:
            soil_health = "Nutrient Deficient"
            health_factors.append("Overall nutrient levels are low")

        reasoning += " " + ". ".join(health_factors) + "."

        return RecommendationResponse(
            fertilizer_recommendation=fertilizer_rec,
            crop_suggestion=crop_suggestion,
            reasoning=reasoning.strip(),
            soil_health=soil_health,
            actions=actions if actions else ["Continue monitoring soil conditions"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate recommendations: {str(e)}"
        )


@router.get("/device-status")
async def get_device_status():
    """
    Get the status of the connected ThingSpeak device
    """
    try:
        if not THINGSPEAK_CHANNEL_ID:
            return {"connected": False, "message": "No device configured"}

        # Try to fetch latest data to check if device is active
        data = get_model_input_dict()

        # Check if we got any valid data
        has_data = any(
            data.get(key) is not None
            for key in ["N", "P", "K", "Moisture", "pH", "temp"]
        )

        return {
            "connected": has_data,
            "device_id": THINGSPEAK_CHANNEL_ID,
            "device_name": "AgroTech Sensor Node #1",
            "last_update": datetime.utcnow().isoformat(),
            "status": "active" if has_data else "inactive",
            "message": (
                "Device is actively sending data"
                if has_data
                else "No recent data from device"
            ),
        }

    except Exception as e:
        return {
            "connected": False,
            "message": f"Error checking device status: {str(e)}",
        }
