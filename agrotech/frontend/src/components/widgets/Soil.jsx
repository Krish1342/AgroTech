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
