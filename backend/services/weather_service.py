import aiohttp
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import os
import json
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class WeatherData:
    temperature: float
    humidity: float
    pressure: float
    wind_speed: float
    wind_direction: int
    rainfall: float
    description: str
    timestamp: datetime

class WeatherService:
    """
    Service for fetching weather data from external APIs
    """
    
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY', 'demo_key')
        self.base_url = "http://api.openweathermap.org/data/2.5"
        self.session = None
        
    async def get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close_session(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def get_current_weather(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Get current weather data for given coordinates
        """
        try:
            if self.api_key == 'demo_key':
                return self._generate_mock_current_weather(latitude, longitude)
            
            session = await self.get_session()
            url = f"{self.base_url}/weather"
            params = {
                'lat': latitude,
                'lon': longitude,
                'appid': self.api_key,
                'units': 'metric'
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_current_weather(data)
                else:
                    logger.error(f"Weather API error: {response.status}")
                    return self._generate_mock_current_weather(latitude, longitude)
                    
        except Exception as e:
            logger.error(f"Weather fetch error: {str(e)}")
            return self._generate_mock_current_weather(latitude, longitude)
    
    async def get_weather_forecast(self, latitude: float, longitude: float, days: int = 5) -> List[Dict[str, Any]]:
        """
        Get weather forecast for given coordinates
        """
        try:
            if self.api_key == 'demo_key':
                return self._generate_mock_forecast(latitude, longitude, days)
            
            session = await self.get_session()
            url = f"{self.base_url}/forecast"
            params = {
                'lat': latitude,
                'lon': longitude,
                'appid': self.api_key,
                'units': 'metric',
                'cnt': days * 8  # 8 forecasts per day (every 3 hours)
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_forecast_data(data)
                else:
                    logger.error(f"Forecast API error: {response.status}")
                    return self._generate_mock_forecast(latitude, longitude, days)
                    
        except Exception as e:
            logger.error(f"Forecast fetch error: {str(e)}")
            return self._generate_mock_forecast(latitude, longitude, days)
    
    async def get_historical_weather(
        self, 
        latitude: float, 
        longitude: float, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        Get historical weather data (mock implementation)
        """
        try:
            # OpenWeatherMap historical data requires subscription
            # For demo, generate mock historical data
            return self._generate_mock_historical_weather(latitude, longitude, start_date, end_date)
            
        except Exception as e:
            logger.error(f"Historical weather fetch error: {str(e)}")
            return []
    
    def _parse_current_weather(self, data: Dict) -> Dict[str, Any]:
        """Parse current weather API response"""
        main = data.get('main', {})
        weather = data.get('weather', [{}])[0]
        wind = data.get('wind', {})
        
        return {
            'location': data.get('name', 'Unknown'),
            'country': data.get('sys', {}).get('country', 'Unknown'),
            'coordinates': {
                'latitude': data.get('coord', {}).get('lat', 0),
                'longitude': data.get('coord', {}).get('lon', 0)
            },
            'temperature': main.get('temp', 0),
            'feels_like': main.get('feels_like', 0),
            'humidity': main.get('humidity', 0),
            'pressure': main.get('pressure', 0),
            'wind_speed': wind.get('speed', 0),
            'wind_direction': wind.get('deg', 0),
            'description': weather.get('description', 'Unknown'),
            'icon': weather.get('icon', '01d'),
            'visibility': data.get('visibility', 0) / 1000,  # Convert to km
            'uv_index': 0,  # Not available in current weather API
            'timestamp': datetime.now().isoformat(),
            'sunrise': datetime.fromtimestamp(data.get('sys', {}).get('sunrise', 0)).isoformat(),
            'sunset': datetime.fromtimestamp(data.get('sys', {}).get('sunset', 0)).isoformat()
        }
    
    def _parse_forecast_data(self, data: Dict) -> List[Dict[str, Any]]:
        """Parse forecast API response"""
        forecasts = []
        
        for item in data.get('list', []):
            main = item.get('main', {})
            weather = item.get('weather', [{}])[0]
            wind = item.get('wind', {})
            
            forecast = {
                'datetime': datetime.fromtimestamp(item.get('dt', 0)).isoformat(),
                'temperature': main.get('temp', 0),
                'feels_like': main.get('feels_like', 0),
                'humidity': main.get('humidity', 0),
                'pressure': main.get('pressure', 0),
                'wind_speed': wind.get('speed', 0),
                'wind_direction': wind.get('deg', 0),
                'description': weather.get('description', 'Unknown'),
                'icon': weather.get('icon', '01d'),
                'rain_probability': item.get('pop', 0) * 100,  # Convert to percentage
                'rainfall': item.get('rain', {}).get('3h', 0)  # 3-hour rainfall
            }
            forecasts.append(forecast)
        
        return forecasts
    
    def _generate_mock_current_weather(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Generate mock current weather data"""
        import random
        
        # Base temperature varies by season
        base_temp = 25 + random.uniform(-10, 10)
        
        return {
            'location': f"Location_{abs(int(latitude))}{abs(int(longitude))}",
            'country': 'Unknown',
            'coordinates': {
                'latitude': latitude,
                'longitude': longitude
            },
            'temperature': round(base_temp, 1),
            'feels_like': round(base_temp + random.uniform(-3, 3), 1),
            'humidity': random.randint(40, 90),
            'pressure': random.randint(1000, 1020),
            'wind_speed': round(random.uniform(0, 15), 1),
            'wind_direction': random.randint(0, 360),
            'description': random.choice([
                'clear sky', 'few clouds', 'scattered clouds', 
                'broken clouds', 'light rain', 'moderate rain'
            ]),
            'icon': random.choice(['01d', '02d', '03d', '04d', '09d', '10d']),
            'visibility': round(random.uniform(5, 15), 1),
            'uv_index': random.randint(1, 10),
            'timestamp': datetime.now().isoformat(),
            'sunrise': (datetime.now().replace(hour=6, minute=0, second=0)).isoformat(),
            'sunset': (datetime.now().replace(hour=18, minute=30, second=0)).isoformat()
        }
    
    def _generate_mock_forecast(self, latitude: float, longitude: float, days: int) -> List[Dict[str, Any]]:
        """Generate mock forecast data"""
        import random
        
        forecasts = []
        base_temp = 25 + random.uniform(-10, 10)
        
        for day in range(days):
            for hour in range(0, 24, 3):  # Every 3 hours
                forecast_time = datetime.now() + timedelta(days=day, hours=hour)
                
                # Temperature variation throughout day
                hour_factor = 1 + 0.3 * np.sin((hour - 6) * np.pi / 12)
                temp = base_temp * hour_factor + random.uniform(-2, 2)
                
                forecast = {
                    'datetime': forecast_time.isoformat(),
                    'temperature': round(temp, 1),
                    'feels_like': round(temp + random.uniform(-3, 3), 1),
                    'humidity': random.randint(40, 90),
                    'pressure': random.randint(1000, 1020),
                    'wind_speed': round(random.uniform(0, 15), 1),
                    'wind_direction': random.randint(0, 360),
                    'description': random.choice([
                        'clear sky', 'few clouds', 'scattered clouds',
                        'broken clouds', 'light rain', 'moderate rain'
                    ]),
                    'icon': random.choice(['01d', '02d', '03d', '04d', '09d', '10d']),
                    'rain_probability': random.randint(0, 80),
                    'rainfall': round(random.uniform(0, 5), 1) if random.random() > 0.7 else 0
                }
                forecasts.append(forecast)
        
        return forecasts
    
    def _generate_mock_historical_weather(
        self, 
        latitude: float, 
        longitude: float, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Generate mock historical weather data"""
        import random
        
        historical_data = []
        current_date = start_date
        base_temp = 25 + random.uniform(-10, 10)
        
        while current_date <= end_date:
            # Seasonal temperature variation
            day_of_year = current_date.timetuple().tm_yday
            seasonal_factor = 1 + 0.3 * np.sin((day_of_year - 81) * 2 * np.pi / 365)
            temp = base_temp * seasonal_factor + random.uniform(-5, 5)
            
            historical = {
                'date': current_date.date().isoformat(),
                'temperature_max': round(temp + random.uniform(0, 5), 1),
                'temperature_min': round(temp - random.uniform(0, 5), 1),
                'temperature_avg': round(temp, 1),
                'humidity': random.randint(40, 90),
                'pressure': random.randint(1000, 1020),
                'wind_speed': round(random.uniform(0, 15), 1),
                'rainfall': round(random.uniform(0, 20), 1) if random.random() > 0.6 else 0,
                'description': random.choice([
                    'clear', 'partly cloudy', 'cloudy', 'rainy', 'stormy'
                ])
            }
            historical_data.append(historical)
            current_date += timedelta(days=1)
        
        return historical_data
    
    async def get_weather_alerts(self, latitude: float, longitude: float) -> List[Dict[str, Any]]:
        """
        Get weather alerts for location
        """
        try:
            # Mock weather alerts for demo
            import random
            
            alerts = []
            if random.random() > 0.7:  # 30% chance of alerts
                alert_types = [
                    'Heavy Rain Warning',
                    'High Temperature Alert',
                    'Strong Wind Advisory',
                    'Flood Risk',
                    'Drought Conditions'
                ]
                
                selected_alert = random.choice(alert_types)
                alerts.append({
                    'id': f"alert_{random.randint(1000, 9999)}",
                    'title': selected_alert,
                    'description': f"Weather advisory for {selected_alert.lower()} in your area",
                    'severity': random.choice(['Minor', 'Moderate', 'Severe']),
                    'start_time': datetime.now().isoformat(),
                    'end_time': (datetime.now() + timedelta(hours=random.randint(6, 48))).isoformat(),
                    'areas': [f"Area around {latitude:.2f}, {longitude:.2f}"]
                })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Weather alerts fetch error: {str(e)}")
            return []
    
    async def get_agricultural_conditions(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Get agricultural conditions and advisories
        """
        try:
            current_weather = await self.get_current_weather(latitude, longitude)
            forecast = await self.get_weather_forecast(latitude, longitude, 7)
            
            # Calculate agricultural metrics
            temp = current_weather['temperature']
            humidity = current_weather['humidity']
            rainfall_forecast = sum(f.get('rainfall', 0) for f in forecast[:8])  # Next 24 hours
            
            conditions = {
                'soil_temperature': round(temp * 0.9, 1),  # Approximate soil temp
                'evapotranspiration_rate': self._calculate_et_rate(temp, humidity, current_weather['wind_speed']),
                'growing_degree_days': self._calculate_gdd(forecast),
                'irrigation_recommendation': self._get_irrigation_recommendation(rainfall_forecast, humidity),
                'pest_risk': self._assess_pest_risk(temp, humidity),
                'disease_risk': self._assess_disease_risk(temp, humidity, rainfall_forecast),
                'field_conditions': self._assess_field_conditions(current_weather, forecast),
                'planting_suitability': self._assess_planting_suitability(current_weather, forecast),
                'harvest_conditions': self._assess_harvest_conditions(current_weather, forecast)
            }
            
            return conditions
            
        except Exception as e:
            logger.error(f"Agricultural conditions error: {str(e)}")
            return {}
    
    def _calculate_et_rate(self, temperature: float, humidity: float, wind_speed: float) -> float:
        """Calculate evapotranspiration rate (simplified)"""
        # Simplified Penman equation approximation
        et_rate = (temperature - 5) * (100 - humidity) * 0.01 * (1 + wind_speed * 0.1)
        return round(max(0, et_rate), 2)
    
    def _calculate_gdd(self, forecast: List[Dict[str, Any]]) -> float:
        """Calculate growing degree days"""
        gdd = 0
        base_temp = 10  # Base temperature for most crops
        
        for day_forecasts in self._group_by_day(forecast):
            daily_temps = [f['temperature'] for f in day_forecasts]
            avg_temp = sum(daily_temps) / len(daily_temps)
            gdd += max(0, avg_temp - base_temp)
        
        return round(gdd, 1)
    
    def _group_by_day(self, forecast: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
        """Group forecast by day"""
        from itertools import groupby
        
        def get_date(forecast_item):
            return datetime.fromisoformat(forecast_item['datetime']).date()
        
        grouped = []
        for date, day_forecasts in groupby(forecast, key=get_date):
            grouped.append(list(day_forecasts))
        
        return grouped
    
    def _get_irrigation_recommendation(self, rainfall_forecast: float, humidity: float) -> str:
        """Get irrigation recommendation"""
        if rainfall_forecast > 10:
            return "Low priority - sufficient rainfall expected"
        elif rainfall_forecast > 5:
            return "Monitor - light rainfall expected"
        elif humidity < 50:
            return "High priority - dry conditions"
        else:
            return "Medium priority - normal irrigation schedule"
    
    def _assess_pest_risk(self, temperature: float, humidity: float) -> str:
        """Assess pest risk level"""
        if temperature > 25 and humidity > 70:
            return "High - favorable conditions for pest activity"
        elif temperature > 20 and humidity > 60:
            return "Medium - monitor pest populations"
        else:
            return "Low - unfavorable conditions for most pests"
    
    def _assess_disease_risk(self, temperature: float, humidity: float, rainfall: float) -> str:
        """Assess disease risk level"""
        if humidity > 80 and rainfall > 5:
            return "High - high moisture favors fungal diseases"
        elif humidity > 70 or rainfall > 2:
            return "Medium - monitor for disease symptoms"
        else:
            return "Low - dry conditions limit disease spread"
    
    def _assess_field_conditions(self, current: Dict, forecast: List[Dict]) -> str:
        """Assess field working conditions"""
        rainfall_24h = sum(f.get('rainfall', 0) for f in forecast[:8])
        wind_speed = current['wind_speed']
        
        if rainfall_24h > 10:
            return "Poor - wet conditions, avoid heavy machinery"
        elif rainfall_24h > 5:
            return "Moderate - limited field work possible"
        elif wind_speed > 15:
            return "Windy - avoid spraying operations"
        else:
            return "Good - suitable for most field operations"
    
    def _assess_planting_suitability(self, current: Dict, forecast: List[Dict]) -> str:
        """Assess planting conditions"""
        temp = current['temperature']
        soil_moisture = current['humidity'] / 100 * 0.5  # Approximate soil moisture
        rainfall_forecast = sum(f.get('rainfall', 0) for f in forecast[:8])
        
        if temp < 10:
            return "Poor - too cold for most crops"
        elif temp > 35:
            return "Poor - too hot, risk of seedling stress"
        elif rainfall_forecast > 15:
            return "Poor - excessive rainfall expected"
        elif 15 <= temp <= 30 and 0.3 <= soil_moisture <= 0.7:
            return "Excellent - optimal conditions"
        else:
            return "Good - suitable for planting"
    
    def _assess_harvest_conditions(self, current: Dict, forecast: List[Dict]) -> str:
        """Assess harvest conditions"""
        humidity = current['humidity']
        rainfall_forecast = sum(f.get('rainfall', 0) for f in forecast[:8])
        wind_speed = current['wind_speed']
        
        if rainfall_forecast > 5:
            return "Poor - rain expected, delay harvest"
        elif humidity > 85:
            return "Moderate - high humidity may affect grain quality"
        elif wind_speed > 20:
            return "Challenging - strong winds may cause crop lodging"
        else:
            return "Good - favorable conditions for harvest"

# Global weather service instance
_weather_service = None

def get_weather_service() -> WeatherService:
    """Get or create weather service instance"""
    global _weather_service
    if _weather_service is None:
        _weather_service = WeatherService()
    return _weather_service

# Import numpy for calculations
try:
    import numpy as np
except ImportError:
    # Fallback for sin function if numpy not available
    import math
    class MockNumpy:
        @staticmethod
        def sin(x):
            return math.sin(x)
    np = MockNumpy()