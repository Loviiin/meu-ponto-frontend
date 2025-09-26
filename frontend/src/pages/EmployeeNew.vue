<template>
  <div class="card">
    <div class="card-body">
      <h2 class="card-title">Novo Funcionário</h2>
      <p class="card-text">Preencha os dados do novo funcionário:</p>
      <form @submit.prevent="createEmployee">
        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Nome:</label>
          <input v-model="usuarios.nome" required class="vTextField" style="width: 100%;" />
        </div>

        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Email:</label>
          <input type="email" v-model="usuarios.email" required class="vTextField" style="width: 100%;" />
        </div>

        <div class="d-flex mb-3">
          <label class="col-sm-3 text-left">Senha:</label>
          <input type="password" v-model="usuarios.senha" required class="vTextField" style="width: 100%;" />
        </div>

          <div class="d-flex mb-3">
            <label class="col-sm-3 text-left">Empresa:</label>
            <select v-model="usuarios.empresa_id" class="form-control" required>
              <option value="" disabled>Selecione uma empresa</option>
              <option v-for="empresa in empresas" :key="empresa.ID" :value="empresa.ID">
                {{ empresa.Nome }}
              </option>
            </select>
          </div>

          <div class="d-flex mb-3">
            <label class="col-sm-3 text-left">Cargo:</label>
            <select v-model="usuarios.cargo_id" class="form-control" required>
              <option value="" disabled>Selecione um cargo</option>
              <option v-for="cargo in cargos" :key="cargo.ID" :value="cargo.ID">
                {{ cargo.Nome }}
              </option>
            </select>
          </div>


        <input class="btn btn-success form-control" style="margin: 10px;" type="submit" value="Salvar" />
        <input class="btn btn-primary form-control" style="margin: 10px;" type="submit" value="Salvar e adicionar outro(a)" name="saveAndAddAnother" />
        <input class="btn btn-primary form-control" style="margin: 10px;" type="submit" value="Salvar e continuar editando" name="saveAndContinue" />
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
        nome: '',
        email: '',
        empresa_id: '',
        cargo_id: '',
        senha: ''
      },
      empresas: [],
      cargos: [],
      cargoUsuarioLogado: localStorage.getItem('cargo') || 'colaborador',
      userId: localStorage.getItem('userId') || null
    };
  },
  async mounted() {
    await this.fetchEmpresas();
    await this.fetchCargos();
  },
  methods: {
    async fetchEmpresas() {
      try {
        if (this.cargoUsuarioLogado === 'admin') {
          // 👑 Admin Nexora → todas empresas
          const response = await api.get('/api/v1/empresas/');
          this.empresas = response.data;
        } else {
          // Dono ou Gerente → apenas empresas vinculadas ao usuário
          const response = await api.get(`/api/v1/usuarios/${this.userId}/empresas`);
          this.empresas = response.data;
        }
      } catch (error) {
        console.error('Erro ao carregar empresas', error);
      }
    },
    async fetchCargos() {
      try {
        if (this.cargoUsuarioLogado === 'admin') {
          // 👑 Admin → todos cargos
          const response = await api.get('/api/v1/cargos/');
          this.cargos = response.data;
        } else {
          // Dono/Gerente → apenas cargos da(s) empresa(s) dele
          const response = await api.get(`/api/v1/usuarios/${this.userId}/cargos`);
          this.cargos = response.data;
        }
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
          senha: this.usuarios.senha
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
