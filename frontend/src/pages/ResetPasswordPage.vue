<template>
  <div class="login-page d-flex align-items-center justify-content-center">
    <!-- Theme Toggle Button -->
    <button 
      @click="toggleTheme" 
      class="theme-toggle-btn" 
      :title="isDarkMode ? 'Modo escuro (azul/dourado)' : 'Modo claro'"
    >
      <i :class="isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"></i>
    </button>
    
    <div class="login-card card shadow-lg">
      <div class="card-body p-4 p-md-5 text-center">
        <img src="../assets/Icon_vertical_nexora-removebg-preview.png" alt="Nexora" class="brand-logo mb-2" />
        <p class="login-box-msg">Definir Nova Senha</p>
        <p v-if="userName" class="login-box-msg2">Olá, <strong>{{ userName }}</strong>! Digite sua nova senha abaixo</p>
        <p v-else class="login-box-msg2">Digite sua nova senha abaixo</p>
        
        <form class="mt-4" @submit.prevent="handleSubmit">
          <div class="input-group">
            <input 
              type="password" 
              name="password" 
              placeholder="Nova Senha" 
              v-model="password" 
              required 
              :disabled="loading || success"
              @input="checkPasswordStrength"
            />
            <span class="input-icon"><i class="bi bi-lock"></i></span>
          </div>

          <!-- Password Strength Checklist -->
          <div class="password-checklist text-start mb-3" v-if="password">
            <div :class="{'text-success': passwordRules.length, 'text-muted': !passwordRules.length}">
              <i :class="passwordRules.length ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i> Mínimo 8 caracteres
            </div>
            <div :class="{'text-success': passwordRules.uppercase, 'text-muted': !passwordRules.uppercase}">
              <i :class="passwordRules.uppercase ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i> Letra maiúscula
            </div>
            <div :class="{'text-success': passwordRules.lowercase, 'text-muted': !passwordRules.lowercase}">
              <i :class="passwordRules.lowercase ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i> Letra minúscula
            </div>
            <div :class="{'text-success': passwordRules.number, 'text-muted': !passwordRules.number}">
              <i :class="passwordRules.number ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i> Número
            </div>
            <div :class="{'text-success': passwordRules.special, 'text-muted': !passwordRules.special}">
              <i :class="passwordRules.special ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i> Caractere especial (!@#$...)
            </div>
          </div>

          <div class="input-group">
            <input 
              type="password" 
              name="confirm-password" 
              placeholder="Confirmar Senha" 
              v-model="confirmPassword" 
              required 
              :disabled="loading || success"
            />
            <span class="input-icon"><i class="bi bi-lock-fill"></i></span>
          </div>

          <div v-if="confirmPassword && password !== confirmPassword" class="text-danger small text-start mb-2">
            <i class="bi bi-x-circle-fill"></i> As senhas não conferem
          </div>

          <!-- Success Message -->
          <transition name="fade">
            <div v-if="success" class="alert alert-success mt-3 d-flex align-items-center" role="alert">
              <i class="bi bi-check-circle-fill me-2"></i>
              <div class="text-start small">Senha alterada com sucesso! Redirecionando...</div>
            </div>
          </transition>

          <!-- Error Message -->
          <transition name="fade">
            <div v-if="error" class="alert alert-danger mt-3 d-flex align-items-center" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <div class="text-start small">{{ error }}</div>
            </div>
          </transition>
          
          <div class="button-wrapper mt-4">
            <button class="btn btn-primary w-100" type="submit" :disabled="loading || success || !isFormValid">
              <span v-if="!loading">
                <i class="bi bi-check-lg me-2"></i>
                Alterar Senha
              </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Alterando...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword, validateResetToken } from '../services/auth'
import { isDarkMode as checkDarkMode, toggleDarkMode } from '../utils/preferences'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const token = ref('')
const userName = ref('')
const isDarkMode = ref(checkDarkMode())

const passwordRules = ref({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
})

const toggleTheme = () => {
  toggleDarkMode()
  isDarkMode.value = checkDarkMode()
}

