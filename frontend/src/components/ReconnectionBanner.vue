<template>
  <transition name="fade">
    <div v-if="showBanner" class="reconnection-banner" :class="{ 'is-connected': isConnected, 'is-disconnected': !isConnected }">
      <div class="banner-content">
        <div class="banner-icon">
          <i :class="isConnected ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"></i>
        </div>
        <div class="banner-message">
          <strong v-if="isConnected">Reconectado!</strong>
          <strong v-else>Sem conexão</strong>
          <p v-if="isConnected" class="mb-0">Conexão com o servidor foi restaurada</p>
          <p v-else class="mb-0">Verifique sua conexão com a internet</p>
        </div>
        <button class="banner-close" @click="hideBanner" type="button">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showBanner = ref(false)
const isConnected = ref(navigator.onLine)
let hideTimeout = null

const handleOnline = () => {
  isConnected.value = true
  showBanner.value = true
  clearTimeout(hideTimeout)
  hideTimeout = setTimeout(() => {
    showBanner.value = false
  }, 5000) // Hide after 5 seconds
}

const handleOffline = () => {
  isConnected.value = false
  showBanner.value = true
  clearTimeout(hideTimeout) // Don't auto-hide offline message
}

const hideBanner = () => {
  showBanner.value = false
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  clearTimeout(hideTimeout)
})
</script>

<style scoped>
.reconnection-banner {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  z-index: 1055;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease-out;
}

.reconnection-banner.is-connected {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
  border-bottom: 2px solid #229954;
}

.reconnection-banner.is-disconnected {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
  border-bottom: 2px solid #a93226;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.banner-icon {
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.banner-message {
  flex: 1;
  color: white;
  font-size: 0.95rem;
}

.banner-message strong {
  display: block;
  font-weight: 600;
}

.banner-message p {
  font-size: 0.875rem;
  opacity: 0.95;
  margin: 2px 0 0 0;
}

.banner-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.banner-close:hover {
  transform: scale(1.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 576px) {
  .reconnection-banner {
    top: 60px;
    padding: 10px 12px;
  }

  .banner-content {
    gap: 8px;
  }

  .banner-message {
    font-size: 0.85rem;
  }

  .banner-message strong {
    font-size: 0.9rem;
  }

  .banner-message p {
    font-size: 0.8rem;
  }
}
</style>
