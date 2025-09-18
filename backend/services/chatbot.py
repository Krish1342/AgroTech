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

from dotenv import load_dotenv

load_dotenv()

class ChatState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    context: Dict[str, Any]

class AgriChatbot:
    def __init__(self):
        """Initialize the AgriChatbot with Groq and LangGraph"""
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        if not self.groq_api_key:
            # Use a placeholder for development if no key is provided
            print("⚠️  Warning: GROQ_API_KEY not found. Using placeholder.")
            self.groq_api_key = "placeholder_key"
        
        try:
            # Initialize Groq LLM with minimal parameters
            self.llm = ChatGroq(
                api_key=self.groq_api_key,
                model="llama3-8b-8192",
                temperature=0.3,
                max_tokens=1024
            )
        except Exception as e:
            print(f"⚠️  Warning: Failed to initialize ChatGroq: {e}")
            self.llm = None
        
        # Message history storage (in production, use a database)
        self.chat_sessions = {}
        self.max_history = 4  # Keep only last 4 messages for context
        
        # Build the conversation graph
        try:
            self.graph = self._build_graph()
            # Add memory for state persistence
            self.memory = MemorySaver()
        except Exception as e:
            print(f"⚠️  Warning: Failed to build graph: {e}")
            self.graph = None
            self.memory = None
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph conversation flow"""
        
        def chat_node(state: ChatState) -> ChatState:
            """Main chat processing node"""
            messages = state["messages"]
            context = state.get("context", {})
            
            # If LLM is not available, return a fallback response
            if not self.llm:
                fallback_response = AIMessage(content="I'm currently experiencing technical difficulties. Please try again later or contact support for assistance.")
                fallback_response.timestamp = datetime.now().isoformat()
                return {
                    "messages": [fallback_response],
                    "context": context
                }
            
            # Add system message with agricultural expertise
            system_prompt = self._get_system_prompt(context)
            
            # Prepare messages for the LLM (system + recent history)
            llm_messages = [SystemMessage(content=system_prompt)]
            
            # Add recent conversation history (keep last few messages for context)
            recent_messages = messages[-self.max_history:] if len(messages) > self.max_history else messages
            llm_messages.extend(recent_messages)
            
            try:
                # Get response from Groq
                response = self.llm.invoke(llm_messages)
                
                # Return updated state with new AI message
                return {
                    "messages": [response],
                    "context": context
                }
            except Exception as e:
                print(f"Error in chat_node: {e}")
                fallback_response = AIMessage(content=f"I'm having trouble processing your request. Error: {str(e)}")
                fallback_response.timestamp = datetime.now().isoformat()
                return {
                    "messages": [fallback_response],
                    "context": context
                }
        
        # Create the graph
        workflow = StateGraph(ChatState)
        
        # Add nodes
        workflow.add_node("chat", chat_node)
        
        # Set entry point
        workflow.set_entry_point("chat")
        
        # Set finish point
        workflow.add_edge("chat", END)
        
        try:
            return workflow.compile(checkpointer=self.memory if self.memory else None)
        except Exception as e:
            print(f"Warning: Failed to compile with checkpointer: {e}")
            return workflow.compile()
    
    def _get_system_prompt(self, context: Dict[str, Any]) -> str:
        """Generate system prompt based on context"""
        base_prompt = """You are an expert agricultural AI assistant specialized in helping farmers with:

1. Crop management and cultivation techniques
2. Soil health and fertilizer recommendations  
3. Weather-based farming advice
4. Disease identification and treatment
5. Irrigation and water management
6. Market trends and pricing insights
7. Sustainable farming practices

Guidelines for responses:
- Provide practical, actionable advice
- Consider local climate and soil conditions when mentioned
- Suggest specific products, techniques, or timing when appropriate
- Ask clarifying questions if more information is needed
- Keep responses concise but informative
- Always prioritize safe and sustainable farming practices

