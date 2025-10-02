<template>
  <div class="card">
    <div class="card-body">
      <h2 class="card-title">Atualizar Funcionário</h2>
      <p class="card-text">Preencha os dados do funcionário:</p>
      <form @submit.prevent="updateEmployee">
        <div class="d-flex mb-3">
          <label class="col-sm-2 text-left">Nome:</label>
          <input v-model="usuario.nome" required style="width: 100%;" />
        </div>
        <div class="d-flex mb-3">
          <label class="col-sm-2 text-left">Email:</label>
          <input type="email" v-model="usuario.email" required style="width: 100%;" />
        </div>
        <div class="d-flex mb-3">
          <label class="col-sm-2 text-left">Senha:</label>
          <input type="password" v-model="usuario.senha" placeholder="Deixe em branco para não alterar" style="width: 100%;" />
        </div>
        <input class="btn btn-success form-control" type="submit" value="Salvar">
      </form>
    </div>
  </div>
</template>

<script>
import api from '../axios';

export default {
  name: 'EmployeeEdit',
  data() {
    return {
      usuario: {
        nome: '',
        email: '',
        senha: ''
      }
    };
  },
  async mounted() {
    const id = this.$route.params.id;
    try {
      const res = await api.get(`/api/v1/usuarios/${id}`);
      this.usuario = {
        nome: res.data.nome,
        email: res.data.email,
        senha: '' // senha não vem do backend, só se alterar
      };
    } catch (error) {
      console.error('Erro ao carregar funcionário', error);
    }
  },
  methods: {
    async updateEmployee() {
      const id = this.$route.params.id;

      // monta payload apenas com campos permitidos
      const payload = {
        nome: this.usuario.nome,
        email: this.usuario.email
      };
      if (this.usuario.senha) {
        payload.senha = this.usuario.senha;
      }

      try {
        await api.put(`/api/v1/usuarios/${id}`, payload);
        alert('Funcionário atualizado com sucesso!');
        this.$router.push('/usuario/list');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert('Erro de autenticação. Por favor, faça login novamente.');
          this.$router.push('/login');
        } else {
          alert('Erro ao atualizar funcionário.');
        }
        console.error('Erro ao atualizar funcionário', error);
      }
    }
  }
};
</script>
