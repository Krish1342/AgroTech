import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          const response = await api.get("/users/verify-token", {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (response.data.valid) {
            setToken(savedToken);
            setUser(response.data.user);
          } else {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post("/users/login", {
        username,
        password,
      });

      const { access_token, user_id } = response.data;

      setToken(access_token);
      localStorage.setItem("token", access_token);

      // Fetch user profile
      const profileResponse = await api.get("/users/profile", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      setUser(profileResponse.data);

      return { success: true, user: profileResponse.data };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/users/register", userData);

      // Auto-login after successful registration
      const loginResult = await login(userData.username, userData.password);

      return {
        success: true,
        user: response.data,
        autoLogin: loginResult.success,
      };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post(
          "/users/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/users/profile", profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      console.error("Profile update failed:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Profile update failed",
      };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await api.post(
        "/users/change-password",
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error("Password change failed:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Password change failed",
      };
    }
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getAuthHeaders,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
