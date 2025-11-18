<template>
  <div class="floating-container">
    <!-- Botão inicial -->
    <button v-if="!expanded" class="floating-btn" @click="toggleExpand" data-cy="floating-punch-btn">
      Bater Ponto!
    </button>

    <!-- Card expandido -->
    <div v-else class="expanded-card">
      <h2>{{ greeting }}, Usuário!</h2>

      <div class="clock">
        <p class="time">{{ currentTime }}</p>
        <p class="date">{{ currentDate }}</p>
      </div>

      <button class="punch-btn" @click="baterPonto" :disabled="posting">
        <span v-if="!posting">BATER PONTO</span>
        <span v-else>Registrando...</span>
      </button>

      <button class="close-btn" @click="toggleExpand"><i class="bi bi-x-circle"></i></button>
    </div>

    <!-- Modal de Ajuste no Mapa -->
    <div v-if="showAdjustModal" class="modal-overlay">
      <div class="modal-card">
        <h3>Ajuste sua localização</h3>
        <p class="modal-subtitle">A precisão atual é de {{ displayAccuracy }}. Arraste o marcador para a sua posição exata e confirme.</p>
        <div class="map-container">
          <LocationPickerMap
            v-if="selectedLocation"
            :initialPosition="selectedLocation"
            @position-changed="onMapPositionChanged"
          />
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelarAjuste" :disabled="posting">Cancelar</button>
          <button class="btn-primary" @click="confirmarAjuste" :disabled="posting">
            <span v-if="!posting">Confirmar</span>
            <span v-else>Enviando...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.floating-container {
  position: fixed;
  top: 20px;
  left: 10px;
  z-index: 1030; /* Acima do navbar (1020) e abaixo do modal (1050) */
  margin-top: 50px;
}

