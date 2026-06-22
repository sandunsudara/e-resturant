import { configureStore } from '@reduxjs/toolkit';

import cartReducer, { createCartInitialState } from 'features/cart/cartSlice';
import shopReducer from 'features/shop/shopSlice';
import userReducer, { createUserInitialState } from 'features/user/userSlice';
import { loadCartState, loadUserState, saveCartState, saveUserState } from './persistence';
import { getSessionId, saveSessionId } from 'utils/session';

const savedCartState = loadCartState();
const activeSessionId = savedCartState?.activeSessionId || getSessionId();
saveSessionId(activeSessionId);
const cartState = savedCartState
  ? {
      ...createCartInitialState(activeSessionId),
      shops: savedCartState.shops || {}
    }
  : createCartInitialState(activeSessionId);
const savedUserState = loadUserState();
const userState = savedUserState ? { ...createUserInitialState(), ...savedUserState } : createUserInitialState();

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    shop: shopReducer,
    user: userReducer
  },
  preloadedState: {
    cart: cartState,
    user: userState
  }
});

store.subscribe(() => {
  const state = store.getState();

  saveCartState(state.cart);
  saveUserState(state.user);
});
