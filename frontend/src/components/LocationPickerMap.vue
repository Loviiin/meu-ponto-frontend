<template>
  <div class="map-wrapper">
    <div ref="mapEl" class="map-el"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  initialPosition: {
    type: Object,
    required: true, // { lat, lng }
  },
  zoom: {
    type: Number,
    default: 17
  },
  circleRadiusMeters: {
    type: Number,
    default: 2
  }
})

const emit = defineEmits(['position-changed'])

const mapEl = ref(null)
const mapInitialized = ref(false)
let map = null
let marker = null
let circle = null
let tileLayer = null
let leafletScriptLoaded = false

// Lazy load Leaflet via CDN com cache seguro
function ensureLeafletLoaded() {
  return new Promise((resolve, reject) => {
    if (window.L && leafletScriptLoaded) return resolve(window.L)

    // Se Leaflet já existe mas o script não foi marcado, só retorna
    if (window.L) {
      leafletScriptLoaded = true
      return resolve(window.L)
    }

    // Verifica se CSS já existe
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.onerror = () => {
        console.warn('Erro ao carregar CSS Leaflet, continuando mesmo assim')
      }
      document.head.appendChild(link)
    }

    // Verifica se script já está carregando
    if (!document.querySelector('script[src*="leaflet.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => {
        leafletScriptLoaded = true
        resolve(window.L)
      }
      script.onerror = () => {
        leafletScriptLoaded = false
        reject(new Error('Falha ao carregar Leaflet'))
      }
      document.body.appendChild(script)
    } else {
      // Script já existe, esperar que carregue
      const checkLeaflet = setInterval(() => {
        if (window.L) {
          clearInterval(checkLeaflet)
          leafletScriptLoaded = true
          resolve(window.L)
        }
      }, 100)
      setTimeout(() => clearInterval(checkLeaflet), 5000)
    }
  })
}

function setupMap(L) {
  try {
    if (!mapEl.value) {
      console.error('mapEl.value não existe')
      return
    }

    // Se o mapa já existe, destruir primeiro
    if (map) {
      cleanupMap()
    }

    // Criar novo mapa
    map = L.map(mapEl.value, { 
      zoomControl: true,
      attributionControl: true,
      preferCanvas: false // usar SVG para melhor compatibilidade
    })
    
    map.setView([props.initialPosition.lat, props.initialPosition.lng], props.zoom)

    // Adicionar camada de tiles
    tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 1
    }).addTo(map)

    // Adicionar marcador draggable
    marker = L.marker([props.initialPosition.lat, props.initialPosition.lng], { 
      draggable: true,
      autoPan: true
    }).addTo(map)

    marker.on('dragend', () => {
      const p = marker.getLatLng()
      emit('position-changed', { lat: p.lat, lng: p.lng })
      updateCircle()
    })

    // Emite posição inicial
    emit('position-changed', { lat: props.initialPosition.lat, lng: props.initialPosition.lng })

    // Desenha círculo inicial
    updateCircle()
    
    mapInitialized.value = true
    
    // Força re-render do mapa após montagem
    setTimeout(() => {
      if (map) map.invalidateSize()
    }, 100)
  } catch (err) {
    console.error('Erro ao configurar mapa:', err)
  }
}

function cleanupMap() {
  try {
    if (circle) {
      if (map) map.removeLayer(circle)
      circle = null
    }
    if (marker) {
      if (map) map.removeLayer(marker)
      marker = null
    }
    if (tileLayer) {
      if (map) map.removeLayer(tileLayer)
      tileLayer = null
    }
    if (map) {
      map.off()
      map.remove()
      map = null
    }
    mapInitialized.value = false
  } catch (err) {
    console.error('Erro ao limpar mapa:', err)
    map = null
    marker = null
    circle = null
    tileLayer = null
  }
}

onMounted(async () => {
  try {
    const L = await ensureLeafletLoaded()
    await new Promise(resolve => setTimeout(resolve, 50)) // pequena pausa
    setupMap(L)
  } catch (err) {
    console.error('Erro ao montar mapa:', err)
  }
})

onUnmounted(() => {
  cleanupMap()
})

watch(() => props.initialPosition, (pos) => {
  if (!map || !mapInitialized.value || !pos) return
  try {
    // Verifica se a posição realmente mudou para evitar loops e resets desnecessários
    const currentCenter = map.getCenter()
    const dist = map.distance(currentCenter, [pos.lat, pos.lng])
    
    // Se a distância for pequena (< 1 metro), ignorar atualização do mapa
    // Isso evita que o mapa fique "pulando" quando o usuário arrasta o marcador
    // pois o evento dragend já atualizou o marcador visualmente
    if (dist < 1) return

    // Mantém o zoom atual do usuário em vez de resetar para props.zoom
    const currentZoom = map.getZoom()
    map.setView([pos.lat, pos.lng], currentZoom)
    
    if (marker) {
      marker.setLatLng([pos.lat, pos.lng])
      // Não emitir position-changed aqui para evitar loop infinito
    }
    updateCircle()
  } catch (err) {
    console.error('Erro ao atualizar posição do mapa:', err)
  }
})

watch(() => props.circleRadiusMeters, () => {
  updateCircle()
})

function updateCircle() {
  try {
    if (!map || !mapInitialized.value || !window.L) return
    
    const L = window.L
    const center = marker ? marker.getLatLng() : (props.initialPosition ? L.latLng(props.initialPosition.lat, props.initialPosition.lng) : null)
    
    if (!center) return
    
    const radius = Number(props.circleRadiusMeters || 0)
    
    if (radius > 0) {
      if (!circle) {
        circle = L.circle(center, {
          radius,
          color: '#d4af37',
          weight: 2,
          fillColor: '#d4af37',
          fillOpacity: 0.15,
        }).addTo(map)
      } else {
        circle.setLatLng(center)
        circle.setRadius(radius)
      }
    } else {
      if (circle) {
        map.removeLayer(circle)
        circle = null
      }
    }
  } catch (err) {
    console.error('Erro ao atualizar círculo:', err)
  }
}
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  touch-action: pan-x pan-y;
}

.map-el {
  width: 100%;
  height: 100%;
  min-height: 250px;
}

/* Touch feedback para mobile */
@media (max-width: 768px) {
  .map-wrapper {
    touch-action: pan-x pan-y pinch-zoom;
  }
  
  .map-el {
    min-height: 280px;
  }
}
</style>
