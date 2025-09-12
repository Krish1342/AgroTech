import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import {
  Home,
  MessageCircle,
  Camera,
  Settings,
  Droplets,
  Thermometer,
  Activity,
  Leaf,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  MapPin,
  Clock,
  Plus,
  MoreVertical,
} from "lucide-react";

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { fields, getText, language, refreshData, loading, selectField } =
    useApp();

  const [activeTab, setActiveTab] = useState("home");

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const handleFieldClick = (field) => {
    selectField(field);
    navigate(`/field/${field.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-700 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      excellent: { en: "Excellent", hi: "उत्कृष्ट" },
      good: { en: "Good", hi: "अच्छा" },
      warning: { en: "Warning", hi: "चेतावनी" },
      critical: { en: "Critical", hi: "गंभीर" },
    };

    return statusMap[status]?.[language] || status;
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) {
      return language === "hi" ? `${minutes} मिनट पहले` : `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);
    return language === "hi" ? `${hours} घंटे पहले` : `${hours} hr ago`;
  };

  const TabBar = () => (
    <div className="tab-bar">
      <div className="flex justify-around">
        {[
          {
            id: "home",
            icon: Home,
            label: getText("Home", "होम"),
          },
          {
            id: "chat",
            icon: MessageCircle,
            label: getText("Chat", "चैट"),
          },
          {
            id: "camera",
            icon: Camera,
            label: getText("Camera", "कैमरा"),
          },
          {
            id: "settings",
            icon: Settings,
            label: getText("Settings", "सेटिंग्स"),
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "chat") navigate("/chat");
              if (tab.id === "camera") navigate("/photo-upload");
              if (tab.id === "settings") navigate("/settings");
            }}
            className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
          >
            <tab.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="header-gradient-green px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {getText("My Fields", "मेरे खेत")}
            </h1>
            <p className="text-green-100">
              {getText("Real-time monitoring", "रियल-टाइम निगरानी")}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-full transition-all duration-200"
            >
              <RefreshCw
                className={`w-6 h-6 text-white ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>

            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-full transition-all duration-200">
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-xl">
                {
                  fields.filter(
                    (f) => f.status === "good" || f.status === "excellent"
                  ).length
                }
              </span>
            </div>
            <p className="text-white text-opacity-90 text-sm font-medium">
              {getText("Healthy", "स्वस्थ")}
            </p>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-xl">
                {fields.filter((f) => f.status === "warning").length}
              </span>
            </div>
            <p className="text-white text-opacity-90 text-sm font-medium">
              {getText("Alerts", "अलर्ट")}
            </p>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-xl">
                {Math.round(
                  fields.reduce((acc, f) => acc + f.moisture, 0) / fields.length
                )}
                %
              </span>
            </div>
            <p className="text-white text-opacity-90 text-sm font-medium">
              {getText("Avg Moisture", "औसत नमी")}
            </p>
          </div>
        </div>
      </div>

      {/* Fields List */}
      <div className="px-6 py-6 space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            onClick={() => handleFieldClick(field)}
            className="field-card animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Field Header */}
            <div className="card-header">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Leaf className="w-7 h-7 text-white" />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {getText(field.name, field.nameHi)}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {getText(field.location, field.locationHi)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${getStatusColor(
                      field.status
                    )}`}
                  >
                    {getStatusIcon(field.status)}
                    <span>{getStatusText(field.status)}</span>
                  </div>

                  <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {getText("Last updated", "अंतिम अपडेट")}:{" "}
                {formatTime(field.lastUpdated)}
              </div>
            </div>

            {/* Sensor Data Grid */}
            <div className="card-body pt-0">
              <div className="sensor-grid mb-4">
                {/* Moisture */}
                <div className="sensor-item">
                  <div className="bg-blue-100 p-2 rounded-xl mr-3">
                    <Droplets className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">
                      {getText("Moisture", "नमी")}
                    </p>
                    <p className="font-bold text-gray-800 text-lg">
                      {field.moisture}%
                    </p>
                  </div>
                </div>

                {/* pH Level */}
                <div className="sensor-item">
                  <div className="bg-purple-100 p-2 rounded-xl mr-3">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">pH</p>
                    <p className="font-bold text-gray-800 text-lg">
                      {field.ph}
                    </p>
                  </div>
                </div>

                {/* Temperature */}
                <div className="sensor-item">
                  <div className="bg-orange-100 p-2 rounded-xl mr-3">
                    <Thermometer className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">
                      {getText("Temperature", "तापमान")}
                    </p>
                    <p className="font-bold text-gray-800 text-lg">
                      {field.temperature}°C
                    </p>
                  </div>
                </div>

                {/* Nutrients */}
                <div className="sensor-item">
                  <div className="bg-green-100 p-2 rounded-xl mr-3">
                    <Leaf className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">
                      {getText("Nitrogen", "नाइट्रोजन")}
                    </p>
                    <p className="font-bold text-gray-800 text-lg">
                      {field.nitrogen}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Soil Health Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">
                    {getText("Soil Health", "मिट्टी स्वास्थ्य")}
                  </span>
                  <span className="font-bold text-gray-800">
                    {Math.round(
                      (field.moisture +
                        field.nitrogen +
                        field.phosphorus +
                        field.potassium) /
                        4
                    )}
                    %
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    style={{
                      width: `${Math.round(
                        (field.moisture +
                          field.nitrogen +
                          field.phosphorus +
                          field.potassium) /
                          4
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-6 pb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {getText("Quick Actions", "त्वरित कार्य")}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/photo-upload")}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 hover:scale-105"
          >
            <Camera className="w-8 h-8 mb-3" />
            <p className="font-semibold text-base">
              {getText("Disease Detection", "रोग पहचान")}
            </p>
            <p className="text-blue-100 text-sm mt-1">
              {getText("Scan plants", "पौधे स्कैन करें")}
            </p>
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 hover:scale-105"
          >
            <MessageCircle className="w-8 h-8 mb-3" />
            <p className="font-semibold text-base">
              {getText("AI Assistant", "AI सहायक")}
            </p>
            <p className="text-purple-100 text-sm mt-1">
              {getText("Get advice", "सलाह लें")}
            </p>
          </button>
        </div>
      </div>

      <TabBar />
    </div>
  );
};

export default DashboardScreen;
