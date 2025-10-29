<template>
  <div class="calendario-page">
    <div class="container py-4">
      <div class="page-header mb-4">
        <h2>
          <i class="bi bi-calendar3 me-2"></i>
          Calendário de Ponto
        </h2>
        <p class="subtitle">Visualize seus registros de ponto mensalmente</p>
      </div>

      <!-- Componente de Calendário -->
      <CalendarPonto ref="calendarComponent" />

      <!-- Informações adicionais -->
      <div class="info-cards mt-4">
        <div class="info-card">
          <i class="bi bi-info-circle"></i>
          <p><strong>Completo:</strong> Todos os pontos foram registrados corretamente</p>
        </div>
        <div class="info-card">
          <i class="bi bi-info-circle"></i>
          <p><strong>Incompleto:</strong> Faltam pontos a serem registrados</p>
        </div>
        <div class="info-card">
          <i class="bi bi-info-circle"></i>
          <p><strong>Em Andamento:</strong> Dia atual com pontos em aberto</p>
        </div>
        <div class="info-card">
          <i class="bi bi-info-circle"></i>
          <p><strong>Sem Ponto:</strong> Nenhum registro de ponto</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CalendarPonto from '../components/CalendarPonto.vue'

const calendarComponent = ref(null)
</script>

<style scoped>
.calendario-page {
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

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-card i {
  font-size: 1.5rem;
  color: #d4af37;
  flex-shrink: 0;
}

.info-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  line-height: 1.4;
}

.info-card strong {
  color: white;
}

@media (max-width: 768px) {
  .calendario-page {
    padding-top: 60px;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
  }
}
</style>
