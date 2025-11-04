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
  Alert,
} from "@mui/material";
import { ArrowBack, Send, SmartToy, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import apiService from "../services/api";

const ChatPage = () => {
  const navigate = useNavigate();
  const { state, actions, getTranslation } = useAppContext();
  const messagesEndRef = useRef(null);

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userMessage = message.trim();
    setMessage("");
    setError(null);

    // Add user message
    actions.addChatMessage({
      sender: "user",
      message: userMessage,
      type: "text",
    });

    // Set typing indicator
    setIsTyping(true);

    try {
      // Get farm context for better AI responses
      const farmContext = {
        fields: state.fields,
        user: state.user,
        currentLocation: state.currentLocation,
      };

      // Get AI response using API service
      const response = await apiService.sendChatMessage(
        userMessage,
        farmContext
      );

      // Add AI response
      actions.addChatMessage({
        sender: "assistant",
        message: response.message || response,
        type: "text",
      });
    } catch (error) {
      console.error("AI Chat Error:", error);
      setError("Failed to get AI response. Please try again.");

      // Add fallback response
      actions.addChatMessage({
        sender: "assistant",
        message:
          "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment. For immediate help, you can check your field details or contact support.",
        type: "text",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    getTranslation("whatWeatherForecast"),
    getTranslation("whenWaterCrops"),
    getTranslation("checkFieldHealth"),
    getTranslation("currentMarketPrices"),
    getTranslation("diseasePreventionTips"),
  ];

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
            {getTranslation("aiFarmAssistant")}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {getTranslation("askAboutFarm")}
        </Typography>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          pb: "80px", // Extra padding at bottom for navbar
          bgcolor: "#f5f5f5",
        }}
      >
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Welcome Message and Quick Questions */}
        {state.chatHistory.length === 0 && (
          <Box sx={{ mb: 3 }}>
            <Paper
              sx={{
                p: 3,
                mb: 2,
                bgcolor: "#e3f2fd",
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              <SmartToy sx={{ fontSize: 48, color: "#2196f3", mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {getTranslation("welcome")} {getTranslation("aiFarmAssistant")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getTranslation("askAboutFarm")}
              </Typography>
            </Paper>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {getTranslation("quickQuestions")}:
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
          marginBottom: "80px", // Increased margin for bottom navigation
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
            placeholder={getTranslation("askAboutCrops")}
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
