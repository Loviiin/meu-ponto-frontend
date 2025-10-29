<template>
  <div class="dashboard-page">
    <div class="container py-4">
      <div class="page-header mb-4">
        <h2>
          <i class="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h2>
        <p class="subtitle">Visão geral do seu desempenho e estatísticas</p>
      </div>

      <!-- Componente de Estatísticas -->
      <DashboardStats ref="statsComponent" />

      <!-- Botão para atualizar -->
      <div class="text-center mt-4">
        <button class="btn btn-outline-primary" @click="reloadStats" :disabled="refreshing">
          <span v-if="refreshing" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-arrow-clockwise me-2"></i>
          Atualizar Estatísticas
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DashboardStats from '../components/DashboardStats.vue'
import { toast } from '../toast'

const statsComponent = ref(null)
const refreshing = ref(false)

const reloadStats = async () => {
  try {
    refreshing.value = true
    await statsComponent.value?.reload()
    toast.success('Estatísticas atualizadas!')
  } catch (err) {
    toast.error('Erro ao atualizar estatísticas')
  } finally {
    refreshing.value = false
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding-top: 80px;
  padding-bottom: 40px;
}

.page-header h2 {
  margin: 0;
  color: white;
  background: linear-gradient(90deg, #d4af37, #fff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
}

.btn-outline-primary {
  background: transparent;
  border: 2px solid #d4af37;
  color: #d4af37;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-outline-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #d4af37, #696000);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.btn-outline-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15rem;
}

@media (max-width: 768px) {
  .dashboard-page {
    padding-top: 60px;
  }
}
</style>
