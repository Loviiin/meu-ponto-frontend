<template>
  <div class="cargo-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3 text-muted">Carregando detalhes do cargo...</p>
    </div>

    <!-- Content -->
    <div v-else-if="cargo" class="card shadow">
      <div class="card-header bg-primary text-white">
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="mb-0">
            <i class="bi bi-briefcase-fill me-2"></i>
            Detalhes do Cargo
          </h3>
          <div class="btn-group">
            <button
              class="btn btn-sm btn-light"
              title="Editar Cargo"
              @click="$router.push(`/cargo/edit/${cargo.id}`)"
            >
              <i class="bi bi-pencil-square me-1"></i>
              Editar
            </button>
            <button
              class="btn btn-sm btn-outline-light"
              title="Voltar"
              @click="$router.push('/cargo/list')"
            >
              <i class="bi bi-arrow-left"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="card-body">
        <!-- Main Info -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="info-item">
              <label class="info-label">
                <i class="bi bi-hash me-1"></i>
                ID
              </label>
              <p class="info-value">{{ cargo.id }}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="info-item">
              <label class="info-label">
                <i class="bi bi-tag me-1"></i>
                Nome do Cargo
              </label>
              <p class="info-value">{{ cargo.nome }}</p>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="info-item">
              <label class="info-label">
                <i class="bi bi-card-text me-1"></i>
                Descrição
              </label>
              <p v-if="cargo.descricao" class="info-value description-text">
                {{ cargo.descricao }}
              </p>
              <p v-else class="info-value text-muted fst-italic">
                Nenhuma descrição cadastrada
              </p>
            </div>
          </div>
        </div>

        <hr class="my-4" />

        <!-- Metadata -->
        <div class="row">
          <div class="col-md-6">
            <div class="info-item">
              <label class="info-label">
                <i class="bi bi-calendar-plus me-1"></i>
                Data de Criação
              </label>
              <p class="info-value">
                <small>{{ formatDate(cargo.createdAt) }}</small>
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="info-item">
              <label class="info-label">
                <i class="bi bi-calendar-check me-1"></i>
                Última Atualização
              </label>
              <p class="info-value">
                <small>{{ formatDate(cargo.updatedAt) }}</small>
              </p>
            </div>
          </div>
        </div>

        <!-- Additional info if deleted -->
        <div v-if="cargo.deletedAt" class="alert alert-warning mt-4">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <strong>Atenção:</strong> Este cargo foi excluído em {{ formatDate(cargo.deletedAt) }}
        </div>
      </div>

      <!-- Action Footer -->
      <div class="card-footer bg-light">
        <div class="d-flex justify-content-between">
          <button
            class="btn btn-secondary"
            @click="$router.push('/cargo/list')"
          >
            <i class="bi bi-arrow-left me-1"></i>
            Voltar para Lista
          </button>
          <div class="btn-group">
            <button
              class="btn btn-warning"
              @click="$router.push(`/cargo/edit/${cargo.id}`)"
            >
              <i class="bi bi-pencil-square me-1"></i>
              Editar
            </button>
            <button
              class="btn btn-danger"
              @click="confirmDelete"
            >
              <i class="bi bi-trash me-1"></i>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="alert alert-danger">
      <i class="bi bi-exclamation-circle me-2"></i>
      Não foi possível carregar os detalhes do cargo
    </div>
  </div>
</template>

<script>
import api from '../axios'
import { toast } from '../toast'

export default {
  name: 'CargoDetail',
  data() {
    return {
      cargo: null,
      loading: false
    }
  },
  async mounted() {
    const id = this.$route.params.id
    if (!id) {
      toast.error('ID do cargo não informado')
      this.$router.push('/cargo/list')
      return
    }
    await this.fetchCargo(id)
  },
  methods: {
    async fetchCargo(id) {
      this.loading = true
      try {
        const res = await api.get(`/cargos/${id}`)
        this.cargo = res.data
      } catch (error) {
        console.error('Erro ao carregar cargo:', error)
        
        if (error.response?.status === 404) {
          const errorMsg = error.response?.data?.error || 'Cargo não encontrado'
          toast.error(errorMsg)
        } else if (error.response?.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
          this.$router.push('/login')
          return
        } else if (error.response?.status === 500) {
          const errorMsg = error.response?.data?.error || 'Erro interno do servidor ao carregar cargo'
          toast.error(errorMsg)
        } else {
          const errorMsg = error.response?.data?.error || 'Erro ao carregar detalhes do cargo'
          toast.error(errorMsg)
        }
        
        this.$router.push('/cargo/list')
      } finally {
        this.loading = false
      }
    },
    
    confirmDelete() {
      if (confirm(`Tem certeza que deseja excluir o cargo "${this.cargo.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
        this.deleteCargo()
      }
    },
    
    async deleteCargo() {
      try {
        await api.delete(`/cargos/${this.cargo.id}`)
        // Sucesso: 204 No Content (sem corpo na resposta)
        toast.success('Cargo excluído com sucesso!')
        this.$router.push('/cargo/list')
      } catch (error) {
        console.error('Erro ao excluir cargo:', error)
        
        if (error.response?.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
          this.$router.push('/login')
        } else if (error.response?.status === 404) {
          // 404 Not Found
          const errorMsg = error.response?.data?.error || 'Cargo não encontrado'
          toast.error(errorMsg)
          this.$router.push('/cargo/list')
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
      if (!dateString) return 'N/A'
      try {
        const date = new Date(dateString)
        return date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return 'N/A'
      }
    }
  }
}
</script>

<style scoped>
.cargo-detail-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.card {
  border: none;
  border-radius: 12px;
}

.card-header {
  border-radius: 12px 12px 0 0 !important;
  padding: 1.5rem;
}

.card-body {
  padding: 2rem;
}

.card-footer {
  border-radius: 0 0 12px 12px !important;
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.125);
}

.info-item {
  margin-bottom: 1.5rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  display: block;
}

.info-value {
  font-size: 1.1rem;
  color: var(--bs-dark);
  margin: 0;
  word-wrap: break-word;
}

.description-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

.btn-group .btn {
  padding: 0.375rem 0.75rem;
}

@media (max-width: 768px) {
  .cargo-detail-container {
    margin: 1rem auto;
  }
  
  .card-header .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .card-header .btn-group {
    width: 100%;
  }
  
  .card-header .btn-group .btn {
    flex: 1;
  }
  
  .card-body {
    padding: 1.5rem;
  }
  
  .card-footer .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .card-footer .btn,
  .card-footer .btn-group {
    width: 100%;
  }
}
</style>
