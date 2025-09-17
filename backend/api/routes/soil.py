from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
from datetime import datetime
import io
from PIL import Image

from ..models.schemas import SoilClassificationRequest, SoilClassificationResponse
from ..services.ml_models import get_ml_service

router = APIRouter()

class SoilAnalysisRequest(BaseModel):
    ph_level: Optional[float] = None
    organic_matter: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorous: Optional[float] = None
    potassium: Optional[float] = None
    location: Optional[str] = None

class SoilAnalysisResponse(BaseModel):
    soil_health_score: float
    recommendations: List[str]
    nutrient_analysis: Dict[str, Any]
    improvement_suggestions: List[str]
    timestamp: datetime

@router.post("/classify-image", response_model=SoilClassificationResponse)
async def classify_soil_image(
    file: UploadFile = File(...),
    ml_service = Depends(get_ml_service)
):
    """
    Classify soil type from an uploaded image
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Call ML service for soil classification
        classification_result = await ml_service.classify_soil_image(image)
        
        if 'error' in classification_result:
            raise HTTPException(status_code=400, detail=classification_result['error'])
        
        # Get soil characteristics
        soil_info = get_soil_characteristics(classification_result['predicted_soil_type'])
        
        return SoilClassificationResponse(
            predicted_soil_type=classification_result['predicted_soil_type'],
            confidence=classification_result['confidence'],
            all_probabilities=classification_result['all_probabilities'],
            soil_characteristics=soil_info,
            recommendations=get_soil_management_tips(classification_result['predicted_soil_type']),
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")

@router.post("/analyze", response_model=SoilAnalysisResponse)
async def analyze_soil_health(request: SoilAnalysisRequest):
    """
    Analyze soil health based on chemical parameters
    """
    try:
        # Calculate soil health score
        health_score = calculate_soil_health_score(
            ph=request.ph_level,
            organic_matter=request.organic_matter,
            nitrogen=request.nitrogen,
            phosphorous=request.phosphorous,
            potassium=request.potassium
        )
        
        # Get nutrient analysis
        nutrient_analysis = analyze_nutrients(
            request.nitrogen, request.phosphorous, request.potassium
        )
        
        # Generate recommendations
        recommendations = generate_soil_recommendations(
            health_score, nutrient_analysis, request.ph_level
        )
        
        # Get improvement suggestions
        improvements = get_improvement_suggestions(health_score, nutrient_analysis)
        
        return SoilAnalysisResponse(
            soil_health_score=health_score,
            recommendations=recommendations,
            nutrient_analysis=nutrient_analysis,
            improvement_suggestions=improvements,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@router.get("/types")
async def get_soil_types():
    """
    Get information about different soil types
    """
    return {
        "soil_types": [
            {
                "name": "Black Soil",
                "description": "Rich in clay content, excellent for cotton cultivation",
                "characteristics": ["High water retention", "Rich in calcium carbonate", "Self-plowing"],
                "best_crops": ["Cotton", "Sugarcane", "Wheat"]
            },
            {
                "name": "Red Soil",
                "description": "Iron-rich soil with good drainage",
                "characteristics": ["Good drainage", "Iron-rich", "Acidic nature"],
                "best_crops": ["Cotton", "Tobacco", "Millets"]
            },
            {
                "name": "Laterite Soil",
                "description": "Iron and aluminum rich soil from tropical regions",
                "characteristics": ["High iron content", "Good drainage", "Low fertility"],
                "best_crops": ["Cashew", "Coconut", "Rice with irrigation"]
            },
            {
                "name": "Sandy Soil",
                "description": "Well-draining soil with large particles",
                "characteristics": ["Excellent drainage", "Easy to work", "Low water retention"],
                "best_crops": ["Maize", "Barley", "Millets"]
            },
            {
                "name": "Clayey Soil",
                "description": "Fine particles with high water retention",
                "characteristics": ["High water retention", "Rich in nutrients", "Poor drainage"],
                "best_crops": ["Paddy", "Wheat", "Sugarcane"]
            }
        ]
    }

@router.get("/health-indicators")
async def get_soil_health_indicators():
    """
    Get soil health indicators and their optimal ranges
    """
    return {
        "indicators": {
            "ph_level": {
                "optimal_range": "6.0-7.5",
                "description": "Measure of soil acidity/alkalinity",
                "impact": "Affects nutrient availability"
            },
            "organic_matter": {
                "optimal_range": "3-5%",
                "description": "Decomposed plant and animal material",
                "impact": "Improves soil structure and fertility"
            },
            "nitrogen": {
                "optimal_range": "20-40 kg/ha",
                "description": "Essential for plant growth and chlorophyll",
                "impact": "Promotes vegetative growth"
            },
            "phosphorous": {
                "optimal_range": "10-25 kg/ha",
                "description": "Important for root development",
                "impact": "Enhances flowering and fruiting"
            },
            "potassium": {
                "optimal_range": "15-30 kg/ha",
                "description": "Helps in water regulation and disease resistance",
                "impact": "Improves overall plant health"
            }
        }
    }

def get_soil_characteristics(soil_type: str) -> Dict[str, Any]:
    """Get detailed characteristics for a soil type"""
    
    characteristics = {
        "black soil": {
            "texture": "Clay",
            "drainage": "Poor to moderate",
            "water_retention": "High",
            "ph_range": "7.0-8.5",
            "fertility": "High",
            "best_crops": ["Cotton", "Sugarcane", "Wheat", "Jowar"],
            "challenges": ["Waterlogging in monsoon", "Cracking in dry season"],
            "management": ["Improve drainage", "Add organic matter", "Timely irrigation"]
        },
        "red soil": {
            "texture": "Sandy to clay loam",
            "drainage": "Good",
            "water_retention": "Moderate",
            "ph_range": "5.5-6.5",
            "fertility": "Moderate",
            "best_crops": ["Cotton", "Tobacco", "Millets", "Groundnut"],
            "challenges": ["Acidity", "Iron toxicity", "Leaching of nutrients"],
            "management": ["Lime application", "Organic matter addition", "Balanced fertilization"]
        },
        "laterite soil": {
            "texture": "Clay",
            "drainage": "Good",
            "water_retention": "Low to moderate",
            "ph_range": "5.0-6.0",
            "fertility": "Low to moderate",
            "best_crops": ["Cashew", "Coconut", "Tapioca", "Rice with irrigation"],
            "challenges": ["High acidity", "Iron and aluminum toxicity", "Low fertility"],
            "management": ["Heavy liming", "Organic matter", "Green manuring"]
        },
        "sandy soil": {
            "texture": "Sand",
            "drainage": "Excellent",
            "water_retention": "Low",
            "ph_range": "6.0-7.0",
            "fertility": "Low to moderate",
            "best_crops": ["Maize", "Barley", "Millets", "Watermelon"],
            "challenges": ["Nutrient leaching", "Low water retention", "Wind erosion"],
            "management": ["Organic matter addition", "Frequent irrigation", "Windbreaks"]
        },
        "clayey soil": {
            "texture": "Clay",
            "drainage": "Poor",
            "water_retention": "Very high",
            "ph_range": "6.5-7.5",
            "fertility": "High",
            "best_crops": ["Paddy", "Wheat", "Sugarcane", "Jute"],
            "challenges": ["Waterlogging", "Compaction", "Poor aeration"],
            "management": ["Drainage improvement", "Avoid cultivation when wet", "Organic matter"]
        }
    }
    
    soil_key = soil_type.lower()
    return characteristics.get(soil_key, {})

def get_soil_management_tips(soil_type: str) -> List[str]:
    """Get management tips for specific soil type"""
    
    tips = {
        "black soil": [
            "Ensure proper drainage during monsoon",
            "Use deep plowing to break hardpan",
            "Apply gypsum to improve soil structure",
            "Practice crop rotation with legumes",
            "Avoid cultivation when soil is too wet"
        ],
        "red soil": [
            "Apply lime to correct acidity",
            "Use phosphatic fertilizers regularly",
            "Add organic matter to improve fertility",
            "Practice contour farming on slopes",
            "Use green manure crops"
        ],
        "laterite soil": [
            "Heavy lime application needed",
            "Use organic fertilizers extensively",
            "Practice green manuring",
            "Ensure adequate irrigation",
            "Use acid-tolerant crop varieties"
        ],
        "sandy soil": [
            "Add organic matter regularly",
            "Use frequent, light irrigation",
            "Apply fertilizers in split doses",
            "Plant cover crops to prevent erosion",
            "Use mulching to retain moisture"
        ],
        "clayey soil": [
            "Improve drainage systems",
            "Add organic matter to improve structure",
            "Avoid working when soil is wet",
            "Use raised bed cultivation",
            "Practice minimum tillage"
        ]
    }
    
    soil_key = soil_type.lower()
    return tips.get(soil_key, ["Regular soil testing recommended", "Consult local agricultural extension"])

def calculate_soil_health_score(ph=None, organic_matter=None, nitrogen=None, phosphorous=None, potassium=None) -> float:
    """Calculate overall soil health score"""
    
    scores = []
    
    # pH score (optimal range 6.0-7.5)
    if ph is not None:
        if 6.0 <= ph <= 7.5:
            ph_score = 100
        elif 5.5 <= ph < 6.0 or 7.5 < ph <= 8.0:
            ph_score = 80
        elif 5.0 <= ph < 5.5 or 8.0 < ph <= 8.5:
            ph_score = 60
        else:
            ph_score = 40
        scores.append(ph_score)
    
    # Organic matter score (optimal >3%)
    if organic_matter is not None:
        if organic_matter >= 3:
            om_score = 100
        elif organic_matter >= 2:
            om_score = 80
        elif organic_matter >= 1:
            om_score = 60
        else:
            om_score = 40
        scores.append(om_score)
    
    # Nitrogen score (optimal 20-40)
    if nitrogen is not None:
        if 20 <= nitrogen <= 40:
            n_score = 100
        elif 15 <= nitrogen < 20 or 40 < nitrogen <= 50:
            n_score = 80
        elif 10 <= nitrogen < 15 or 50 < nitrogen <= 60:
            n_score = 60
        else:
            n_score = 40
        scores.append(n_score)
    
    # Similar scoring for P and K
    if phosphorous is not None:
        if 10 <= phosphorous <= 25:
            p_score = 100
        elif 8 <= phosphorous < 10 or 25 < phosphorous <= 30:
            p_score = 80
        elif 5 <= phosphorous < 8 or 30 < phosphorous <= 35:
            p_score = 60
        else:
            p_score = 40
        scores.append(p_score)
    
    if potassium is not None:
        if 15 <= potassium <= 30:
            k_score = 100
        elif 10 <= potassium < 15 or 30 < potassium <= 40:
            k_score = 80
        elif 5 <= potassium < 10 or 40 < potassium <= 50:
            k_score = 60
        else:
            k_score = 40
        scores.append(k_score)
    
    return sum(scores) / len(scores) if scores else 0.0

def analyze_nutrients(nitrogen=None, phosphorous=None, potassium=None) -> Dict[str, Any]:
    """Analyze nutrient levels"""
    
    analysis = {}
    
    if nitrogen is not None:
        if nitrogen < 15:
            analysis['nitrogen'] = {"status": "Low", "recommendation": "Apply nitrogen fertilizers"}
        elif nitrogen > 50:
            analysis['nitrogen'] = {"status": "High", "recommendation": "Reduce nitrogen application"}
        else:
            analysis['nitrogen'] = {"status": "Optimal", "recommendation": "Maintain current levels"}
    
    if phosphorous is not None:
        if phosphorous < 8:
            analysis['phosphorous'] = {"status": "Low", "recommendation": "Apply phosphatic fertilizers"}
        elif phosphorous > 35:
            analysis['phosphorous'] = {"status": "High", "recommendation": "Reduce phosphorous application"}
        else:
            analysis['phosphorous'] = {"status": "Optimal", "recommendation": "Maintain current levels"}
    
    if potassium is not None:
        if potassium < 10:
            analysis['potassium'] = {"status": "Low", "recommendation": "Apply potassic fertilizers"}
        elif potassium > 50:
            analysis['potassium'] = {"status": "High", "recommendation": "Reduce potassium application"}
        else:
            analysis['potassium'] = {"status": "Optimal", "recommendation": "Maintain current levels"}
    
    return analysis

def generate_soil_recommendations(health_score: float, nutrient_analysis: Dict, ph_level: Optional[float]) -> List[str]:
    """Generate soil management recommendations"""
    
    recommendations = []
    
    if health_score < 60:
        recommendations.append("Soil health needs significant improvement")
        recommendations.append("Consider comprehensive soil testing")
    elif health_score < 80:
        recommendations.append("Soil health is moderate - some improvements needed")
    else:
        recommendations.append("Soil health is good - maintain current practices")
    
    # pH recommendations
    if ph_level is not None:
        if ph_level < 6.0:
            recommendations.append("Apply lime to increase pH")
        elif ph_level > 8.0:
            recommendations.append("Apply sulfur or organic matter to reduce pH")
    
    # Nutrient-specific recommendations
    for nutrient, analysis in nutrient_analysis.items():
        if analysis['status'] != 'Optimal':
            recommendations.append(f"{nutrient.title()}: {analysis['recommendation']}")
    
    return recommendations

def get_improvement_suggestions(health_score: float, nutrient_analysis: Dict) -> List[str]:
    """Get specific improvement suggestions"""
    
    suggestions = []
    
    if health_score < 70:
        suggestions.extend([
            "Add organic compost or well-rotted manure",
            "Practice crop rotation with legumes",
            "Use cover crops during fallow periods",
            "Implement conservation tillage practices"
        ])
    
    # Add specific suggestions based on nutrient deficiencies
    deficient_nutrients = [k for k, v in nutrient_analysis.items() if v['status'] == 'Low']
    
    if 'nitrogen' in deficient_nutrients:
        suggestions.append("Consider green manuring with nitrogen-fixing crops")
    
    if 'phosphorous' in deficient_nutrients:
        suggestions.append("Apply rock phosphate or bone meal for long-term P availability")
    
    if 'potassium' in deficient_nutrients:
        suggestions.append("Use wood ash or potassium sulfate for K supplementation")
    
    return suggestions[:6]  # Return max 6 suggestions