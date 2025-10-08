// Centralized validation & masking helpers

export const REGEX = {
  CNPJ: /^\d{14}$/, // raw digits only
  CPF: /^\d{11}$/,  // raw digits only
  CEP: /^\d{8}$/,   // raw digits only
  CEP_FLEX: /^\d{5}-?\d{3}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export function onlyDigits(v = '') { return v.replace(/\D+/g, ''); }

export function normalizeEmail(v = '') { return v.trim().toLowerCase(); }

export function normalizeDateISO(localDate) {
  if (!localDate) return '';
  return new Date(localDate + 'T00:00:00Z').toISOString();
}

export function isFutureDate(localDate) {
  if (!localDate) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  const d = new Date(localDate + 'T00:00:00');
  return d.getTime() > today.getTime();
}

// Simple field validators returning error message (or empty string)
export const fieldValidators = {
  'empresa.nome_fantasia': v => v ? '' : 'Nome fantasia é obrigatório',
  'empresa.razao_social': v => v ? '' : 'Razão social é obrigatória',
  'empresa.cnpj': v => !v ? 'CNPJ é obrigatório' : (REGEX.CNPJ.test(v) ? '' : 'CNPJ deve ter 14 dígitos numéricos'),
  'localidade.nome': v => v ? '' : 'Nome da localidade é obrigatório',
  'localidade.cep': v => !v ? 'CEP é obrigatório' : (REGEX.CEP_FLEX.test(v) || REGEX.CEP.test(v) ? '' : 'CEP inválido'),
  'localidade.raio_geofence_metros': v => (v && v > 0) ? '' : 'Informe um raio válido (>0)',
  'usuario.nome': v => v ? '' : 'Nome é obrigatório',
  'usuario.email': v => !v ? 'Email é obrigatório' : (REGEX.EMAIL.test(v) ? '' : 'Formato de email inválido'),
  'usuario.password': v => !v ? 'Senha é obrigatória' : (v.length < 6 ? 'Senha deve ter pelo menos 6 caracteres' : ''),
  'usuario.cpf': v => !v ? 'CPF é obrigatório' : (REGEX.CPF.test(v) ? '' : 'CPF deve ter 11 dígitos'),
  'usuario.salario': v => (v != null && v >= 0) ? '' : 'Salário deve ser >= 0',
  'usuario.data_admissao': v => v ? '' : 'Data de admissão é obrigatória',
};

export function validateFieldByKey(key, getValueFn) {
  const validator = fieldValidators[key];
  if (!validator) return '';
  return validator(getValueFn());
}
