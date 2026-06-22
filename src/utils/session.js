const SHOP_SESSION_STORAGE_KEY = 'shop-session-id';

export function createSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function saveSessionId(sessionId) {
  if (typeof window === 'undefined' || !sessionId) return;

  localStorage.setItem(SHOP_SESSION_STORAGE_KEY, sessionId);
}

export function getSessionId() {
  if (typeof window === 'undefined') return 'server-session';

  const existingSessionId = localStorage.getItem(SHOP_SESSION_STORAGE_KEY);
  if (existingSessionId) return existingSessionId;

  const sessionId = createSessionId();
  saveSessionId(sessionId);

  return sessionId;
}

export function createSavedSessionId() {
  const sessionId = createSessionId();
  saveSessionId(sessionId);

  return sessionId;
}
