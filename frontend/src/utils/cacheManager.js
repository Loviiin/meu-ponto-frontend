/**
 * Cache Manager para requisições de API
 * Armazena respostas em memória com TTL (Time To Live)
 * 
 * SEGURANÇA:
 * 1. Cache é APENAS em memória (não persiste em localStorage/IndexedDB)
 * 2. Cache é automaticamente limpo ao deslogar
 * 3. Cache é validado contra token ativo (se token mudou, cache é inválido)
 * 4. Cada aba tem seu próprio cache (não compartilhado entre abas)
 * 5. Cache é destruído ao fechar a aba/página
 * 
 * Não há risco de:
 * - Um usuário acessar dados de outro usuário
 * - DevTools bypass: o cache é em memória, não em storage
 * - Múltiplas abas: cada aba tem contexto JS separado
 */

const cache = new Map()
let currentSessionToken = null
let cacheValidationEnabled = true

// Detectar mudanças de sessão (outro usuário logou)
export function validateCacheSession() {
  const token = localStorage.getItem('token')
  
  // Se o token mudou, cache está inválido (outro usuário logou)
  if (token !== currentSessionToken) {
    if (currentSessionToken !== null) {
      console.warn('⚠️ Token mudou! Cache invalidado (possível troca de usuário)')
      cacheClear()
    }
    currentSessionToken = token
  }
  
  return token === currentSessionToken
}

// Monitorar mudanças de autenticação
export function initCacheManager() {
  // Inicializar token atual
  currentSessionToken = localStorage.getItem('token')
  
  // Verificar se o token foi removido (logout)
  const originalSetItem = localStorage.setItem
  const originalRemoveItem = localStorage.removeItem

  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments)
    
    // Se o token mudou (login de novo usuário), validar cache
    if (key === 'token' || key === 'access') {
      validateCacheSession()
    }
  }

  localStorage.removeItem = function(key, value) {
    // Se removeram o token, limpar cache
    if (key === 'token' || key === 'access') {
      console.log('🔄 Logout detectado, limpando cache...')
      cacheClear()
      currentSessionToken = null
    }
    originalRemoveItem.apply(this, arguments)
  }

  // Limpar cache ao fechar aba/janela
  window.addEventListener('beforeunload', () => {
    cacheClear()
  })
  
  // Monitorar mudanças de storage de OUTRAS ABAS
  window.addEventListener('storage', (event) => {
    if (event.key === 'token' || event.key === 'access') {
      console.log('🔄 Outra aba fez logout/login, validando cache...')
      validateCacheSession()
    }
  })
}

export function setCacheConfig(ttlSeconds = 300) {
  return {
    ttl: ttlSeconds * 1000 // Converter para ms
  }
}

export function cacheGet(key) {
  // Validar se a sessão ainda é a mesma
  if (!validateCacheSession()) {
    return null
  }
  
  const entry = cache.get(key)
  if (!entry) return null
  
  // Verificar se expirou
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  
  console.log(`✅ Cache hit: ${key}`)
  return entry.data
}

export function cacheSet(key, data, ttlMs = 5 * 60 * 1000) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  })
  console.log(`💾 Cached: ${key} (TTL: ${ttlMs}ms)`)
}

export function cacheClear(key) {
  if (key) {
    cache.delete(key)
    console.log(`🗑️ Cache cleared: ${key}`)
  } else {
    const size = cache.size
    cache.clear()
    console.log(`🗑️ Cache cleared (${size} items)`)
  }
}

/**
 * Wrapper para chamadas de API com cache automático
 * @param {string} cacheKey - Chave única para o cache
 * @param {Function} apiCall - Função que faz a chamada à API
 * @param {number} ttlMs - TTL em milissegundos (padrão: 5 minutos)
 */
export async function cachedApiCall(cacheKey, apiCall, ttlMs = 5 * 60 * 1000) {
  // Verificar se está em cache
  const cached = cacheGet(cacheKey)
  if (cached) {
    return cached
  }
  
  // Se não está em cache, fazer requisição
  console.log(`🔄 Fetching: ${cacheKey}`)
  const data = await apiCall()
  
  // Armazenar em cache
  cacheSet(cacheKey, data, ttlMs)
  
  return data
}

export default {
  get: cacheGet,
  set: cacheSet,
  clear: cacheClear,
  cachedApiCall
}
