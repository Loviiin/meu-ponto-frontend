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
        <p class="login-box-msg">Recuperar Senha</p>
        <p class="login-box-msg2">Digite seu email para receber as instruções</p>
        
        <form class="mt-4" @submit.prevent="handleSubmit">
          <div class="input-group">
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              v-model="email" 
              required 
              :disabled="loading"
            />
            <span class="input-icon"><i class="bi bi-envelope"></i></span>
          </div>

          <!-- Success Message -->
          <transition name="fade">
            <div v-if="message" class="alert alert-success mt-3 d-flex align-items-center" role="alert">
              <i class="bi bi-check-circle-fill me-2"></i>
              <div class="text-start small">{{ message }}</div>
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
            <button class="btn btn-primary w-100" type="submit" :disabled="loading">
              <span v-if="!loading">
                <i class="bi bi-send-fill me-2"></i>
                Enviar Link
              </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enviando...
              </span>
            </button>
          </div>

          <div class="mt-4 text-center">
            <router-link to="/login" class="forgot-password-link">
              <i class="bi bi-arrow-left me-1"></i> Voltar para o Login
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { requestPasswordReset } from '../services/auth'
import { isDarkMode as checkDarkMode, toggleDarkMode } from '../utils/preferences'

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const isDarkMode = ref(checkDarkMode())

const toggleTheme = () => {
  toggleDarkMode()
  isDarkMode.value = checkDarkMode()
}

const handleSubmit = async () => {
  loading.value = true
  message.value = ''
  error.value = ''
  
  try {
    await requestPasswordReset(email.value)
    message.value = 'Se o email estiver cadastrado, você receberá instruções em breve.'
    email.value = ''
  } catch (err) {
    error.value = err.response?.data?.erro || 'Ocorreu um erro ao processar sua solicitação.'
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

.forgot-password-link {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password-link:hover {
  color: var(--color-white);
  text-decoration: underline;
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

body.light-mode .forgot-password-link {
  color: rgba(0, 0, 0, 0.6);
}

body.light-mode .forgot-password-link:hover {
  color: #696000;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

