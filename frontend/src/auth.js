import api from './axios';
import ProfileService from './services/ProfileService';
import { saveUserPermissions, clearUserPermissions } from './utils/permissions';

export async function login(username, password, email) {
  const res = await api.post('/api/token/', { username, password, email });
  localStorage.setItem('access', res.data.access);
  localStorage.setItem('refresh', res.data.refresh);
  localStorage.setItem('token', res.data.access); // Armazena o token de acesso
  
  // Carregar permissões após login bem-sucedido
  try {
    await loadUserPermissions();
  } catch (error) {
    console.warn('Não foi possível carregar permissões no login:', error);
  }
}

export async function refreshToken() {
  const refresh = localStorage.getItem('refresh');
  if (refresh) {
    const res = await api.post('/api/token/refresh/', { refresh });
    localStorage.setItem('access', res.data.access);
  }
}

export async function loadUserPermissions() {
  try {
    const data = await ProfileService.getPermissions();
    const permissions = data.permissoes || [];
    saveUserPermissions(permissions);
    return permissions;
  } catch (error) {
    console.error('Erro ao carregar permissões do usuário:', error);
    throw error;
  }
}

export function logout() {
  // Remove tokens de autenticação
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('token');
  // Remove permissões
  clearUserPermissions();
}