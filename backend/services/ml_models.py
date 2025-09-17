import pandas as pd
import numpy as np
import pickle
import joblib
import os
from typing import Dict, List, Any, Optional, Tuple
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLModelService:
    """
    Service for loading and using trained ML models for predictions
    """
    
    def __init__(self):
        self.crop_model = None
        self.soil_model = None
        self.models_loaded = False
        self.model_paths = {
            'crop_recommendation': 'models/crop_recommendation_model.pkl',
            'soil_classification': 'models/soil_classification_model.h5'
        }
        self.scalers = {}
        self.label_encoders = {}
        
        # Sample data for demo mode when models aren't available
        self.crop_recommendations = {
            'rice': {'confidence': 0.85, 'growing_season': 'Kharif', 'water_requirement': 'High'},
            'wheat': {'confidence': 0.78, 'growing_season': 'Rabi', 'water_requirement': 'Medium'},
            'maize': {'confidence': 0.82, 'growing_season': 'Both', 'water_requirement': 'Medium'},
            'cotton': {'confidence': 0.75, 'growing_season': 'Kharif', 'water_requirement': 'Medium'},
            'sugarcane': {'confidence': 0.88, 'growing_season': 'Annual', 'water_requirement': 'High'},
            'barley': {'confidence': 0.72, 'growing_season': 'Rabi', 'water_requirement': 'Low'},
            'millet': {'confidence': 0.79, 'growing_season': 'Kharif', 'water_requirement': 'Low'},
            'pulses': {'confidence': 0.81, 'growing_season': 'Both', 'water_requirement': 'Medium'}
        }
        
        self.soil_types = ['Black Soil', 'Red Soil', 'Sandy Soil', 'Clayey Soil', 'Laterite Soil', 'Peat Soil', 'Cinder Soil', 'Yellow Soil']
    
    def load_models(self):
        """
        Load trained models from files
        """
        try:
            # Try to load crop recommendation model
            crop_model_path = self.model_paths['crop_recommendation']
            if os.path.exists(crop_model_path):
                with open(crop_model_path, 'rb') as f:
                    model_data = pickle.load(f)
                    self.crop_model = model_data.get('model')
                    self.scalers['crop'] = model_data.get('scaler')
                    self.label_encoders['crop'] = model_data.get('label_encoder')
                logger.info("Crop recommendation model loaded successfully")
            else:
                logger.warning(f"Crop model not found at {crop_model_path}, using demo mode")
            
            # Try to load soil classification model
            soil_model_path = self.model_paths['soil_classification']
            if os.path.exists(soil_model_path):
                # For TensorFlow/Keras models
                try:
                    import tensorflow as tf
                    self.soil_model = tf.keras.models.load_model(soil_model_path)
                    logger.info("Soil classification model loaded successfully")
                except ImportError:
                    logger.warning("TensorFlow not available, using demo mode for soil classification")
            else:
                logger.warning(f"Soil model not found at {soil_model_path}, using demo mode")
            
            self.models_loaded = True
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            logger.info("Continuing in demo mode")
            self.models_loaded = True
    
    async def predict_crop(
        self,
        temperature: float,
        humidity: float,
        moisture: float,
        soil_type: str,
        nitrogen: float,
        potassium: float,
        phosphorous: float
    ) -> Dict[str, Any]:
        """
        Predict recommended crop based on environmental conditions
        """
        try:
            # Prepare input features
            features = np.array([[
                nitrogen, phosphorous, potassium, temperature, 
                humidity, moisture, self._encode_soil_type(soil_type)
            ]])
            
            if self.crop_model and self.scalers.get('crop'):
                # Use actual trained model
                scaled_features = self.scalers['crop'].transform(features)
                prediction = self.crop_model.predict(scaled_features)
                
                if hasattr(self.crop_model, 'predict_proba'):
                    probabilities = self.crop_model.predict_proba(scaled_features)[0]
                    confidence = float(np.max(probabilities))
                else:
                    confidence = 0.85  # Default confidence
                
                # Decode prediction
                if self.label_encoders.get('crop'):
                    recommended_crop = self.label_encoders['crop'].inverse_transform([prediction[0]])[0]
                else:
                    recommended_crop = str(prediction[0])
            else:
                # Demo mode - use rule-based prediction
                recommended_crop, confidence = self._demo_crop_prediction(
                    temperature, humidity, moisture, soil_type, nitrogen, potassium, phosphorous
                )
            
            # Get additional crop information
            crop_info = self.crop_recommendations.get(recommended_crop, {
                'confidence': confidence,
                'growing_season': 'Unknown',
                'water_requirement': 'Medium'
            })
            
            return {
                'recommended_crop': recommended_crop,
                'confidence': confidence,
                'growing_season': crop_info.get('growing_season', 'Unknown'),
                'water_requirement': crop_info.get('water_requirement', 'Medium'),
                'prediction_factors': {
                    'temperature_suitability': self._temperature_suitability(temperature, recommended_crop),
                    'humidity_suitability': self._humidity_suitability(humidity, recommended_crop),
                    'soil_suitability': self._soil_suitability(soil_type, recommended_crop),
                    'nutrient_balance': self._nutrient_balance(nitrogen, phosphorous, potassium)
                },
                'alternative_crops': self._get_alternative_crops(recommended_crop),
                'model_version': '1.0-demo' if not self.crop_model else '1.0-trained'
            }
            
        except Exception as e:
            logger.error(f"Crop prediction error: {str(e)}")
            return {'error': f'Prediction failed: {str(e)}'}
    
    async def classify_soil(self, image_path: str) -> Dict[str, Any]:
        """
        Classify soil type from image
        """
        try:
            if self.soil_model:
                # Use actual trained model
                # Image preprocessing would go here
                # For demo, return mock prediction
                pass
            
            # Demo mode - return mock classification
            predicted_soil = np.random.choice(self.soil_types)
            confidence = np.random.uniform(0.7, 0.95)
            
            # Generate probability distribution
            probabilities = {}
            remaining_prob = 1.0 - confidence
            for soil_type in self.soil_types:
                if soil_type == predicted_soil:
                    probabilities[soil_type] = confidence
                else:
                    probabilities[soil_type] = remaining_prob / (len(self.soil_types) - 1)
            
            return {
                'predicted_soil_type': predicted_soil,
                'confidence': round(confidence, 3),
                'all_probabilities': {k: round(v, 3) for k, v in probabilities.items()},
                'soil_characteristics': self._get_soil_characteristics(predicted_soil),
                'recommended_crops': self._get_crops_for_soil(predicted_soil),
                'model_version': '1.0-demo' if not self.soil_model else '1.0-trained'
            }
            
        except Exception as e:
            logger.error(f"Soil classification error: {str(e)}")
            return {'error': f'Classification failed: {str(e)}'}
    
    def _encode_soil_type(self, soil_type: str) -> int:
        """
        Encode soil type to numeric value
        """
        soil_mapping = {
            'Black Soil': 0, 'Red Soil': 1, 'Sandy Soil': 2, 'Clayey Soil': 3,
            'Laterite Soil': 4, 'Peat Soil': 5, 'Cinder Soil': 6, 'Yellow Soil': 7
        }
        return soil_mapping.get(soil_type, 0)
    
    def _demo_crop_prediction(
        self, temperature: float, humidity: float, moisture: float, 
        soil_type: str, nitrogen: float, potassium: float, phosphorous: float
    ) -> Tuple[str, float]:
        """
        Demo crop prediction using rule-based logic
        """
        score_weights = {}
        
        for crop in self.crop_recommendations.keys():
            score = 0.0
            
            # Temperature scoring
            if crop in ['rice', 'cotton', 'sugarcane'] and temperature > 25:
                score += 0.3
            elif crop in ['wheat', 'barley'] and 15 <= temperature <= 25:
                score += 0.3
            elif crop == 'maize' and 20 <= temperature <= 30:
                score += 0.3
            
            # Humidity scoring
            if crop in ['rice', 'sugarcane'] and humidity > 70:
                score += 0.2
            elif crop in ['wheat', 'barley'] and humidity < 70:
                score += 0.2
            
            # Soil type scoring
            if crop == 'rice' and soil_type in ['Clayey Soil', 'Black Soil']:
                score += 0.2
            elif crop in ['wheat', 'barley'] and soil_type in ['Sandy Soil', 'Red Soil']:
                score += 0.2
            elif crop == 'cotton' and soil_type == 'Black Soil':
                score += 0.2
            
            # Nutrient scoring
            if nitrogen > 100:
                if crop in ['maize', 'sugarcane']:
                    score += 0.15
            if phosphorous > 50:
                if crop in ['wheat', 'barley', 'pulses']:
                    score += 0.1
            if potassium > 150:
                if crop in ['cotton', 'sugarcane']:
                    score += 0.05
            
            score_weights[crop] = min(score, 1.0)
        
        # Select crop with highest score
        best_crop = max(score_weights.items(), key=lambda x: x[1])
        confidence = 0.6 + (best_crop[1] * 0.3)  # Scale to reasonable confidence
        
        return best_crop[0], round(confidence, 3)
    
    def _temperature_suitability(self, temperature: float, crop: str) -> str:
        """
        Assess temperature suitability for crop
        """
        optimal_temps = {
            'rice': (25, 35), 'wheat': (15, 25), 'maize': (20, 30),
            'cotton': (25, 35), 'sugarcane': (26, 32), 'barley': (12, 25),
            'millet': (25, 35), 'pulses': (20, 30)
        }
        
        if crop in optimal_temps:
            min_temp, max_temp = optimal_temps[crop]
            if min_temp <= temperature <= max_temp:
                return 'Optimal'
            elif abs(temperature - min_temp) <= 5 or abs(temperature - max_temp) <= 5:
                return 'Suitable'
            else:
                return 'Suboptimal'
        
        return 'Unknown'
    
    def _humidity_suitability(self, humidity: float, crop: str) -> str:
        """
        Assess humidity suitability for crop
        """
        if crop in ['rice', 'sugarcane'] and humidity > 70:
            return 'Optimal'
        elif crop in ['wheat', 'barley', 'millet'] and 50 <= humidity <= 70:
            return 'Optimal'
        elif 40 <= humidity <= 80:
            return 'Suitable'
        else:
            return 'Suboptimal'
    
    def _soil_suitability(self, soil_type: str, crop: str) -> str:
        """
        Assess soil suitability for crop
        """
        soil_crop_mapping = {
            'rice': ['Clayey Soil', 'Black Soil'],
            'wheat': ['Sandy Soil', 'Red Soil', 'Black Soil'],
            'maize': ['Red Soil', 'Black Soil', 'Sandy Soil'],
            'cotton': ['Black Soil', 'Red Soil'],
            'sugarcane': ['Black Soil', 'Red Soil'],
            'barley': ['Sandy Soil', 'Red Soil'],
            'millet': ['Sandy Soil', 'Red Soil', 'Black Soil'],
            'pulses': ['Red Soil', 'Black Soil', 'Sandy Soil']
        }
        
        if crop in soil_crop_mapping and soil_type in soil_crop_mapping[crop]:
            return 'Optimal'
        else:
            return 'Suitable'
    
    def _nutrient_balance(self, nitrogen: float, phosphorous: float, potassium: float) -> str:
        """
        Assess nutrient balance
        """
        if nitrogen > 80 and phosphorous > 40 and potassium > 120:
            return 'High'
        elif nitrogen > 40 and phosphorous > 20 and potassium > 60:
            return 'Medium'
        else:
            return 'Low'
    
    def _get_alternative_crops(self, primary_crop: str) -> List[str]:
        """
        Get alternative crop recommendations
        """
        alternatives = {
            'rice': ['maize', 'wheat'],
            'wheat': ['barley', 'maize'],
            'maize': ['rice', 'millet'],
            'cotton': ['sugarcane', 'maize'],
            'sugarcane': ['cotton', 'rice'],
            'barley': ['wheat', 'millet'],
            'millet': ['maize', 'barley'],
            'pulses': ['wheat', 'maize']
        }
        
        return alternatives.get(primary_crop, ['maize', 'wheat'])
    
    def _get_soil_characteristics(self, soil_type: str) -> Dict[str, Any]:
        """
        Get characteristics of soil type
        """
        characteristics = {
            'Black Soil': {
                'ph_range': '6.5-8.5',
                'drainage': 'Poor to moderate',
                'fertility': 'High',
                'organic_matter': 'High',
                'water_retention': 'High'
            },
            'Red Soil': {
                'ph_range': '5.5-7.0',
                'drainage': 'Good',
                'fertility': 'Medium',
                'organic_matter': 'Low to medium',
                'water_retention': 'Medium'
            },
            'Sandy Soil': {
                'ph_range': '6.0-7.5',
                'drainage': 'Excellent',
                'fertility': 'Low',
                'organic_matter': 'Low',
                'water_retention': 'Low'
            },
            'Clayey Soil': {
                'ph_range': '6.5-8.0',
                'drainage': 'Poor',
                'fertility': 'High',
                'organic_matter': 'High',
                'water_retention': 'Very high'
            },
            'Laterite Soil': {
                'ph_range': '5.0-6.5',
                'drainage': 'Good',
                'fertility': 'Low',
                'organic_matter': 'Low',
                'water_retention': 'Low'
            }
        }
        
        return characteristics.get(soil_type, {
            'ph_range': '6.0-7.5',
            'drainage': 'Moderate',
            'fertility': 'Medium',
            'organic_matter': 'Medium',
            'water_retention': 'Medium'
        })
    
    def _get_crops_for_soil(self, soil_type: str) -> List[str]:
        """
        Get recommended crops for soil type
        """
        soil_crops = {
            'Black Soil': ['cotton', 'sugarcane', 'rice', 'wheat'],
            'Red Soil': ['maize', 'wheat', 'millet', 'pulses'],
            'Sandy Soil': ['millet', 'barley', 'wheat'],
            'Clayey Soil': ['rice', 'wheat', 'sugarcane'],
            'Laterite Soil': ['rice', 'maize', 'millet'],
            'Peat Soil': ['rice', 'vegetables'],
            'Cinder Soil': ['barley', 'millet'],
            'Yellow Soil': ['maize', 'rice', 'wheat']
        }
        
        return soil_crops.get(soil_type, ['maize', 'wheat', 'rice'])

# Global ML service instance
_ml_service = None

def get_ml_service() -> MLModelService:
    """
    Get or create ML service instance
    """
    global _ml_service
    if _ml_service is None:
        _ml_service = MLModelService()
        _ml_service.load_models()
    return _ml_service

# Initialize service on import
ml_service = get_ml_service()