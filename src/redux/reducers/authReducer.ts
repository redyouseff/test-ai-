import {
  AUTH_LOADING,
  AUTH_SUCCESS,
  AUTH_ERROR,
  LOGOUT,
  AuthState
} from '../types';

const userStr = localStorage.getItem('user');
const initialState: AuthState = {
  user: userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
};

const authReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case AUTH_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    
    case AUTH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        error: null
      };
    
    default:
      return state;
  }
};

export default authReducer; 