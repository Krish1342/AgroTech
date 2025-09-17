from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime

from ..models.schemas import CropPredictionRequest, CropPredictionResponse, CropInfo
from ..services.ml_models import get_ml_service

router = APIRouter()

class CropRecommendationRequest(BaseModel):
    temperature: float = Field(..., ge=-50, le=60, description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    moisture: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    soil_type: str = Field(..., description="Type of soil (Sandy, Loamy, Black, Red, Clayey)")
    nitrogen: float = Field(..., ge=0, le=200, description="Nitrogen content in soil")
    potassium: float = Field(..., ge=0, le=200, description="Potassium content in soil")
    phosphorous: float = Field(..., ge=0, le=200, description="Phosphorous content in soil")
    location: Optional[str] = Field(None, description="Location for additional context")

class CropRecommendationResponse(BaseModel):
    recommended_crop: str
    confidence: float
    all_probabilities: Dict[str, float]
    fertilizer_recommendation: Optional[str] = None
    additional_tips: List[str] = []
    input_conditions: Dict[str, Any]
    timestamp: datetime

@router.post("/recommend", response_model=CropRecommendationResponse)
async def recommend_crop(
    request: CropRecommendationRequest,
    ml_service = Depends(get_ml_service)
):
    """
    Recommend the best crop based on soil and environmental conditions
    """
    try:
        # Call the ML service for crop prediction
        prediction_result = await ml_service.predict_crop(
            temperature=request.temperature,
            humidity=request.humidity,
            moisture=request.moisture,
            soil_type=request.soil_type,
            nitrogen=request.nitrogen,
            potassium=request.potassium,
            phosphorous=request.phosphorous
        )
        
        if 'error' in prediction_result:
            raise HTTPException(status_code=400, detail=prediction_result['error'])
        
        # Get fertilizer recommendation based on crop and nutrient levels
        fertilizer_rec = get_fertilizer_recommendation(
            prediction_result['recommended_crop'],
            request.nitrogen,
            request.potassium,
            request.phosphorous
        )
        
        # Get additional growing tips
        tips = get_growing_tips(
            prediction_result['recommended_crop'],
            request.soil_type,
            request.temperature,
            request.humidity
        )
        
        return CropRecommendationResponse(
            recommended_crop=prediction_result['recommended_crop'],
            confidence=prediction_result['confidence'],
            all_probabilities=prediction_result['all_probabilities'],
            fertilizer_recommendation=fertilizer_rec,
            additional_tips=tips,
            input_conditions=request.dict(),
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/info/{crop_name}")
async def get_crop_info(crop_name: str):
    """
    Get detailed information about a specific crop
    """
    crop_database = get_crop_database()
    
    crop_name_normalized = crop_name.lower().replace(" ", "_")
    
    if crop_name_normalized not in crop_database:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    return crop_database[crop_name_normalized]

@router.get("/list")
async def list_available_crops():
    """
    Get list of all available crops in the system
    """
    crops = [
        "Maize", "Sugarcane", "Cotton", "Tobacco", "Paddy", 
        "Barley", "Wheat", "Millets", "Oil seeds"
    ]
    
    return {
        "crops": crops,
        "total_count": len(crops)
    }

@router.get("/seasonal-recommendations")
async def get_seasonal_recommendations(
    season: str,
    region: Optional[str] = None
):
    """
    Get crop recommendations based on season and region
    """
    seasonal_crops = get_seasonal_crop_recommendations(season, region)
    
    return {
        "season": season,
        "region": region,
        "recommended_crops": seasonal_crops,
        "timestamp": datetime.now()
    }

def get_fertilizer_recommendation(crop: str, nitrogen: float, potassium: float, phosphorous: float) -> str:
    """Get fertilizer recommendation based on crop and current nutrient levels"""
    
    # Optimal nutrient ranges for different crops
    crop_nutrients = {
        "maize": {"n": (20, 40), "p": (10, 20), "k": (10, 20)},
        "wheat": {"n": (30, 50), "p": (15, 25), "k": (15, 25)},
        "cotton": {"n": (15, 30), "p": (20, 40), "k": (15, 30)},
        "paddy": {"n": (25, 45), "p": (10, 20), "k": (10, 20)},
        "sugarcane": {"n": (10, 25), "p": (25, 45), "k": (5, 15)},
        "tobacco": {"n": (15, 35), "p": (15, 25), "k": (5, 15)},
        "barley": {"n": (10, 25), "p": (10, 20), "k": (10, 20)},
        "millets": {"n": (15, 30), "p": (15, 25), "k": (5, 15)},
        "oil seeds": {"n": (5, 20), "p": (25, 45), "k": (15, 30)}
    }
    
    crop_key = crop.lower()
    if crop_key not in crop_nutrients:
        return "Standard NPK fertilizer recommended"
    
    optimal = crop_nutrients[crop_key]
    recommendations = []
    
    # Check nitrogen
    if nitrogen < optimal["n"][0]:
        recommendations.append("Increase nitrogen with Urea or Ammonium Sulfate")
    elif nitrogen > optimal["n"][1]:
        recommendations.append("Reduce nitrogen application")
    
    # Check phosphorous
    if phosphorous < optimal["p"][0]:
        recommendations.append("Add phosphorous with DAP or Triple Superphosphate")
    elif phosphorous > optimal["p"][1]:
        recommendations.append("Reduce phosphorous application")
    
    # Check potassium
    if potassium < optimal["k"][0]:
        recommendations.append("Add potassium with Muriate of Potash")
    elif potassium > optimal["k"][1]:
        recommendations.append("Reduce potassium application")
    
    if not recommendations:
        return "Current nutrient levels are optimal for this crop"
    
    return "; ".join(recommendations)

def get_growing_tips(crop: str, soil_type: str, temperature: float, humidity: float) -> List[str]:
    """Get specific growing tips based on crop and conditions"""
    
    tips = []
    crop_lower = crop.lower()
    
    # Temperature-based tips
    if temperature < 20:
        tips.append("Consider using row covers or greenhouse protection in cool weather")
    elif temperature > 35:
        tips.append("Provide shade during peak hours and increase irrigation frequency")
    
    # Humidity-based tips
    if humidity < 40:
        tips.append("Monitor for water stress and consider drip irrigation")
    elif humidity > 80:
        tips.append("Ensure good air circulation to prevent fungal diseases")
    
    # Soil-specific tips
    soil_tips = {
        "sandy": "Increase organic matter and use frequent, light watering",
        "clayey": "Improve drainage and avoid overwatering",
        "loamy": "Ideal soil condition - maintain organic matter levels",
        "black": "Excellent for cotton and sugarcane - monitor moisture levels",
        "red": "Add lime if acidic and supplement with organic fertilizers"
    }
    
    if soil_type.lower() in soil_tips:
        tips.append(soil_tips[soil_type.lower()])
    
    # Crop-specific tips
    crop_specific_tips = {
        "maize": ["Plant after last frost", "Ensure adequate spacing for air circulation"],
        "wheat": ["Plant in cool season", "Monitor for rust diseases"],
        "cotton": ["Requires warm weather", "Deep watering less frequently"],
        "paddy": ["Maintain standing water during growing season", "Transplant seedlings carefully"],
        "sugarcane": ["Requires consistent moisture", "Harvest before flowering for sugar content"]
    }
    
    if crop_lower in crop_specific_tips:
        tips.extend(crop_specific_tips[crop_lower])
    
    return tips[:5]  # Return max 5 tips

def get_crop_database() -> Dict[str, Any]:
    """Return detailed crop information database"""
    return {
        "maize": {
            "name": "Maize (Corn)",
            "scientific_name": "Zea mays",
            "growing_season": "Kharif (June-September)",
            "soil_preference": ["Sandy", "Loamy"],
            "temperature_range": "21-27°C",
            "water_requirement": "Medium to High",
            "harvest_time": "100-120 days",
            "uses": ["Food grain", "Animal feed", "Industrial applications"],
            "major_nutrients": {"nitrogen": "High", "phosphorous": "Medium", "potassium": "Medium"}
        },
        "wheat": {
            "name": "Wheat",
            "scientific_name": "Triticum aestivum",
            "growing_season": "Rabi (November-April)",
            "soil_preference": ["Loamy", "Black"],
            "temperature_range": "15-25°C",
            "water_requirement": "Medium",
            "harvest_time": "120-150 days",
            "uses": ["Food grain", "Flour production"],
            "major_nutrients": {"nitrogen": "High", "phosphorous": "Medium", "potassium": "Medium"}
        },
        "cotton": {
            "name": "Cotton",
            "scientific_name": "Gossypium hirsutum",
            "growing_season": "Kharif (May-October)",
            "soil_preference": ["Black", "Red"],
            "temperature_range": "25-35°C",
            "water_requirement": "High",
            "harvest_time": "150-180 days",
            "uses": ["Textile fiber", "Oil extraction"],
            "major_nutrients": {"nitrogen": "Medium", "phosphorous": "High", "potassium": "Medium"}
        }
    }

def get_seasonal_crop_recommendations(season: str, region: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get seasonal crop recommendations"""
    
    seasonal_data = {
        "kharif": {
            "months": "June-September",
            "crops": [
                {"name": "Paddy", "suitability": "High", "water_need": "High"},
                {"name": "Maize", "suitability": "High", "water_need": "Medium"},
                {"name": "Cotton", "suitability": "High", "water_need": "High"},
                {"name": "Sugarcane", "suitability": "Medium", "water_need": "High"}
            ]
        },
        "rabi": {
            "months": "November-April",
            "crops": [
                {"name": "Wheat", "suitability": "High", "water_need": "Medium"},
                {"name": "Barley", "suitability": "High", "water_need": "Low"},
                {"name": "Mustard", "suitability": "Medium", "water_need": "Low"}
            ]
        },
        "zaid": {
            "months": "March-June",
            "crops": [
                {"name": "Watermelon", "suitability": "High", "water_need": "High"},
                {"name": "Cucumber", "suitability": "Medium", "water_need": "Medium"},
                {"name": "Fodder crops", "suitability": "High", "water_need": "Medium"}
            ]
        }
    }
    
    season_key = season.lower()
    if season_key not in seasonal_data:
        return []
    
    return seasonal_data[season_key]["crops"]