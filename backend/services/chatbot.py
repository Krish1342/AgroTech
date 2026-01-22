"""
LangGraph-based chatbot for agricultural assistance using Groq
"""
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from typing_extensions import Annotated, TypedDict
from langgraph.checkpoint.memory import MemorySaver
"""
Simple, dependency-free chatbot for agricultural assistance.
This version avoids external LLMs to ensure local development works reliably.
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta


class SimpleChatbot:
    def __init__(self) -> None:
        self.chat_sessions: Dict[str, Dict[str, Any]] = {}
        self.max_history = 10

    def get_session_id(self, user_id: str = "default") -> str:
        return f"session_{user_id}_{datetime.now().strftime('%Y%m%d')}"

    def _generate_reply(self, text: str) -> str:
        msg = (text or "").strip().lower()

        if not msg:
            return (
                "Hi! I can help with crop choices, soil care, irrigation, and weather tips. "
                "Ask me something like: 'What crops can I plant now?' or 'How often should I water?'."
            )

        # Simple keyword routing
        if any(k in msg for k in ["weather", "rain", "temperature", "forecast"]):
            return (
                "For quick weather guidance: water early morning or late evening to reduce evaporation. "
                "Check the Weather tab for live conditions and a 5‑day forecast."
            )

        if any(k in msg for k in ["water", "irrigation", "moisture"]):
            return (
                "Irrigation tip: water deeply but less frequently to promote strong roots. "
                "Use mulch to reduce evaporation and aim for soil moisture around 20–35% for many field crops."
            )

        if any(k in msg for k in ["soil", "ph", "fertilizer", "nutrient", "npk"]):
            return (
                "Soil care: keep pH near 6.0–7.0 for most crops. Apply balanced N‑P‑K based on a soil test; "
                "add organic matter (compost) to improve structure and water retention."
            )

        if any(k in msg for k in ["crop", "plant", "sow", "seed"]):
            month = datetime.now().strftime("%B")
            return (
                f"General crop suggestion for {month}: consider fast‑growing vegetables (e.g., okra, leafy greens) "
                "and local staples suited to your region. Choose disease‑resistant varieties and stagger plantings."
            )

        if any(k in msg for k in ["disease", "pest", "blight", "fungus", "insect"]):
            return (
                "Disease management: remove infected leaves, improve airflow, avoid overhead watering, "
                "and rotate crops. Use targeted bio‑safe controls when necessary."
            )

        if any(k in msg for k in ["hello", "hi", "hey"]):
            return "Hello! How can I help with your field today?"

        # Default helpful reply
        return (
            "I can help with crops, soil health, irrigation, and weather tips. "
            "Try asking: 'What should I plant now?' or 'How to improve soil fertility?'."
        )

    def get_chat_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        session = self.chat_sessions.get(session_id)
        if not session:
            return []
        return session["messages"][-limit:]

    def chat(self, message: str, context: Dict[str, Any] = None, session_id: str = None) -> Dict[str, Any]:
        if not session_id:
            session_id = self.get_session_id()

        if session_id not in self.chat_sessions:
            self.chat_sessions[session_id] = {
                "messages": [],
                "created_at": datetime.now(),
                "last_activity": datetime.now(),
            }

        session = self.chat_sessions[session_id]

        # Store user message
        user_entry = {
            "role": "user",
            "content": message,
            "timestamp": datetime.now().isoformat(),
        }

        reply = self._generate_reply(message)

        ai_entry = {
            "role": "assistant",
            "content": reply,
            "timestamp": datetime.now().isoformat(),
        }

        session["messages"].extend([user_entry, ai_entry])
        if len(session["messages"]) > self.max_history:
            session["messages"] = session["messages"][-self.max_history :]
        session["last_activity"] = datetime.now()

        return {
            "message": reply,
            "session_id": session_id,
            "timestamp": ai_entry["timestamp"],
            "success": True,
        }

    def clear_session(self, session_id: str) -> bool:
        return self.chat_sessions.pop(session_id, None) is not None

    def cleanup_old_sessions(self, max_age_hours: int = 24) -> int:
        cutoff = datetime.now() - timedelta(hours=max_age_hours)
        to_remove = [sid for sid, s in self.chat_sessions.items() if s["last_activity"] < cutoff]
        for sid in to_remove:
            self.chat_sessions.pop(sid, None)
        return len(to_remove)


# Global singleton
_chatbot_instance: SimpleChatbot | None = None


def get_chatbot() -> SimpleChatbot:
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = SimpleChatbot()
    return _chatbot_instance


def health_check() -> Dict[str, Any]:
    bot = get_chatbot()
    test = bot.chat("hello", session_id="health_check")
    return {
        "status": "healthy",
        "message": "Chatbot service is operational",
        "echo": bool(test.get("success")),
    }