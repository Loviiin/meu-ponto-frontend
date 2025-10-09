<template>
  <div class="floating-container">
    <!-- Botão inicial -->
    <button v-if="!expanded" class="floating-btn" @click="toggleExpand">
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
  </div>
</template>

<style scoped>
.floating-container {
  position: fixed;
  top: 20px;
  left: 10px;
  z-index: 999;
  margin-top: 50px;
  
}

.floating-btn {
  background: #2563eb;
  color: rgba(212, 175, 55, 1);
  font-weight: bold;
  border: none;
  padding: 15px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(26, 36, 45, 0.6); /* translúcido */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.floating-btn:hover {
    color: white;
    background: rgba(212, 175, 55, 1);
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
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import api from "../axios";
import { toast } from "../toast";

const expanded = ref(false);
const currentTime = ref("");
const currentDate = ref("");
const userId = localStorage.getItem("userId");

const latitude = ref(null);
const longitude = ref(null);
const posting = ref(false);

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

  // Se não temos localização ainda, tentar obter sem bloquear a UI
  if (latitude.value === null || longitude.value === null) {
    toast.info('Obtendo localização...');
    await new Promise((resolve) => {
      // tenta uma coleta rápida com precisão média
      getGeolocation({ enableHighAccuracy: false, timeout: 5000, maximumAge: 15000 }, resolve);
      // timeout de segurança
      setTimeout(resolve, 3000);
    });
  }

  try {
    const payload = {
      usuario_id: Number(userId),
      latitude: latitude.value,
      longitude: longitude.value,
      data_hora: new Date().toISOString(),
    };

    const resp = await api.post("/pontos", payload, { timeout: 8000 });
    const duration = Math.round(performance.now() - start);
    toast.success(`Ponto registrado (${duration}ms)`);
  } catch (error) {
    console.error("Erro ao bater ponto", error.response?.data || error);
    const msg = error.response?.data?.message || 'Erro ao registrar ponto.';
    toast.error(msg);
  } finally {
    posting.value = false;
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
  const opts = Object.assign({ enableHighAccuracy: true, timeout: 15000, maximumAge: 20000 }, options);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      // Atualiza coordenadas e registra precisão
      latitude.value = pos.coords.latitude;
      longitude.value = pos.coords.longitude;
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
</script>
