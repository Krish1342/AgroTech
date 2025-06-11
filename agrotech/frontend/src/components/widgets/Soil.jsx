import Card from "../Card";
import React from 'react';

export default function Weather() {
  return (
    <Card title="Soil Conditions">
      <div className="text-gray-700">
        <p>
            🌱 Soil Moisture: 45% (Optimal for growth)
        </p>
        <p>
            🌡️ Soil Temperature: 75°F (Ideal for root development)
        </p>
        <p>
            🧪 Soil pH: 6.5 (Slightly acidic, suitable for most crops)
        </p>
        <p>
            🌾 Nutrient Levels: Nitrogen: 30 ppm, Phosphorus: 20 ppm, Potassium: 25 ppm</p>
        <p>
            🌍 Soil Type: Loamy (Best for water retention and nutrient availability)
        </p>
        <p>
            🌧️ Recent Rainfall: 0.5 inches in the last 24 hours
        </p>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Historical Trends:
          </p>
          <div className="h-16 bg-gradient-to-r from-blue-200 to-blue-500 rounded-lg mt-1"></div>
        </div>
      </div>
    </Card>
  );
}
