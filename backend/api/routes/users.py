from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, validator
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import uuid
import hashlib
import secrets

router = APIRouter()
security = HTTPBearer()

class UserRegistration(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size: Optional[float] = None
    farming_type: Optional[str] = None
    
    @validator('username')
    def username_must_be_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        return v
    
    @validator('password')
    def password_must_be_strong(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size: Optional[float] = None
    farming_type: Optional[str] = None
    created_at: str
    last_login: Optional[str] = None
    is_active: bool = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size: Optional[float] = None
    farming_type: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str

class PasswordReset(BaseModel):
    email: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

# In-memory storage for demo (in production, use a database)
users_db = {}
active_tokens = {}

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

def create_access_token(user_id: str) -> str:
    """Create access token for user"""
    token = secrets.token_urlsafe(32)
    active_tokens[token] = {
        "user_id": user_id,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(hours=24)
    }
    return token

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from token"""
    token = credentials.credentials
    
    if token not in active_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    
    token_data = active_tokens[token]
    
    if datetime.now() > token_data["expires_at"]:
        del active_tokens[token]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    
    user_id = token_data["user_id"]
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return users_db[user_id]

@router.post("/register", response_model=UserProfile)
async def register_user(user_data: UserRegistration):
    """
    Register a new user
    """
    try:
        # Check if username already exists
        for user in users_db.values():
            if user["username"] == user_data.username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                )
            if user["email"] == user_data.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(user_data.password)
        
        new_user = {
            "id": user_id,
            "username": user_data.username,
            "email": user_data.email,
            "password_hash": hashed_password,
            "full_name": user_data.full_name,
            "farm_location": user_data.farm_location,
            "farm_size": user_data.farm_size,
            "farming_type": user_data.farming_type,
            "created_at": datetime.now().isoformat(),
            "last_login": None,
            "is_active": True
        }
        
        users_db[user_id] = new_user
        
        # Return user profile (without password)
        return UserProfile(**{k: v for k, v in new_user.items() if k != "password_hash"})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration error: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin):
    """
    Login user and return access token
    """
    try:
        # Find user by username
        user = None
        for u in users_db.values():
            if u["username"] == login_data.username:
                user = u
                break
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        # Check if user is active
        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Update last login
        user["last_login"] = datetime.now().isoformat()
        
        # Create access token
        access_token = create_access_token(user["id"])
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user_id=user["id"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user's profile
    """
    try:
        return UserProfile(**{k: v for k, v in current_user.items() if k != "password_hash"})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile fetch error: {str(e)}"
        )

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update current user's profile
    """
    try:
        user_id = current_user["id"]
        user = users_db[user_id]
        
        # Update fields if provided
        if profile_data.full_name is not None:
            user["full_name"] = profile_data.full_name
        if profile_data.farm_location is not None:
            user["farm_location"] = profile_data.farm_location
        if profile_data.farm_size is not None:
            user["farm_size"] = profile_data.farm_size
        if profile_data.farming_type is not None:
            user["farming_type"] = profile_data.farming_type
        
        return UserProfile(**{k: v for k, v in user.items() if k != "password_hash"})
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile update error: {str(e)}"
        )

@router.post("/logout")
async def logout_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout user and invalidate token
    """
    try:
        token = credentials.credentials
        
        if token in active_tokens:
            del active_tokens[token]
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout error: {str(e)}"
        )

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """
    Change user password
    """
    try:
        user_id = current_user["id"]
        user = users_db[user_id]
        
        # Verify old password
        if not verify_password(password_data.old_password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid current password"
            )
        
        # Validate new password
        if len(password_data.new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 6 characters"
            )
        
        # Update password
        user["password_hash"] = hash_password(password_data.new_password)
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password change error: {str(e)}"
        )

@router.post("/reset-password")
async def reset_password(reset_data: PasswordReset):
    """
    Request password reset (demo implementation)
    """
    try:
        # Find user by email
        user = None
        for u in users_db.values():
            if u["email"] == reset_data.email:
                user = u
                break
        
        if not user:
            # Don't reveal if email exists or not for security
            return {"message": "If the email exists, a reset link has been sent"}
        
        # In a real implementation, send email with reset token
        # For demo, we'll generate a temporary password
        temp_password = secrets.token_urlsafe(8)
        user["password_hash"] = hash_password(temp_password)
        
        return {
            "message": "Password reset successfully",
            "temporary_password": temp_password,  # Only for demo - never do this in production
            "note": "Please change your password after logging in"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset error: {str(e)}"
        )

@router.get("/users", response_model=List[UserProfile])
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """
    Get all users (admin functionality for demo)
    """
    try:
        users = [
            UserProfile(**{k: v for k, v in user.items() if k != "password_hash"})
            for user in users_db.values()
        ]
        return users
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Users fetch error: {str(e)}"
        )

@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """
    Delete current user's account
    """
    try:
        user_id = current_user["id"]
        
        # Remove user from database
        if user_id in users_db:
            del users_db[user_id]
        
        # Remove all tokens for this user
        tokens_to_remove = [
            token for token, data in active_tokens.items()
            if data["user_id"] == user_id
        ]
        
        for token in tokens_to_remove:
            del active_tokens[token]
        
        return {"message": "Account deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Account deletion error: {str(e)}"
        )

@router.get("/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """
    Verify if token is valid and return user info
    """
    try:
        return {
            "valid": True,
            "user": UserProfile(**{k: v for k, v in current_user.items() if k != "password_hash"})
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@router.get("/sessions")
async def get_active_sessions(current_user: dict = Depends(get_current_user)):
    """
    Get all active sessions for current user
    """
    try:
        user_id = current_user["id"]
        
        user_sessions = [
            {
                "token_id": token[:8] + "...",  # Show partial token for identification
                "created_at": data["created_at"].isoformat(),
                "expires_at": data["expires_at"].isoformat(),
                "is_current": False  # Would need to identify current token
            }
            for token, data in active_tokens.items()
            if data["user_id"] == user_id
        ]
        
        return {
            "active_sessions": user_sessions,
            "total_sessions": len(user_sessions)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sessions fetch error: {str(e)}"
        )