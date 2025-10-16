<template>
  <div class="table-responsive">
    <h2>Empresas</h2>
    <button
      class="btn btn-primary btn-sm"
      style="margin-bottom: 10px;"
      @click="$router.push('/empresa/new')"
    >
      Nova Empresa
      <i class="bi bi-building"></i>
    </button>

  <table class="table table-striped table-dark table-mobile">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Raio Geofence (m)</th>
          <th>Latitude</th>
          <th>Longitude</th>
          <th width="180">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="empresa in empresas" :key="empresa.id">
          <td :data-label="'ID'">{{ empresa.id }}</td>
          <td :data-label="'Nome'">{{ empresa.nome }}</td>
          <td :data-label="'Raio Geofence (m)'">{{ empresa.raioGeofenceMetros }}</td>
          <td :data-label="'Latitude'">{{ empresa.sedeLatitude }}</td>
          <td :data-label="'Longitude'">{{ empresa.sedeLongitude }}</td>
          <td class="text-nowrap" :data-label="'Ações'">
            <div class="btn-group" role="group">
              <a
                class="btn btn-primary btn-sm"
                title="Consultar"
                @click="$router.push(`/empresa/${empresa.id}`)"
              >
                <i class="bi bi-eye"></i>
              </a>
              <a
                @click="$router.push(`/empresa/edit/${empresa.id}`)"
                class="btn btn-warning btn-sm"
                title="Editar"
              >
                <i class="bi bi-pencil-square"></i>
              </a>
              <a
                @click="deleteEmpresa(empresa.id)"
                class="btn btn-danger btn-sm"
                title="Excluir"
              >
                <i class="bi bi-trash"></i>
              </a>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '../axios'

export default {
  name: 'EmpresaList',
  data() {
    return {
      empresas: []
    }
  },
  async mounted() {
    await this.fetchEmpresas()
  },
  methods: {
    async fetchEmpresas() {
      try {
        const res = await api.get('/empresas')
        // 🔥 Normaliza os campos vindos do backend
        this.empresas = (res.data || []).map(e => ({
          id: e.id || e.ID,
          nome: e.nome || e.Nome,
          raioGeofenceMetros: e.raioGeofenceMetros || e.RaioGeofenceMetros,
          sedeLatitude: e.sedeLatitude || e.SedeLatitude,
          sedeLongitude: e.sedeLongitude || e.SedeLongitude
        }))
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.$router.push('/login')
        } else {
          console.error('Erro ao carregar empresas', error)
        }
      }
    },
    async deleteEmpresa(id) {
      if (confirm('Tem certeza que deseja excluir esta Empresa?')) {
        try {
          await api.delete(`/empresas/${id}`)
          this.empresas = this.empresas.filter(e => e.id !== id)
        } catch (error) {
          console.error('Erro ao excluir Empresa', error)
        }
      }
    }
  }
}
</script>
