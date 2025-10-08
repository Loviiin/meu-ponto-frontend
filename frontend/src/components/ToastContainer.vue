<template>
  <div class="toast-container" aria-live="polite" aria-atomic="true">
    <transition-group name="toast-fade" tag="div">
      <div v-for="t in toasts" :key="t.id" class="toast-item" :class="t.type" role="alert">
        <span class="msg">{{ t.message }}</span>
        <button class="close" @click="remove(t.id)" aria-label="Fechar">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { toasts, removeToast } from '../toast.js';
function remove(id){ removeToast(id); }
</script>

<style scoped>
.toast-container { position: fixed; top: 16px; right: 16px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; width: 320px; }
.toast-item { position: relative; padding: 12px 36px 12px 14px; border-radius: 8px; font-size: 14px; color: #fff; box-shadow:0 4px 12px rgba(0,0,0,0.25); backdrop-filter: blur(4px); animation: slideIn .3s ease; }
.toast-item.success { background: linear-gradient(120deg,#2e7d32,#43a047); }
.toast-item.error { background: linear-gradient(120deg,#c62828,#e53935); }
.toast-item.info { background: linear-gradient(120deg,#1565c0,#1e88e5); }
.toast-item.warn { background: linear-gradient(120deg,#ef6c00,#fb8c00); }
.toast-item .close { position:absolute; top:4px; right:8px; background:none; border:none; color:#fff; font-size:16px; cursor:pointer; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all .25s ease; }
.toast-fade-enter-from { opacity:0; transform: translateY(-10px); }
.toast-fade-leave-to { opacity:0; transform: translateY(-6px); }
@keyframes slideIn { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }
</style>
