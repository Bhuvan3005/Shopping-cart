import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { loginUser, registerUser, refreshToken as refreshTokenApi } from '../api/auth';

const AUTH_KEY = 'mercury_auth';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false,
      };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'LOADED':
      return { ...state, loading: false };
    default:
      return state;
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'SET_USER', payload: parsed });
      } else {
        dispatch({ type: 'LOADED' });
      }
    } catch {
      dispatch({ type: 'LOADED' });
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!state.loading) {
      if (state.user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        }));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, [state.user, state.accessToken, state.refreshToken, state.loading]);

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password);
    dispatch({
      type: 'SET_USER',
      payload: {
        user: { _id: data._id, name: data.name, email: data.email, role: data.role },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    });
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await registerUser(name, email, password);
    dispatch({
      type: 'SET_USER',
      payload: {
        user: { _id: data._id, name: data.name, email: data.email, role: data.role },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const refresh = useCallback(async () => {
    if (!state.refreshToken) return;
    try {
      const data = await refreshTokenApi(state.refreshToken);
      dispatch({
        type: 'SET_USER',
        payload: {
          user: state.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      });
    } catch {
      logout();
    }
  }, [state.refreshToken, state.user, logout]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        accessToken: state.accessToken,
        loading: state.loading,
        isAuthenticated: !!state.user,
        isAdmin: state.user?.role === 'admin',
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
