import os
import requests
from typing import Dict, Any, List, Optional

# Simple ThingSpeak client for reading latest feed fields
THINGSPEAK_CHANNEL_ID = os.getenv("THINGSPEAK_CHANNEL_ID")
THINGSPEAK_READ_API_KEY = os.getenv("THINGSPEAK_READ_API_KEY", "")
# Only 5 fields: N, P, K, Moisture, pH (temperature comes from weather API)
MODEL_FIELD_STR = os.getenv("THINGSPEAK_MODEL_FIELDS", "1,2,3,4,5")
MODEL_FIELDS = [int(x) for x in MODEL_FIELD_STR.split(",") if x.strip().isdigit()]
THINGSPEAK_RECOMMENDATION_CHANNEL_ID = os.getenv("THINGSPEAK_RECOMMENDATION_CHANNEL_ID")
THINGSPEAK_RECOMMENDATION_WRITE_API_KEY = os.getenv(
    "THINGSPEAK_RECOMMENDATION_WRITE_API_KEY", ""
)


def _safe_float(x: Any) -> Optional[float]:
    try:
        if x is None or x == "":
            return None
        return float(x)
    except Exception:
        return None


def get_latest_feed(
    channel_id: Optional[str] = None,
    read_key: Optional[str] = None,
    fields: Optional[List[int]] = None,
) -> Dict[int, Optional[float]]:
    """
    Returns a dict mapping field number -> numeric value (or None).
    Example: {1: 10.0, 2: 5.0, 3: 7.0, 4: 30.0, 5: 6.5}
    """
    channel_id = channel_id or THINGSPEAK_CHANNEL_ID
    read_key = read_key or THINGSPEAK_READ_API_KEY
    fields = fields or MODEL_FIELDS

    result = {f: None for f in fields}
    if not channel_id:
        return result

    url = f"https://api.thingspeak.com/channels/{channel_id}/feeds.json?results=1"
    if read_key:
        url += f"&api_key={read_key}"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        j = r.json()
        feeds = j.get("feeds") or []
        if not feeds:
            return result
        feed = feeds[0]
        for f in fields:
            key = f"field{f}"
            if key in feed:
                result[f] = _safe_float(feed.get(key))
    except requests.HTTPError as he:
        # keep logging minimal here; let caller decide what to do
        print(f"ThingSpeak HTTP error: {he}")
    except Exception as e:
        print(f"Error fetching ThingSpeak feed: {e}")
    return result


def get_model_input_dict() -> Dict[str, Any]:
    """
    Return a normalized dictionary suitable for your model/prediction code.
    Keys: 'N','P','K','Moisture','pH' (temperature from weather API, not sensor)
    """
    feed = get_latest_feed()
    mapping = {}
    # map MODEL_FIELDS in order to semantic names (5 fields only)
    names = ["N", "P", "K", "Moisture", "pH"]
    for idx, field_num in enumerate(MODEL_FIELDS):
        name = names[idx] if idx < len(names) else f"field{field_num}"
        mapping[name] = feed.get(field_num)

    return mapping


def get_recommendations(write_back: bool = False) -> Dict[str, Any]:
    """
    Compute fertilizer and crop recommendations from latest ThingSpeak feed.
    Rules:
      - Fertilizer:
          If N < 30 -> "High-N Fertilizer (e.g., Urea/20-10-10)."
          Else if P < 15 -> "High-P Fertilizer (e.g., DAP/10-30-10)."
          Else if K < 20 -> "High-K Fertilizer (e.g., MOP/10-10-20)."
          Else -> "Nutrient levels are optimal."
      - Crop:
          If P > N and K > N -> "Root/Fruiting Crops (e.g., Tomatoes, Potatoes)."
          Else -> "Grains/Cereals (e.g., Wheat, Corn)."

    If write_back=True and recommendation channel + key are present, post to ThingSpeak.
    Returns: {'fertilizer_rec': str, 'crop_suggestion': str}
    """
    # Read latest model fields (defaults to MODEL_FIELDS -> 1..6)
    feed = get_latest_feed()
    # Extract N,P,K (fields 1,2,3)
    N = feed.get(1)
    P = feed.get(2)
    K = feed.get(3)

    # Helper for numeric comparison (treat None as NaN)
    def is_number(x):
        return x is not None

    # Fertilizer rules
    fertilizer_rec = "Nutrient levels are optimal."
    if is_number(N) and N < 30:
        fertilizer_rec = "High-N Fertilizer (e.g., Urea/20-10-10)."
    elif is_number(P) and P < 15:
        fertilizer_rec = "High-P Fertilizer (e.g., DAP/10-30-10)."
    elif is_number(K) and K < 20:
        fertilizer_rec = "High-K Fertilizer (e.g., MOP/10-10-20)."

    # Crop rules
    crop_suggestion = "Grains/Cereals (e.g., Wheat, Corn)."
    if is_number(P) and is_number(K) and is_number(N) and (P > N) and (K > N):
        crop_suggestion = "Root/Fruiting Crops (e.g., Tomatoes, Potatoes)."

    rec = {"fertilizer_rec": fertilizer_rec, "crop_suggestion": crop_suggestion}

    # Optional: write back to Recommendation Channel (field1=fertilizer, field2=crop)
    if write_back:
        if (
            THINGSPEAK_RECOMMENDATION_CHANNEL_ID
            and THINGSPEAK_RECOMMENDATION_WRITE_API_KEY
        ):
            try:
                params = {
                    "api_key": THINGSPEAK_RECOMMENDATION_WRITE_API_KEY,
                    "field1": fertilizer_rec,
                    "field2": crop_suggestion,
                }
                r = requests.post(
                    "https://api.thingspeak.com/update", params=params, timeout=10
                )
                r.raise_for_status()
            except Exception as e:
                print(f"Failed to write recommendations to ThingSpeak: {e}")
        else:
            print(
                "Recommendation write-back skipped: recommendation channel or write key not configured."
            )

    return rec


# Example usage inside your backend route:
# from thingspeak_client import get_model_input_dict
# data = get_model_input_dict()
# features = [data['N'], data['P'], data['K'], data['Moisture'], data['pH'], data['temp']]
# pass `features` to your ML model (handle None / missing values as your model expects)
