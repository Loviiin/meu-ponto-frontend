<template>
  <div class="card mt-4">
    <div class="card-body">
      <h2 class="card-title">Editar Empresa</h2>
      <p class="card-text">Atualize os dados da empresa.</p>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      </div>

      <form v-else @submit.prevent="updateEmpresa">
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
        
        <LocationPickerMap 
          v-if="mapCenter"
          :initialPosition="mapCenter" 
          :circleRadiusMeters="Number(empresa.raioGeofenceMetros || 0)" 
          @position-changed="onMapChanged" 
        />

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

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-success flex-grow-1">Salvar Alterações</button>
          <button type="button" class="btn btn-secondary" @click="$router.back()">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../axios'
import LocationPickerMap from '../components/LocationPickerMap.vue'
import { getAddressByCEP } from '../services/locationService.js'

export default {
  name: 'EmpresaEdit',
  components: { LocationPickerMap },
  data() {
    return {
      empresa: {
        id: null,
        nome: '',
        raioGeofenceMetros: 100.0,
        sedeLatitude: -23.55052,
        sedeLongitude: -46.633308
      },
      cep: '',
      mapCenter: { lat: -23.55052, lng: -46.633308 },
      loading: true
    }
  },
  mounted() {
    this.loadEmpresa()
  },
  methods: {
    async loadEmpresa() {
      try {
        const empresaId = this.$route.params.id
        const response = await api.get(`/empresas/${empresaId}`)
        
        this.empresa = {
          id: response.data.id,
          nome: response.data.nome,
          raioGeofenceMetros: response.data.raioGeofenceMetros || 100.0,
          sedeLatitude: response.data.sedeLatitude || -23.55052,
          sedeLongitude: response.data.sedeLongitude || -46.633308
        }
        
        this.mapCenter = { 
          lat: this.empresa.sedeLatitude, 
          lng: this.empresa.sedeLongitude 
        }
      } catch (error) {
        console.error('Erro ao carregar empresa:', error)
        alert('Erro ao carregar empresa')
        this.$router.back()
      } finally {
        this.loading = false
      }
    },
    onMapChanged(pos) {
      this.empresa.sedeLatitude = pos.lat
      this.empresa.sedeLongitude = pos.lng
    },
    async onBlurCep() {
      const digits = String(this.cep || '').replace(/\D/g, '')
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
    async updateEmpresa() {
      try {
        const payload = {
          Nome: this.empresa.nome,
          RaioGeofenceMetros: this.empresa.raioGeofenceMetros ? parseFloat(this.empresa.raioGeofenceMetros) : 0.0,
          SedeLatitude: this.empresa.sedeLatitude ? parseFloat(this.empresa.sedeLatitude) : 0.0,
          SedeLongitude: this.empresa.sedeLongitude ? parseFloat(this.empresa.sedeLongitude) : 0.0
        }

        console.log('Payload enviado:', payload)

        await api.patch(`/empresas/${this.empresa.id}`, payload)
        alert('Empresa atualizada com sucesso!')
        this.$router.back()
      } catch (error) {
        console.error('Erro ao atualizar empresa:', error)
        alert('Erro ao atualizar empresa: ' + (error.response?.data?.message || error.message))
      }
    }
  }
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.card-title {
  color: #d4af37;
}

.form-control {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: #d4af37;
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(212, 175, 55, 0.25);
}

.form-label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}
</style>
