import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { toast } from "react-hot-toast";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const { user } = await authService.login(credentials);
      setUser(user);
      toast.success("Login successful");
      return user;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const { user } = await authService.register(userData);
      setUser(user);
      toast.success("Registration successful");
      return user;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success("Logged out successfully");
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      toast.success("Password reset link sent to your email");
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send reset email";
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await authService.resetPassword(token, password);
      toast.success("Password reset successfully");
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to reset password";
      toast.error(message);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const user = await authService.refreshUser();
      setUser(user);
      return user;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isStudent: user?.role === "student",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
