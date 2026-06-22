const CART_STORAGE_KEY = 'shop-cart-state';
const USER_STORAGE_KEY = 'shop-user-state';

export function loadCartState() {
  if (typeof window === 'undefined') return undefined;

  try {
    const storedValue = localStorage.getItem(CART_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : undefined;
  } catch (error) {
    console.warn('Unable to load saved cart state:', error);
    return undefined;
  }
}

export function saveCartState(cartState) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
  } catch (error) {
    console.warn('Unable to save cart state:', error);
  }
}

export function loadUserState() {
  if (typeof window === 'undefined') return undefined;

  try {
    const storedValue = localStorage.getItem(USER_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : undefined;
  } catch (error) {
    console.warn('Unable to load saved user state:', error);
    return undefined;
  }
}

export function saveUserState(userState) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userState));
  } catch (error) {
    console.warn('Unable to save user state:', error);
  }
}
