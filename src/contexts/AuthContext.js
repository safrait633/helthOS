import React, { createContext, useContext, useState, useEffect } from 'react';
import userDatabase from '../services/UserDatabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Database initialization happens automatically in UserDatabase
    
    // Check if there's a saved user in localStorage
    const savedUser = localStorage.getItem('healthos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const result = userDatabase.authenticateUser(email, password);
      
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('healthos_user', JSON.stringify(result.user));
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error de inicio de sesión' };
    }
  };

  const register = async (userData) => {
    try {
      const result = userDatabase.createUser({
        ...userData,
        role: userData.role || 'user'
      });
      
      if (result.success) {
        const { password: _, ...userWithoutPassword } = result.user;
        setUser(userWithoutPassword);
        localStorage.setItem('healthos_user', JSON.stringify(userWithoutPassword));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error de registro' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthos_user');
  };

  const updateProfile = async (updatedData) => {
    try {
      const result = userDatabase.updateUser(user.id, updatedData);
      
      if (result.success) {
        const { password: _, ...userWithoutPassword } = result.user;
        setUser(userWithoutPassword);
        localStorage.setItem('healthos_user', JSON.stringify(userWithoutPassword));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error al actualizar perfil' };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    userDatabase // Export for use in admin panel
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}