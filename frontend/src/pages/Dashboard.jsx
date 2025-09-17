import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  TrendingUp,
  BarChart3,
  Leaf,
  CloudRain,
  Calendar,
  Activity,
  Target,
  Award,
  ChevronRight,
  Plus,
  RefreshCw,
  Loader,
} from "lucide-react";
import { predictionService, weatherService } from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPredictions: 0,
    accuracyRate: 0,
    activeCrops: 0,
    soilAnalyses: 0,
  });
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load prediction statistics
      const predictionStats = await predictionService.getStatistics();
      if (predictionStats) {
        setStats({
          totalPredictions: predictionStats.total_predictions || 0,
          accuracyRate: predictionStats.accuracy_rate || 85,
          activeCrops: predictionStats.active_crops || 0,
          soilAnalyses: predictionStats.soil_analyses || 0,
        });
      }

      // Load recent predictions
      const recentData = await predictionService.getHistory({ limit: 5 });
      setRecentPredictions(recentData.predictions || []);

      // Load weather data for user location
      const location = user?.farm_location || "Default Location";
      const weather = await weatherService.getCurrentWeather(location);
      setWeatherData(weather);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "New Crop Recommendation",
      description: "Get AI-powered crop suggestions",
      icon: Leaf,
      color: "bg-green-500",
      link: "/crop-recommendation",
    },
    {
      title: "Soil Analysis",
      description: "Analyze your soil health",
      icon: BarChart3,
      color: "bg-blue-500",
      link: "/soil-analysis",
    },
    {
      title: "Weather Dashboard",
      description: "Check agricultural weather",
      icon: CloudRain,
      color: "bg-cyan-500",
      link: "/weather",
    },
    {
      title: "Data Management",
      description: "Upload and manage your data",
      icon: Activity,
      color: "bg-purple-500",
      link: "/data-management",
    },
  ];

  const statCards = [
    {
      title: "Total Predictions",
      value: stats.totalPredictions,
      icon: Target,
      color: "text-blue-600 bg-blue-100",
      change: "+12%",
      changeColor: "text-green-600",
    },
    {
      title: "Accuracy Rate",
      value: `${stats.accuracyRate}%`,
      icon: Award,
      color: "text-green-600 bg-green-100",
      change: "+5%",
      changeColor: "text-green-600",
    },
    {
      title: "Active Crops",
      value: stats.activeCrops,
      icon: Leaf,
      color: "text-orange-600 bg-orange-100",
      change: "+3",
      changeColor: "text-green-600",
    },
    {
      title: "Soil Analyses",
      value: stats.soilAnalyses,
      icon: BarChart3,
      color: "text-purple-600 bg-purple-100",
      change: "+8",
      changeColor: "text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="mt-2 text-neutral-600">
            Here's what's happening with your farm today.
          </p>
        </div>

        {error && (
          <div className="alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${stat.changeColor}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Quick Actions
                </h2>
                <button
                  onClick={loadDashboardData}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="group p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-lg ${action.color} text-white`}
                      >
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900 group-hover:text-primary-600">
                          {action.title}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Predictions */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Recent Predictions
                </h2>
                <Link
                  to="/crop-recommendation"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Prediction</span>
                </Link>
              </div>

              {recentPredictions.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <p className="text-neutral-600 mb-2">No predictions yet</p>
                  <p className="text-sm text-neutral-500">
                    Start by getting your first crop recommendation
                  </p>
                  <Link
                    to="/crop-recommendation"
                    className="btn-primary mt-4 inline-flex items-center space-x-2"
                  >
                    <Leaf className="h-4 w-4" />
                    <span>Get Started</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPredictions.map((prediction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Leaf className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-neutral-900">
                            {prediction.predicted_crop || "Crop Recommendation"}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {prediction.location || "Unknown location"} •
                            {new Date(
                              prediction.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          {prediction.confidence
                            ? `${prediction.confidence}% confidence`
                            : "Completed"}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {prediction.prediction_type || "Crop prediction"}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link
                      to="/predictions"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View all predictions →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
            {weatherData && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
                  <CloudRain className="h-5 w-5 text-blue-500" />
                  <span>Weather</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Temperature</span>
                    <span className="font-medium">
                      {weatherData.temperature}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Humidity</span>
                    <span className="font-medium">{weatherData.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Condition</span>
                    <span className="font-medium capitalize">
                      {weatherData.condition}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Location</span>
                    <span className="font-medium text-sm">
                      {weatherData.location}
                    </span>
                  </div>
                </div>
                <Link
                  to="/weather"
                  className="mt-4 w-full btn-secondary text-center"
                >
                  View Detailed Weather
                </Link>
              </div>
            )}

            {/* Farm Overview */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Farm Overview
              </h3>
              <div className="space-y-3">
                {user?.farm_location && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Location</span>
                    <span className="font-medium text-sm">
                      {user.farm_location}
                    </span>
                  </div>
                )}
                {user?.farm_size && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Size</span>
                    <span className="font-medium">{user.farm_size} acres</span>
                  </div>
                )}
                {user?.farming_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Type</span>
                    <span className="font-medium">{user.farming_type}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Member Since</span>
                  <span className="font-medium text-sm">
                    {new Date(
                      user?.created_at || Date.now()
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Link
                to="/profile"
                className="mt-4 w-full btn-secondary text-center"
              >
                Update Profile
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-neutral-600">
                    Dashboard accessed today
                  </span>
                </div>
                {stats.totalPredictions > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-neutral-600">
                      {stats.totalPredictions} prediction
                      {stats.totalPredictions !== 1 ? "s" : ""} made
                    </span>
                  </div>
                )}
                {stats.soilAnalyses > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-neutral-600">
                      {stats.soilAnalyses} soil analysis completed
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-neutral-600">
                    Profile {user?.full_name ? "completed" : "incomplete"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
