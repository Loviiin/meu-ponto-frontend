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

    <table class="table table-striped table-dark">
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
          <td>{{ empresa.id }}</td>
          <td>{{ empresa.nome }}</td>
          <td>{{ empresa.raioGeofenceMetros }}</td>
          <td>{{ empresa.sedeLatitude }}</td>
          <td>{{ empresa.sedeLongitude }}</td>
          <td class="text-nowrap">
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
        const res = await api.get('/api/v1/empresas')
        this.empresas = res.data
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.$router.push('/login')
        }
      }
    },
    async deleteEmpresa(id) {
      if (confirm('Tem certeza que deseja excluir esta Empresa?')) {
        try {
          await api.delete(`/api/v1/empresas/${id}`)
          this.empresas = this.empresas.filter(e => e.id !== id)
        } catch (error) {
          console.error('Erro ao excluir Empresa', error)
        }
      }
    }
  }
}
</script>
