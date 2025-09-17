import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import {
  ArrowBack,
  Send,
  SmartToy,
  Person,
  Mic,
  AttachFile,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const ChatPage = () => {
  const navigate = useNavigate();
  const { state, actions, getTranslation } = useAppContext();
  const messagesEndRef = useRef(null);

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");

    // Add user message
    actions.addChatMessage({
      sender: "user",
      message: userMessage,
      type: "text",
    });

    // Simulate AI typing
    setIsTyping(true);

    // Generate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      actions.addChatMessage({
        sender: "assistant",
        message: aiResponse,
        type: "text",
      });
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (
      message.includes("weather") ||
      message.includes("rain") ||
      message.includes("temperature")
    ) {
      return "Based on current weather data, today will be partly cloudy with temperatures around 22°C. There's a 30% chance of rain in the evening. I recommend checking soil moisture levels before any irrigation activities.";
    }

    if (message.includes("fertilizer") || message.includes("nutrient")) {
      return "For your current crops, I recommend a balanced NPK fertilizer (10-26-26) application. Based on your soil analysis, apply 2-3 kg per acre. The best time for application is early morning when soil moisture is optimal.";
    }

    if (
      message.includes("disease") ||
      message.includes("pest") ||
      message.includes("problem")
    ) {
      return "I've reviewed your recent field photos. The leaf spots indicate early signs of fungal infection. Apply copper-based fungicide spray in the evening. Ensure good air circulation and avoid overhead watering for the next few days.";
    }

    if (
      message.includes("water") ||
      message.includes("irrigation") ||
      message.includes("moisture")
    ) {
      return "Your soil moisture levels are currently at 65%, which is good for wheat cultivation. I recommend irrigating when levels drop below 60%. Based on weather forecast, next watering should be in 2-3 days.";
    }

    if (message.includes("harvest") || message.includes("when to harvest")) {
      return "Based on your planting date and crop growth data, your wheat should be ready for harvest in approximately 45-50 days. I'll monitor the progress and send you alerts when the optimal harvest time approaches.";
    }

    if (
      message.includes("price") ||
      message.includes("market") ||
      message.includes("sell")
    ) {
      return "Current market prices: Wheat ₹2,100/quintal (+2.5%), Rice ₹3,200/quintal (-1.2%), Maize ₹1,850/quintal (+0.8%). Best selling locations are within 50km of your farm. Would you like me to find nearby buyers?";
    }

    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("help")
    ) {
      return "Hello! I'm your AI farming assistant. I can help you with crop management, disease detection, weather updates, fertilizer recommendations, and market prices. What would you like to know about your farm today?";
    }

    // Default response
    return "I understand you're asking about farm management. Could you be more specific? I can help with weather updates, crop health monitoring, fertilizer recommendations, irrigation scheduling, disease detection, and market prices. What specific area would you like assistance with?";
  };

  const quickQuestions = [
    "What's the weather forecast?",
    "When should I water my crops?",
    "Check my field health",
    "Current market prices",
    "Disease prevention tips",
  ];

  const handleQuickQuestion = (question) => {
    setMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      className="page"
      sx={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
          color: "white",
          p: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <IconButton
            onClick={() => navigate("/dashboard")}
            sx={{ color: "white", mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          <SmartToy sx={{ mr: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            AI Farm Assistant
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Ask me anything about your farm and crops
        </Typography>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          pb: 1,
          bgcolor: "#f5f5f5",
        }}
      >
        {/* Quick Questions */}
        {state.chatHistory.length <= 1 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Quick questions:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {quickQuestions.map((question, index) => (
                <Chip
                  key={index}
                  label={question}
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickQuestion(question)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "#e3f2fd",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Messages */}
        {state.chatHistory.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              mb: 2,
              flexDirection: msg.sender === "user" ? "row-reverse" : "row",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: msg.sender === "user" ? "#4caf50" : "#2196f3",
                flexShrink: 0,
              }}
            >
              {msg.sender === "user" ? (
                <Person sx={{ fontSize: 18 }} />
              ) : (
                <SmartToy sx={{ fontSize: 18 }} />
              )}
            </Avatar>

            <Paper
              sx={{
                p: 2,
                maxWidth: "75%",
                bgcolor: msg.sender === "user" ? "#4caf50" : "white",
                color: msg.sender === "user" ? "white" : "inherit",
                borderRadius: 2,
                ...(msg.sender === "user" && {
                  borderTopRightRadius: 4,
                }),
                ...(msg.sender === "assistant" && {
                  borderTopLeftRadius: 4,
                }),
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                {msg.message}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  opacity: 0.7,
                  fontSize: "0.7rem",
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Paper>
          </Box>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <Box
            sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#2196f3" }}>
              <SmartToy sx={{ fontSize: 18 }} />
            </Avatar>
            <Paper sx={{ p: 2, borderRadius: 2, borderTopLeftRadius: 4 }}>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: "#ccc",
                      borderRadius: "50%",
                      animation: "pulse 1.4s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                      "@keyframes pulse": {
                        "0%, 80%, 100%": {
                          opacity: 0.3,
                        },
                        "40%": {
                          opacity: 1,
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Container */}
      <Box
        sx={{
          p: 2,
          bgcolor: "white",
          borderTop: "1px solid #e0e0e0",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your crops, weather, or farming tips..."
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "#f8f9fa",
              },
            }}
          />

          <IconButton
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            sx={{
              bgcolor: "#4caf50",
              color: "white",
              "&:hover": {
                bgcolor: "#45a049",
              },
              "&:disabled": {
                bgcolor: "#e0e0e0",
                color: "#9e9e9e",
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage;