"""
        
        # Add context-specific information
        if context:
            base_prompt += "\nCurrent Context:\n"
            
            if "fields" in context and context["fields"]:
                base_prompt += f"- Farmer has {len(context['fields'])} fields\n"
                for field in context["fields"][:2]:  # Show first 2 fields
                    base_prompt += f"  * {field.get('name', 'Field')}: {field.get('crop', 'Unknown crop')}, {field.get('area', 'Unknown area')}\n"
            
            if "user" in context and context["user"]:
                user = context["user"]
                if user.get("location"):
                    base_prompt += f"- Location: {user['location']}\n"
                if user.get("farmName"):
                    base_prompt += f"- Farm: {user['farmName']}\n"
            
            if "currentLocation" in context and context["currentLocation"]:
                loc = context["currentLocation"]
                base_prompt += f"- Current coordinates: {loc.get('lat', 'Unknown')}, {loc.get('lng', 'Unknown')}\n"
        
        base_prompt += "\nProvide helpful, specific agricultural advice based on this context."
        
        return base_prompt
    
    def get_session_id(self, user_id: str = "default") -> str:
        """Generate or get session ID for chat history"""
        return f"session_{user_id}_{datetime.now().strftime('%Y%m%d')}"
    
    def get_chat_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get chat history for a session"""
        if session_id not in self.chat_sessions:
            return []
        
        messages = self.chat_sessions[session_id]["messages"]
        
        # Convert to dict format for API response
        history = []
        for msg in messages[-limit:]:
            if isinstance(msg, HumanMessage):
                history.append({
                    "role": "user",
                    "content": msg.content,
                    "timestamp": getattr(msg, 'timestamp', datetime.now().isoformat())
                })
            elif isinstance(msg, AIMessage):
                history.append({
                    "role": "assistant", 
                    "content": msg.content,
                    "timestamp": getattr(msg, 'timestamp', datetime.now().isoformat())
                })
        
        return history
    
    def chat(self, message: str, context: Dict[str, Any] = None, session_id: str = None) -> Dict[str, Any]:
        """
        Process a chat message and return response
        
        Args:
            message: User's message
            context: Additional context (fields, user info, etc.)
            session_id: Chat session identifier
        
        Returns:
            Dict with response message and metadata
        """
        if not session_id:
            session_id = self.get_session_id()
        
        # Initialize session if not exists
        if session_id not in self.chat_sessions:
            self.chat_sessions[session_id] = {
                "messages": [],
                "created_at": datetime.now(),
                "last_activity": datetime.now()
            }
        
        session = self.chat_sessions[session_id]
        
        # Create user message
        user_message = HumanMessage(content=message)
        user_message.timestamp = datetime.now().isoformat()
        
        # Prepare state
        state = ChatState(
            messages=session["messages"] + [user_message],
            context=context or {}
        )
        
        try:
            # Process through LangGraph if available
            if self.graph:
                result = self.graph.invoke(state)
                # Extract AI response
                ai_message = result["messages"][-1]
            else:
                # Fallback to direct LLM call if graph is not available
                if self.llm:
                    system_prompt = self._get_system_prompt(context or {})
                    messages = [SystemMessage(content=system_prompt)] + session["messages"][-self.max_history:] + [user_message]
                    ai_message = self.llm.invoke(messages)
                else:
                    ai_message = AIMessage(content="I'm currently experiencing technical difficulties. Please try again later.")
            
            ai_message.timestamp = datetime.now().isoformat()
            
            # Update session with new messages (keep history limited)
            session["messages"].extend([user_message, ai_message])
            
            # Trim history to max_history * 2 (user + ai message pairs)
            if len(session["messages"]) > self.max_history * 2:
                session["messages"] = session["messages"][-(self.max_history * 2):]
            
            session["last_activity"] = datetime.now()
            
            return {
                "message": ai_message.content,
                "session_id": session_id,
                "timestamp": ai_message.timestamp,
                "success": True
            }
            
        except Exception as e:
            return {
                "message": "I'm sorry, I'm having trouble processing your request right now. Please try again.",
                "error": str(e),
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "success": False
            }
    
    def clear_session(self, session_id: str) -> bool:
        """Clear chat history for a session"""
        if session_id in self.chat_sessions:
            del self.chat_sessions[session_id]
            return True
        return False
    
    def cleanup_old_sessions(self, max_age_hours: int = 24):
        """Remove old chat sessions"""
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        sessions_to_remove = []
        for session_id, session in self.chat_sessions.items():
            if session["last_activity"] < cutoff_time:
                sessions_to_remove.append(session_id)
        
        for session_id in sessions_to_remove:
            del self.chat_sessions[session_id]
        
        return len(sessions_to_remove)

# Global chatbot instance
chatbot = None

def get_chatbot() -> AgriChatbot:
    """Get or create global chatbot instance"""
    global chatbot
    if chatbot is None:
        chatbot = AgriChatbot()
    return chatbot

def health_check() -> Dict[str, Any]:
    """Health check for the chatbot service"""
    try:
        bot = get_chatbot()
        # Test with a simple message
        test_response = bot.chat("Hello", session_id="health_check")
        return {
            "status": "healthy",
            "groq_connection": test_response["success"],
            "message": "Chatbot service is operational"
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e),
            "message": "Chatbot service is experiencing issues"
        }