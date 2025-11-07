// Centralized validation & masking helpers

export const REGEX = {
  CNPJ: /^\d{14}$/, // raw digits only
  CPF: /^\d{11}$/,  // raw digits only
  CEP: /^\d{8}$/,   // raw digits only
  CEP_FLEX: /^\d{5}-?\d{3}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_BR: /^\d{10,11}$/, // 10 ou 11 dígitos
};

export function onlyDigits(v = '') { 
  return v.replace(/\D+/g, ''); 
}

export function normalizeEmail(v = '') { 
  return v.trim().toLowerCase(); 
}

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

// Formatação de campos
export function formatPhoneBR(v = '') {
  const digits = onlyDigits(v);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function formatCEP(v = '') {
  const digits = onlyDigits(v);
  if (digits.length === 0) return '';
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

export function formatCPF(v = '') {
  const digits = onlyDigits(v);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatCNPJ(v = '') {
  const digits = onlyDigits(v);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

// Validação completa de CPF (com dígitos verificadores)
export function validarCPF(cpf) {
  cpf = onlyDigits(cpf);
  
  if (cpf.length !== 11) return false;
  
  // Rejeita CPFs com todos dígitos iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let soma = 0;
  let resto;
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
  // Segundo dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
}

// Validação completa de CNPJ (com dígitos verificadores)
export function validarCNPJ(cnpj) {
  cnpj = onlyDigits(cnpj);
  
  if (cnpj.length !== 14) return false;
  
  // Rejeita CNPJs com todos dígitos iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação dos dígitos verificadores
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  // Primeiro dígito verificador
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

// Validação de telefone brasileiro
export function validarTelefoneBR(telefone) {
  telefone = onlyDigits(telefone);
  
  if (telefone.length !== 11) return false;
  
  const ddd = parseInt(telefone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  // Celular deve começar com 9
  if (telefone[2] !== '9') return false;
  
  return true;
}

// Validação de senha forte
export function validarSenhaForte(senha) {
  const erros = [];
  
  if (!senha || senha.length < 8) {
    erros.push('Senha deve ter no mínimo 8 caracteres');
  }
  
  if (!/[A-Z]/.test(senha)) {
    erros.push('Senha deve conter pelo menos 1 letra maiúscula');
  }
  
  if (!/[a-z]/.test(senha)) {
    erros.push('Senha deve conter pelo menos 1 letra minúscula');
  }
  
  if (!/[0-9]/.test(senha)) {
    erros.push('Senha deve conter pelo menos 1 número');
  }
  
  return {
    valido: erros.length === 0,
    erros: erros,
    isValid: erros.length === 0, // Alias para compatibilidade
    errors: erros // Alias para compatibilidade
  };
}

// Exporta como alias
export const validatePassword = validarSenhaForte;

// Calcula força da senha (0-100)
export function calculatePasswordStrength(password) {
  if (!password) return 0;
  
  let strength = 0;
  
  // Comprimento
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;
  
  // Variedade de caracteres
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
}

// Retorna mensagem de erro detalhada para telefone
export function getPhoneErrorMessage(phone) {
  const cleaned = onlyDigits(phone);
  
  if (cleaned.length === 0) return null;
  
  if (cleaned.length < 11) {
    return 'Telefone deve ter 11 dígitos (DDD + número)';
  }
  
  const ddd = parseInt(cleaned.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return 'DDD inválido (deve ser entre 11 e 99)';
  }
  
  const firstDigit = cleaned[2];
  if (firstDigit !== '9') {
    return 'Número de celular deve começar com 9';
  }
  
  return null;
}

// Aliases para compatibilidade
export const validateCPF = validarCPF;
export const validateCNPJ = validarCNPJ;
export const validatePhone = validarTelefoneBR;
export const unformatCPF = onlyDigits;
export const unformatCNPJ = onlyDigits;
export const unformatPhone = onlyDigits;
export const validateEmail = (email) => REGEX.EMAIL.test(email);
export const isValidCPFFormat = (cpf) => onlyDigits(cpf).length === 11;
export const isValidCNPJFormat = (cnpj) => onlyDigits(cnpj).length === 14;

// Simple field validators returning error message (or empty string)
export const fieldValidators = {
  'empresa.nome_fantasia': v => v ? '' : 'Nome fantasia é obrigatório',
  'empresa.razao_social': v => v ? '' : 'Razão social é obrigatória',
  'empresa.cnpj': v => !v ? 'CNPJ é obrigatório' : (!validarCNPJ(v) ? 'CNPJ inválido. Verifique os números digitados' : ''),
  'localidade.nome': v => v ? '' : 'Nome da localidade é obrigatório',
  'localidade.cep': v => !v ? 'CEP é obrigatório' : (REGEX.CEP_FLEX.test(v) || REGEX.CEP.test(onlyDigits(v)) ? '' : 'CEP inválido'),
  'localidade.raio_geofence_metros': v => (v && v > 0) ? '' : 'Informe um raio válido (>0)',
  'usuario.nome': v => v ? '' : 'Nome é obrigatório',
  'usuario.email': v => !v ? 'Email é obrigatório' : (REGEX.EMAIL.test(v) ? '' : 'Formato de email inválido'),
  'usuario.password': v => {
    if (!v) return 'Senha é obrigatória';
    const validacao = validarSenhaForte(v);
    return validacao.valido ? '' : validacao.erros[0];
  },
  'usuario.cpf': v => !v ? 'CPF é obrigatório' : (!validarCPF(v) ? 'CPF inválido. Verifique os números digitados' : ''),
  'usuario.telefone': v => !v ? '' : (!validarTelefoneBR(v) ? 'Telefone deve ter 11 dígitos no formato (XX) XXXXX-XXXX' : ''),
  'usuario.salario': v => (v != null && v >= 0) ? '' : 'Salário deve ser >= 0',
  'usuario.data_admissao': v => v ? '' : 'Data de admissão é obrigatória',
};

export function validateFieldByKey(key, getValueFn) {
  const validator = fieldValidators[key];
  if (!validator) return '';
  return validator(getValueFn());
}
