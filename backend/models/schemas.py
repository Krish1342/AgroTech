from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class SoilType(str, Enum):
    BLACK = "Black Soil"
    RED = "Red Soil"
    SANDY = "Sandy Soil"
    CLAYEY = "Clayey Soil"
    LATERITE = "Laterite Soil"
    PEAT = "Peat Soil"
    CINDER = "Cinder Soil"
    YELLOW = "Yellow Soil"

class CropType(str, Enum):
    RICE = "rice"
    WHEAT = "wheat"
    MAIZE = "maize"
    COTTON = "cotton"
    SUGARCANE = "sugarcane"
    BARLEY = "barley"
    MILLET = "millet"
    PULSES = "pulses"

class SeasonType(str, Enum):
    KHARIF = "Kharif"
    RABI = "Rabi"
    SUMMER = "Summer"
    ANNUAL = "Annual"

# Request Models
class CropRecommendationRequest(BaseModel):
    temperature: float
    humidity: float
    moisture: float
    soil_type: SoilType
    nitrogen: float
    potassium: float
    phosphorous: float
    
    @validator('temperature')
    def temperature_must_be_valid(cls, v):
        if not -10 <= v <= 50:
            raise ValueError('Temperature must be between -10 and 50 degrees Celsius')
        return v
    
    @validator('humidity')
    def humidity_must_be_valid(cls, v):
        if not 0 <= v <= 100:
            raise ValueError('Humidity must be between 0 and 100 percent')
        return v
    
    @validator('moisture')
    def moisture_must_be_valid(cls, v):
        if not 0 <= v <= 100:
            raise ValueError('Moisture must be between 0 and 100 percent')
        return v
    
    @validator('nitrogen', 'potassium', 'phosphorous')
    def nutrients_must_be_positive(cls, v):
        if v < 0:
            raise ValueError('Nutrient values must be non-negative')
        return v

class SoilAnalysisRequest(BaseModel):
    image_data: Optional[str] = None  # Base64 encoded image
    image_url: Optional[str] = None
    location: Optional[str] = None
    
    @validator('image_data', 'image_url')
    def at_least_one_image_source(cls, v, values):
        if not values.get('image_data') and not v:
            raise ValueError('Either image_data or image_url must be provided')
        return v

class WeatherRequest(BaseModel):
    latitude: float
    longitude: float
    
    @validator('latitude')
    def latitude_must_be_valid(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90 degrees')
        return v
    
    @validator('longitude')
    def longitude_must_be_valid(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180 degrees')
        return v

class PredictionRequest(BaseModel):
    prediction_type: str
    input_data: Dict[str, Any]
    user_id: Optional[str] = None

# Response Models
class CropRecommendationResponse(BaseModel):
    recommended_crop: CropType
    confidence: float
    growing_season: SeasonType
    water_requirement: str
    prediction_factors: Dict[str, str]
    alternative_crops: List[CropType]
    model_version: str

class SoilClassificationResponse(BaseModel):
    predicted_soil_type: SoilType
    confidence: float
    all_probabilities: Dict[str, float]
    soil_characteristics: Dict[str, Any]
    recommended_crops: List[CropType]
    model_version: str

class WeatherResponse(BaseModel):
    location: str
    country: str
    coordinates: Dict[str, float]
    temperature: float
    feels_like: float
    humidity: int
    pressure: int
    wind_speed: float
    wind_direction: int
    description: str
    icon: str
    visibility: float
    uv_index: int
    timestamp: str
    sunrise: str
    sunset: str

class WeatherForecastResponse(BaseModel):
    forecasts: List[Dict[str, Any]]
    location: str
    forecast_days: int

class AgriculturalConditionsResponse(BaseModel):
    soil_temperature: float
    evapotranspiration_rate: float
    growing_degree_days: float
    irrigation_recommendation: str
    pest_risk: str
    disease_risk: str
    field_conditions: str
    planting_suitability: str
    harvest_conditions: str

# Database Models (for future database integration)
class PredictionHistory(BaseModel):
    id: str
    user_id: Optional[str] = None
    prediction_type: str
    input_data: Dict[str, Any]
    result: Dict[str, Any]
    confidence: float
    timestamp: datetime
    model_version: str

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size: Optional[float] = None
    farming_type: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True

class CropInfo(BaseModel):
    name: str
    scientific_name: str
    crop_type: CropType
    growing_season: SeasonType
    suitable_soil_types: List[SoilType]
    water_requirement: str
    growth_duration_days: int
    optimal_temperature_range: Dict[str, float]
    optimal_humidity_range: Dict[str, float]
    nutrient_requirements: Dict[str, float]

class SoilInfo(BaseModel):
    soil_type: SoilType
    ph_range: str
    drainage: str
    fertility: str
    organic_matter: str
    water_retention: str
    suitable_crops: List[CropType]
    improvement_suggestions: List[str]

class WeatherAlert(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    start_time: datetime
    end_time: datetime
    areas: List[str]
    alert_type: str

# Utility Models
class APIResponse(BaseModel):
    """Generic API response wrapper"""
    success: bool
    message: str
    data: Optional[Any] = None
    error_code: Optional[str] = None

class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    items: List[Any]
    total_count: int
    page: int
    per_page: int
    total_pages: int

class HealthCheckResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    dependencies: Dict[str, str]

# Validation Models
class DataValidation(BaseModel):
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    suggestions: List[str]

class ModelPerformance(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    last_updated: datetime
    training_samples: int

# Configuration Models
class AppConfig(BaseModel):
    debug: bool = False
    api_version: str = "1.0"
    max_upload_size_mb: int = 10
    allowed_image_types: List[str] = ["jpg", "jpeg", "png", "bmp"]
    weather_api_timeout: int = 30
    ml_model_timeout: int = 60

# Error Models
class ValidationError(BaseModel):
    field: str
    message: str
    code: str

class APIError(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str
    request_id: Optional[str] = None