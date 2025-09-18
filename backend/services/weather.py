"""
Weather service for agricultural applications using OpenWeatherMap API
"""
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx

from dotenv import load_dotenv

load_dotenv()

class WeatherService:
    def __init__(self):
        """Initialize weather service with OpenWeatherMap API"""
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        if not self.api_key:
            raise ValueError("OPENWEATHER_API_KEY environment variable is required")
        
        self.base_url = "https://api.openweathermap.org/data/2.5"
        self.timeout = 10.0
    
    async def get_current_weather(self, lat: float, lng: float) -> Dict[str, Any]:
        """
        Get current weather conditions for given coordinates
        
        Args:
            lat: Latitude
            lng: Longitude
        
        Returns:
            Dict with current weather data
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/weather",
                    params={
                        "lat": lat,
                        "lon": lng,
                        "appid": self.api_key,
                        "units": "metric"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                return self._format_current_weather(data)
                
        except httpx.RequestError as e:
            raise Exception(f"Weather API request failed: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Weather API error: {e.response.status_code}")
    
    async def get_weather_forecast(self, lat: float, lng: float, days: int = 5) -> Dict[str, Any]:
        """
        Get weather forecast for given coordinates
        
        Args:
            lat: Latitude
            lng: Longitude
            days: Number of days (max 5 for free tier)
        
        Returns:
            Dict with forecast data
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/forecast",
                    params={
                        "lat": lat,
                        "lon": lng,
                        "appid": self.api_key,
                        "units": "metric",
                        "cnt": min(days * 8, 40)  # 8 forecasts per day, max 40
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                return self._format_forecast(data, days)
                
        except httpx.RequestError as e:
            raise Exception(f"Weather forecast API request failed: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Weather forecast API error: {e.response.status_code}")
    
    async def get_weather_by_city(self, city: str) -> Dict[str, Any]:
        """
        Get current weather by city name
        
        Args:
            city: City name
        
        Returns:
            Dict with current weather data
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/weather",
                    params={
                        "q": city,
                        "appid": self.api_key,
                        "units": "metric"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                return self._format_current_weather(data)
                
        except httpx.RequestError as e:
            raise Exception(f"Weather API request failed: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Weather API error: {e.response.status_code}")
    
    def _format_current_weather(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Format current weather data for agricultural use"""
        weather = data.get("weather", [{}])[0]
        main = data.get("main", {})
        wind = data.get("wind", {})
        
        # Calculate agricultural insights
        insights = self._get_agricultural_insights(
            temperature=main.get("temp", 0),
            humidity=main.get("humidity", 0),
            wind_speed=wind.get("speed", 0),
            weather_condition=weather.get("main", "").lower(),
            pressure=main.get("pressure", 0)
        )
        
        return {
            "location": {
                "name": data.get("name", "Unknown"),
                "country": data.get("sys", {}).get("country", ""),
                "coordinates": {
                    "lat": data.get("coord", {}).get("lat"),
                    "lng": data.get("coord", {}).get("lon")
                }
            },
            "current": {
                "temperature": main.get("temp"),
                "feels_like": main.get("feels_like"),
                "humidity": main.get("humidity"),
                "pressure": main.get("pressure"),
                "wind_speed": wind.get("speed"),
                "wind_direction": wind.get("deg"),
                "visibility": data.get("visibility", 0) / 1000,  # Convert to km
                "uv_index": None,  # Not available in current weather API
                "condition": weather.get("main"),
                "description": weather.get("description"),
                "icon": weather.get("icon")
            },
            "agricultural_insights": insights,
            "timestamp": datetime.now().isoformat(),
            "data_source": "OpenWeatherMap"
        }
    
    def _format_forecast(self, data: Dict[str, Any], days: int) -> Dict[str, Any]:
        """Format forecast data for agricultural use"""
        forecasts = []
        
        # Group forecasts by day
        daily_forecasts = {}
        for item in data.get("list", []):
            date = datetime.fromtimestamp(item["dt"]).date()
            if date not in daily_forecasts:
                daily_forecasts[date] = []
            daily_forecasts[date].append(item)
        
        # Process each day
        for date, day_forecasts in list(daily_forecasts.items())[:days]:
            # Calculate daily aggregates
            temps = [item["main"]["temp"] for item in day_forecasts]
            humidity_vals = [item["main"]["humidity"] for item in day_forecasts]
            
            # Most common weather condition
            conditions = [item["weather"][0]["main"] for item in day_forecasts]
            main_condition = max(set(conditions), key=conditions.count)
            
            # Check for precipitation
            precipitation = sum(item.get("rain", {}).get("3h", 0) + 
                             item.get("snow", {}).get("3h", 0) for item in day_forecasts)
            
            daily_forecast = {
                "date": date.isoformat(),
                "temperature": {
                    "min": min(temps),
                    "max": max(temps),
                    "avg": sum(temps) / len(temps)
                },
                "humidity": {
                    "min": min(humidity_vals),
                    "max": max(humidity_vals),
                    "avg": sum(humidity_vals) / len(humidity_vals)
                },
                "condition": main_condition,
                "description": day_forecasts[0]["weather"][0]["description"],
                "precipitation": precipitation,
                "wind_speed": sum(item["wind"]["speed"] for item in day_forecasts) / len(day_forecasts)
            }
            
            # Add agricultural insights for the day
            daily_forecast["agricultural_insights"] = self._get_agricultural_insights(
                temperature=daily_forecast["temperature"]["avg"],
                humidity=daily_forecast["humidity"]["avg"],
                wind_speed=daily_forecast["wind_speed"],
                weather_condition=main_condition.lower(),
                precipitation=precipitation
            )
            
            forecasts.append(daily_forecast)
        
        return {
            "location": {
                "name": data.get("city", {}).get("name", "Unknown"),
                "country": data.get("city", {}).get("country", ""),
                "coordinates": {
                    "lat": data.get("city", {}).get("coord", {}).get("lat"),
                    "lng": data.get("city", {}).get("coord", {}).get("lon")
                }
            },
            "forecast": forecasts,
            "timestamp": datetime.now().isoformat(),
            "data_source": "OpenWeatherMap"
        }
    
    def _get_agricultural_insights(self, temperature: float, humidity: float, 
                                 wind_speed: float, weather_condition: str,
                                 pressure: float = None, precipitation: float = 0) -> Dict[str, Any]:
        """Generate agricultural insights based on weather conditions"""
        insights = {
            "irrigation_recommendation": "normal",
            "field_work_suitability": "suitable",
            "disease_risk": "low",
            "recommendations": [],
            "alerts": []
        }
        
        # Temperature-based recommendations
        if temperature < 5:
            insights["alerts"].append("Frost risk - protect sensitive crops")
            insights["field_work_suitability"] = "poor"
        elif temperature > 35:
            insights["alerts"].append("Heat stress risk - ensure adequate irrigation")
            insights["irrigation_recommendation"] = "high"
        elif temperature > 30:
            insights["irrigation_recommendation"] = "increased"
        
        # Humidity-based recommendations
        if humidity > 80:
            insights["disease_risk"] = "high"
            insights["recommendations"].append("High humidity increases fungal disease risk")
        elif humidity < 30:
            insights["irrigation_recommendation"] = "increased"
            insights["recommendations"].append("Low humidity may require additional watering")
        
        # Wind-based recommendations
        if wind_speed > 10:
            insights["field_work_suitability"] = "poor"
            insights["recommendations"].append("Strong winds - avoid spraying operations")
        elif wind_speed > 5:
            insights["recommendations"].append("Moderate winds - good for drying conditions")
        
        # Weather condition based recommendations
        if "rain" in weather_condition:
            insights["irrigation_recommendation"] = "reduced"
            insights["field_work_suitability"] = "poor"
            if precipitation > 10:
                insights["alerts"].append("Heavy rainfall - check for waterlogging")
        elif "snow" in weather_condition:
            insights["field_work_suitability"] = "unsuitable"
            insights["alerts"].append("Snow conditions - protect crops if needed")
        elif "clear" in weather_condition or "sun" in weather_condition:
            insights["recommendations"].append("Clear weather - good for field operations")
        
        # Combined conditions
        if temperature > 25 and humidity > 70:
            insights["disease_risk"] = "high"
            insights["recommendations"].append("Hot and humid - monitor for pest and disease activity")
        
        if temperature < 10 and humidity > 80:
            insights["disease_risk"] = "medium"
            insights["recommendations"].append("Cool and humid - watch for fungal diseases")
        
        return insights

# Global weather service instance
weather_service = None

def get_weather_service() -> WeatherService:
    """Get or create global weather service instance"""
    global weather_service
    if weather_service is None:
        weather_service = WeatherService()
    return weather_service