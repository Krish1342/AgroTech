import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { languages } from "../data/mockData";
import { Mic, MicOff, CheckCircle, Globe, Sprout, Play } from "lucide-react";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { language, setLanguage, setFirstTime, voiceEnabled } = useApp();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [voiceOnboardingEnabled, setVoiceOnboardingEnabled] =
    useState(voiceEnabled);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
  };

  const handleContinue = () => {
    setIsAnimating(true);
    setLanguage(selectedLanguage);
    setFirstTime(false);

    setTimeout(() => {
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex flex-col">
      {/* Header with logo */}
      <div className="flex-shrink-0 pt-16 pb-8 px-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
          <Sprout className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-3">
          {selectedLanguage === "hi" ? "कृषिटेक" : "Agrotech"}
        </h1>

        <p className="text-white/90 text-lg leading-relaxed px-4">
          {selectedLanguage === "hi"
            ? "स्मार्ट खेती के लिए आपका AI साथी"
            : "Your AI companion for smart farming"}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-white rounded-t-3xl shadow-2xl px-6 py-8 flex flex-col">
        {/* Language Selection */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Globe className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedLanguage === "hi"
                ? "अपनी भाषा चुनें"
                : "Select your preferred language"}
            </h2>
          </div>

          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                  selectedLanguage === lang.code
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-25"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedLanguage === lang.code
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedLanguage === lang.code && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className="text-left">
                    <p className="font-semibold text-gray-800">
                      {lang.nativeName}
                    </p>
                    <p className="text-sm text-gray-500">{lang.name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Onboarding Option */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedLanguage === "hi" ? "आवाज़ सहायता" : "Voice Assistance"}
          </h3>

          <button
            onClick={() => setVoiceOnboardingEnabled(!voiceOnboardingEnabled)}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
              voiceOnboardingEnabled
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <div className="flex items-center">
              {voiceOnboardingEnabled ? (
                <Mic className="w-6 h-6 text-blue-600 mr-4" />
              ) : (
                <MicOff className="w-6 h-6 text-gray-400 mr-4" />
              )}

              <div className="text-left">
                <p className="font-semibold text-gray-800">
                  {selectedLanguage === "hi"
                    ? "आवाज़ ऑनबोर्डिंग"
                    : "Voice Onboarding"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedLanguage === "hi"
                    ? "बोलकर ऐप का उपयोग करें"
                    : "Navigate the app using voice commands"}
                </p>
              </div>
            </div>

            <div
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                voiceOnboardingEnabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                  voiceOnboardingEnabled ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Features Preview */}
        <div className="mb-8 flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedLanguage === "hi" ? "मुख्य सुविधाएं" : "Key Features"}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                <span className="text-white text-lg">🌱</span>
              </div>
              <p className="text-sm font-medium text-green-800">
                {selectedLanguage === "hi"
                  ? "रियल-टाइम मॉनिटरिंग"
                  : "Real-time Monitoring"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                <span className="text-white text-lg">🤖</span>
              </div>
              <p className="text-sm font-medium text-blue-800">
                {selectedLanguage === "hi" ? "AI सलाह" : "AI Advisory"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                <span className="text-white text-lg">📊</span>
              </div>
              <p className="text-sm font-medium text-purple-800">
                {selectedLanguage === "hi"
                  ? "डेटा एनालिटिक्स"
                  : "Data Analytics"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mb-3">
                <span className="text-white text-lg">📱</span>
              </div>
              <p className="text-sm font-medium text-orange-800">
                {selectedLanguage === "hi" ? "रोग पहचान" : "Disease Detection"}
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={isAnimating}
          className={`w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg ${
            isAnimating ? "animate-pulse" : "hover:shadow-xl active:scale-95"
          }`}
        >
          {isAnimating ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
              {selectedLanguage === "hi" ? "शुरू हो रहा है..." : "Starting..."}
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              {selectedLanguage === "hi" ? "शुरू करें" : "Get Started"}
            </>
          )}
        </button>

        {/* Skip option */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full text-gray-500 hover:text-gray-700 py-3 mt-4 text-sm font-medium"
        >
          {selectedLanguage === "hi" ? "बाद में सेट करें" : "Set up later"}
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
