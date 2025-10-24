<template>
  <div class="table-responsive">
    <h2>Funcionários</h2>
    <button class="btn btn-primary btn-sm" style="margin-bottom: 10px;" @click="$router.push('/usuario/new')" :disabled="loading">
      Novo Funcionário
      <i class="bi bi-person-add"></i>
    </button>

    <!-- Loading Indicator -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3 text-muted">Carregando funcionários...</p>
    </div>

    <!-- Error Message -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-3" @click="fetchUsuarios">
        <i class="bi bi-arrow-clockwise"></i> Tentar Novamente
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="usuarios.length === 0" class="text-center py-5">
      <i class="bi bi-people" style="font-size: 4rem; color: #6c757d;"></i>
      <h4 class="mt-3 text-muted">Nenhum funcionário cadastrado</h4>
      <p class="text-muted">Comece adicionando o primeiro funcionário ao sistema.</p>
      <button class="btn btn-primary mt-3" @click="$router.push('/usuario/new')">
        <i class="bi bi-person-plus-fill me-2"></i>
        Cadastrar Primeiro Funcionário
      </button>
    </div>

    <!-- Table -->
    <table v-else class="table table-striped table-dark table-mobile">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Email</th>
          <th>Cargo</th>
          <th>Localidade</th>
          <th>Data de Criação</th>
          <th>Última Atualização</th>
          <th>Saldo Banco de Horas (min)</th>
          <th width="180">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in usuarios" :key="usuario.id">
          <td :data-label="'ID'">{{ usuario.id }}</td>
          <td :data-label="'Nome'">{{ usuario.nome }}</td>
          <td :data-label="'Email'">{{ usuario.email }}</td>
          <td :data-label="'Cargo'">{{ usuario.contrato?.cargo?.nome || 'N/A' }}</td>
          <td :data-label="'Localidade'">{{ usuario.contrato?.localidade?.nome || 'N/A' }}</td>
          <td :data-label="'Data de Criação'">{{ formatDate(usuario.data_criacao) }}</td>
          <td :data-label="'Última Atualização'">{{ formatDate(usuario.data_atualizacao) }}</td>
          <td :data-label="'Saldo Banco de Horas (min)'">{{ usuario.saldo_banco_horas_minutos ?? 0 }}</td>
          <td class="text-nowrap" :data-label="'Ações'">
            <div class="btn-group" role="group">
              <a class="btn btn-primary btn-sm" title="Consultar" @click="$router.push(`/usuario/${usuario.id}`)">
                <i class="bi bi-eye"></i>
              </a>
              <a @click="$router.push(`/funcionarios/${usuario.id}/editar`)" class="btn btn-warning btn-sm" title="Editar">
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
import { toast } from '../toast.js'

export default {
  name: 'EmployeeList',
  data() {
    return {
      usuarios: [],
      loading: false,
      error: null
    }
  },
  async mounted() {
    await this.fetchUsuarios()
  },
  methods: {
    async fetchUsuarios() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/usuarios')
        this.usuarios = res.data
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error)
        
        if (error.response?.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
          this.$router.push('/login')
        } else if (error.response?.status === 403) {
          this.error = 'Você não tem permissão para visualizar funcionários.'
        } else if (error.response?.status >= 500) {
          this.error = 'Erro no servidor. Tente novamente mais tarde.'
        } else if (error.request) {
          this.error = 'Erro de conexão. Verifique sua internet.'
        } else {
          this.error = 'Erro ao carregar funcionários. Tente novamente.'
        }
      } finally {
        this.loading = false
      }
    },
    async deleteUsuario(id) {
      if (!confirm('Tem certeza que deseja excluir este funcionário?')) {
        return
      }

      try {
        await api.delete(`/usuarios/${id}`)
        this.usuarios = this.usuarios.filter(u => u.id !== id)
        toast.success('Funcionário excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error)
        
        const status = error.response?.status
        const data = error.response?.data
        
        if (status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
          this.$router.push('/login')
        } else if (status === 403) {
          toast.error('Você não tem permissão para excluir funcionários.')
        } else if (status === 404) {
          toast.error(data?.error || 'Funcionário não encontrado.')
          // Remover da lista local mesmo assim
          this.usuarios = this.usuarios.filter(u => u.id !== id)
        } else if (status >= 500) {
          toast.error(data?.error || 'Erro no servidor. Tente novamente mais tarde.')
        } else {
          toast.error(data?.error || 'Erro ao excluir funcionário. Tente novamente.')
        }
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR')
      } catch {
        return 'N/A'
      }
    }
  }
}
</script>