const listeners = new Set();
let idCounter = 0;

export function showToast(message, type = "success") {
  const toast = { id: ++idCounter, type, message };
  listeners.forEach((listener) => listener(toast));
}

export function subscribeToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
