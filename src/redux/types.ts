// Action Types
export const AUTH_LOADING = 'AUTH_LOADING';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_ERROR = 'AUTH_ERROR';
export const LOGOUT = 'LOGOUT';

// API URL and Endpoints
export const API_URL = 'https://care-insight-api-9ed25d3ea3ea.herokuapp.com';
export const API_ENDPOINTS = {
  login: '/api/v1/auth/login',
  register: '/api/v1/auth/register'
};

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  specialty: string;
  role: string;
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  specialization?: string;
  phone?: string;
} 