const checkPasswordStrength = () => {
  const p = password.value
  passwordRules.value = {
    length: p.length >= 8,
    uppercase: /[A-Z]/.test(p),
    lowercase: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(p)
  }
}

const isFormValid = computed(() => {
  return Object.values(passwordRules.value).every(Boolean) && 
         password.value === confirmPassword.value &&
         password.value !== ''
})

onMounted(async () => {
  token.value = route.query.token
  if (!token.value) {
    error.value = 'Token de recuperação inválido ou ausente.'
    return
  }

  // Validate token and get user name
  try {
    const response = await validateResetToken(token.value)
    if (response.data.valid) {
      userName.value = response.data.nome
    }
  } catch (err) {
    error.value = err.response?.data?.erro || 'Token inválido ou expirado.'
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''
  
  try {
    await resetPassword(token.value, password.value)
    success.value = true
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.erro || 'Ocorreu um erro ao redefinir a senha.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Full-height center for login page */
.login-page {
  min-height: 100vh;
  padding: 24px;
}

.brand-logo {
  width: 220px;
  height: auto;
  object-fit: contain;
}

.login-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: var(--color-white);
  width: 100%;
  max-width: 420px;
}

.login-box-msg {
  margin-top: 0.25rem;
  font-weight: 700;
  font-size: 1.5rem;
}
.login-box-msg2 {
  margin-top: -4px;
  font-weight: 300;
  color: #c9c9c9;
  font-size: 0.95rem;
}

.input-group {
  position: relative;
  width: 100%;
  margin: 10px 0;
  display: flex;
}
.input-group input {
  flex: 1;
  padding: 10px 10px;
  border: none;
  outline: none;
  border-radius: 10px 0 0 10px;
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-white);
  font-size: 14px;
}
.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
.input-group .input-icon {
  width: 44px;
  background: rgba(255, 255, 255, 0.15);
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0 10px 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 16px;
  pointer-events: none;
}

.password-checklist {
  font-size: 0.85rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 8px;
}
.password-checklist div {
  margin-bottom: 4px;
  transition: color 0.3s ease;
}
.password-checklist i {
  margin-right: 6px;
}
.text-success {
  color: #4ade80 !important;
}
.text-muted {
  color: rgba(255, 255, 255, 0.5) !important;
}

button.btn-primary {
  border-radius: 10px;
  background: var(--color-primary-80);
  border: none;
  padding: 12px;
  font-weight: bold;
  letter-spacing: 0.5px;
  transition: 0.25s ease;
}
button.btn-primary:hover:not(:disabled) {
  background: var(--color-primary);
  transform: translateY(-1px);
}
button.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* Theme Toggle Button */
.theme-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--color-white);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1030;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.theme-toggle-btn:active {
  transform: translateY(0);
}

/* Light Mode Styles */
body.light-mode .theme-toggle-btn {
  border-color: rgba(105, 96, 0, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: rgba(105, 96, 0, 0.9);
}

body.light-mode .theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  color: rgba(105, 96, 0, 1);
}

body.light-mode .login-card {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(105, 96, 0, 0.15);
  color: rgba(0, 0, 0, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

body.light-mode .login-box-msg2 {
  color: rgba(0, 0, 0, 0.65);
}

body.light-mode .input-group input {
  background: rgba(255, 255, 255, 0.9);
  color: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(105, 96, 0, 0.2);
}

body.light-mode .input-group input::placeholder {
  color: rgba(0, 0, 0, 0.55);
}

body.light-mode .input-group .input-icon {
  background: rgba(255, 255, 255, 0.9);
  border-left-color: rgba(105, 96, 0, 0.25);
  color: #696000;
}

body.light-mode button.btn-primary {
  background: #696000;
  color: white;
  border: none;
}

body.light-mode button.btn-primary:hover:not(:disabled) {
  background: #504700;
}

body.light-mode .password-checklist {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}
body.light-mode .text-muted {
  color: rgba(0, 0, 0, 0.4) !important;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

