import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true 
      };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem('cookify_token'),
  isAuthenticated: false,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  useEffect(() => {
    const token = localStorage.getItem('cookify_token');
    if (token) {
      dispatch({ type: 'LOGIN_START' });
      loadUser();
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      dispatch({ type: 'SET_USER', payload: res.data });
    } catch (error) {
      localStorage.removeItem('cookify_token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email, password, retryCount = 0) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      
      localStorage.setItem('cookify_token', res.data.token);
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: res.data, token: res.data.token } 
      });
      return { success: true };
    } catch (error) {
      // Retry logic for network issues (common on mobile)
      if (retryCount < 2 && (
        error.code === 'NETWORK_ERROR' || 
        error.code === 'ECONNABORTED' || 
        error.message.includes('timeout') ||
        error.message.includes('Network connection failed')
      )) {
        console.log(`Login attempt ${retryCount + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return login(email, password, retryCount + 1);
      }
      
      const errorMsg = error.response?.data?.error || error.message || 'Login failed';
      const details = error.response?.data?.details || [];
      dispatch({ type: 'LOGIN_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg, details };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      
      
      localStorage.setItem('cookify_token', res.data.token);
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: res.data, token: res.data.token } 
      });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      const details = error.response?.data?.details || [];
      dispatch({ type: 'LOGIN_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg, details };
    }
  };

  const logout = () => {
    localStorage.removeItem('cookify_token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      loadUser,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};