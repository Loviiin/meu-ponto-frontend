// Simple toast manager
import { reactive } from 'vue';

let counter = 0;
export const toasts = reactive([]);

export function addToast({ message, type = 'info', timeout = 3500 }) {
  const id = ++counter;
  toasts.push({ id, message, type, timeout });
  if (timeout > 0) {
    setTimeout(() => removeToast(id), timeout);
  }
  return id;
}

export function removeToast(id) {
  const idx = toasts.findIndex(t => t.id === id);
  if (idx !== -1) toasts.splice(idx, 1);
}

export const toast = {
  success(msg, timeout){ addToast({ message: msg, type: 'success', timeout }); },
  error(msg, timeout){ addToast({ message: msg, type: 'error', timeout }); },
  info(msg, timeout){ addToast({ message: msg, type: 'info', timeout }); },
  warn(msg, timeout){ addToast({ message: msg, type: 'warn', timeout }); },
};
