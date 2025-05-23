import {
  AUTH_LOADING,
  AUTH_SUCCESS,
  AUTH_ERROR,
  LOGOUT,
  API_URL,
  API_ENDPOINTS,
  LoginCredentials,
  RegisterData
} from '../types';
import api from '../api';
import { Dispatch } from 'redux';

export const login = (credentials: LoginCredentials) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: AUTH_LOADING });

    const response = await api.post(API_ENDPOINTS.login, credentials);

    const { token, user } = response.data;
    
    // Store token and user in localStorage with error handling
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User stored in localStorage:', localStorage.getItem('user'));
      console.log('Token stored in localStorage:', localStorage.getItem('token'));
    } catch (storageError) {
      console.error('Error storing data in localStorage:', storageError);
    }
    
    dispatch({
      type: AUTH_SUCCESS,
      payload: {
        user,
        token
      }
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
    dispatch({
      type: AUTH_ERROR,
      payload: errorMessage
    });
    throw error;
  }
};

export const register = (userData: RegisterData) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: AUTH_LOADING });

    const response = await api.post(API_ENDPOINTS.register, userData);

    const { token, user } = response.data;
    
    // Store token and user in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    dispatch({
      type: AUTH_SUCCESS,
      payload: {
        user,
        token
      }
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
    dispatch({
      type: AUTH_ERROR,
      payload: errorMessage
    });
    throw error;
  }
};

export const logout = () => (dispatch: Dispatch) => {
  // Remove token and user from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  dispatch({ type: LOGOUT });
};

export const fetchProfile = () => async (dispatch: Dispatch, getState: any) => {
  try {
    dispatch({ type: AUTH_LOADING });
    const { token } = getState().auth;
    const response = await api.get('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    dispatch({
      type: AUTH_SUCCESS,
      payload: {
        user: response.data.user,
        token
      }
    });
    localStorage.setItem('user', JSON.stringify(response.data.user));
  } catch (error: any) {
    dispatch({
      type: AUTH_ERROR,
      payload: error.response?.data?.message || 'Failed to fetch profile'
    });
  }
}; 