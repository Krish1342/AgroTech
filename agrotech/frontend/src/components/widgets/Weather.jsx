import Card from "../Card";
import React from 'react';

export default function Weather() {
  return (
    <Card title="Weather Snapshot">
      <div className="text-gray-700">
        <p>🌡️ 85°F</p>
        <p>💧 81% humidity</p>
        <p>💨 6.5 mph wind</p>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Historical Trends:</p>
          <div className="h-16 bg-gradient-to-r from-blue-200 to-blue-500 rounded-lg mt-1"></div>
        </div>
      </div>
    </Card>
  );
}
