from fastapi import FastAPI, Query
from pydantic import BaseModel
import os
from thingspeak_client import get_model_input_dict, get_recommendations

app = FastAPI(title="Agrotech Demo API")

class RecommendResponse(BaseModel):
    fertilizer_rec: str
    crop_suggestion: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/demo/input")
def demo_input():
    """
    Return latest sensor-like inputs fetched from ThingSpeak (N,P,K,Moisture,pH,temp + optional weather)
    """
    data = get_model_input_dict()
    return {"data": data}

@app.get("/demo/recommend", response_model=RecommendResponse)
def demo_recommend(write_back: bool = Query(False, description="If true, push recommendations to Recommendation Channel")):
    """
    Compute recommendations using ThingSpeak feed and optional write-back.
    """
    rec = get_recommendations(write_back=write_back)
    return {"fertilizer_rec": rec.get("fertilizer_rec"), "crop_suggestion": rec.get("crop_suggestion")}

if __name__ == "__main__":
    # Quick local run: python demo_api.py
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("demo_api:app", host=host, port=port, reload=False)