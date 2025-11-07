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
let map = null
let marker = null
let circle = null

// Lazy load Leaflet via CDN sem instalar dependência
function ensureLeafletLoaded() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L)

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    script.onerror = () => reject(new Error('Falha ao carregar Leaflet'))
    document.body.appendChild(script)
  })
}

function setupMap(L) {
  if (!mapEl.value) return
  map = L.map(mapEl.value, { zoomControl: true })
  map.setView([props.initialPosition.lat, props.initialPosition.lng], props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  marker = L.marker([props.initialPosition.lat, props.initialPosition.lng], { draggable: true }).addTo(map)
  marker.on('dragend', () => {
    const p = marker.getLatLng()
    emit('position-changed', { lat: p.lat, lng: p.lng })
    updateCircle()
  })

  // Emite posição inicial
  emit('position-changed', { lat: props.initialPosition.lat, lng: props.initialPosition.lng })

  // Desenha círculo inicial se houver raio
  updateCircle()
}

onMounted(async () => {
  const L = await ensureLeafletLoaded()
  setupMap(L)
})

onUnmounted(() => {
  if (map) {
    if (circle) {
      map.removeLayer(circle)
      circle = null
    }
    map.remove()
    map = null
    marker = null
  }
})

watch(() => props.initialPosition, (pos) => {
  if (!map || !pos) return
  map.setView([pos.lat, pos.lng])
  if (marker) {
    marker.setLatLng([pos.lat, pos.lng])
    // IMPORTANTE: Emitir evento quando a posição inicial muda (ex: após busca de CEP)
    emit('position-changed', { lat: pos.lat, lng: pos.lng })
  }
  updateCircle()
})

watch(() => props.circleRadiusMeters, () => {
  updateCircle()
})

function updateCircle() {
  if (!map || !window.L) return
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
