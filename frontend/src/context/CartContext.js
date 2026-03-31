import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { syncCart as syncCartApi, mergeCart as mergeCartApi } from '../api/cart';

const CART_KEY = 'mercury_cart';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD':
      return action.payload || [];
    case 'ADD': {
      const existing = state.find(item => item._id === action.payload._id);
      if (existing) {
        return state.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      }
      return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }];
    }
    case 'REMOVE':
      return state.filter(item => item._id !== action.payload);
    case 'UPDATE_QUANTITY': {
      const { id, quantity, maxStock } = action.payload;
      const capped = Math.min(Math.max(0, quantity), maxStock ?? 999);
      return state.map(item =>
        item._id === id ? { ...item, quantity: capped } : item
      ).filter(item => item.quantity > 0);
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
};

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const { isAuthenticated, accessToken } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) dispatch({ type: 'LOAD', payload: JSON.parse(saved) });
    } catch (e) {
      console.warn('Could not load cart from storage');
    }
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Sync with backend when authenticated and cart changes
  const syncTimeoutRef = React.useRef(null);
  useEffect(() => {
    if (!isAuthenticated || !accessToken || cart.length === 0) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      const items = cart.map(item => ({ product: item._id, quantity: item.quantity }));
      syncCartApi(items, accessToken).catch(() => {});
    }, 1000);
    return () => clearTimeout(syncTimeoutRef.current);
  }, [cart, isAuthenticated, accessToken]);

  // On login: merge guest cart with server cart
  const hasmerged = React.useRef(false);
  useEffect(() => {
    if (isAuthenticated && accessToken && !hasmerged.current) {
      hasmerged.current = true;
      const guestItems = cart.map(item => ({ product: item._id, quantity: item.quantity }));
      if (guestItems.length > 0) {
        mergeCartApi(guestItems, accessToken).catch(() => {});
      }
    }
    if (!isAuthenticated) {
      hasmerged.current = false;
    }
  }, [isAuthenticated, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToCart = useCallback((product, quantity = 1) => {
    dispatch({ type: 'ADD', payload: { ...product, quantity } });
  }, []);

  const removeFromCart = useCallback((id) => {
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  const updateQuantity = useCallback((id, quantity, maxStock) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity, maxStock } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
