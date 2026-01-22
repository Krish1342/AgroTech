# ThingSpeak IoT Integration Setup Guide

This guide will help you set up ThingSpeak integration for real-time sensor monitoring in your AgroTech application.

## 📋 Prerequisites

- A ThingSpeak account (free at [thingspeak.com](https://thingspeak.com))
- Python 3.8+ installed
- Node.js 16+ installed
- OpenWeatherMap API key (for temperature data)

## 🚀 Quick Setup

### Step 1: Create ThingSpeak Channel

1. Go to [ThingSpeak](https://thingspeak.com) and sign up/login
2. Click on **"Channels"** → **"New Channel"**
3. Configure your channel:
   - **Name**: AgroTech Sensor Node
   - **Field 1**: Nitrogen (N)
   - **Field 2**: Phosphorus (P)
   - **Field 3**: Potassium (K)
   - **Field 4**: Soil Moisture
   - **Field 5**: pH Level
   - ~~**Field 6**: Temperature~~ ❌ **NOT NEEDED** - Temperature comes from Weather API
4. Click **"Save Channel"**

### Step 2: Get API Keys

1. In your channel, go to **"API Keys"** tab
2. Copy your:
   - **Channel ID** (at the top)
   - **Read API Key** (for fetching data)
   - **Write API Key** (for sending data)

### Step 3: Configure Backend

1. Navigate to `backend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your credentials:

   ```env
   # ThingSpeak Configuration (5 fields only)
   THINGSPEAK_CHANNEL_ID=your_channel_id
   THINGSPEAK_READ_API_KEY=your_read_api_key
   THINGSPEAK_WRITE_API_KEY=your_write_api_key
   THINGSPEAK_MODEL_FIELDS=1,2,3,4,5

   # OpenWeatherMap (for temperature data)
   OPENWEATHER_API_KEY=your_openweather_api_key

   # Default location for weather data
   DEFAULT_LATITUDE=28.6139
   DEFAULT_LONGITUDE=77.2090
   ```

### Step 4: Populate Demo Data

**Important:** Before testing, populate your channel with demo data to ensure visualization works even if WiFi module fails:

```bash
cd backend
python populate_demo_data.py
```

Choose one of three options:

1. **Custom populate**: Choose how many entries per soil profile (recommended: 2-3)
2. **Quick populate**: Sends 1 entry from each of 8 different soil profiles
3. **Continuous mode**: Keeps sending random data every 15 seconds

**Recommended:** Use option 1 and enter "2" to get 16 demo entries covering various soil conditions.

### Step 5: Test the Integration

1. Start the backend server:

   ```bash
   cd backend
   python main.py
   ```

2. Test the API endpoints:

   ```bash
   # Get current sensor data (includes weather temperature)
   curl http://localhost:8000/api/thingspeak/current

   # Get historical data
   curl http://localhost:8000/api/thingspeak/historical?results=15

   # Get recommendations
   curl http://localhost:8000/api/thingspeak/recommendations

   # Check device status
   curl http://localhost:8000/api/thingspeak/device-status
   ```

### Step 6: Start Frontend

1. Navigate to frontend folder:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`
3. Login and navigate to Dashboard → My Field

## 📊 Sensor Data Structure

### ThingSpeak Fields (5 only)

- **Field 1**: Nitrogen (N) - kg/ha
- **Field 2**: Phosphorus (P) - kg/ha
- **Field 3**: Potassium (K) - kg/ha
- **Field 4**: Soil Moisture - %
- **Field 5**: pH Level - 0-14 scale

### Weather API (Temperature)

- Temperature is fetched from OpenWeatherMap API
- Uses location configured in `DEFAULT_LATITUDE` and `DEFAULT_LONGITUDE`
- No sensor needed for temperature measurement

## 📊 Sending Data to ThingSpeak

### Option 1: Populate Demo Data (Recommended First)

Use the demo data populator to ensure there's always data for visualization:

```bash
python populate_demo_data.py
```

This includes 8 different soil profiles:

- 🌟 Nutrient-Rich Soil
- 🔵 Nitrogen-Deficient Soil
- 🟠 Phosphorus-Deficient Soil
- 🏜️ Dry Soil Conditions
- 💧 Wet Soil Conditions
- 🧪 Acidic Soil
- ⚗️ Alkaline Soil
- ⚖️ Balanced Soil

### Option 2: Continuous Test Data

For continuous testing:

```bash
python send_test_data.py
```

This sends random realistic data every 15 seconds (respects ThingSpeak rate limits).

### Option 3: ThingSpeak Web Interface

1. Go to your channel page
2. Click on **"API Request"** in the top navigation
3. Use the URL format:
   ```
   https://api.thingspeak.com/update?api_key=YOUR_WRITE_API_KEY&field1=45&field2=25&field3=35&field4=65&field5=6.8
   ```

### Option 4: Arduino/ESP32 (Real Hardware)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* writeAPIKey = "YOUR_WRITE_API_KEY";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Read sensor values (replace with actual sensor readings)
    float nitrogen = 45.0;
    float phosphorus = 25.0;
    float potassium = 35.0;
    float moisture = 65.0;
    float ph = 6.8;
    // Note: Temperature comes from Weather API, not sensor

    String url = "https://api.thingspeak.com/update?api_key=" + String(writeAPIKey) +
                 "&field1=" + String(nitrogen) +
                 "&field2=" + String(phosphorus) +
                 "&field3=" + String(potassium) +
                 "&field4=" + String(moisture) +
                 "&field5=" + String(ph);

    http.begin(url);
    int httpCode = http.GET();

    if (httpCode > 0) {
      Serial.println("Data sent successfully");
    }

    http.end();
  }

  delay(15000); // Wait 15 seconds (ThingSpeak rate limit)
}
```

## 🎯 Features

### Real-Time Monitoring

- Live sensor data updates every 30 seconds
- Visual charts showing NPK nutrient trends
- Environmental conditions (moisture, pH)
- **Temperature from weather API** (not sensor)
- Trend indicators (increasing/decreasing/stable)

### Smart Recommendations

- **Fertilizer Recommendations**: Based on current NPK levels
- **Crop Suggestions**: Optimized for your soil conditions
- **Actionable Advice**: Step-by-step fertilization guidelines
- **Soil Health Assessment**: Real-time pH and moisture analysis
- **Weather-aware**: Temperature considerations in recommendations

### Dashboard Features

- Single device view (simplified from multi-field)
- Device connection status indicator
- Real-time data refresh button
- Quick access to detailed analytics

## 📱 UI Components

### Dashboard Page

- Shows connected device status
- Displays live sensor readings (N, P, K, Moisture, pH, Temperature\*)
- Single field card with real-time data
- Quick action buttons
- \*Temperature sourced from weather API

### Field Details Page

- Real-time sensor data with color-coded indicators
- Historical trends charts (last 10 readings)
- 15-reading averages for each parameter
- Comprehensive recommendations section
- Fertilizer and crop suggestions
- Actionable steps for soil improvement

## 🔧 Troubleshooting

### No Data Showing

1. Check ThingSpeak API keys in `.env` file
2. Verify channel has data (check ThingSpeak dashboard)
3. Check OpenWeatherMap API key is valid
4. Check backend console for errors
5. Test API endpoint: `curl http://localhost:8000/api/thingspeak/current`

### "Device Disconnected" Status

- Means no recent data in ThingSpeak channel
- Run `python populate_demo_data.py` to add demo data
- Or use `python send_test_data.py` for continuous data
- Check that field mappings are correct in `.env` (only 5 fields)

### Temperature Not Showing

- Verify `OPENWEATHER_API_KEY` is set in `.env`
- Check `DEFAULT_LATITUDE` and `DEFAULT_LONGITUDE` are correct
- Backend will use fallback temperature (25°C) if weather API fails
- Check backend logs for weather API errors

### API Rate Limits

- ThingSpeak free tier: 1 update every 15 seconds
- Frontend auto-refreshes every 30 seconds (safe)
- Demo data populator respects 15-second limit
- For faster updates, consider ThingSpeak license upgrade

## 📚 API Endpoints

### `GET /api/thingspeak/current`

Returns the latest sensor reading with temperature from weather API

### `GET /api/thingspeak/historical?results=15`

Returns last N readings with averages and trends

### `GET /api/thingspeak/recommendations`

Returns smart fertilizer and crop recommendations (uses weather temperature)

### `GET /api/thingspeak/device-status`

Returns device connection status

## 🌟 Recommendation Logic

The system provides intelligent recommendations based on:

### Fertilizer Logic

- **Nitrogen < 30**: High-N fertilizer (Urea)
- **Nitrogen > 80**: Skip nitrogen fertilizers
- **Phosphorus < 15**: High-P fertilizer (DAP)
- **Potassium < 20**: Potassium fertilizer (MOP)
- **All optimal**: Balanced NPK maintenance

### Crop Suggestions

- **High N, Low P/K**: Leafy vegetables (Spinach, Lettuce)
- **High P & K**: Fruiting crops (Tomatoes, Peppers)
- **Low N, High P**: Root vegetables (Potatoes, Carrots)
- **Balanced**: Cereals (Wheat, Rice, Maize)
- **Very high nutrients**: Heavy feeders (Pumpkin, Squash)

### Soil Health

- **pH 6.0-7.5**: Optimal
- **pH < 5.5**: Add lime to reduce acidity
- **pH > 8.0**: Add sulfur to reduce alkalinity
- **Moisture < 30%**: Increase irrigation
- **Moisture > 80%**: Improve drainage
- **Temperature considerations**: From weather API

## 🎨 Customization

### Changing Default Location

Edit `backend/.env`:

```env
DEFAULT_LATITUDE=your_latitude
DEFAULT_LONGITUDE=your_longitude
```

### Adjusting Refresh Rate

Edit `frontend/src/pages/FieldDetailsPage.jsx`:

```javascript
// Change from 30000 (30s) to desired milliseconds
const interval = setInterval(() => {
  fetchData(true);
}, 60000); // 60 seconds
```

### Customizing Recommendations

Edit `backend/api/routes/thingspeak.py` in the `get_smart_recommendations` function to adjust thresholds and logic.

## 📞 Support

For issues or questions:

1. Check ThingSpeak documentation: https://www.mathworks.com/help/thingspeak/
2. Check OpenWeatherMap docs: https://openweathermap.org/api
3. Review backend logs: `python main.py`
4. Check browser console for frontend errors
5. Verify all API keys are correct

## 🎉 Key Changes from Standard Setup

### ⚠️ Important Differences

1. **Only 5 ThingSpeak Fields**: No temperature sensor needed
2. **Temperature from Weather API**: Uses OpenWeatherMap instead
3. **Location Configuration**: Set `DEFAULT_LATITUDE` and `DEFAULT_LONGITUDE`
4. **Demo Data Available**: Use `populate_demo_data.py` for offline visualization
5. **Fallback Temperature**: System works even if weather API fails (uses 25°C default)

## 🎉 Next Steps

1. ✅ Populate demo data: `python populate_demo_data.py`
2. ✅ Test with continuous data: `python send_test_data.py`
3. ✅ Connect real IoT sensors (if available)
4. ✅ Configure weather API for your location
5. ✅ Set up automatic data collection
6. Configure alerts for abnormal values
7. Export historical data for analysis
8. Train custom ML models with collected data

Happy farming! 🌾🚜
