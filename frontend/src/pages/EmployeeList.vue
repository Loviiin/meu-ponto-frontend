<template>
  <div class="table-responsive">
    <h2>Funcionários</h2>
    <button class="btn btn-primary btn-sm" style="margin-bottom: 10px;" @click="$router.push('/usuario/new')" >Novo Funcionário
      <i class="bi bi-person-add"></i>
    </button>

    <table class="table table-striped table-dark">
      <thead>
  <tr>
    <th>ID</th>
    <th>Nome</th>
    <th>Email</th>
    <th>Empresa</th>
    <th>Cargo</th>
    <th>Data de Criação</th>
    <th>Última Atualização</th>
    <th>Saldo Banco de Horas (min)</th>
    <th width="180">Ações</th>
  </tr>
</thead>
<tbody>
  <tr v-for="usuario in usuarios" :key="usuario.id">
    <td>{{ usuario.id }}</td>
    <td>{{ usuario.nome }}</td>
    <td>{{ usuario.email }}</td>
    <td>{{ usuario.empresa_id }}</td>
    <td>{{ usuario.cargo_id }}</td>
    <td>{{ usuario.data_criacao ? usuario.data_criacao.substring(0, 10) : '' }}</td>
    <td>{{ usuario.data_atualizacao ? usuario.data_atualizacao.substring(0, 10) : '' }}</td>
    <td>{{ usuario.saldo_banco_horas_minutos }}</td>
    <td class="text-nowrap">
      <div class="btn-group" role="group">
        <a class="btn btn-primary btn-sm" title="Consultar" @click="$router.push(`/usuario/${usuario.id}`)">
          <i class="bi bi-eye"></i>
        </a>
        <a @click="$router.push(`/usuario/edit/${usuario.id}`)" class="btn btn-warning btn-sm" title="Editar">
          <i class="bi bi-pencil-square"></i>
        </a>
        <a @click="deleteUsuario(usuario.id)" class="btn btn-danger btn-sm" title="Excluir">
          <i class="bi bi-trash"></i>
        </a>
        <a @click="$router.push(`/ponto/relatorios/usuario/${usuario.id}`)" class="btn btn-success btn-sm" title="Exportar Relatório">
          <i class="bi bi-file-earmark-arrow-down"></i>
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
  name: 'EmployeeList',
  data() {
    return {
      usuarios: []
    }
  },
  async mounted() {
    await this.fetchUsuarios()
  },
  methods: {
    async fetchUsuarios() {
      try {
        const res = await api.get('/usuarios')
        this.usuarios = res.data
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.$router.push('/login')
        }
      }
    },
    async deleteUsuario(id) {
      if (confirm('Tem certeza que deseja excluir este funcionário?')) {
        try {
          await api.delete(`/usuarios/${id}`)
          this.usuarios = this.usuarios.filter(u => u.id !== id)
        } catch (error) {
          console.error('Erro ao excluir funcionário', error)
        }
      }
    }
  }
}

</script>