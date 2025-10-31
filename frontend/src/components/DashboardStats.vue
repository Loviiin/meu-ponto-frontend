<template>
  <div class="dashboard-stats">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div v-else-if="stats" class="stats-grid">
      <!-- Pontos Card -->
      <div class="stat-card">
        <div class="stat-icon bg-primary">
          <i class="bi bi-clock-history"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Pontos Este Mês</div>
          <div class="stat-value">{{ stats.pontos?.total_mes_atual || 0 }}</div>
          <div class="stat-subtitle">
            Mês anterior: {{ stats.pontos?.total_mes_anterior || 0 }}
            <span v-if="stats.pontos?.total_mes_atual > stats.pontos?.total_mes_anterior" class="trend-up">
              <i class="bi bi-arrow-up"></i>
            </span>
            <span v-else-if="stats.pontos?.total_mes_atual < stats.pontos?.total_mes_anterior" class="trend-down">
              <i class="bi bi-arrow-down"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- Banco de Horas Card -->
      <div class="stat-card">
        <div class="stat-icon" :class="stats.banco_horas?.saldo_atual_minutos >= 0 ? 'bg-success' : 'bg-danger'">
          <i class="bi bi-piggy-bank"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Banco de Horas</div>
          <div class="stat-value" :class="stats.banco_horas?.saldo_atual_minutos >= 0 ? 'text-success' : 'text-danger'">
            {{ stats.banco_horas?.saldo_atual_formatado || '00:00' }}
          </div>
          <div class="stat-subtitle">
            <span class="text-success">
              <i class="bi bi-plus-circle"></i> {{ formatMinutes(stats.banco_horas?.total_credito_mes || 0) }}
            </span>
            <span class="mx-2">|</span>
            <span class="text-danger">
              <i class="bi bi-dash-circle"></i> {{ formatMinutes(stats.banco_horas?.total_debito_mes || 0) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Justificativas Card -->
      <div class="stat-card">
        <div class="stat-icon bg-warning">
          <i class="bi bi-file-text"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Justificativas</div>
          <div class="stat-value">
            <span class="badge bg-warning me-2">{{ stats.justificativas?.pendentes || 0 }} Pendentes</span>
          </div>
          <div class="stat-subtitle">
            <span class="text-success">{{ stats.justificativas?.aprovadas_mes || 0 }} aprovadas</span>
            <span class="mx-1">•</span>
            <span class="text-danger">{{ stats.justificativas?.reprovadas_mes || 0 }} reprovadas</span>
          </div>
        </div>
      </div>

      <!-- Tempo na Empresa Card -->
      <div class="stat-card">
        <div class="stat-icon bg-info">
          <i class="bi bi-calendar-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Tempo na Empresa</div>
          <div class="stat-value">{{ stats.tempo_empresa_dias || 0 }} dias</div>
          <div class="stat-subtitle">
            {{ formatYearsMonths(stats.tempo_empresa_dias || 0) }}
          </div>
        </div>
      </div>

      <!-- Último Ponto Card (se disponível) -->
      <div v-if="stats.ultimo_ponto" class="stat-card stat-card-wide">
        <div class="stat-icon bg-primary">
          <i class="bi bi-geo-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Último Ponto Registrado</div>
          <div class="stat-value small">{{ formatDateTime(stats.ultimo_ponto.data) }}</div>
          <div class="stat-subtitle">
            <span class="badge" :class="getPontoTypeBadge(stats.ultimo_ponto.tipo)">
              {{ stats.ultimo_ponto.tipo }}
            </span>
            <span class="mx-2">•</span>
            <i class="bi bi-geo-alt-fill"></i> {{ stats.ultimo_ponto.localidade }}
          </div>
        </div>
      </div>

      <!-- Total de Pontos Card -->
      <div class="stat-card">
        <div class="stat-icon bg-secondary">
          <i class="bi bi-list-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total de Pontos</div>
          <div class="stat-value">{{ stats.pontos?.total_geral || 0 }}</div>
          <div class="stat-subtitle">Desde o início</div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Erro ao carregar estatísticas
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProfileService from '../services/ProfileService'

const stats = ref(null)
const loading = ref(true)

const loadStats = async () => {
  try {
    loading.value = true
    stats.value = await ProfileService.getStats()
    console.log('Stats do dashboard:', stats.value)
  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err)
  } finally {
    loading.value = false
  }
}

// Formata minutos para HH:MM
const formatMinutes = (minutes) => {
  const hours = Math.floor(Math.abs(minutes) / 60)
  const mins = Math.abs(minutes) % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Formata dias para anos e meses
const formatYearsMonths = (days) => {
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  
  if (years > 0) {
    return `${years} ano${years > 1 ? 's' : ''} e ${months} mes${months > 1 ? 'es' : ''}`
  }
  return `${months} mes${months > 1 ? 'es' : ''}`
}

// Formata data e hora
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR')
}

// Retorna classe do badge baseado no tipo de ponto
const getPontoTypeBadge = (tipo) => {
  const badges = {
    'ENTRADA': 'bg-success',
    'SAIDA': 'bg-danger',
    'INTERVALO_INICIO': 'bg-warning',
    'INTERVALO_FIM': 'bg-info'
  }
  return badges[tipo] || 'bg-secondary'
}

onMounted(() => {
  loadStats()
})

// Expor método para recarregar (pode ser chamado pelo componente pai)
defineExpose({
  reload: loadStats
})
</script>

<style scoped>
.dashboard-stats {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #d4af37, transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(212, 175, 55, 0.3);
  border-color: rgba(212, 175, 55, 0.3);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card-wide {
  grid-column: span 2;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #d4af37;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-value.small {
  font-size: 1.25rem;
}

.stat-subtitle {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.trend-up {
  color: #2ecc71;
  margin-left: 0.5rem;
}

.trend-down {
  color: #e74c3c;
  margin-left: 0.5rem;
}

/* Color Classes */
.bg-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.bg-success {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.bg-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.bg-warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.bg-info {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.bg-secondary {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

/* Badge */
.badge {
  font-weight: 500;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card-wide {
    grid-column: span 1;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
}

/* Loading */
.spinner-border {
  width: 3rem;
  height: 3rem;
  border-color: #d4af37;
  border-right-color: transparent;
}
</style>
