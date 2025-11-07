// Local Storage preferences manager
const STORAGE_KEY = 'app_preferences';

const defaults = {
  darkMode: false, // false = tema azul/dourado (padrão), true = tema claro
  theme: 'dark', // Sempre começa no tema escuro (azul/dourado)
  sidebarCollapsed: false,
  language: 'pt-BR',
};

export function getPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch (err) {
    console.error('Error reading preferences:', err);
    return defaults;
  }
}

export function setPreference(key, value) {
  try {
    const prefs = getPreferences();
    prefs[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    return true;
  } catch (err) {
    console.error('Error saving preferences:', err);
    return false;
  }
}

export function setPreferences(updates) {
  try {
    const prefs = { ...getPreferences(), ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    return true;
  } catch (err) {
    console.error('Error saving preferences:', err);
    return false;
  }
}

export function clearPreferences() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Error clearing preferences:', err);
    return false;
  }
}

export function isDarkMode() {
  const prefs = getPreferences();
  // Retorna false se theme = 'dark' (tema azul/dourado padrão)
  // Retorna true se theme = 'light' (tema claro alternativo)
  return prefs.theme === 'light';
}

export function setDarkMode(enabled) {
  // enabled = true -> tema claro
  // enabled = false -> tema azul/dourado (padrão)
  setPreference('darkMode', enabled);
  setPreference('theme', enabled ? 'light' : 'dark');
  applyTheme(enabled);
}

export function toggleDarkMode() {
  const isLight = isDarkMode();
  setDarkMode(!isLight);
  return !isLight;
}

export function applyTheme(isLight) {
  if (isLight) {
    // Tema claro alternativo
    document.body.classList.add('light-mode');
  } else {
    // Tema padrão azul/dourado (sem classe adicional)
    document.body.classList.remove('light-mode');
  }
  // Remove dark-mode se existir (não usamos mais essa classe)
  document.body.classList.remove('dark-mode');
}

export function initializeTheme() {
  const isDark = isDarkMode();
  applyTheme(isDark);
}
