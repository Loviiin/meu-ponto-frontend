<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="sidebar bg-dark text-white p-3">
      <h5 class="mb-4">Gerenciar</h5>
      <button
        class="btn btn-primary btn-sm w-100 mb-2"
        @click="showPermissions = !showPermissions"
      >
        {{ showPermissions ? 'Ocultar' : 'Gerenciar' }} Permissões
      </button>
      <button
        class="btn btn-secondary btn-sm w-100"
        @click="$router.push('/cargo/list')"
      >
        Voltar
      </button>
    </div>

    <!-- Conteúdo principal -->
    <div class="content flex-fill d-flex justify-content-center align-items-start p-4">
      <div class="card shadow-lg w-75">
        <div class="card-body text-center">
          <h2 class="card-title mb-4">Detalhes do Cargo</h2>

          <div v-if="cargo">
            <div class="row text-start mb-3">
              <div class="col-md-6">
                <p><strong>ID:</strong> {{ cargo.id }}</p>
                <p><strong>Nome:</strong> {{ cargo.nome }}</p>
                <p><strong>Empresa:</strong> {{ cargo.empresa_id }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Carga horária diária:</strong> {{ cargo.carga_horaria_diaria_minutos }} min</p>
                <p><strong>Entrada esperada:</strong> {{ formatMinutes(cargo.entrada_esperada_minutos) }}</p>
                <p><strong>Saída esperada:</strong> {{ formatMinutes(cargo.saida_esperada_minutos) }}</p>
                <p><strong>Almoço:</strong> {{ cargo.minutos_almoco_esperado }} min</p>
              </div>
            </div>

            <h4 class="mt-4">Permissões atribuídas</h4>
            <ul class="list-group list-group-flush mb-4">
              <li
                v-for="perm in cargo.permissoes"
                :key="perm.id"
                class="list-group-item"
              >
                {{ perm.nome }}
              </li>
              <li v-if="cargo.permissoes.length === 0" class="list-group-item">
                Nenhuma permissão atribuída
              </li>
            </ul>

            <!-- Gerenciamento de permissões -->
            <div v-if="showPermissions" class="text-start mt-4">
              <h4>Adicionar Permissões</h4>
              <div v-if="permissoes.length === 0" class="">Carregando permissões...</div>
              <ul class="list-group">
                <li
                  v-for="perm in permissoes"
                  :key="perm.id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  {{ perm.nome }}
                  <button
                    class="btn btn-sm btn-success"
                    @click="assignPermission(perm.id)"
                  >
                    Atribuir
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div v-else>
            <p>Carregando cargo...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../axios'

export default {
  name: 'CargoDetail',
  data() {
    return {
      cargo: null,
      permissoes: [],
      showPermissions: false
    }
  },
  async mounted() {
    const id = this.$route.params.id
    await this.fetchCargo(id)
  },
  methods: {
    async fetchCargo(id) {
      try {
        const res = await api.get(`/cargos/${id}`)
        this.cargo = res.data
      } catch (error) {
        console.error('Erro ao carregar cargo', error)
      }
    },
    async loadPermissions() {
      try {
        const res = await api.get('/permissoes')
        this.permissoes = res.data
      } catch (error) {
        console.error('Erro ao carregar permissões', error)
      }
    },
    async assignPermission(permId) {
      try {
        await api.post(`/cargos/${this.cargo.id}/permissoes/${permId}`)
        alert('Permissão atribuída com sucesso!')
        await this.fetchCargo(this.cargo.id) // recarrega cargo
      } catch (error) {
        console.error('Erro ao atribuir permissão', error)
        alert('Erro ao atribuir permissão.')
      }
    },
    formatMinutes(minutes) {
      if (!minutes && minutes !== 0) return '-'
      const h = Math.floor(minutes / 60).toString().padStart(2, '0')
      const m = (minutes % 60).toString().padStart(2, '0')
      return `${h}:${m}`
    }
  },
  watch: {
    showPermissions(newVal) {
      if (newVal && this.permissoes.length === 0) {
        this.loadPermissions()
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
}
.card {
  border-radius: 12px;
}
</style>