.floating-btn {
  background: rgba(26, 36, 45, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(212, 175, 55, 1);
  font-weight: bold;
  border: 1px solid rgba(212, 175, 55, 1);
  padding: 15px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.floating-btn:hover {
  color: white;
  background: rgba(212, 175, 55, 1);
}

/* Responsividade do botão flutuante */
@media (max-width: 768px) {
  .floating-container {
    top: auto;
    bottom: 50px; /* acima do footer */
    left: 50%;
    transform: translateX(-50%);
    margin-top: 0;
    z-index: 1030; /* garante que fica acima de tudo exceto modals */
  }
  
  .floating-btn {
    padding: 12px 18px;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }
  
  .floating-btn:active {
    transform: scale(0.95);
  }
  
  .expanded-card {
    width: 90vw;
    max-width: 320px;
    position: fixed;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 576px) {
  .floating-container {
    bottom: 45px;
  }
  
  .floating-btn {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
  
  .expanded-card {
    bottom: 45px;
  }
}

@media (max-width: 375px) {
  .floating-container {
    bottom: 40px;
  }
  
  .expanded-card {
    bottom: 40px;
    width: 95vw;
    max-width: 280px;
  }
}

.expanded-card {
  background: white;
  border-radius:10px;
  padding: 20px;
  width: 260px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  animation: fadeIn 0.3s ease;
  position: relative;
    background: rgba(255, 255, 255, 0.08); /* glass */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.expanded-card h2 {
  margin-bottom: 15px;
  font-size: 18px;
  color: #ffffff;
  text-align: center;
}

.clock {
  text-align: center;
  margin-bottom: 20px;
}

.time {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
}

.date {
  font-size: 14px;
  color: #ffffff;
}

.punch-btn {
  width: 100%;
  padding: 12px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.punch-btn:hover {
  background: #15803d;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 10px;
  background: transparent;
  border: none;
  color: #888;
  font-size: 16px;
  cursor: pointer;
}
@keyframes fadeIn {
  from {opacity: 0; transform: translateY(10px);}
  to {opacity: 1; transform: translateY(0);}
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
}
.modal-card {
  width: min(92vw, 720px);
  max-height: 92vh;
  background: #0b1320cc;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 0.6);
  border-radius: 12px;
  padding: 16px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1.25rem;
  color: rgba(212, 175, 55, 1);
  flex-shrink: 0;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #e5e7eb;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.map-container {
  flex: 1;
  min-height: 300px;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.btn-secondary {
  background: transparent;
  color: #e5e7eb;
  border: 1px solid #9ca3af;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  background: rgba(156, 163, 175, 0.1);
}
.btn-primary {
  background: rgba(212, 175, 55, 1);
  color: #0b1320;
  border: 1px solid rgba(212, 175, 55, 1);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: rgba(212, 175, 55, 0.9);
}

/* Responsividade do modal */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 8px;
    padding-bottom: 55vh; /* espaço extra para os botões não ficarem no footer */
  }
  
  .modal-card {
    width: 100%;
    max-width: 100%;
    max-height: 90vh;
    height: auto;
    padding: 12px;
    padding-bottom: 55vh;
    border-radius: 8px;
  }
  
  .modal-card h3 {
    font-size: 1.1rem;
    margin-bottom: 6px;
  }
  
  .modal-subtitle {
    font-size: 0.85rem;
    margin-bottom: 8px;
  }
  
  .map-container {
    flex: 1;
    min-height: 250px;
    max-height: calc(90vh - 200px); /* deixa espaço para título + botões */
    margin-bottom: 10px;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
    margin-top: auto;
    padding-top: 12px;
    flex-shrink: 0;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
    padding: 12px;
  }
}

@media (max-width: 576px) {
  .modal-overlay {
    padding: 6px;
    padding-bottom: 55vh; /* ainda mais espaço em telas menores */
  }
  
  .modal-card {
    padding: 10px;
    padding-bottom: 55vh;
    max-height: 88vh;
    height: auto;
  }
  
  .map-container {
    min-height: 200px;
    max-height: calc(88vh - 180px);
  }
}

@media (max-width: 375px) {
  .modal-overlay {
    padding: 4px;
    padding-bottom: 55vh; /* máximo espaço para telas pequenas */
  }
  
  .modal-card {
    padding: 8px;
    padding-bottom: 55vh;
    border-radius: 6px;
    max-height: 85vh;
    height: auto;
  }
  
  .modal-card h3 {
    font-size: 1rem;
    margin-bottom: 4px;
  }
  
  .modal-subtitle {
    font-size: 0.8rem;
    margin-bottom: 6px;
  }
  
  .map-container {
    min-height: 180px;
    max-height: calc(85vh - 160px);
    margin-bottom: 8px;
  }
}

/* Light Mode Styles */
body.light-mode .floating-btn {
  background: rgba(255, 255, 255, 0.95);
  color: #696000;
  border-color: #FFD700;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

body.light-mode .floating-btn:hover {
  background: #FFD700;
  color: #333333;
}

body.light-mode .expanded-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(105, 96, 0, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

body.light-mode .expanded-card h2 {
  color: #333333;
}

body.light-mode .time {
  color: #333333;
}

body.light-mode .date {
  color: #666666;
}

body.light-mode .punch-btn {
  background: #16a34a;
}

body.light-mode .punch-btn:hover {
  background: #15803d;
}

body.light-mode .close-btn {
  color: #666666;
}

body.light-mode .close-btn:hover {
  color: #333333;
}

body.light-mode .modal-card {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(105, 96, 0, 0.3);
  color: #333333;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

body.light-mode .modal-card h3 {
  color: #696000;
}

body.light-mode .modal-subtitle {
  color: #666666;
}

body.light-mode .btn-secondary {
  color: #333333;
  border-color: #666666;
}

body.light-mode .btn-secondary:hover {
  background: rgba(102, 102, 102, 0.1);
}

body.light-mode .btn-primary {
  background: #FFD700;
  color: #333333;
  border-color: #FFD700;
}

body.light-mode .btn-primary:hover {
  background: #E6C200;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import api from "../axios";
import { toast } from "../toast";
import LocationPickerMap from "./LocationPickerMap.vue";

const expanded = ref(false);
const currentTime = ref("");
const currentDate = ref("");
const userId = localStorage.getItem("userId");

const latitude = ref(null);
const longitude = ref(null);
const posting = ref(false);
const accuracy = ref(null); // em metros

// Estado para ajuste manual no mapa
const showAdjustModal = ref(false);
const impreciseLocation = ref(null); // { lat, lng, accuracy }
const selectedLocation = ref(null); // { lat, lng }

const displayAccuracy = computed(() => {
  if (accuracy.value == null) return '—';
  const v = Math.round(accuracy.value);
  return `${v} m`;
});

// Atualiza relógio
function updateClock() {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  currentDate.value = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Saudação dinâmica
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
});

function toggleExpand() {
  expanded.value = !expanded.value;
}

async function baterPonto() {
  // UI otimista: feedback imediato
  if (posting.value) return;
  posting.value = true;
  const start = performance.now();

  // Solicitar geolocalização com alta precisão antes de registrar o ponto
  toast.info('Obtendo localização de alta precisão...');
  await new Promise((resolve) => {
    getGeolocation({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }, resolve);
  });

  // Se falhou completamente em obter coordenadas, encerrar (erro já foi exibido)
  if (latitude.value == null || longitude.value == null) {
    posting.value = false;
    return;
  }

  // Caminho híbrido: usar automático se precisão <= 30m, caso contrário abrir mapa
  const acc = typeof accuracy.value === 'number' ? accuracy.value : Number.POSITIVE_INFINITY;
  if (acc <= 30) {
    try {
      const payload = {
        usuario_id: Number(userId),
        latitude: latitude.value,
        longitude: longitude.value,
        data_hora: new Date().toISOString(),
        metodo: 'AUTOMATICO',
        original_accuracy: accuracy.value,
      };

      const resp = await api.post("/pontos", payload, { timeout: 8000 });
      const duration = Math.round(performance.now() - start);
      toast.success(`Ponto registrado automaticamente (${duration}ms)`);
      expanded.value = false; // fecha o card após sucesso
    } catch (error) {
      console.error("Erro ao bater ponto", error.response?.data || error);
      const msg = error.response?.data?.message || 'Erro ao registrar ponto.';
      toast.error(msg);
    } finally {
      posting.value = false;
    }
  } else {
    // Abrir modal com mapa para ajuste fino
    impreciseLocation.value = {
      lat: latitude.value,
      lng: longitude.value,
      accuracy: accuracy.value,
    };
    selectedLocation.value = {
      lat: latitude.value,
      lng: longitude.value,
    };
    showAdjustModal.value = true;
    posting.value = false; // liberar UI enquanto usuário ajusta
  }
}

// Função para obter a localização (simples, com alta precisão)
function getGeolocation(options, onDone) {
  if (!navigator.geolocation) {
    toast.error("Geolocalização não é suportada por este navegador.");
    if (onDone) onDone();
    return;
  }

  // Defaults pensados para rapidez; caller pode sobrescrever em chamadas específicas
  const opts = Object.assign({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }, options);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      // Atualiza coordenadas e registra precisão
      latitude.value = pos.coords.latitude;
      longitude.value = pos.coords.longitude;
      accuracy.value = typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null;
      console.log(
        "Localização obtida:",
        latitude.value,
        longitude.value,
        `accuracy=${pos.coords.accuracy}m`
      );
      if (onDone) onDone();
    },
    (err) => {
      console.error("Erro ao obter localização:", err);
      toast.error(`Erro ao obter localização: ${err.message}. Verifique as permissões do seu navegador.`);
      accuracy.value = null;
      if (onDone) onDone();
    },
    opts
  );
}

let interval = null;
onMounted(() => {
  updateClock();
  interval = setInterval(updateClock, 1000);
  // Pré-aquecer geolocalização com cache recente (melhora TTFP)
  getGeolocation({ enableHighAccuracy: false, timeout: 7000, maximumAge: 30000 });
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});

// Handlers do modal de ajuste no mapa
function onMapPositionChanged(pos) {
  selectedLocation.value = { lat: pos.lat, lng: pos.lng };
}

function cancelarAjuste() {
  showAdjustModal.value = false;
}

async function confirmarAjuste() {
  if (!selectedLocation.value) return;
  if (posting.value) return;
  posting.value = true;
  try {
    const payload = {
      usuario_id: Number(userId),
      latitude: selectedLocation.value.lat,
      longitude: selectedLocation.value.lng,
      data_hora: new Date().toISOString(),
      metodo: 'AJUSTE_PELO_MAPA',
      original_latitude: impreciseLocation.value?.lat ?? null,
      original_longitude: impreciseLocation.value?.lng ?? null,
      original_accuracy: impreciseLocation.value?.accuracy ?? null,
    };
    await api.post('/pontos', payload, { timeout: 8000 });
    toast.success('Ponto registrado com ajuste pelo mapa');
    showAdjustModal.value = false;
    expanded.value = false; // fecha o card após sucesso
  } catch (error) {
    console.error('Erro ao registrar ajuste', error.response?.data || error);
    const msg = error.response?.data?.message || 'Erro ao registrar ponto ajustado.';
    toast.error(msg);
  } finally {
    posting.value = false;
  }
}
</script>
