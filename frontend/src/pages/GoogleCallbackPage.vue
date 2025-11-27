<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
    <!-- Loading State -->
    <div v-if="!error" class="auth-card">
      <div class="text-center">
        <div class="spinner-wrapper">
          <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 class="loading-title">Processando login...</h2>
        <p class="loading-subtitle">Aguarde enquanto conectamos com o Google</p>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-card">
      <div class="error-icon-wrapper">
        <svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 class="error-title">Falha na Autenticação</h2>
      <p class="error-message">{{ error }}</p>
      <div class="error-actions">
        <button @click="router.push('/login')" class="btn-primary">
          Voltar para Login
        </button>
        <button @click="retryAuth" class="btn-secondary">
          Tentar Novamente
        </button>
      </div>
      <p class="error-footer">Redirecionando em {{ countdown }}s...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../axios'

const route = useRoute()
const router = useRouter()
const error = ref('')
const countdown = ref(5)
let countdownInterval = null

const retryAuth = () => {
  window.location.href = `${api.defaults.baseURL}/auth/google/login`
}

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
      router.push('/login')
    }
  }, 1000)
}

onMounted(async () => {
  const code = route.query.code
  const state = route.query.state

  if (!code) {
    error.value = 'Código de autorização não encontrado. Por favor, tente fazer login novamente.'
    startCountdown()
    return
  }

  try {
    if (state === 'link-account') {
      // Fluxo de vinculação (usuário já logado)
      await api.post('/auth/google/link/callback', { code })
      router.push('/perfil')
    } else {
      // Fluxo de login
      const response = await api.get(`/auth/google/callback?code=${code}`)
      const { token, user } = response.data
      
      // Salvar token e user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Redirecionar
      router.push('/home')
    }
  } catch (err) {
    // Extrair mensagem de erro mais amigável
    const errorMsg = err.response?.data?.erro || err.response?.data?.message || err.message
    
    if (err.response?.status === 401) {
      error.value = 'Sessão expirada. Por favor, faça login novamente.'
    } else if (err.response?.status === 400) {
      error.value = errorMsg || 'Dados de autenticação inválidos.'
    } else if (err.response?.status === 500) {
      error.value = 'Erro no servidor. Tente novamente em alguns instantes.'
    } else {
      error.value = errorMsg || 'Não foi possível completar o login com Google.'
    }
    
    startCountdown()
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.auth-card, .error-card {
  background: white;
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 28rem;
  width: 100%;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dark .auth-card,
.dark .error-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.spinner-wrapper {
  margin-bottom: 1.5rem;
}

.spinner {
  height: 4rem;
  width: 4rem;
  color: #3b82f6;
  margin: 0 auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.dark .loading-title {
  color: #f9fafb;
}

.loading-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
}

.dark .loading-subtitle {
  color: #9ca3af;
}

.progress-bar {
  margin-top: 1.5rem;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.dark .progress-bar {
  background: rgba(75, 85, 99, 0.5);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 9999px;
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

.error-card {
  text-align: center;
}

.error-icon-wrapper {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.error-icon {
  height: 4rem;
  width: 4rem;
  color: #ef4444;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.dark .error-title {
  color: #f9fafb;
}

.error-message {
  color: #ef4444;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0.75rem;
  border-left: 4px solid #ef4444;
}

.dark .error-message {
  background: rgba(239, 68, 68, 0.15);
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -2px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.dark .btn-secondary {
  color: #9ca3af;
  border-color: rgba(75, 85, 99, 0.5);
}

.btn-secondary:hover {
  background: #f9fafb;
  color: #3b82f6;
  border-color: #3b82f6;
}

.dark .btn-secondary:hover {
  background: rgba(59, 130, 246, 0.1);
}

.error-footer {
  color: #9ca3af;
  font-size: 0.75rem;
  font-style: italic;
}

.dark .error-footer {
  color: #6b7280;
}
</style>
