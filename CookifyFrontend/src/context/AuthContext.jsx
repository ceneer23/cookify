import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

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
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem('cookify_token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('cookify_token');
    if (token) {
      loadUser();
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/auth/me');
      dispatch({ type: 'SET_USER', payload: res.data });
    } catch (error) {
      localStorage.removeItem('cookify_token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', {
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
      const errorMsg = error.response?.data?.error || 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', userData);
      
      localStorage.setItem('cookify_token', res.data.token);
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: res.data, token: res.data.token } 
      });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('cookify_token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      loadUser
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