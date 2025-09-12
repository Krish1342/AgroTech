import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { connectedDevices, languages } from "../data/mockData";
import {
  ArrowLeft,
  Globe,
  Bell,
  Mic,
  Wifi,
  WifiOff,
  Battery,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Shield,
  User,
  HelpCircle,
  LogOut,
  Settings as SettingsIcon,
  Check,
  X,
  Clock,
  Smartphone,
  Radio,
  Eye,
} from "lucide-react";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const {
    getText,
    language,
    setLanguage,
    settings,
    updateSetting,
    clearCache,
  } = useApp();

  const [localSettings, setLocalSettings] = useState(settings);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setShowLanguageModal(false);
  };

  const handleSettingChange = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    updateSetting(key, value);
  };

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      clearCache();
      setClearingCache(false);
    }, 2000);
  };

  const getDeviceStatusIcon = (status) => {
    switch (status) {
      case "online":
        return <Wifi className="w-5 h-5 text-green-600" />;
      case "offline":
        return <WifiOff className="w-5 h-5 text-red-600" />;
      case "syncing":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Radio className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatLastSeen = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return getText("Just now", "अभी");
    if (minutes < 60)
      return getText(`${minutes} min ago`, `${minutes} मिनट पहले`);

    const hours = Math.floor(minutes / 60);
    return getText(`${hours} hr ago`, `${hours} घंटे पहले`);
  };

  const LanguageModal = () =>
    showLanguageModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-xl max-w-sm w-full p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {getText("Select Language", "भाषा चुनें")}
          </h3>

          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center justify-between ${
                  language === lang.code
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {lang.nativeName}
                  </p>
                  <p className="text-sm text-gray-500">{lang.name}</p>
                </div>

                {language === lang.code && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowLanguageModal(false)}
            className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {getText("Cancel", "रद्द करें")}
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 pt-12 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full mr-4 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                {getText("Settings", "सेटिंग्स")}
              </h1>
              <p className="text-gray-100">
                {getText(
                  "Manage your preferences",
                  "अपनी प्राथमिकताएं प्रबंधित करें"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* User Profile Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {getText("Farmer Profile", "किसान प्रोफ़ाइल")}
              </h3>
              <p className="text-gray-600">farmer@agrotech.com</p>
            </div>

            <button className="text-blue-600 hover:text-blue-800">
              {getText("Edit", "संपादित करें")}
            </button>
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <SettingsIcon className="w-6 h-6 text-gray-600 mr-2" />
            {getText("App Preferences", "ऐप प्राथमिकताएं")}
          </h3>

          <div className="space-y-4">
            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">
                    {getText("Language", "भाषा")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {languages.find((l) => l.code === language)?.nativeName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLanguageModal(true)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {getText("Change", "बदलें")}
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">
                    {getText("Push Notifications", "पुश नोटिफिकेशन")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getText(
                      "Get alerts for your crops",
                      "अपनी फसलों के लिए अलर्ट प्राप्त करें"
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  handleSettingChange(
                    "notifications",
                    !localSettings.notifications
                  )
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  localSettings.notifications ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    localSettings.notifications
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Voice Prompts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mic className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">
                    {getText("Voice Prompts", "आवाज़ के संकेत")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getText(
                      "Enable voice assistant features",
                      "आवाज़ सहायक सुविधाएं सक्षम करें"
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  handleSettingChange(
                    "voicePrompts",
                    !localSettings.voicePrompts
                  )
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  localSettings.voicePrompts ? "bg-purple-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    localSettings.voicePrompts
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Data Sync Frequency */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <RefreshCw className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">
                    {getText("Data Sync", "डेटा सिंक")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getText("Every", "हर")} {localSettings.syncFrequency}{" "}
                    {getText("minutes", "मिनट")}
                  </p>
                </div>
              </div>

              <select
                value={localSettings.syncFrequency}
                onChange={(e) =>
                  handleSettingChange("syncFrequency", e.target.value)
                }
                className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="5">5 min</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">1 hr</option>
              </select>
            </div>
          </div>
        </div>

        {/* Connected Devices */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Smartphone className="w-6 h-6 text-gray-600 mr-2" />
            {getText("Connected Devices", "जुड़े हुए उपकरण")}
          </h3>

          <div className="space-y-4">
            {connectedDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center flex-1">
                  <div className="mr-3">
                    {getDeviceStatusIcon(device.status)}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {getText(device.name, device.nameHi)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getText(device.location, device.locationHi)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getText("Last seen", "अंतिम बार दिखा")}:{" "}
                      {formatLastSeen(device.lastSeen)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm">
                      <Battery className="w-4 h-4 text-gray-400 mr-1" />
                      <span
                        className={`font-medium ${
                          device.battery > 50
                            ? "text-green-600"
                            : device.battery > 20
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {device.battery}%
                      </span>
                    </div>

                    <div
                      className={`w-3 h-3 rounded-full ${
                        device.status === "online"
                          ? "bg-green-500"
                          : device.status === "offline"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage & Cache */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="w-6 h-6 text-gray-600 mr-2" />
            {getText("Storage & Cache", "स्टोरेज और कैश")}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  {getText("Offline Data Cache", "ऑफ़लाइन डेटा कैश")}
                </p>
                <p className="text-sm text-gray-500">
                  {localSettings.offlineCache}
                </p>
              </div>

              <button
                onClick={handleClearCache}
                disabled={clearingCache}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {clearingCache ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {getText("Clearing...", "साफ़ कर रहे हैं...")}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {getText("Clear Cache", "कैश साफ़ करें")}
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  {getText("Data Export", "डेटा निर्यात")}
                </p>
                <p className="text-sm text-gray-500">
                  {getText(
                    "Export your data for backup",
                    "बैकअप के लिए अपना डेटा निर्यात करें"
                  )}
                </p>
              </div>

              <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                {getText("Export", "निर्यात")}
              </button>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <HelpCircle className="w-6 h-6 text-gray-600 mr-2" />
            {getText("Help & Support", "मदद और सहायता")}
          </h3>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-800">
                {getText("User Guide", "उपयोगकर्ता गाइड")}
              </span>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-800">
                {getText("Contact Support", "सहायता से संपर्क करें")}
              </span>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-800">
                {getText("Privacy Policy", "गोपनीयता नीति")}
              </span>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {getText("App Information", "ऐप जानकारी")}
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {getText("Version", "संस्करण")}
              </span>
              <span className="text-gray-800 font-medium">1.0.0</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">{getText("Build", "बिल्ड")}</span>
              <span className="text-gray-800 font-medium">2025.09.12</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                {getText("License", "लाइसेंस")}
              </span>
              <span className="text-gray-800 font-medium">MIT</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button className="w-full flex items-center justify-center p-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
          <LogOut className="w-5 h-5 mr-2" />
          {getText("Sign Out", "साइन आउट")}
        </button>
      </div>

      <LanguageModal />
    </div>
  );
};

export default SettingsScreen;
