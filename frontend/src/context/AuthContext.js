import React, { createContext, useReducer, useEffect } from 'react';
import axios from '../utils/index';
import authReducer from './reducers/authReducer';
import setAuthToken from '../utils/setAuthToken';

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null
};

// Create context
export const AuthContext = createContext(initialState);

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    try {
      console.log('Loading user...');
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      
      if (token) {
        console.log('Token found in localStorage:', token.substring(0, 10) + '...');
        setAuthToken(token);
      } else {
        console.log('No token found in localStorage');
        dispatch({ type: 'AUTH_ERROR', payload: 'No authentication token found' });
        return;
      }

      const res = await axios.get('/api/users/me');
      console.log('User loaded successfully:', res.data);

      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error loading user:', err.response ? err.response.data : err.message);
      
      // If we get a 401 Unauthorized, the token is likely invalid
      if (err.response && err.response.status === 401) {
        console.log('Token invalid or expired, clearing token');
        localStorage.removeItem('token');
        setAuthToken(null);
      }
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response ? err.response.data.message : 'Authentication error'
      });
    }
  };

  // Register user
  const register = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      console.log('Registering user:', formData.email);
      
      const res = await axios.post('/api/users/register', formData, config);
      console.log('Registration successful:', res.data);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });

      // Load user after successful registration
      await loadUser();
    } catch (err) {
      console.error('Registration failed:', err);
      console.error('Error details:', err.response ? err.response.data : err.message);
      
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response ? err.response.data.message : 'Registration failed'
      });
    }
  };

  // Login user
  const login = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      console.log('Attempting login with:', formData.email);
      
      // Clear any existing token before login attempt
      localStorage.removeItem('token');
      setAuthToken(null);
      
      // Set loading state
      dispatch({ type: 'LOGIN_START' });
      
      // Make the login request
      const res = await axios.post('/api/users/login', formData, config);
      console.log('Login response:', res.data);
      
      // Validate the response
      if (!res.data || !res.data.success) {
        throw new Error('Login response missing success status');
      }
      
      if (!res.data.token) {
        throw new Error('Login response missing token');
      }

      // Set token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set token in axios headers
      setAuthToken(res.data.token);
      
      console.log('Token set in localStorage and axios headers');

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });

      // Load user after successful login
      console.log('Loading user after login');
      await loadUser();
    } catch (err) {
      console.error('Login failed:', err);
      
      // Clear any partial auth state
      localStorage.removeItem('token');
      setAuthToken(null);
      
      // Get detailed error message
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Final error message:', errorMessage);
      
      dispatch({
        type: 'LOGIN_FAIL',
        payload: errorMessage
      });
    }
  };

  // Logout
  const logout = () => {
    console.log('Logging out, clearing token');
    localStorage.removeItem('token');
    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  // Update profile
  const updateProfile = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.put('/api/users/me', formData, config);

      dispatch({
        type: 'UPDATE_PROFILE_SUCCESS',
        payload: res.data.data
      });
    } catch (err) {
      dispatch({
        type: 'UPDATE_PROFILE_FAIL',
        payload: err.response ? err.response.data.message : 'Update profile failed'
      });
    }
  };

  // Change password
  const changePassword = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.put('/api/users/password', formData, config);

      dispatch({
        type: 'CHANGE_PASSWORD_SUCCESS',
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: 'CHANGE_PASSWORD_FAIL',
        payload: err.response ? err.response.data.message : 'Change password failed'
      });
    }
  };

  // Load user on first run or refresh
  useEffect(() => {
    if (localStorage.token) {
      loadUser();
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        loadUser,
        clearErrors,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 