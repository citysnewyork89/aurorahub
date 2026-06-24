import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/auth/me`).then(r => {
      setUser(r.data);
      return axios.get(`${API}/auth/me/admin`);
    }).then(r => {
      setIsAdmin(r.data.isAdmin);
    }).catch(() => {
      setUser(null);
    }).finally(() => setLoading(false));
  }, []);

  const login = () => { window.location.href = `${API}/auth/discord`; };

  const logout = async () => {
    await axios.post(`${API}/auth/logout`);
    setUser(null);
    setIsAdmin(false);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const API_URL = API;
