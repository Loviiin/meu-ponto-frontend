import api from './axios';

export async function login(username, password, email) {
  const res = await api.post('/api/token/', { username, password, email });
  localStorage.setItem('access', res.data.access);
  localStorage.setItem('refresh', res.data.refresh);
  localStorage.setItem('token', res.data.access); // Armazena o token de acesso
}

export async function refreshToken() {
  const refresh = localStorage.getItem('refresh');
  if (refresh) {
    const res = await api.post('/api/token/refresh/', { refresh });
    localStorage.setItem('access', res.data.access);
  }
}

export function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
}