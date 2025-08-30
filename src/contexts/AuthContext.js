import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import authService from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Register function
  const register = async (email, password, userData) => {
    setLoading(true);
    try {
      const result = await authService.register(email, password, userData);
      if (!result.success) {
        toast.showError(result.error);
      } else {
        toast.showSuccess('Account created successfully! Welcome to Celebrity Spotlight.');
      }
      return result;
    } catch (error) {
      toast.showError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (!result.success) {
        toast.showError(result.error);
      } else {
        toast.showSuccess('Welcome back! You have successfully signed in.');
      }
      return result;
    } catch (error) {
      toast.showError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      const result = await authService.logout();
      if (result.success) {
        setCurrentUser(null);
        setUserData(null);
        toast.showInfo('You have been signed out successfully.');
      } else {
        toast.showError(result.error);
      }
      return result;
    } catch (error) {
      toast.showError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      const result = await authService.resetPassword(email);
      if (!result.success) {
        toast.showError(result.error);
      } else {
        toast.showSuccess('Password reset email sent successfully. Please check your inbox.');
      }
      return result;
    } catch (error) {
      toast.showError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const result = await authService.updateUserProfile(userData);
      if (result.success) {
        // Refresh user data
        const userDataResult = await authService.getUserData(currentUser.uid);
        if (userDataResult.success) {
          setUserData(userDataResult.userData);
        }
        toast.showSuccess('Profile updated successfully.');
      } else {
        toast.showError(result.error);
      }
      return result;
    } catch (error) {
      toast.showError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      if (!result.success) {
        toast.showError(result.error);
      } else {
        toast.showSuccess('Password changed successfully.');
      }
      return result;
    } catch (error) {
      toast.showError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Clear all toasts function
  const clearAllToasts = () => {
    toast.clearAllToasts();
  };

  // Listen for authentication state changes
  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!mounted) return;
        
        if (user) {
          setCurrentUser(user);
          // Set loading to false immediately when user is authenticated
          // This prevents the loading screen from showing during redirects
          if (mounted) {
            setLoading(false);
          }
          
          // Fetch user data from Firestore with timeout (in background)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );
          
          try {
            const userDataResult = await Promise.race([
              authService.getUserData(user.uid),
              timeoutPromise
            ]);
            
            if (mounted && userDataResult.success) {
              setUserData(userDataResult.userData);
            }
          } catch (error) {
            console.warn('Failed to fetch user data:', error.message);
            // Continue with basic user info even if Firestore fails
          }
        } else {
          if (mounted) {
            setCurrentUser(null);
            setUserData(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    changePassword,
    clearAllToasts
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;