<template>
  <div class="card">
    <div class="card-body">
      <h2 class="card-title">Nova Empresa</h2>
      <p class="card-text">Preencha os dados da empresa:</p>
      <form @submit.prevent="createEmpresa">
        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Nome:</label>
          <input v-model="empresa.nome" required class="form-control" />
        </div>
        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Raio Geofence (metros):</label>
          <input type="number" v-model="empresa.raioGeofenceMetros" required class="form-control" />
        </div>
        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Latitude:</label>
          <input type="number" step="any" v-model="empresa.sedeLatitude" required class="form-control" />
        </div>
        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Longitude:</label>
          <input type="number" step="any" v-model="empresa.sedeLongitude" required class="form-control" />
        </div>
        <input class="btn btn-success form-control" type="submit" value="Salvar">
      </form>
    </div>
  </div>
</template>

<script>
import api from '../axios';

export default {
  name: 'EmpresaNew',
  data() {
    return {
      empresa: {
        nome: '',
        raioGeofenceMetros: null,
        sedeLatitude: null,
        sedeLongitude: null
      }
    }
  },
  methods: {
    async createEmpresa() {
      try {
        await api.post('/api/v1/empresas', this.empresa);
        alert('Empresa criada com sucesso!');
        this.$router.push('/empresa/list');
      } catch (error) {
        console.error('Erro ao criar empresa', error);
        alert('Erro ao criar empresa.');
      }
    }
  }
}
</script>
