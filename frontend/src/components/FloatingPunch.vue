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

      <button class="punch-btn" @click="baterPonto">
        BATER PONTO
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

const expanded = ref(false);
const currentTime = ref("");
const currentDate = ref("");
const userId = localStorage.getItem("userId");

const latitude = ref(null);
const longitude = ref(null);

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
  // Garante que a localização foi obtida
  if (latitude.value === null || longitude.value === null) {
    alert("Não foi possível obter sua localização. Verifique as permissões do navegador e tente novamente.");
    // Tenta obter a localização de novo, caso o usuário libere a permissão
    getGeolocation(); 
    return;
  }

  try {
    const payload = {
      usuario_id: Number(userId),
      latitude: latitude.value,
      longitude: longitude.value,
      data_hora: new Date().toISOString(),
    };

    await api.post("/pontos", payload);

    alert("Ponto registrado com sucesso!");
  } catch (error) {
    console.error("Erro ao bater ponto", error.response?.data || error);
    alert("Erro ao registrar ponto.");
  }
}

// Função para obter a localização
function getGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitude.value = pos.coords.latitude;
        longitude.value = pos.coords.longitude;
        console.log("Localização obtida:", latitude.value, longitude.value);
      },
      (err) => {
        console.error("Erro ao obter localização:", err);
        alert("Erro ao obter localização. Verifique as permissões do seu navegador.");
      }
    );
  } else {
    alert("Geolocalização não é suportada por este navegador.");
  }
}

let interval = null;
onMounted(() => {
  updateClock();
  interval = setInterval(updateClock, 1000);
  getGeolocation(); // Pede a localização ao montar o componente
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>
