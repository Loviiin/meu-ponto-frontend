<template>
  <div class="card">
    <div class="card-body">
      <h2 class="card-title">Novo Funcionário</h2>
      <p class="card-text">Preencha os dados do novo funcionário:</p>
      <form @submit.prevent="createEmployee">
        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Nome:</label>
          <input v-model="usuarios.nome" required class="vTextField" style="width: 100%;"/>
        </div>
        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Email:</label>
          <input type="email" v-model="usuarios.email" class="vTextField" style="width: 100%;" />
        </div> 
        <div class="d-flex mb-3"> 
          <label class="col-sm-3 text-left">Empresa:</label>
          <select v-model="usuarios.empresa_id"  class="form-control">
            <option value="" disabled>Selecione uma empresa</option>
            <option v-for="empresa in empresas" :key="empresa.id" :value="empresa.id">
              {{ empresa.nome }}
            </option>
          </select>
        </div>  
        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Cargo:</label>
          <select v-model="usuarios.cargo_id"  class="form-control">
            <option value="" disabled>Selecione um cargo</option>
            <option v-for="cargo in cargos" :key="cargo.id" :value="cargo.id">
              {{ cargo.nome }}
            </option>
          </select>
        </div>
        
        <input class="btn btn-success form-control" style="margin: 10px;"  type="submit" value="Salvar">
        <input class="btn btn-primary form-control" style="margin: 10px;"  type="submit" value="Salvar e adicionar outro(a)" name="saveAndAddAnother">
        <input class="btn btn-primary form-control" style="margin: 10px;" type="submit" value="Salvar e continuar editando" name="saveAndContinue">
      </form>
    </div>
  </div>
</template>

<script>
import api from '../axios';

export default {
  name: 'EmployeeNew',
  data() {
    return {
usuarios: {
  nome: 'Teste Usuário',
  email: 'teste@empresa.com',
  empresa_id: 1, // precisa existir no banco
  cargo_id: 2,   // precisa existir no banco
  senha: 'senha123'
},
      empresas: [], // lista de empresas carregadas da API
      cargos: []    // lista de cargos carregados da API
    };
  },
  async mounted() {
    await this.fetchEmpresas();
    await this.fetchCargos();
  },
  methods: {
    async fetchEmpresas() {
      try {
        const response = await api.get('/api/v1/empresas/');
        this.empresas = response.data;
      } catch (error) {
        console.error('Erro ao carregar empresas', error);
      }
    },
    async fetchCargos() {
      try {
        const response = await api.get('/api/v1/cargos/');
        this.cargos = response.data;
      } catch (error) {
        console.error('Erro ao carregar cargos', error);
      }
    },
    async createEmployee() {
  try {
    const payload = {
      nome: this.usuarios.nome,
      email: this.usuarios.email,
      empresa_id: Number(this.usuarios.empresa_id),
      cargo_id: Number(this.usuarios.cargo_id),
      senha: this.usuarios.senha || "senha123" // pode fixar uma senha só pra teste
    };

    await api.post('/api/v1/usuarios', payload);
    alert('Funcionário criado com sucesso!');
    this.$router.push('/usuario/list');
  } catch (error) {
    console.error(error.response?.data || error.message);
    if (error.response && error.response.status === 401) {
      alert('Erro de autenticação. Por favor, faça login novamente.');
      this.$router.push('/login');
    } else {
      alert('Erro ao criar funcionário.');
    }
  }
    }
    }
};
</script>
