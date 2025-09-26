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
  <label class="form-label">Raio da Empresa (em metros):</label>
  <input
    v-model.number="empresa.RaioGeofenceMetros"
    type="number"
    step="0.01"
    min="0.1"
    required
    class="form-control"
  />
</div>



        <div class="mb-3">
  <label class="form-label">Latitude:</label>
  <input
    v-model.number="empresa.sedeLatitude"
    type="number"
    step="0.000001"
    min="0.1"
    required
    class="form-control"
  />
</div>

<div class="mb-3">
  <label class="form-label">Longitude:</label>
  <input
    v-model.number="empresa.sedeLongitude"
    type="number"
    step="0.000001"
    min="0.1"
    required
    class="form-control"
  />
</div>

        <button type="submit" class="btn btn-success w-100">Salvar Empresa</button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../axios'

export default {
  name: 'EmpresaNew',
  data() {
  return {
    empresa: {
      Nome: '',
      RaioGeofenceMetros: 0.0, // float64 no Go
      SedeLatitude: 0.0,
      SedeLongitude: 0.0
    }
  }
},
  methods: {
async createEmpresa() {
  try {
    const payload = {
      Nome: this.empresa.Nome,
      RaioGeofenceMetros: this.empresa.RaioGeofenceMetros
        ? parseFloat(this.empresa.RaioGeofenceMetros)
        : 0.0,
      SedeLatitude: this.empresa.SedeLatitude
        ? parseFloat(this.empresa.SedeLatitude)
        : 0.0,
      SedeLongitude: this.empresa.SedeLongitude
        ? parseFloat(this.empresa.SedeLongitude)
        : 0.0
    }

    console.log("Payload enviado:", payload)

    const resEmpresa = await api.post('/api/v1/empresas', payload)
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
