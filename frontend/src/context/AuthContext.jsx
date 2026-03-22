/**
 * Authentication Context — provides user state and auth actions throughout app.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('lexisure_user');
    const token = localStorage.getItem('lexisure_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('lexisure_token', data.access_token);
    localStorage.setItem('lexisure_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (email, password, full_name) => {
    const { data } = await authAPI.register({ email, password, full_name });
    localStorage.setItem('lexisure_token', data.access_token);
    localStorage.setItem('lexisure_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('lexisure_token');
    localStorage.removeItem('lexisure_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
