import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import {
  quickActions,
  chatHistory as initialChatHistory,
} from "../data/mockData";
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Loader,
  Volume2,
  VolumeX,
  Leaf,
  Bug,
  Droplets,
  Shield,
  Heart,
  Cloud,
  MessageCircle,
  Trash2,
} from "lucide-react";

const ChatScreen = () => {
  const navigate = useNavigate();
  const { getText, isTyping, setTyping } = useApp();
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState(initialChatHistory);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getQuickActionIcon = (iconName) => {
    const icons = {
      Leaf,
      Bug,
      Droplets,
      Shield,
      Heart,
      Cloud,
    };
    return icons[iconName] || MessageCircle;
  };

  const simulateBotResponse = (userMessage) => {
    setTyping(true);

    setTimeout(() => {
      let botResponse = "";
      let botResponseHi = "";

      const lowerMessage = userMessage.toLowerCase();

      if (
        lowerMessage.includes("fertilizer") ||
        lowerMessage.includes("उर्वरक")
      ) {
        botResponse =
          "Based on your soil data, I recommend applying nitrogen-rich fertilizer. Your current nitrogen levels are at 85% in Field 1. Consider organic compost or NPK 20-10-10 ratio.";
        botResponseHi =
          "आपके मिट्टी के डेटा के आधार पर, मैं नाइट्रोजन युक्त उर्वरक लगाने की सलाह देता हूँ। खेत 1 में आपका वर्तमान नाइट्रोजन स्तर 85% है। जैविक खाद या NPK 20-10-10 अनुपात पर विचार करें।";
      } else if (
        lowerMessage.includes("disease") ||
        lowerMessage.includes("रोग")
      ) {
        botResponse =
          "I can help identify plant diseases. Please upload a photo of the affected plant using the camera feature, or describe the symptoms you're seeing.";
        botResponseHi =
          "मैं पौधों के रोगों की पहचान करने में मदद कर सकता हूँ। कृपया कैमरा फीचर का उपयोग करके प्रभावित पौधे की फोटो अपलोड करें, या आप जो लक्षण देख रहे हैं उनका वर्णन करें।";
      } else if (
        lowerMessage.includes("water") ||
        lowerMessage.includes("पानी")
      ) {
        botResponse =
          "Based on your field moisture levels, Field 3 needs immediate watering (45% moisture). Fields 1 and 2 are adequately hydrated. Water early morning or evening for best absorption.";
        botResponseHi =
          "आपके खेत की नमी के स्तर के आधार पर, खेत 3 को तत्काल पानी की आवश्यकता है (45% नमी)। खेत 1 और 2 पर्याप्त रूप से हाइड्रेटेड हैं। सबसे अच्छे अवशोषण के लिए सुबह जल्दी या शाम को पानी दें।";
      } else if (
        lowerMessage.includes("pest") ||
        lowerMessage.includes("कीट")
      ) {
        botResponse =
          "For pest control, use integrated pest management. Monitor regularly, use beneficial insects, and apply organic pesticides only when necessary. What specific pests are you observing?";
        botResponseHi =
          "कीट नियंत्रण के लिए, एकीकृत कीट प्रबंधन का उपयोग करें। नियमित निगरानी करें, लाभकारी कीड़ों का उपयोग करें, और केवल आवश्यक होने पर जैविक कीटनाशकों का प्रयोग करें। आप कौन से विशिष्ट कीट देख रहे हैं?";
      } else {
        botResponse =
          "I'm here to help with your farming needs! I can assist with fertilizer recommendations, disease identification, watering schedules, pest control, and crop health advice. What would you like to know?";
        botResponseHi =
          "मैं आपकी खेती की जरूरतों में मदद करने के लिए यहाँ हूँ! मैं उर्वरक सुझाव, रोग पहचान, पानी देने का कार्यक्रम, कीट नियंत्रण, और फसल स्वास्थ्य सलाह के साथ सहायता कर सकता हूँ। आप क्या जानना चाहते हैं?";
      }

      const newBotMessage = {
        id: Date.now(),
        type: "bot",
        message: botResponse,
        messageHi: botResponseHi,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newBotMessage]);
      setTyping(false);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: "user",
      message: inputMessage,
      messageHi: inputMessage, // In real app, this would be translated
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    simulateBotResponse(inputMessage);
    setInputMessage("");
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      fertilizer: {
        en: "What fertilizer should I use for my current soil conditions?",
        hi: "मेरी वर्तमान मिट्टी की स्थिति के लिए मुझे कौन सा उर्वरक उपयोग करना चाहिए?",
      },
      disease: {
        en: "Help me identify a disease on my plants",
        hi: "मेरे पौधों पर बीमारी की पहचान करने में मेरी सहायता करें",
      },
      watering: {
        en: "What is the optimal watering schedule for my crops?",
        hi: "मेरी फसलों के लिए इष्टतम पानी देने का कार्यक्रम क्या है?",
      },
      pest: {
        en: "How can I control pests in my field?",
        hi: "मैं अपने खेत में कीटों को कैसे नियंत्रित कर सकता हूँ?",
      },
      health: {
        en: "How can I improve the overall health of my crops?",
        hi: "मैं अपनी फसलों के समग्र स्वास्थ्य में कैसे सुधार कर सकता हूँ?",
      },
      weather: {
        en: "What should I do based on the current weather conditions?",
        hi: "वर्तमान मौसमी परिस्थितियों के आधार पर मुझे क्या करना चाहिए?",
      },
    };

    const message = quickMessages[action.category];
    if (message) {
      setInputMessage(getText(message.en, message.hi));
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // In a real app, this would start/stop voice recognition
    if (!isListening) {
      // Simulate voice input
      setTimeout(() => {
        setInputMessage("My plants are showing yellow leaves");
        setIsListening(false);
      }, 2000);
    }
  };

  const toggleTextToSpeech = () => {
    setIsSpeaking(!isSpeaking);
    // In a real app, this would start/stop text-to-speech
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full mr-4 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>

            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <Bot className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">
                  {getText("AI Crop Advisor", "AI फसल सलाहकार")}
                </h1>
                <p className="text-green-100 text-sm">
                  {isTyping
                    ? getText("Typing...", "टाइप कर रहा है...")
                    : getText("Online", "ऑनलाइन")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={toggleTextToSpeech}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking ? "bg-white/30" : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {isSpeaking ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={clearChat}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {quickActions.map((action) => {
            const IconComponent = getQuickActionIcon(action.icon);
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2 text-white text-sm font-medium whitespace-nowrap transition-colors"
              >
                <IconComponent className="w-4 h-4" />
                <span>{getText(action.text, action.textHi)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-10 h-10 text-green-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {getText(
                "Welcome to AI Crop Advisor!",
                "AI फसल सलाहकार में आपका स्वागत है!"
              )}
            </h3>

            <p className="text-gray-600 mb-6 max-w-sm">
              {getText(
                "Ask me anything about your crops, soil health, diseases, or farming practices.",
                "अपनी फसलों, मिट्टी के स्वास्थ्य, रोगों, या खेती की प्रथाओं के बारे में मुझसे कुछ भी पूछें।"
              )}
            </p>

            <div className="text-sm text-gray-500">
              {getText(
                "Try one of the quick actions above or type a message",
                "ऊपर दिए गए त्वरित कार्यों में से किसी एक को आज़माएं या एक संदेश टाइप करें"
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                    msg.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.type === "user" ? "bg-green-500" : "bg-blue-500"
                    }`}
                  >
                    {msg.type === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.type === "user"
                        ? "bg-green-500 text-white"
                        : "bg-white border border-gray-200 shadow-sm"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        msg.type === "user" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {getText(msg.message, msg.messageHi)}
                    </p>

                    <p
                      className={`text-xs mt-1 ${
                        msg.type === "user" ? "text-green-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>

                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleVoiceInput}
            className={`p-3 rounded-full transition-colors ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={getText(
                "Ask about crops, diseases, fertilizers...",
                "फसलों, रोगों, उर्वरकों के बारे में पूछें..."
              )}
              className="w-full bg-gray-100 rounded-full px-6 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            />

            {isListening && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Loader className="w-5 h-5 text-red-500 animate-spin" />
              </div>
            )}
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className={`p-3 rounded-full transition-colors ${
              inputMessage.trim() && !isTyping
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
