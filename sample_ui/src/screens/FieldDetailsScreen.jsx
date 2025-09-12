import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { generateHistoricalData } from "../data/mockData";
import {
  ArrowLeft,
  Droplets,
  Activity,
  Thermometer,
  Leaf,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Clock,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FieldDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fields, getText } = useApp();

  const [selectedMetric, setSelectedMetric] = useState("moisture");
  const [timeRange, setTimeRange] = useState("7d");
  const [chartData, setChartData] = useState(null);

  const field = fields.find((f) => f.id === parseInt(id));

  useEffect(() => {
    if (field) {
      const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30;
      const historicalData = generateHistoricalData(field.id, days);

      const labels = historicalData.map((d) => {
        if (timeRange === "24h") {
          return d.time;
        }
        return new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      });

      const datasets = [];

      if (selectedMetric === "moisture" || selectedMetric === "all") {
        datasets.push({
          label: getText("Moisture %", "नमी %"),
          data: historicalData.map((d) => d.moisture),
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        });
      }

      if (selectedMetric === "ph" || selectedMetric === "all") {
        datasets.push({
          label: "pH",
          data: historicalData.map((d) => d.ph),
          borderColor: "#8B5CF6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          fill: selectedMetric === "ph",
          tension: 0.4,
        });
      }

      if (selectedMetric === "temperature" || selectedMetric === "all") {
        datasets.push({
          label: getText("Temperature °C", "तापमान °C"),
          data: historicalData.map((d) => d.temperature),
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          fill: selectedMetric === "temperature",
          tension: 0.4,
        });
      }

      setChartData({
        labels,
        datasets,
      });
    }
  }, [field, selectedMetric, timeRange, getText]);

  if (!field) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {getText("Field Not Found", "खेत नहीं मिला")}
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-800"
          >
            {getText("Back to Dashboard", "डैशबोर्ड पर वापस जाएं")}
          </button>
        </div>
      </div>
    );
  }

  const getTrendIcon = (current, previous) => {
    if (current > previous)
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous)
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getRecommendation = (field) => {
    const recommendations = [];

    if (field.moisture < 50) {
      recommendations.push({
        type: "warning",
        message: getText(
          "Low moisture detected. Consider irrigation.",
          "कम नमी का पता लगा। सिंचाई पर विचार करें।"
        ),
      });
    }

    if (field.ph < 6.0 || field.ph > 8.0) {
      recommendations.push({
        type: "info",
        message: getText(
          "pH levels are outside optimal range.",
          "pH स्तर इष्टतम सीमा से बाहर है।"
        ),
      });
    }

    if (field.nitrogen < 60) {
      recommendations.push({
        type: "warning",
        message: getText(
          "Nitrogen levels are low. Apply fertilizer.",
          "नाइट्रोजन का स्तर कम है। उर्वरक लगाएं।"
        ),
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "success",
        message: getText(
          "All parameters are within optimal range.",
          "सभी पैरामीटर इष्टतम सीमा के भीतर हैं।"
        ),
      });
    }

    return recommendations;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 pt-12 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full mr-4 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              {getText(field.name, field.nameHi)}
            </h1>
            <p className="text-green-100">
              {getText(field.location, field.locationHi)}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Droplets className="w-6 h-6 text-white mx-auto mb-1" />
            <p className="text-white font-bold text-lg">{field.moisture}%</p>
            <p className="text-white/80 text-xs">
              {getText("Moisture", "नमी")}
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Activity className="w-6 h-6 text-white mx-auto mb-1" />
            <p className="text-white font-bold text-lg">{field.ph}</p>
            <p className="text-white/80 text-xs">pH</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Thermometer className="w-6 h-6 text-white mx-auto mb-1" />
            <p className="text-white font-bold text-lg">
              {field.temperature}°C
            </p>
            <p className="text-white/80 text-xs">{getText("Temp", "तापमान")}</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Leaf className="w-6 h-6 text-white mx-auto mb-1" />
            <p className="text-white font-bold text-lg">{field.nitrogen}%</p>
            <p className="text-white/80 text-xs">N</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Chart Controls */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col space-y-4">
            {/* Metric Selection */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                {getText("Select Metric", "मेट्रिक चुनें")}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: "moisture",
                    label: getText("Moisture", "नमी"),
                    icon: Droplets,
                    color: "blue",
                  },
                  { id: "ph", label: "pH", icon: Activity, color: "purple" },
                  {
                    id: "temperature",
                    label: getText("Temperature", "तापमान"),
                    icon: Thermometer,
                    color: "orange",
                  },
                  {
                    id: "all",
                    label: getText("All", "सभी"),
                    icon: TrendingUp,
                    color: "green",
                  },
                ].map((metric) => (
                  <button
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric.id)}
                    className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
                      selectedMetric === metric.id
                        ? metric.color === "blue"
                          ? "border-blue-500 bg-blue-50"
                          : metric.color === "purple"
                          ? "border-purple-500 bg-purple-50"
                          : metric.color === "orange"
                          ? "border-orange-500 bg-orange-50"
                          : "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <metric.icon
                      className={`w-5 h-5 mr-2 ${
                        selectedMetric === metric.id
                          ? metric.color === "blue"
                            ? "text-blue-600"
                            : metric.color === "purple"
                            ? "text-purple-600"
                            : metric.color === "orange"
                            ? "text-orange-600"
                            : "text-green-600"
                          : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        selectedMetric === metric.id
                          ? metric.color === "blue"
                            ? "text-blue-700"
                            : metric.color === "purple"
                            ? "text-purple-700"
                            : metric.color === "orange"
                            ? "text-orange-700"
                            : "text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      {metric.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range Selection */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                {getText("Time Range", "समय सीमा")}
              </h3>
              <div className="flex space-x-2">
                {[
                  { id: "24h", label: getText("24 Hours", "24 घंटे") },
                  { id: "7d", label: getText("7 Days", "7 दिन") },
                  { id: "30d", label: getText("30 Days", "30 दिन") },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      timeRange === range.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            {getText("Trends", "रुझान")}
          </h3>

          <div className="h-64">
            {chartData && <Line data={chartData} options={chartOptions} />}
          </div>
        </div>

        {/* Latest Readings */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            {getText("Latest Readings", "नवीनतम रीडिंग")}
          </h3>

          <div className="space-y-3">
            {[
              {
                label: getText("Soil Moisture", "मिट्टी की नमी"),
                value: `${field.moisture}%`,
                icon: Droplets,
                color: "blue",
                trend: getTrendIcon(field.moisture, field.moisture - 5),
              },
              {
                label: "pH Level",
                value: field.ph,
                icon: Activity,
                color: "purple",
                trend: getTrendIcon(field.ph, field.ph - 0.1),
              },
              {
                label: getText("Temperature", "तापमान"),
                value: `${field.temperature}°C`,
                icon: Thermometer,
                color: "orange",
                trend: getTrendIcon(field.temperature, field.temperature - 2),
              },
              {
                label: getText("Nitrogen (N)", "नाइट्रोजन (N)"),
                value: `${field.nitrogen}%`,
                icon: Leaf,
                color: "green",
                trend: getTrendIcon(field.nitrogen, field.nitrogen - 3),
              },
              {
                label: getText("Phosphorus (P)", "फास्फोरस (P)"),
                value: `${field.phosphorus}%`,
                icon: Leaf,
                color: "yellow",
                trend: getTrendIcon(field.phosphorus, field.phosphorus - 2),
              },
              {
                label: getText("Potassium (K)", "पोटेशियम (K)"),
                value: `${field.potassium}%`,
                icon: Leaf,
                color: "indigo",
                trend: getTrendIcon(field.potassium, field.potassium - 1),
              },
            ].map((reading, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-lg mr-3 ${
                      reading.color === "blue"
                        ? "bg-blue-100"
                        : reading.color === "purple"
                        ? "bg-purple-100"
                        : reading.color === "orange"
                        ? "bg-orange-100"
                        : reading.color === "green"
                        ? "bg-green-100"
                        : reading.color === "yellow"
                        ? "bg-yellow-100"
                        : "bg-indigo-100"
                    }`}
                  >
                    <reading.icon
                      className={`w-5 h-5 ${
                        reading.color === "blue"
                          ? "text-blue-600"
                          : reading.color === "purple"
                          ? "text-purple-600"
                          : reading.color === "orange"
                          ? "text-orange-600"
                          : reading.color === "green"
                          ? "text-green-600"
                          : reading.color === "yellow"
                          ? "text-yellow-600"
                          : "text-indigo-600"
                      }`}
                    />
                  </div>
                  <span className="font-medium text-gray-700">
                    {reading.label}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {reading.trend}
                  <span className="font-bold text-gray-800">
                    {reading.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {getText("Last updated", "अंतिम अपडेट")}:{" "}
            {new Date(field.lastUpdated).toLocaleString()}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            {getText("Recommendations", "सिफारिशें")}
          </h3>

          <div className="space-y-3">
            {getRecommendation(field).map((rec, index) => (
              <div
                key={index}
                className={`flex items-start p-3 rounded-lg ${
                  rec.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : rec.type === "warning"
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                {rec.type === "success" && (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                )}
                {rec.type === "warning" && (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                )}
                {rec.type === "info" && (
                  <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                )}

                <p
                  className={`text-sm ${
                    rec.type === "success"
                      ? "text-green-700"
                      : rec.type === "warning"
                      ? "text-yellow-700"
                      : "text-blue-700"
                  }`}
                >
                  {rec.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldDetailsScreen;
