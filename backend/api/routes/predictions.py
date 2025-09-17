from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..models.schemas import PredictionHistory, PredictionRequest
from ..services.ml_models import get_ml_service

router = APIRouter()

class PredictionHistoryResponse(BaseModel):
    predictions: List[Dict[str, Any]]
    total_count: int
    page: int
    per_page: int

class PredictionStatsResponse(BaseModel):
    total_predictions: int
    crop_predictions: int
    soil_classifications: int
    most_recommended_crop: str
    most_classified_soil: str
    accuracy_stats: Dict[str, float]

# In-memory storage for demo (in production, use a database)
prediction_history = []

@router.get("/history", response_model=PredictionHistoryResponse)
async def get_prediction_history(
    page: int = 1,
    per_page: int = 10,
    prediction_type: Optional[str] = None
):
    """
    Get user's prediction history with pagination
    """
    try:
        # Filter by prediction type if specified
        filtered_predictions = prediction_history
        if prediction_type:
            filtered_predictions = [
                p for p in prediction_history 
                if p.get('type') == prediction_type
            ]
        
        # Pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_predictions = filtered_predictions[start_idx:end_idx]
        
        return PredictionHistoryResponse(
            predictions=paginated_predictions,
            total_count=len(filtered_predictions),
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History fetch error: {str(e)}")

@router.post("/crop")
async def create_crop_prediction(
    request: dict,
    ml_service = Depends(get_ml_service)
):
    """
    Create a new crop prediction and save to history
    """
    try:
        # Make prediction using ML service
        prediction_result = await ml_service.predict_crop(
            temperature=request['temperature'],
            humidity=request['humidity'],
            moisture=request['moisture'],
            soil_type=request['soil_type'],
            nitrogen=request['nitrogen'],
            potassium=request['potassium'],
            phosphorous=request['phosphorous']
        )
        
        if 'error' in prediction_result:
            raise HTTPException(status_code=400, detail=prediction_result['error'])
        
        # Save to history
        history_entry = {
            "id": str(uuid.uuid4()),
            "type": "crop_prediction",
            "input_data": request,
            "result": prediction_result,
            "timestamp": datetime.now().isoformat(),
            "accuracy": prediction_result.get('confidence', 0.0)
        }
        
        prediction_history.append(history_entry)
        
        return {
            "prediction_id": history_entry["id"],
            "result": prediction_result,
            "saved_to_history": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/soil")
async def create_soil_prediction(
    image_data: dict,  # In real implementation, this would be image file handling
    ml_service = Depends(get_ml_service)
):
    """
    Create a new soil classification prediction and save to history
    """
    try:
        # For demo purposes, create mock soil classification
        prediction_result = {
            "predicted_soil_type": "Black Soil",
            "confidence": 0.89,
            "all_probabilities": {
                "Black Soil": 0.89,
                "Red Soil": 0.06,
                "Sandy Soil": 0.03,
                "Clayey Soil": 0.01,
                "Laterite Soil": 0.01
            }
        }
        
        # Save to history
        history_entry = {
            "id": str(uuid.uuid4()),
            "type": "soil_classification",
            "input_data": {"image_uploaded": True, "file_name": image_data.get("filename", "unknown")},
            "result": prediction_result,
            "timestamp": datetime.now().isoformat(),
            "accuracy": prediction_result.get('confidence', 0.0)
        }
        
        prediction_history.append(history_entry)
        
        return {
            "prediction_id": history_entry["id"],
            "result": prediction_result,
            "saved_to_history": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Soil prediction error: {str(e)}")

@router.get("/stats", response_model=PredictionStatsResponse)
async def get_prediction_stats():
    """
    Get statistics about user's predictions
    """
    try:
        total_predictions = len(prediction_history)
        crop_predictions = len([p for p in prediction_history if p['type'] == 'crop_prediction'])
        soil_classifications = len([p for p in prediction_history if p['type'] == 'soil_classification'])
        
        # Most recommended crop
        crop_results = [p['result']['recommended_crop'] for p in prediction_history if p['type'] == 'crop_prediction']
        most_recommended_crop = max(set(crop_results), key=crop_results.count) if crop_results else "None"
        
        # Most classified soil
        soil_results = [p['result']['predicted_soil_type'] for p in prediction_history if p['type'] == 'soil_classification']
        most_classified_soil = max(set(soil_results), key=soil_results.count) if soil_results else "None"
        
        # Accuracy stats
        accuracies = [p['accuracy'] for p in prediction_history if 'accuracy' in p]
        avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0.0
        
        accuracy_stats = {
            "average_accuracy": round(avg_accuracy, 3),
            "high_confidence_predictions": len([a for a in accuracies if a > 0.8]),
            "total_predictions_with_accuracy": len(accuracies)
        }
        
        return PredictionStatsResponse(
            total_predictions=total_predictions,
            crop_predictions=crop_predictions,
            soil_classifications=soil_classifications,
            most_recommended_crop=most_recommended_crop,
            most_classified_soil=most_classified_soil,
            accuracy_stats=accuracy_stats
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats error: {str(e)}")

@router.get("/{prediction_id}")
async def get_prediction_details(prediction_id: str):
    """
    Get detailed information about a specific prediction
    """
    try:
        prediction = next((p for p in prediction_history if p['id'] == prediction_id), None)
        
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")
        
        return prediction
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detail fetch error: {str(e)}")

@router.delete("/{prediction_id}")
async def delete_prediction(prediction_id: str):
    """
    Delete a specific prediction from history
    """
    try:
        global prediction_history
        original_count = len(prediction_history)
        prediction_history = [p for p in prediction_history if p['id'] != prediction_id]
        
        if len(prediction_history) == original_count:
            raise HTTPException(status_code=404, detail="Prediction not found")
        
        return {"message": "Prediction deleted successfully", "prediction_id": prediction_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete error: {str(e)}")

@router.get("/export/csv")
async def export_predictions_csv():
    """
    Export prediction history as CSV
    """
    try:
        import io
        import csv
        from fastapi.responses import StreamingResponse
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['ID', 'Type', 'Timestamp', 'Result', 'Confidence'])
        
        # Write data
        for prediction in prediction_history:
            result_summary = prediction['result'].get('recommended_crop') or prediction['result'].get('predicted_soil_type')
            writer.writerow([
                prediction['id'],
                prediction['type'],
                prediction['timestamp'],
                result_summary,
                prediction.get('accuracy', 'N/A')
            ])
        
        output.seek(0)
        
        return StreamingResponse(
            io.StringIO(output.getvalue()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=predictions.csv"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")

@router.post("/batch")
async def create_batch_predictions(
    requests: List[dict],
    ml_service = Depends(get_ml_service)
):
    """
    Create multiple crop predictions in batch
    """
    try:
        results = []
        
        for request in requests:
            try:
                # Make prediction
                prediction_result = await ml_service.predict_crop(
                    temperature=request['temperature'],
                    humidity=request['humidity'],
                    moisture=request['moisture'],
                    soil_type=request['soil_type'],
                    nitrogen=request['nitrogen'],
                    potassium=request['potassium'],
                    phosphorous=request['phosphorous']
                )
                
                # Save to history
                history_entry = {
                    "id": str(uuid.uuid4()),
                    "type": "crop_prediction",
                    "input_data": request,
                    "result": prediction_result,
                    "timestamp": datetime.now().isoformat(),
                    "accuracy": prediction_result.get('confidence', 0.0)
                }
                
                prediction_history.append(history_entry)
                
                results.append({
                    "input": request,
                    "prediction": prediction_result,
                    "status": "success"
                })
                
            except Exception as e:
                results.append({
                    "input": request,
                    "error": str(e),
                    "status": "failed"
                })
        
        successful_predictions = len([r for r in results if r['status'] == 'success'])
        
        return {
            "total_requests": len(requests),
            "successful_predictions": successful_predictions,
            "failed_predictions": len(requests) - successful_predictions,
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

@router.get("/trends/monthly")
async def get_monthly_prediction_trends():
    """
    Get monthly prediction trends and patterns
    """
    try:
        from collections import defaultdict
        
        monthly_data = defaultdict(lambda: {"crop": 0, "soil": 0})
        
        for prediction in prediction_history:
            date = datetime.fromisoformat(prediction['timestamp'])
            month_key = date.strftime("%Y-%m")
            
            if prediction['type'] == 'crop_prediction':
                monthly_data[month_key]['crop'] += 1
            elif prediction['type'] == 'soil_classification':
                monthly_data[month_key]['soil'] += 1
        
        trends = [
            {
                "month": month,
                "crop_predictions": data['crop'],
                "soil_classifications": data['soil'],
                "total": data['crop'] + data['soil']
            }
            for month, data in sorted(monthly_data.items())
        ]
        
        return {
            "trends": trends,
            "total_months": len(trends)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trends error: {str(e)}")

@router.get("/recommendations/based-on-history")
async def get_recommendations_based_on_history():
    """
    Get personalized recommendations based on prediction history
    """
    try:
        if not prediction_history:
            return {
                "message": "No prediction history available",
                "recommendations": [
                    "Start by making crop predictions to get personalized recommendations",
                    "Upload soil images for soil type classification",
                    "Use weather data to optimize farming decisions"
                ]
            }
        
        # Analyze prediction patterns
        crop_predictions = [p for p in prediction_history if p['type'] == 'crop_prediction']
        
        recommendations = []
        
        if crop_predictions:
            # Most common input conditions
            avg_temp = sum(p['input_data']['temperature'] for p in crop_predictions) / len(crop_predictions)
            avg_humidity = sum(p['input_data']['humidity'] for p in crop_predictions) / len(crop_predictions)
            
            recommendations.append(f"Based on your farming conditions (avg temp: {avg_temp:.1f}°C, humidity: {avg_humidity:.1f}%), consider diversifying with heat/humidity tolerant crops")
            
            # Most recommended crops
            recommended_crops = [p['result']['recommended_crop'] for p in crop_predictions]
            most_common_crop = max(set(recommended_crops), key=recommended_crops.count)
            recommendations.append(f"You frequently get recommendations for {most_common_crop}. Consider crop rotation with legumes to improve soil health")
            
            # Confidence analysis
            confidences = [p['accuracy'] for p in crop_predictions]
            avg_confidence = sum(confidences) / len(confidences)
            
            if avg_confidence < 0.7:
                recommendations.append("Consider getting detailed soil testing to improve prediction accuracy")
            else:
                recommendations.append("Your input data quality is good, leading to reliable predictions")
        
        # General recommendations
        recommendations.extend([
            "Monitor weather patterns regularly for optimal planting decisions",
            "Keep track of soil health through periodic testing",
            "Consider sustainable farming practices like organic fertilizers"
        ])
        
        return {
            "personalized_recommendations": recommendations[:5],
            "based_on_predictions": len(prediction_history),
            "analysis_date": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendations error: {str(e)}")