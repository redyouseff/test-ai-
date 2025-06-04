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

    // First, get the token from login
    const loginResponse = await api.post(API_ENDPOINTS.login, credentials);
    const { token } = loginResponse.data;

    // Store token in localStorage
    localStorage.setItem('token', token);

    // Then fetch the user profile using the token
    const profileResponse = await api.get('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const user = profileResponse.data.data;
    
    // Store user in localStorage
    try {
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

    return { user, token };
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

    // First, register and get the token
    const registerResponse = await api.post(API_ENDPOINTS.register, userData);
    const { token } = registerResponse.data;
    
    // Store token in localStorage
    localStorage.setItem('token', token);

    // Then fetch the user profile using the token
    const profileResponse = await api.get('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const user = profileResponse.data.data;
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    dispatch({
      type: AUTH_SUCCESS,
      payload: {
        user,
        token
      }
    });

    return { user, token };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
    dispatch({
      type: AUTH_ERROR,
      payload: errorMessage
    });
    throw error;
  }
};

export const logout = () => ({
  type: LOGOUT as const
});

export type AuthAction = ReturnType<typeof logout>;

export const fetchProfile = () => async (dispatch: Dispatch, getState: any) => {
  try {
    dispatch({ type: AUTH_LOADING });
    
    // الحصول على التوكن من Redux state أو localStorage
    const { token } = getState().auth;
    const storedToken = localStorage.getItem('token');
    const authToken = token || storedToken;

    if (!authToken) {
      throw new Error('لم يتم العثور على توكن المصادقة');
    }

    const response = await api.get('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    // تحديث Redux state
    dispatch({
      type: AUTH_SUCCESS,
      payload: {
        user: response.data.data,
        token: authToken
      }
    });
    
    // تحديث localStorage
    localStorage.setItem('user', JSON.stringify(response.data.data));
    if (!token) {
      localStorage.setItem('token', authToken);
    }
  } catch (error: any) {
    // في حالة الخطأ، نحاول استعادة البيانات من localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: JSON.parse(storedUser),
          token: localStorage.getItem('token')
        }
      });
    } else {
      dispatch({
        type: AUTH_ERROR,
        payload: error.response?.data?.message || 'فشل في جلب الملف الشخصي'
      });
    }
    console.log("fetchProfile: error=", error); // debug
  }
}; 