import { createSlice } from '@reduxjs/toolkit';

import { getSessionId } from 'utils/session';

export function createCartInitialState(activeSessionId = getSessionId()) {
  return {
    activeSessionId,
    shops: {}
  };
}

function getShopCart(state, shopSlug) {
  if (!state.shops[shopSlug]) {
    state.shops[shopSlug] = { items: [] };
  }

  return state.shops[shopSlug];
}

function toCartItem(item) {
  return {
    id: item.cartId || item.id,
    productId: item.productId || item.id,
    variationId: item.variationId || 0,
    variationLabel: item.variationLabel || '',
    name: item.name,
    price: item.price,
    currency: item.currency,
    image: item.image
  };
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: createCartInitialState(),
  reducers: {
    hydrateCart(state, action) {
      const savedCart = action.payload;

      if (!savedCart || typeof savedCart !== 'object') return;

      state.activeSessionId = savedCart.activeSessionId || state.activeSessionId;
      state.shops = savedCart.shops || {};
    },
    setActiveSessionId(state, action) {
      if (!action.payload) return;

      state.activeSessionId = action.payload;
      state.shops = {};
    },
    addItem(state, action) {
      const { shopSlug, item } = action.payload;
      const shopCart = getShopCart(state, shopSlug);
      const existingItem = shopCart.items.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        existingItem.quantity += 1;
        return;
      }

      shopCart.items.push({
        ...toCartItem(item),
        quantity: 1
      });
    },
    incrementItem(state, action) {
      const { shopSlug, itemId } = action.payload;
      const shopCart = getShopCart(state, shopSlug);
      const existingItem = shopCart.items.find((cartItem) => cartItem.id === itemId);

      if (existingItem) {
        existingItem.quantity += 1;
      }
    },
    decrementItem(state, action) {
      const { shopSlug, itemId } = action.payload;
      const shopCart = getShopCart(state, shopSlug);
      const existingItem = shopCart.items.find((cartItem) => cartItem.id === itemId);

      if (!existingItem) return;

      if (existingItem.quantity <= 1) {
        shopCart.items = shopCart.items.filter((cartItem) => cartItem.id !== itemId);
        return;
      }

      existingItem.quantity -= 1;
    },
    removeItem(state, action) {
      const { shopSlug, itemId } = action.payload;
      const shopCart = getShopCart(state, shopSlug);

      shopCart.items = shopCart.items.filter((cartItem) => cartItem.id !== itemId);
    },
    clearCart(state, action) {
      const { shopSlug } = action.payload;
      const shopCart = getShopCart(state, shopSlug);

      shopCart.items = [];
    }
  }
});

export const { addItem, clearCart, decrementItem, hydrateCart, incrementItem, removeItem, setActiveSessionId } = cartSlice.actions;

export function selectCartItems(state, shopSlug) {
  return state.cart.shops?.[shopSlug]?.items || [];
}

export function selectCartTotalQuantity(state, shopSlug) {
  return selectCartItems(state, shopSlug).reduce((total, item) => total + item.quantity, 0);
}

export function selectCartSubtotal(state, shopSlug) {
  return selectCartItems(state, shopSlug).reduce((total, item) => total + item.price * item.quantity, 0);
}

export function selectActiveSessionId(state) {
  return state.cart.activeSessionId;
}

export default cartSlice.reducer;
