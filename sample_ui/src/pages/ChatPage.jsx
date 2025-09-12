import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  IconButton,
  TextField,
  Button,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  ArrowBack,
  Mic,
  Send,
  MicNone,
  Home,
  Assessment,
  Camera,
  Chat,
  Settings,
} from "@mui/icons-material";

const ChatPage = () => {
  const navigate = useNavigate();
  const [navValue, setNavValue] = React.useState(3);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI agricultural advisor. How can I help you today?",
      sender: "ai",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 2,
      text: "I noticed some yellowing on my tomato leaves. What could be causing this?",
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 3,
      text: "Yellowing leaves on tomatoes can indicate several issues:\n\n1. **Overwatering** - Most common cause\n2. **Nutrient deficiency** - Especially nitrogen\n3. **Disease** - Such as early blight\n4. **Natural aging** - Lower leaves naturally yellow\n\nCan you tell me more about the pattern of yellowing and your watering schedule?",
      sender: "ai",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: newMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages([...messages, userMessage]);
      setNewMessage("");

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          text: "Thank you for the additional information. Based on what you've described, I recommend checking the soil moisture levels and ensuring proper drainage. Would you like me to provide specific treatment recommendations?",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1500);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would handle voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setNewMessage(
          "Voice message: The leaves are mostly yellow at the bottom of the plant and I water them every day."
        );
      }, 3000);
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <Box className="header header-green">
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            onClick={() => navigate("/dashboard")}
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              mr: 2,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography className="header-title">AI Advisor</Typography>
            <Typography className="header-subtitle">
              Get expert agricultural advice
            </Typography>
          </Box>
          <IconButton
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            <Mic />
          </IconButton>
        </Box>
      </Box>

      {/* Chat Messages */}
      <Box
        className="page-content"
        sx={{
          pb: "120px", // Extra space for input area
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: "flex",
              justifyContent:
                message.sender === "user" ? "flex-end" : "flex-start",
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                maxWidth: "80%",
                flexDirection:
                  message.sender === "user" ? "row-reverse" : "row",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.sender === "user" ? "#2196F3" : "#4CAF50",
                  width: 32,
                  height: 32,
                  fontSize: "14px",
                }}
              >
                {message.sender === "user" ? "U" : "AI"}
              </Avatar>

              <Paper
                sx={{
                  p: 2,
                  backgroundColor:
                    message.sender === "user" ? "#e3f2fd" : "#f1f8e9",
                  border: `1px solid ${
                    message.sender === "user" ? "#2196F3" : "#4CAF50"
                  }`,
                  borderRadius: 2,
                  borderBottomLeftRadius: message.sender === "user" ? 2 : 0,
                  borderBottomRightRadius: message.sender === "user" ? 0 : 2,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-line",
                    lineHeight: 1.5,
                  }}
                >
                  {message.text}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    mt: 0.5,
                  }}
                >
                  {message.timestamp}
                </Typography>
              </Paper>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          position: "fixed",
          bottom: 56, // Above bottom navigation
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTop: "1px solid #e0e0e0",
          p: 2,
          zIndex: 1000,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

          <IconButton
            onClick={toggleRecording}
            sx={{
              backgroundColor: isRecording ? "#f44336" : "#4CAF50",
              color: "white",
              "&:hover": {
                backgroundColor: isRecording ? "#d32f2f" : "#388e3c",
              },
            }}
          >
            <MicNone />
          </IconButton>

          <IconButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{
              backgroundColor: "#2196F3",
              color: "white",
              "&:hover": {
                backgroundColor: "#1976d2",
              },
              "&:disabled": {
                backgroundColor: "#e0e0e0",
                color: "#9e9e9e",
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>

        {isRecording && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mt: 1,
              py: 1,
              backgroundColor: "#ffebee",
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#f44336",
                animation: "pulse 1s infinite",
              }}
            />
            <Typography variant="body2" color="error">
              Recording... Tap to stop
            </Typography>
          </Box>
        )}
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation
        className="bottom-nav"
        value={navValue}
        onChange={(event, newValue) => {
          setNavValue(newValue);
          const routes = [
            "/dashboard",
            "/field/1",
            "/upload",
            "/chat",
            "/settings",
          ];
          navigate(routes[newValue]);
        }}
        sx={{
          "& .MuiBottomNavigationAction-root": {
            "&.Mui-selected": {
              color: "primary.main",
            },
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="My Crops" icon={<Assessment />} />
        <BottomNavigationAction label="Advisory" icon={<Camera />} />
        <BottomNavigationAction label="Chat" icon={<Chat />} />
        <BottomNavigationAction label="Settings" icon={<Settings />} />
      </BottomNavigation>
    </div>
  );
};

export default ChatPage;
