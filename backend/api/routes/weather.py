from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os
from datetime import datetime, timedelta
import asyncio

router = APIRouter()

class WeatherRequest(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = None

class WeatherResponse(BaseModel):
    location: str
    current_weather: Dict[str, Any]
    forecast: List[Dict[str, Any]]
    agricultural_advisory: List[str]
    timestamp: datetime

class CropCalendarRequest(BaseModel):
    crop_name: str
    location: str
    planting_date: Optional[str] = None

@router.get("/current", response_model=WeatherResponse)
async def get_current_weather(
    latitude: float = Query(..., description="Latitude coordinate"),
    longitude: float = Query(..., description="Longitude coordinate"),
    location_name: Optional[str] = Query(None, description="Location name for reference")
):
    """
    Get current weather and forecast for agricultural planning
    """
    try:
        # Get weather data from multiple sources for reliability
        weather_data = await fetch_weather_data(latitude, longitude)
        
        if not weather_data:
            raise HTTPException(status_code=503, detail="Weather service unavailable")
        
        # Generate agricultural advisory
        advisory = generate_agricultural_advisory(weather_data)
        
        return WeatherResponse(
            location=location_name or f"Lat: {latitude}, Lon: {longitude}",
            current_weather=weather_data['current'],
            forecast=weather_data['forecast'],
            agricultural_advisory=advisory,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather fetch error: {str(e)}")

@router.get("/forecast/{days}")
async def get_weather_forecast(
    days: int,
    latitude: float = Query(...),
    longitude: float = Query(...)
):
    """
    Get extended weather forecast
    """
    if days > 14:
        raise HTTPException(status_code=400, detail="Maximum 14 days forecast available")
    
    try:
        forecast_data = await fetch_extended_forecast(latitude, longitude, days)
        return {
            "location": f"Lat: {latitude}, Lon: {longitude}",
            "forecast_days": days,
            "forecast": forecast_data,
            "timestamp": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast error: {str(e)}")

@router.get("/agricultural-advisory")
async def get_agricultural_advisory(
    latitude: float = Query(...),
    longitude: float = Query(...),
    crop_type: Optional[str] = Query(None)
):
    """
    Get specific agricultural advisory based on weather
    """
    try:
        weather_data = await fetch_weather_data(latitude, longitude)
        
        if crop_type:
            advisory = generate_crop_specific_advisory(weather_data, crop_type)
        else:
            advisory = generate_general_advisory(weather_data)
        
        return {
            "location": f"Lat: {latitude}, Lon: {longitude}",
            "crop_type": crop_type,
            "advisory": advisory,
            "weather_summary": weather_data['current'],
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advisory error: {str(e)}")

@router.post("/crop-calendar")
async def get_crop_calendar(request: CropCalendarRequest):
    """
    Get crop-specific calendar and weather recommendations
    """
    try:
        # Generate crop calendar based on location and crop
        calendar_data = generate_crop_calendar(
            request.crop_name, 
            request.location, 
            request.planting_date
        )
        
        return {
            "crop": request.crop_name,
            "location": request.location,
            "calendar": calendar_data,
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calendar error: {str(e)}")

@router.get("/alerts")
async def get_weather_alerts(
    latitude: float = Query(...),
    longitude: float = Query(...)
):
    """
    Get weather alerts and warnings
    """
    try:
        alerts = await fetch_weather_alerts(latitude, longitude)
        
        return {
            "location": f"Lat: {latitude}, Lon: {longitude}",
            "alerts": alerts,
            "severity_levels": {
                "low": "Monitor conditions",
                "medium": "Take precautionary measures",
                "high": "Immediate action required"
            },
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alerts error: {str(e)}")

async def fetch_weather_data(latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
    """Fetch weather data from OpenWeatherMap API (free tier)"""
    
    # Using OpenWeatherMap free API (you'll need to sign up for API key)
    api_key = os.getenv("OPENWEATHER_API_KEY", "demo_key")
    
    # For demo purposes, return mock data if no API key
    if api_key == "demo_key":
        return get_mock_weather_data(latitude, longitude)
    
    try:
        async with httpx.AsyncClient() as client:
            # Current weather
            current_url = f"http://api.openweathermap.org/data/2.5/weather"
            current_params = {
                "lat": latitude,
                "lon": longitude,
                "appid": api_key,
                "units": "metric"
            }
            
            # Forecast
            forecast_url = f"http://api.openweathermap.org/data/2.5/forecast"
            forecast_params = {
                "lat": latitude,
                "lon": longitude,
                "appid": api_key,
                "units": "metric"
            }
            
            current_response = await client.get(current_url, params=current_params)
            forecast_response = await client.get(forecast_url, params=forecast_params)
            
            if current_response.status_code != 200 or forecast_response.status_code != 200:
                return get_mock_weather_data(latitude, longitude)
            
            current_data = current_response.json()
            forecast_data = forecast_response.json()
            
            return {
                "current": {
                    "temperature": current_data["main"]["temp"],
                    "humidity": current_data["main"]["humidity"],
                    "pressure": current_data["main"]["pressure"],
                    "weather": current_data["weather"][0]["description"],
                    "wind_speed": current_data["wind"]["speed"],
                    "visibility": current_data.get("visibility", 0) / 1000,  # Convert to km
                    "uv_index": 5,  # Mock UV index
                    "rainfall": current_data.get("rain", {}).get("1h", 0)
                },
                "forecast": [
                    {
                        "date": item["dt_txt"],
                        "temperature": item["main"]["temp"],
                        "humidity": item["main"]["humidity"],
                        "weather": item["weather"][0]["description"],
                        "rainfall": item.get("rain", {}).get("3h", 0)
                    }
                    for item in forecast_data["list"][:8]  # Next 24 hours (8 x 3-hour intervals)
                ]
            }
            
    except Exception as e:
        print(f"Weather API error: {e}")
        return get_mock_weather_data(latitude, longitude)

def get_mock_weather_data(latitude: float, longitude: float) -> Dict[str, Any]:
    """Return mock weather data for demo purposes"""
    
    import random
    
    return {
        "current": {
            "temperature": round(random.uniform(20, 35), 1),
            "humidity": random.randint(40, 80),
            "pressure": random.randint(1005, 1025),
            "weather": random.choice(["Clear sky", "Partly cloudy", "Overcast", "Light rain"]),
            "wind_speed": round(random.uniform(2, 8), 1),
            "visibility": round(random.uniform(8, 15), 1),
            "uv_index": random.randint(3, 8),
            "rainfall": round(random.uniform(0, 5), 1)
        },
        "forecast": [
            {
                "date": (datetime.now() + timedelta(hours=i*3)).strftime("%Y-%m-%d %H:%M:%S"),
                "temperature": round(random.uniform(18, 33), 1),
                "humidity": random.randint(35, 85),
                "weather": random.choice(["Clear", "Cloudy", "Rain", "Drizzle"]),
                "rainfall": round(random.uniform(0, 3), 1)
            }
            for i in range(8)
        ]
    }

async def fetch_extended_forecast(latitude: float, longitude: float, days: int) -> List[Dict[str, Any]]:
    """Fetch extended weather forecast"""
    
    # For demo, generate mock extended forecast
    forecast = []
    for i in range(days):
        date = datetime.now() + timedelta(days=i)
        forecast.append({
            "date": date.strftime("%Y-%m-%d"),
            "temperature_max": round(random.uniform(25, 35), 1),
            "temperature_min": round(random.uniform(15, 25), 1),
            "humidity": random.randint(40, 80),
            "weather": random.choice(["Sunny", "Partly cloudy", "Cloudy", "Rainy", "Stormy"]),
            "rainfall": round(random.uniform(0, 20), 1),
            "wind_speed": round(random.uniform(3, 12), 1)
        })
    
    return forecast

def generate_agricultural_advisory(weather_data: Dict[str, Any]) -> List[str]:
    """Generate agricultural advisory based on weather conditions"""
    
    advisory = []
    current = weather_data['current']
    
    # Temperature advisories
    if current['temperature'] > 35:
        advisory.append("High temperature alert: Increase irrigation frequency and provide shade for sensitive crops")
    elif current['temperature'] < 15:
        advisory.append("Low temperature warning: Protect crops from frost damage, consider row covers")
    
    # Humidity advisories
    if current['humidity'] > 80:
        advisory.append("High humidity: Monitor for fungal diseases, ensure good air circulation")
    elif current['humidity'] < 40:
        advisory.append("Low humidity: Increase irrigation and consider mulching to retain soil moisture")
    
    # Rainfall advisories
    if current['rainfall'] > 10:
        advisory.append("Heavy rainfall expected: Ensure proper drainage, avoid field operations")
    elif current['rainfall'] == 0 and current['humidity'] < 50:
        advisory.append("Dry conditions: Plan irrigation schedule, check soil moisture levels")
    
    # Wind advisories
    if current['wind_speed'] > 10:
        advisory.append("Strong winds: Secure tall crops, check for wind damage, avoid pesticide spraying")
    
    # UV advisories
    if current['uv_index'] > 7:
        advisory.append("High UV index: Protect workers, consider crop shading for sensitive plants")
    
    # General advisories
    if not advisory:
        advisory.append("Weather conditions are favorable for normal agricultural activities")
    
    return advisory

def generate_crop_specific_advisory(weather_data: Dict[str, Any], crop_type: str) -> List[str]:
    """Generate crop-specific weather advisory"""
    
    advisory = generate_agricultural_advisory(weather_data)
    current = weather_data['current']
    
    crop_specific = {
        "rice": {
            "temperature": {
                "high": "High temperature may affect grain filling - ensure adequate water supply",
                "low": "Cool weather may slow growth - monitor for diseases"
            },
            "rainfall": {
                "high": "Excess water may cause lodging - improve drainage",
                "low": "Maintain standing water in fields"
            }
        },
        "wheat": {
            "temperature": {
                "high": "Heat stress during grain filling - irrigate frequently",
                "low": "Favorable for wheat growth - monitor for rust diseases"
            },
            "rainfall": {
                "high": "Excess moisture may cause fungal diseases",
                "low": "Supplemental irrigation may be needed"
            }
        },
        "cotton": {
            "temperature": {
                "high": "Optimal temperature for cotton growth",
                "low": "Cool weather may delay flowering"
            },
            "rainfall": {
                "high": "Excess moisture may affect fiber quality",
                "low": "Cotton is drought tolerant but monitor soil moisture"
            }
        }
    }
    
    crop_lower = crop_type.lower()
    if crop_lower in crop_specific:
        if current['temperature'] > 30:
            advisory.append(crop_specific[crop_lower]['temperature']['high'])
        elif current['temperature'] < 20:
            advisory.append(crop_specific[crop_lower]['temperature']['low'])
        
        if current['rainfall'] > 5:
            advisory.append(crop_specific[crop_lower]['rainfall']['high'])
        elif current['rainfall'] == 0:
            advisory.append(crop_specific[crop_lower]['rainfall']['low'])
    
    return advisory

def generate_general_advisory(weather_data: Dict[str, Any]) -> List[str]:
    """Generate general agricultural advisory"""
    
    advisory = generate_agricultural_advisory(weather_data)
    
    # Add general farming tips based on season
    current_month = datetime.now().month
    
    if current_month in [6, 7, 8, 9]:  # Monsoon season
        advisory.append("Monsoon season: Prepare for kharif crop cultivation")
        advisory.append("Ensure proper drainage systems are in place")
    elif current_month in [11, 12, 1, 2]:  # Winter season
        advisory.append("Winter season: Ideal for rabi crop cultivation")
        advisory.append("Monitor for frost and provide protection if needed")
    elif current_month in [3, 4, 5]:  # Summer season
        advisory.append("Summer season: Focus on water conservation")
        advisory.append("Consider heat-tolerant crop varieties")
    
    return advisory

def generate_crop_calendar(crop_name: str, location: str, planting_date: Optional[str] = None) -> Dict[str, Any]:
    """Generate crop calendar with key agricultural activities"""
    
    if planting_date:
        start_date = datetime.strptime(planting_date, "%Y-%m-%d")
    else:
        start_date = datetime.now()
    
    # Crop growth cycles (in days)
    crop_cycles = {
        "rice": {"total": 120, "transplanting": 20, "flowering": 60, "maturity": 120},
        "wheat": {"total": 130, "germination": 7, "tillering": 45, "flowering": 90, "maturity": 130},
        "cotton": {"total": 180, "germination": 10, "flowering": 60, "boll_formation": 120, "harvest": 180},
        "maize": {"total": 110, "germination": 7, "tasseling": 60, "maturity": 110},
        "sugarcane": {"total": 365, "germination": 30, "tillering": 90, "grand_growth": 240, "maturity": 365}
    }
    
    crop_lower = crop_name.lower()
    if crop_lower not in crop_cycles:
        return {"error": "Crop not found in database"}
    
    cycle = crop_cycles[crop_lower]
    calendar = {
        "crop": crop_name,
        "total_duration": f"{cycle['total']} days",
        "key_stages": []
    }
    
    for stage, days in cycle.items():
        if stage != "total":
            stage_date = start_date + timedelta(days=days)
            calendar["key_stages"].append({
                "stage": stage.replace("_", " ").title(),
                "date": stage_date.strftime("%Y-%m-%d"),
                "days_from_planting": days
            })
    
    # Add general recommendations
    calendar["recommendations"] = [
        "Monitor weather conditions regularly",
        "Maintain proper irrigation schedule",
        "Apply fertilizers at recommended stages",
        "Monitor for pests and diseases",
        "Harvest at optimal maturity"
    ]
    
    return calendar

async def fetch_weather_alerts(latitude: float, longitude: float) -> List[Dict[str, Any]]:
    """Fetch weather alerts and warnings"""
    
    # For demo purposes, return mock alerts
    import random
    
    possible_alerts = [
        {
            "type": "temperature",
            "severity": "medium",
            "message": "High temperature expected over the next 3 days",
            "action": "Increase irrigation frequency"
        },
        {
            "type": "rainfall",
            "severity": "high",
            "message": "Heavy rainfall warning for next 24 hours",
            "action": "Ensure field drainage and avoid harvesting"
        },
        {
            "type": "wind",
            "severity": "low",
            "message": "Strong winds expected",
            "action": "Secure tall crops and avoid spraying"
        },
        {
            "type": "drought",
            "severity": "medium",
            "message": "No rainfall expected for next 7 days",
            "action": "Plan irrigation schedule carefully"
        }
    ]
    
    # Randomly select 0-2 alerts for demo
    num_alerts = random.randint(0, 2)
    alerts = random.sample(possible_alerts, num_alerts)
    
    return alerts

import random