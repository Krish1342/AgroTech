import React, { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Loader,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import config from "../config";

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    // Load default weather
    loadWeatherData(config.location.defaultLocation || "Delhi, India");
  }, []);

  const loadWeatherData = async (locationQuery) => {
    setLoading(true);
    setError("");

    try {
      // Load current weather by city
      const currentResponse = await api.getWeatherByCity(locationQuery);

      const mappedCurrent = {
        locationName: `${currentResponse.location?.name || "Unknown"}${
          currentResponse.location?.country
            ? ", " + currentResponse.location.country
            : ""
        }`,
        temperature: Math.round(currentResponse.current?.temperature ?? 0),
        feels_like: Math.round(currentResponse.current?.feels_like ?? 0),
        humidity: currentResponse.current?.humidity ?? null,
        wind_speed: currentResponse.current?.wind_speed ?? null, // km/h
        visibility: currentResponse.current?.visibility ?? null, // km
        condition: currentResponse.current?.condition ?? "",
        description: currentResponse.current?.description ?? "",
        icon: currentResponse.current?.icon ?? "",
        sunrise: currentResponse.current?.sunrise || null,
        sunset: currentResponse.current?.sunset || null,
        timestamp: currentResponse.timestamp,
        coordinates: currentResponse.location?.coordinates,
        agricultural_insights: currentResponse.agricultural_insights || null,
        data_source: currentResponse.data_source,
      };

      setCurrentWeather(mappedCurrent);

      // Load forecast using coordinates
      if (mappedCurrent.coordinates?.lat && mappedCurrent.coordinates?.lng) {
        const forecastResponse = await api.getWeatherForecast(
          mappedCurrent.coordinates.lat,
          mappedCurrent.coordinates.lng,
          5
        );
        setForecast(forecastResponse.forecast || []);
      } else {
        setForecast([]);
      }

      // Build alerts from agricultural insights
      const insights = mappedCurrent.agricultural_insights || {};
      const builtAlerts = [];
      (insights.alerts || []).forEach((msg) => {
        const lower = (msg || "").toLowerCase();
        let severity = "medium";
        if (
          lower.includes("frost") ||
          lower.includes("heavy") ||
          lower.includes("heat")
        ) {
          severity = "high";
        }
        builtAlerts.push({
          title: "Weather Alert",
          description: msg,
          severity,
          recommendation: null,
        });
      });
      (insights.recommendations || []).forEach((rec) => {
        builtAlerts.push({
          title: "Recommendation",
          description: rec,
          severity: "low",
          recommendation: rec,
        });
      });
      setAlerts(builtAlerts);
    } catch (err) {
      setError("Failed to load weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      loadWeatherData(location.trim());
    }
  };

  const getWeatherIcon = (condition) => {
    const iconClass = "h-8 w-8";
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case "cloudy":
      case "clouds":
      case "overcast":
        return <Cloud className={`${iconClass} text-gray-500`} />;
      case "rainy":
      case "rain":
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      default:
        return <Sun className={`${iconClass} text-yellow-500`} />;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case "excellent":
        return "text-green-600 bg-green-100";
      case "good":
        return "text-blue-600 bg-blue-100";
      case "fair":
        return "text-yellow-600 bg-yellow-100";
      case "poor":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAlertColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "border-red-200 bg-red-50 text-red-800";
      case "medium":
        return "border-yellow-200 bg-yellow-50 text-yellow-800";
      case "low":
        return "border-blue-200 bg-blue-50 text-blue-800";
      default:
        return "border-gray-200 bg-gray-50 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Weather Dashboard
          </h1>
          <p className="mt-2 text-neutral-600">
            Current conditions and agricultural weather insights
          </p>
        </div>

        {/* Location Search */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleLocationSubmit} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city or location..."
                className="w-full input-field"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>Get Weather</span>
            </button>
            <button
              type="button"
              onClick={() =>
                loadWeatherData(
                  currentWeather?.locationName ||
                    config.location.defaultLocation ||
                    "Delhi, India"
                )
              }
              disabled={loading}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </form>
        </div>

        {error && (
          <div className="alert-error mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {currentWeather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Weather */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Weather Card */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-neutral-900">
                      Current Weather
                    </h2>
                    <div className="flex items-center space-x-2 text-neutral-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{currentWeather.locationName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-neutral-900">
                      {currentWeather.temperature}°C
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {getWeatherIcon(currentWeather.condition)}
                      <span className="text-neutral-600 capitalize">
                        {currentWeather.condition}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-neutral-600">
                        Feels Like
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-neutral-900">
                      {currentWeather.feels_like || currentWeather.temperature}
                      °C
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-neutral-600">Humidity</span>
                    </div>
                    <div className="text-lg font-semibold text-neutral-900">
                      {currentWeather.humidity}%
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-neutral-600">Wind</span>
                    </div>
                    <div className="text-lg font-semibold text-neutral-900">
                      {currentWeather.wind_speed} km/h
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-neutral-600">
                        Visibility
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-neutral-900">
                      {currentWeather.visibility ?? "-"} km
                    </div>
                  </div>
                </div>

                {currentWeather.agricultural_insights && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">
                      Agricultural Conditions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-green-700">
                          Field Work:
                        </span>
                        <div
                          className={`mt-1 px-2 py-1 rounded text-xs font-medium ${getConditionColor(
                            currentWeather.agricultural_insights
                              .field_work_suitability
                          )}`}
                        >
                          {
                            currentWeather.agricultural_insights
                              .field_work_suitability
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-green-700">
                          Irrigation Need:
                        </span>
                        <div
                          className={`mt-1 px-2 py-1 rounded text-xs font-medium ${getConditionColor(
                            currentWeather.agricultural_insights
                              .irrigation_recommendation
                          )}`}
                        >
                          {
                            currentWeather.agricultural_insights
                              .irrigation_recommendation
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-green-700">
                          Disease Risk:
                        </span>
                        <div
                          className={`mt-1 px-2 py-1 rounded text-xs font-medium ${getConditionColor(
                            currentWeather.agricultural_insights.disease_risk
                          )}`}
                        >
                          {currentWeather.agricultural_insights.disease_risk}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 7-Day Forecast */}
              {forecast.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Forecast
                  </h3>
                  <div className="space-y-3">
                    {forecast.map((day, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-16 text-sm text-neutral-600">
                            {index === 0
                              ? "Today"
                              : new Date(day.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                })}
                          </div>
                          {getWeatherIcon(day.condition)}
                          <span className="text-sm text-neutral-600 capitalize">
                            {day.condition}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-neutral-900 font-medium">
                            {Math.round(day.temperature?.max ?? 0)}°
                          </span>
                          <span className="text-neutral-500">
                            {Math.round(day.temperature?.min ?? 0)}°
                          </span>
                          {typeof day.precipitation === "number" &&
                            day.precipitation > 0 && (
                              <div className="flex items-center space-x-1 text-blue-600">
                                <Droplets className="h-3 w-3" />
                                <span>{Math.round(day.precipitation)} mm</span>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Weather Alerts */}
              {alerts.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Agricultural Alerts</span>
                  </h3>
                  <div className="space-y-3">
                    {alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getAlertColor(
                          alert.severity
                        )}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {alert.title}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs opacity-90">
                          {alert.description}
                        </p>
                        {alert.recommendation && (
                          <div className="mt-2 text-xs">
                            <strong>Recommendation:</strong>{" "}
                            {alert.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Updated */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Last Updated:</span>
                    <span className="text-neutral-900">
                      {currentWeather?.timestamp
                        ? new Date(currentWeather.timestamp).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Data Source:</span>
                    <span className="text-neutral-900">
                      {currentWeather?.data_source || "Weather API"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Next Update:</span>
                    <span className="text-neutral-900">
                      {currentWeather?.timestamp
                        ? new Date(
                            new Date(currentWeather.timestamp).getTime() +
                              30 * 60000
                          ).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Weather Tips
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">
                      Monitor humidity levels for optimal irrigation timing
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">
                      Plan field activities based on weather forecasts
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">
                      Set up alerts for extreme weather conditions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && !currentWeather && (
          <div className="text-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-neutral-600">Loading weather data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
