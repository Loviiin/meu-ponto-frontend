<template>
  <div class="calendar-ponto" data-cy="calendar-ponto">
    <div class="calendar-header">
      <button class="btn btn-icon" @click="previousMonth" :disabled="loading" data-cy="btn-mes-anterior">
        <i class="bi bi-chevron-left"></i>
      </button>
      
      <div class="calendar-title">
        <h4>{{ monthName }} {{ currentYear }}</h4>
        <button class="btn btn-sm btn-outline" @click="goToCurrentMonth" v-if="!isCurrentMonth">
          Voltar para Hoje
        </button>
      </div>
      
      <button class="btn btn-icon" @click="nextMonth" :disabled="loading" data-cy="btn-proximo-mes">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div v-else-if="calendar" class="calendar-content">
      <!-- Days of Week -->
      <div class="calendar-weekdays">
        <div class="weekday">Dom</div>
        <div class="weekday">Seg</div>
        <div class="weekday">Ter</div>
        <div class="weekday">Qua</div>
        <div class="weekday">Qui</div>
        <div class="weekday">Sex</div>
        <div class="weekday">Sáb</div>
      </div>

      <!-- Calendar Days -->
      <div class="calendar-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="getDayClass(day)"
          @click="day && selectDay(day)"
        >
          <div v-if="day" class="day-content">
            <div class="day-number">{{ getDayNumber(day.data) }}</div>
            
            <div v-if="day.tem_ponto" class="day-info">
              <div class="ponto-indicator" :class="getStatusClass(day.status)">
                <i :class="getStatusIcon(day.status)"></i>
              </div>
              
              <div class="day-times" v-if="day.primeiro_ponto">
                <small>{{ day.primeiro_ponto }}</small>
                <small v-if="day.ultimo_ponto"> - {{ day.ultimo_ponto }}</small>
              </div>
              
              <div class="day-balance" :class="{'positive': day.saldo_dia_minutos > 0, 'negative': day.saldo_dia_minutos < 0}">
                {{ day.saldo_dia_formatado }}
              </div>
            </div>
            
            <div v-else class="no-ponto">
              <i class="bi bi-dash-circle"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumo Mensal -->
      <div class="calendar-summary" v-if="calendar.resumo">
        <div class="summary-card">
          <div class="summary-icon bg-primary">
            <i class="bi bi-calendar-check"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Dias Trabalhados</div>
            <div class="summary-value">{{ calendar.resumo.total_dias_trabalhados }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon bg-success">
            <i class="bi bi-check-circle"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Dias Completos</div>
            <div class="summary-value">{{ calendar.resumo.total_dias_completos }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon bg-warning">
            <i class="bi bi-exclamation-circle"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Dias Incompletos</div>
            <div class="summary-value">{{ calendar.resumo.total_dias_incompletos }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon" :class="calendar.resumo.saldo_total_minutos >= 0 ? 'bg-success' : 'bg-danger'">
            <i class="bi bi-clock"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Saldo Total</div>
            <div class="summary-value" :class="calendar.resumo.saldo_total_minutos >= 0 ? 'text-success' : 'text-danger'">
              {{ calendar.resumo.saldo_total_formatado }}
            </div>
          </div>
        </div>
      </div>

      <!-- Legenda -->
      <div class="calendar-legend">
        <div class="legend-item">
          <span class="legend-badge badge-completo"></span>
          <span>Completo</span>
        </div>
        <div class="legend-item">
          <span class="legend-badge badge-incompleto"></span>
          <span>Incompleto</span>
        </div>
        <div class="legend-item">
          <span class="legend-badge badge-em-andamento"></span>
          <span>Em Andamento</span>
        </div>
        <div class="legend-item">
          <span class="legend-badge badge-sem-ponto"></span>
          <span>Sem Ponto</span>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Erro ao carregar calendário
    </div>

    <!-- Modal de Detalhes do Dia (opcional) -->
    <div v-if="selectedDay" class="day-modal-overlay" @click="selectedDay = null">
      <div class="day-modal" @click.stop>
        <div class="modal-header">
          <h5>{{ formatDate(selectedDay.data) }} - {{ selectedDay.dia_semana }}</h5>
          <button class="btn-close" @click="selectedDay = null">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="badge" :class="getStatusBadgeClass(selectedDay.status)">
              {{ getStatusLabel(selectedDay.status) }}
            </span>
          </div>
          <div class="detail-row" v-if="selectedDay.tem_ponto">
            <span class="detail-label">Total de Pontos:</span>
            <span>{{ selectedDay.total_pontos }}</span>
          </div>
          <div class="detail-row" v-if="selectedDay.primeiro_ponto">
            <span class="detail-label">Primeiro Ponto:</span>
            <span>{{ selectedDay.primeiro_ponto }}</span>
          </div>
          <div class="detail-row" v-if="selectedDay.ultimo_ponto">
            <span class="detail-label">Último Ponto:</span>
            <span>{{ selectedDay.ultimo_ponto }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Saldo do Dia:</span>
            <span :class="{'text-success': selectedDay.saldo_dia_minutos > 0, 'text-danger': selectedDay.saldo_dia_minutos < 0}">
              {{ selectedDay.saldo_dia_formatado }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProfileService from '../services/ProfileService'

const calendar = ref(null)
const loading = ref(true)
const currentMonth = ref(new Date().getMonth() + 1)
const currentYear = ref(new Date().getFullYear())
const selectedDay = ref(null)

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const monthName = computed(() => monthNames[currentMonth.value - 1])

const isCurrentMonth = computed(() => {
  const now = new Date()
  return currentMonth.value === now.getMonth() + 1 && currentYear.value === now.getFullYear()
})

const calendarDays = computed(() => {
  if (!calendar.value || !calendar.value.dias) return []
  
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
  
  const days = []
  
  // Preenche os dias vazios antes do primeiro dia do mês
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }
  
  // Preenche os dias do mês
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const dayData = calendar.value.dias.find(d => d.data === dateStr)
    
    if (dayData) {
      days.push(dayData)
    } else {
      // Cria um dia vazio se não houver dados
      days.push({
        data: dateStr,
        dia_semana: getDayName(new Date(currentYear.value, currentMonth.value - 1, i)),
        tem_ponto: false,
        total_pontos: 0,
        saldo_dia_minutos: 0,
        saldo_dia_formatado: '00:00',
        status: 'sem_ponto'
      })
    }
  }
  
  return days
})

const loadCalendar = async () => {
  try {
    loading.value = true
    calendar.value = await ProfileService.getCalendar(currentMonth.value, currentYear.value)
    console.log('Dados do calendário:', calendar.value)
  } catch (err) {
    console.error('Erro ao carregar calendário:', err)
  } finally {
    loading.value = false
  }
}

const previousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadCalendar()
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadCalendar()
}

const goToCurrentMonth = () => {
  const now = new Date()
  currentMonth.value = now.getMonth() + 1
  currentYear.value = now.getFullYear()
  loadCalendar()
}

const selectDay = (day) => {
  selectedDay.value = day
}

const getDayNumber = (dateStr) => {
  return parseInt(dateStr.split('-')[2])
}

const getDayName = (date) => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return days[date.getDay()]
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const getDayClass = (day) => {
  if (!day) return 'empty'
  
  const classes = ['has-day']
  
  if (day.tem_ponto) {
    classes.push('has-ponto')
  }
  
  const today = new Date()
  const dayDate = new Date(day.data + 'T00:00:00')
  
  if (dayDate.toDateString() === today.toDateString()) {
    classes.push('today')
  }
  
  if (dayDate.getDay() === 0 || dayDate.getDay() === 6) {
    classes.push('weekend')
  }
  
  return classes.join(' ')
}

const getStatusClass = (status) => {
  const classes = {
    'completo': 'status-completo',
    'incompleto': 'status-incompleto',
    'em_andamento': 'status-andamento',
    'sem_ponto': 'status-sem-ponto'
  }
  return classes[status] || ''
}

const getStatusIcon = (status) => {
  const icons = {
    'completo': 'bi bi-check-circle-fill',
    'incompleto': 'bi bi-exclamation-circle-fill',
    'em_andamento': 'bi bi-clock-fill',
    'sem_ponto': 'bi bi-dash-circle-fill'
  }
  return icons[status] || 'bi bi-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    'completo': 'Completo',
    'incompleto': 'Incompleto',
    'em_andamento': 'Em Andamento',
    'sem_ponto': 'Sem Ponto'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'completo': 'bg-success',
    'incompleto': 'bg-warning',
    'em_andamento': 'bg-info',
    'sem_ponto': 'bg-secondary'
  }
  return classes[status] || 'bg-secondary'
}

onMounted(() => {
  loadCalendar()
})

// Expor método para recarregar
defineExpose({
  reload: loadCalendar
})
</script>

<style scoped>
.calendar-ponto {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.calendar-title {
  text-align: center;
  flex: 1;
}

.calendar-title h4 {
  margin: 0 0 0.5rem 0;
  color: white;
  background: linear-gradient(90deg, #d4af37, #fff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-icon:hover:not(:disabled) {
  background: linear-gradient(135deg, #d4af37, #696000);
  transform: scale(1.1);
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.5);
  color: #d4af37;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  transition: all 0.3s;
}

.btn-outline:hover {
  background: rgba(212, 175, 55, 0.2);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #d4af37;
  padding: 0.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.calendar-day {
  aspect-ratio: 1;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  transition: all 0.3s;
  position: relative;
}

.calendar-day.empty {
  background: transparent;
  border: none;
}

.calendar-day.has-day {
  cursor: pointer;
}

.calendar-day.has-day:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(212, 175, 55, 0.5);
  transform: scale(1.05);
}

.calendar-day.today {
  border: 2px solid #d4af37;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
}

.calendar-day.weekend {
  background: rgba(255, 100, 100, 0.05);
}

.day-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.day-number {
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
}

.day-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.ponto-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
}

.status-completo {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.status-incompleto {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.status-andamento {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.status-sem-ponto {
  background: rgba(255, 255, 255, 0.2);
}

.day-times {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  line-height: 1.2;
}

.day-balance {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.day-balance.positive {
  color: #2ecc71;
}

.day-balance.negative {
  color: #e74c3c;
}

.no-ponto {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 1.25rem;
}

/* Summary */
.calendar-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4af37;
}

/* Legend */
.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.legend-badge {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.badge-completo {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.badge-incompleto {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.badge-em-andamento {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.badge-sem-ponto {
  background: rgba(255, 255, 255, 0.2);
}

/* Modal */
.day-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.day-modal {
  background: rgba(0, 0, 36, 0.95);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h5 {
  margin: 0;
  color: white;
}

.btn-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #d4af37;
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-ponto {
    padding: 1rem;
  }
  
  .calendar-header {
    flex-wrap: wrap;
  }
  
  .calendar-title h4 {
    font-size: 1.25rem;
  }
  
  .weekday {
    font-size: 0.7rem;
    padding: 0.25rem;
  }
  
  .day-number {
    font-size: 0.75rem;
  }
  
  .ponto-indicator {
    width: 20px;
    height: 20px;
    font-size: 0.65rem;
  }
  
  .day-times {
    font-size: 0.55rem;
  }
  
  .day-balance {
    font-size: 0.6rem;
  }
  
  .calendar-summary {
    grid-template-columns: 1fr;
  }
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
  background: rgba(255, 255, 255, 0.2);
}

.text-success {
  color: #2ecc71 !important;
}

.text-danger {
  color: #e74c3c !important;
}

/* Spinner */
.spinner-border {
  width: 3rem;
  height: 3rem;
  border-color: #d4af37;
  border-right-color: transparent;
}

/* Light Mode Styles */
body.light-mode .calendar-header {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(105, 96, 0, 0.15);
}

body.light-mode .calendar-title h4 {
  background: linear-gradient(90deg, #696000, #333333);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

body.light-mode .btn-icon {
  background: rgba(255, 255, 255, 0.8);
  color: #696000;
  border-color: rgba(105, 96, 0, 0.3);
}

body.light-mode .btn-icon:hover:not(:disabled) {
  background: linear-gradient(135deg, #FFD700, #696000);
  color: #333333;
}

body.light-mode .btn-nav {
  background: rgba(255, 255, 255, 0.8);
  color: #696000;
  border-color: rgba(105, 96, 0, 0.3);
}

body.light-mode .btn-nav:hover:not(:disabled) {
  background: #FFD700;
  border-color: #FFD700;
  color: #333333;
}

body.light-mode .weekday {
  color: #696000;
}

body.light-mode .calendar-grid,
body.light-mode .calendar-summary {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(105, 96, 0, 0.15);
}

body.light-mode .calendar-day {
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(105, 96, 0, 0.1);
}

body.light-mode .calendar-day.has-day:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.5);
}

body.light-mode .calendar-day.today {
  border-color: #FFD700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.5);
}

body.light-mode .calendar-day.weekend {
  background: rgba(255, 100, 100, 0.1);
}

body.light-mode .day-number {
  color: #333333;
}

body.light-mode .day-times {
  color: rgba(51, 51, 51, 0.7);
}

body.light-mode .day-balance {
  color: #666666;
}

body.light-mode .day-header,
body.light-mode .summary-item {
  background: rgba(255, 215, 0, 0.15);
  color: #333333;
  border-color: rgba(105, 96, 0, 0.2);
}

body.light-mode .day-cell {
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(105, 96, 0, 0.1);
  color: #333333;
}

body.light-mode .day-cell:hover:not(.outside):not(.loading) {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.4);
}

body.light-mode .day-cell.today {
  border-color: #FFD700;
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.3);
}

body.light-mode .outside {
  background: rgba(248, 248, 248, 0.5);
  color: #999999;
}

body.light-mode .outside .day-number {
  color: #999999;
}

body.light-mode .ponto-indicator {
  color: white !important;
  font-weight: 600;
}

body.light-mode .status-completo {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white !important;
}

body.light-mode .status-incompleto {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white !important;
}

body.light-mode .status-andamento {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white !important;
}

body.light-mode .status-sem-ponto {
  background: rgba(150, 150, 150, 0.5);
  color: white !important;
}

body.light-mode .day-balance.positive {
  color: #27ae60 !important;
  background: rgba(46, 204, 113, 0.15);
}

body.light-mode .day-balance.negative {
  color: #c0392b !important;
  background: rgba(231, 76, 60, 0.15);
}

body.light-mode .spinner-border {
  border-color: #FFD700;
  border-right-color: transparent;
}
</style>
