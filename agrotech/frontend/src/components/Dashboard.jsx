import Weather from "./widgets/Weather";
import React from 'react';
import Soil from "./widgets/Soil";


export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-100 min-h-screen">
      <div className="space-y-6">
        <Weather />
        <Soil />
        
      </div>
    </div>
  );
}
