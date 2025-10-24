<template>
  <div class="cargo-list-container">
    <div class="header-section">
      <h2>
        <i class="bi bi-briefcase-fill me-2"></i>
        Gerenciamento de Cargos
      </h2>
      <button
        class="btn btn-primary"
        @click="$router.push('/cargo/new')"
      >
        <i class="bi bi-plus-circle me-1"></i>
        Novo Cargo
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3 text-muted">Carregando cargos...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && cargos.length === 0" class="empty-state">
      <i class="bi bi-inbox display-1 text-muted"></i>
      <h4 class="mt-3">Nenhum cargo cadastrado</h4>
      <p class="text-muted">Comece criando seu primeiro cargo</p>
      <button class="btn btn-primary mt-2" @click="$router.push('/cargo/new')">
        <i class="bi bi-plus-circle me-1"></i>
        Criar Primeiro Cargo
      </button>
    </div>

    <!-- Table with Data -->
    <div v-else class="table-responsive">
      <table class="table table-hover table-striped align-middle">
        <thead class="table-dark">
          <tr>
            <th style="width: 80px;">ID</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th style="width: 200px;">Data de Criação</th>
            <th style="width: 180px;" class="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cargo in cargos" :key="cargo.id">
            <td><strong>{{ cargo.id }}</strong></td>
            <td>
              <strong>{{ cargo.nome }}</strong>
            </td>
            <td>
              <span v-if="cargo.descricao" class="text-muted">
                {{ truncateText(cargo.descricao, 80) }}
              </span>
              <span v-else class="text-muted fst-italic">Sem descrição</span>
            </td>
            <td>
              <small class="text-muted">
                {{ formatDate(cargo.createdAt) }}
              </small>
            </td>
            <td class="text-center">
              <div class="btn-group" role="group">
                <button
                  class="btn btn-sm btn-outline-primary"
                  title="Visualizar Detalhes"
                  @click="$router.push(`/cargo/detail/${cargo.id}`)"
                >
                  <i class="bi bi-eye"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-warning"
                  title="Editar Cargo"
                  @click="$router.push(`/cargo/edit/${cargo.id}`)"
                >
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  title="Excluir Cargo"
                  @click="confirmDelete(cargo)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from '../axios'
import { toast } from '../toast'

export default {
  name: 'CargoList',
  data() {
    return {
      cargos: [],
      loading: false
    }
  },
  async mounted() {
    await this.fetchCargos()
  },
  methods: {
    async fetchCargos() {
      this.loading = true
      try {
        const res = await api.get('/cargos')
        // Garantir que sempre seja um array
        this.cargos = Array.isArray(res.data) ? res.data : []
      } catch (error) {
        console.error('Erro ao carregar cargos:', error)
        
        if (error.response?.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
          this.$router.push('/login')
        } else if (error.response?.status === 500) {
          // 500 Internal Server Error
          const errorMsg = error.response?.data?.error || 'Erro interno do servidor ao carregar cargos'
          toast.error(errorMsg)
        } else {
          const errorMsg = error.response?.data?.error || 'Erro ao carregar lista de cargos'
          toast.error(errorMsg)
        }
      } finally {
        this.loading = false
      }
    },
    
    confirmDelete(cargo) {
      if (confirm(`Tem certeza que deseja excluir o cargo "${cargo.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
        this.deleteCargo(cargo.id)
      }
    },
    
    async deleteCargo(id) {
      try {
        await api.delete(`/cargos/${id}`)
        // Sucesso: 204 No Content (sem corpo na resposta)
        this.cargos = this.cargos.filter(c => c.id !== id)
        toast.success('Cargo excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir cargo:', error)
        
        if (error.response?.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
          this.$router.push('/login')
        } else if (error.response?.status === 404) {
          // 404 Not Found
          const errorMsg = error.response?.data?.error || 'Cargo não encontrado'
          toast.error(errorMsg)
          // Recarregar lista para sincronizar
          await this.fetchCargos()
        } else if (error.response?.status === 500) {
          // 500 Internal Server Error (pode ser cargo em uso)
          const errorMsg = error.response?.data?.error || 'Não foi possível excluir. Verifique se o cargo está em uso.'
          toast.error(errorMsg)
        } else {
          const errorMsg = error.response?.data?.error || 'Erro ao excluir cargo'
          toast.error(errorMsg)
        }
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      } catch {
        return '-'
      }
    },
    
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }
  }
}
</script>

<style scoped>
.cargo-list-container {
  padding: 2rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-section h2 {
  margin: 0;
  color: var(--bs-dark);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--bs-light);
  border-radius: 8px;
  margin-top: 2rem;
}

.table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table thead th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(0,0,0,0.02);
}

.btn-group .btn {
  padding: 0.375rem 0.75rem;
}

@media (max-width: 768px) {
  .cargo-list-container {
    padding: 1rem;
  }
  
  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-section button {
    width: 100%;
  }
}
</style>
