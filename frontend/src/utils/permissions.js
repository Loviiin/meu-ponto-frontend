// Constantes de permissões (exatamente como definido no backend)
export const PERMISSIONS = {
  EDITAR_EMPRESA: 'EDITAR_EMPRESA',
  DELETAR_EMPRESA: 'DELETAR_EMPRESA',
  GERENCIAR_CARGOS: 'GERENCIAR_CARGOS',
  DELETAR_USUARIO: 'DELETAR_USUARIO',
  EDITAR_USUARIO: 'EDITAR_USUARIO',
  EDITAR_PROPRIA_CONTA: 'EDITAR_PROPRIA_CONTA',
  DELETAR_PROPRIA_CONTA: 'DELETAR_PROPRIA_CONTA',
  VER_SALDO_FUNCIONARIOS: 'VER_SALDO_FUNCIONARIOS',
  EDITAR_SALDO_FUNCIONARIOS: 'EDITAR_SALDO_FUNCIONARIOS',
  VISUALIZAR_PONTO_FUNCIONARIOS: 'VISUALIZAR_PONTO_FUNCIONARIOS',
  AJUSTAR_PONTO_FUNCIONARIOS: 'AJUSTAR_PONTO_FUNCIONARIOS',
  GERENCIAR_JUSTIFICATIVAS: 'GERENCIAR_JUSTIFICATIVAS',
  VER_JUSTIFICATIVAS_PENDENTES: 'VER_JUSTIFICATIVAS_PENDENTES',
  CRIAR_JUSTIFICATIVA_PROPRIA: 'CRIAR_JUSTIFICATIVA_PROPRIA',
  APROVAR_JUSTIFICATIVAS: 'APROVAR_JUSTIFICATIVAS',
  GERENCIAR_LOCALIDADES: 'GERENCIAR_LOCALIDADES',
  VISUALIZAR_RELATORIOS_GERAIS: 'VISUALIZAR_RELATORIOS_GERAIS',
}

// Descrições amigáveis para UI
export const PERMISSION_LABELS = {
  EDITAR_EMPRESA: 'Editar Empresa',
  DELETAR_EMPRESA: 'Deletar Empresa',
  GERENCIAR_CARGOS: 'Gerenciar Cargos',
  DELETAR_USUARIO: 'Deletar Usuário',
  EDITAR_USUARIO: 'Editar Usuário',
  EDITAR_PROPRIA_CONTA: 'Editar Própria Conta',
  DELETAR_PROPRIA_CONTA: 'Deletar Própria Conta',
  VER_SALDO_FUNCIONARIOS: 'Ver Saldo de Funcionários',
  EDITAR_SALDO_FUNCIONARIOS: 'Editar Saldo de Funcionários',
  VISUALIZAR_PONTO_FUNCIONARIOS: 'Visualizar Ponto de Funcionários',
  AJUSTAR_PONTO_FUNCIONARIOS: 'Ajustar Ponto de Funcionários',
  GERENCIAR_JUSTIFICATIVAS: 'Gerenciar Justificativas',
  VER_JUSTIFICATIVAS_PENDENTES: 'Ver Justificativas Pendentes',
  CRIAR_JUSTIFICATIVA_PROPRIA: 'Criar Justificativa Própria',
  APROVAR_JUSTIFICATIVAS: 'Aprovar Justificativas',
  GERENCIAR_LOCALIDADES: 'Gerenciar Localidades',
  VISUALIZAR_RELATORIOS_GERAIS: 'Visualizar Relatórios Gerais',
}

// Categorias para organização na UI
export const PERMISSION_CATEGORIES = {
  empresa: ['EDITAR_EMPRESA', 'DELETAR_EMPRESA'],
  usuarios: ['DELETAR_USUARIO', 'EDITAR_USUARIO', 'EDITAR_PROPRIA_CONTA', 'DELETAR_PROPRIA_CONTA'],
  cargos: ['GERENCIAR_CARGOS'],
  ponto: ['VISUALIZAR_PONTO_FUNCIONARIOS', 'AJUSTAR_PONTO_FUNCIONARIOS'],
  justificativas: ['GERENCIAR_JUSTIFICATIVAS', 'VER_JUSTIFICATIVAS_PENDENTES', 'CRIAR_JUSTIFICATIVA_PROPRIA', 'APROVAR_JUSTIFICATIVAS'],
  banco_horas: ['VER_SALDO_FUNCIONARIOS', 'EDITAR_SALDO_FUNCIONARIOS'],
  localidades: ['GERENCIAR_LOCALIDADES'],
  relatorios: ['VISUALIZAR_RELATORIOS_GERAIS'],
}

// Helpers utilitários para checagem de permissões
export function hasPerm(userPermissions, permission) {
  if (!userPermissions) return false
  if (Array.isArray(userPermissions)) {
    return userPermissions.some(p => p === permission || p.nome === permission)
  }
  if (userPermissions instanceof Set) {
    return userPermissions.has(permission)
  }
  return false
}

export function anyPerm(userPermissions, permissionsArray) {
  return permissionsArray.some(p => hasPerm(userPermissions, p))
}

export function allPerms(userPermissions, permissionsArray) {
  return permissionsArray.every(p => hasPerm(userPermissions, p))
}

// Normaliza lista de permissões da API para Set
export function normalizePermissions(permissionsArray) {
  if (!permissionsArray || !Array.isArray(permissionsArray)) return new Set()
  return new Set(permissionsArray.map(p => typeof p === 'string' ? p : p.nome))
}

// Pega permissões do localStorage
export function getUserPermissions() {
  try {
    const perms = localStorage.getItem('user_permissions')
    if (!perms) return new Set()
    const parsed = JSON.parse(perms)
    return normalizePermissions(parsed)
  } catch (_) {
    return new Set()
  }
}

// Salva permissões no localStorage
export function saveUserPermissions(permissions) {
  try {
    const normalized = Array.isArray(permissions) 
      ? permissions.map(p => typeof p === 'string' ? p : p.nome)
      : Array.from(permissions)
    localStorage.setItem('user_permissions', JSON.stringify(normalized))
  } catch (e) {
    console.error('Erro ao salvar permissões:', e)
  }
}

// Limpa permissões do localStorage (logout)
export function clearUserPermissions() {
  localStorage.removeItem('user_permissions')
}
