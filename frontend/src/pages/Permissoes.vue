<template>
  <div class="container mt-4">
    <h2 class="mb-4">Gerenciamento de Roles e Permissões</h2>

    <!-- Criar nova role -->
    <div class="mb-4 text-end">
      <button class="btn btn-primary me-2" @click="criarRole">
        <i class="bi bi-people-fill"></i> Criar Role
      </button>
      <button class="btn btn-success" @click="criarPermissao">
        <i class="bi bi-plus-circle"></i> Criar Permissão
      </button>
    </div>

    <!-- Listagem de roles -->
    <div class="row mb-5">
      <div
        v-for="role in roles"
        :key="role.id"
        class="col-md-4 mb-3"
      >
        <div
          class="card shadow role-card"
          :class="{ 'border-primary': roleSelecionada && roleSelecionada.id === role.id }"
          @click="selecionarRole(role)"
          style="cursor: pointer;"
        >
          <div class="card-body">
            <h5 class="card-title">{{ role.nome }}</h5>
            <p class="">{{ role.descricao || 'Sem descrição' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gestão de permissões da role selecionada -->
    <div v-if="roleSelecionada" class="row">
      <h4 class="mb-3">Permissões da Role: {{ roleSelecionada.nome }}</h4>

      <!-- Permissões disponíveis -->
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-header bg-dark text-white">
            Permissões Disponíveis
          </div>
          <ul class="list-group list-group-flush" style="max-height: 400px; overflow-y: auto;">
            <li
              v-for="perm in permissoesDisponiveis"
              :key="perm.id"
              class="list-group-item"
              :class="{ 'active': selectedDisponivel === perm.id }"
              @click="selectedDisponivel = perm.id"
              style="cursor: pointer;"
            >
              {{ perm.nome }}
            </li>
            <li v-if="permissoesDisponiveis.length === 0" class="list-group-item">
              Nenhuma permissão disponível
            </li>
          </ul>
        </div>
      </div>

      <!-- Botões mover -->
      <div class="col-md-2 d-flex flex-column align-items-center justify-content-center gap-2">
        <button
          class="btn btn-outline-primary"
          :disabled="!selectedDisponivel"
          @click="atribuirPermissao"
        >
          >>
        </button>
        <button
          class="btn btn-outline-danger"
          :disabled="!selectedAtribuida"
          @click="removerPermissao"
        >
          <<
        </button>
      </div>

      <!-- Permissões atribuídas -->
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-header bg-dark text-white">
            Permissões Atribuídas
          </div>
          <ul class="list-group list-group-flush" style="max-height: 400px; overflow-y: auto;">
            <li
              v-for="perm in permissoesAtribuidas"
              :key="perm.id"
              class="list-group-item"
              :class="{ 'active': selectedAtribuida === perm.id }"
              @click="selectedAtribuida = perm.id"
              style="cursor: pointer;"
            >
              {{ perm.nome }}
            </li>
            <li v-if="permissoesAtribuidas.length === 0" class="list-group-item">
              Nenhuma permissão atribuída
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../axios'

export default {
  name: 'Permissoes',
  data() {
    return {
      roles: [],
      roleSelecionada: null,

      permissoes: [],
      permissoesAtribuidas: [],

      selectedDisponivel: null,
      selectedAtribuida: null
    }
  },
  computed: {
    permissoesDisponiveis() {
      return this.permissoes.filter(
        p => !this.permissoesAtribuidas.some(pa => pa.id === p.id)
      )
    }
  },
  async mounted() {
    await this.fetchRoles()
    await this.fetchPermissoes()
  },
  methods: {
    async fetchRoles() {
      try {
        const res = await api.get('/api/v1/roles')
        this.roles = res.data
      } catch (error) {
        console.error('Erro ao carregar roles', error)
      }
    },
    async fetchPermissoes() {
      try {
        const res = await api.get('/api/v1/permissoes')
        this.permissoes = res.data
      } catch (error) {
        console.error('Erro ao carregar permissões', error)
      }
    },
    async selecionarRole(role) {
      this.roleSelecionada = role
      await this.fetchPermissoesRole(role.id)
    },
    async fetchPermissoesRole(id) {
      try {
        const res = await api.get(`/api/v1/roles/${id}`)
        this.permissoesAtribuidas = res.data.permissoes || []
      } catch (error) {
        console.error('Erro ao carregar permissões da role', error)
      }
    },
    async atribuirPermissao() {
      if (!this.selectedDisponivel || !this.roleSelecionada) return
      try {
        await api.post(`/api/v1/roles/${this.roleSelecionada.id}/permissoes/${this.selectedDisponivel}`)
        await this.fetchPermissoesRole(this.roleSelecionada.id)
        this.selectedDisponivel = null
      } catch (error) {
        console.error('Erro ao atribuir permissão', error)
      }
    },
    async removerPermissao() {
      if (!this.selectedAtribuida || !this.roleSelecionada) return
      try {
        await api.delete(`/api/v1/roles/${this.roleSelecionada.id}/permissoes/${this.selectedAtribuida}`)
        await this.fetchPermissoesRole(this.roleSelecionada.id)
        this.selectedAtribuida = null
      } catch (error) {
        console.error('Erro ao remover permissão', error)
      }
    },
    criarPermissao() {
      this.$router.push('/permissoes/new')
    },
    criarRole() {
      this.$router.push('/roles/new')
    }
  }
}
</script>

<style scoped>
.role-card:hover {
  transform: scale(1.02);
  transition: all 0.2s ease;
  border-color: #1976d2 !important;
}
.list-group-item.active {
  background-color: rgba(33, 150, 243, 0.15);
  color: #1976d2;
  font-weight: bold;
}
</style>
