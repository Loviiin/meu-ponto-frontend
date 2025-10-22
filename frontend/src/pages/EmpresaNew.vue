<template>
  <div class="card mt-4">
    <div class="card-body">
      <h2 class="card-title">Cadastrar Nova Empresa</h2>
      <p class="card-text">Preencha os dados da nova empresa.</p>
        <form @submit.prevent="createEmpresa">
        <!-- Dados da Empresa -->
        <div class="mb-3">
          <label class="form-label">Nome da Empresa:</label>
          <input v-model="empresa.nome" required class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">CEP (opcional para centralizar o mapa):</label>
          <input v-model="cep" class="form-control" placeholder="00000-000" @blur="onBlurCep" />
        </div>

        <div class="mb-2">
          <small class="text-muted">Ajuste visualmente a localização exata arrastando o marcador no mapa.</small>
        </div>
  <LocationPickerMap :initialPosition="mapCenter" :circleRadiusMeters="Number(empresa.raioGeofenceMetros || 0)" @position-changed="onMapChanged" />

        <div class="row mt-3">
          <div class="col">
            <label class="form-label">Latitude:</label>
            <input v-model.number="empresa.sedeLatitude" type="number" step="0.000001" class="form-control" readonly />
          </div>
          <div class="col">
            <label class="form-label">Longitude:</label>
            <input v-model.number="empresa.sedeLongitude" type="number" step="0.000001" class="form-control" readonly />
          </div>
        </div>

        <div class="mb-3 mt-2">
          <label class="form-label">Raio da Empresa (em metros):</label>
          <input v-model.number="empresa.raioGeofenceMetros" type="number" step="0.01" min="0.1" required class="form-control" />
        </div>

        <button type="submit" class="btn btn-success w-100">Salvar Empresa</button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../axios'
import LocationPickerMap from '../components/LocationPickerMap.vue'
import { getAddressByCEP } from '../services/locationService.js'

export default {
  name: 'EmpresaNew',
  components: { LocationPickerMap },
  data() {
  return {
    empresa: {
      nome: '',
      raioGeofenceMetros: 100.0,
      sedeLatitude: -23.55052,
      sedeLongitude: -46.633308
    },
    cep: '',
    mapCenter: { lat: -23.55052, lng: -46.633308 }
  }
},
  methods: {
onMapChanged(pos){
  this.empresa.sedeLatitude = pos.lat
  this.empresa.sedeLongitude = pos.lng
},
async onBlurCep(){
  const digits = String(this.cep||'').replace(/\D/g,'')
  if (digits.length !== 8) return
  try {
    const address = await getAddressByCEP(digits)
    const lat = address.latitude ?? address.lat ?? address.Latitude ?? address.Lat
    const lng = address.longitude ?? address.lon ?? address.lng ?? address.Longitude ?? address.Lng ?? address.Lon
    if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      this.mapCenter = { lat, lng }
    }
  } catch (e) {
    console.warn('Falha ao centralizar por CEP', e.response?.data || e)
  }
},
async createEmpresa() {
  try {
    const payload = {
      Nome: this.empresa.nome,
      RaioGeofenceMetros: this.empresa.raioGeofenceMetros ? parseFloat(this.empresa.raioGeofenceMetros) : 0.0,
      SedeLatitude: this.empresa.sedeLatitude ? parseFloat(this.empresa.sedeLatitude) : 0.0,
      SedeLongitude: this.empresa.sedeLongitude ? parseFloat(this.empresa.sedeLongitude) : 0.0
    }

    console.log("Payload enviado:", payload)

    const resEmpresa = await api.post('/empresas', payload)
    const empresaId = resEmpresa.data.id

    alert('Empresa criada com sucesso! Agora cadastre o administrador.')
    this.$router.push({ path: '/usuario/new', query: { empresa_id: empresaId } })
  } catch (error) {
    console.error('Erro ao criar empresa', error.response?.data || error)
    alert('Erro ao criar empresa.')
  }
}

  }
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}
</style>
