<template>
  <div class="card">
    <div class="card-body">
      <h2 class="card-title">Novo Cargo</h2>
      <p class="card-text">Preencha os dados do novo cargo:</p>
      <form @submit.prevent="createCargo">
        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Nome:</label>
          <input v-model="cargo.nome" required class="form-control" />
        </div>
        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Empresa:</label>
          <select v-model="cargo.empresa_id" required class="form-control">
            <option value="" disabled>Selecione a empresa</option>
            <option v-for="empresa in empresas" :key="empresa.id" :value="empresa.id">
              {{ empresa.nome }}
            </option>
          </select>
        </div>
        <input class="btn btn-success form-control" type="submit" value="Salvar">
      </form>
    </div>
  </div>
</template>

<script>
import api from '../axios';

export default {
  name: 'CargoNew',
  data() {
    return {
      cargo: {
        nome: '',
        empresa_id: null
      },
      empresas: []
    }
  },
  async mounted() {
    try {
      const res = await api.get('/api/v1/empresas');
      this.empresas = res.data;
    } catch (error) {
      console.error('Erro ao carregar empresas', error);
    }
  },
  methods: {
    async createCargo() {
      try {
        await api.post('/api/v1/cargos', this.cargo);
        alert('Cargo criado com sucesso!');
        this.$router.push('/cargo/list');
      } catch (error) {
        console.error('Erro ao criar cargo', error);
        alert('Erro ao criar cargo.');
      }
    }
  }
}
</script>
