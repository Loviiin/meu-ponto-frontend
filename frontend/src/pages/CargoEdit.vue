<template>
  <div class="cargo-edit-container">
    <div class="card shadow">
      <div class="card-header bg-warning text-dark">
        <h3 class="mb-0">
          <i class="bi bi-pencil-square me-2"></i>
          Editar Cargo
        </h3>
      </div>
      
      <div class="card-body">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
          <p class="mt-3 text-muted">Carregando dados do cargo...</p>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="updateCargo">
          <div class="mb-4">
            <label for="cargoId" class="form-label fw-bold">
              <i class="bi bi-hash me-1"></i>
              ID do Cargo
            </label>
            <input
              id="cargoId"
              type="text"
              class="form-control"
              :value="cargo.id"
              disabled
            />
            <small class="form-text text-muted">
              O ID não pode ser alterado
            </small>
          </div>

          <div class="mb-4">
            <label for="cargoNome" class="form-label fw-bold">
              <i class="bi bi-tag me-1"></i>
              Nome do Cargo
              <span class="text-danger">*</span>
            </label>
            <input
              id="cargoNome"
              v-model="cargo.nome"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.nome }"
              placeholder="Ex: Desenvolvedor Frontend"
              required
              maxlength="100"
            />
            <div v-if="errors.nome" class="invalid-feedback">
              {{ errors.nome }}
            </div>
          </div>

          <div class="mb-4">
            <label for="cargoDescricao" class="form-label fw-bold">
              <i class="bi bi-card-text me-1"></i>
              Descrição
            </label>
            <textarea
              id="cargoDescricao"
              v-model="cargo.descricao"
              class="form-control"
              :class="{ 'is-invalid': errors.descricao }"
              rows="5"
              placeholder="Descreva as responsabilidades e requisitos deste cargo..."
              maxlength="500"
            ></textarea>
            <div class="form-text">
              {{ cargo.descricao ? cargo.descricao.length : 0 }}/500 caracteres
            </div>
            <div v-if="errors.descricao" class="invalid-feedback">
              {{ errors.descricao }}
            </div>
          </div>

          <div class="mb-3">
            <small class="text-muted">
              <i class="bi bi-info-circle me-1"></i>
              Última atualização: {{ formatDate(cargo.updatedAt) }}
            </small>
          </div>

          <div class="d-flex gap-2 justify-content-end">
            <button
              type="button"
              class="btn btn-secondary"
              @click="$router.push('/cargo/list')"
              :disabled="submitting"
            >
              <i class="bi bi-x-circle me-1"></i>
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-warning"
              :disabled="submitting || !isFormValid"
            >
              <span v-if="submitting">
                <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Salvando...
              </span>
              <span v-else>
                <i class="bi bi-check-circle me-1"></i>
                Salvar Alterações
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../axios'
import { toast } from '../toast'

export default {
  name: 'CargoEdit',
  data() {
    return {
      cargo: {
        id: null,
        nome: '',
        descricao: '',
        createdAt: '',
        updatedAt: ''
      },
      loading: false,
      submitting: false,
      errors: {}
    }
  },
  computed: {
    isFormValid() {
      return this.cargo.nome.trim().length > 0 && Object.keys(this.errors).length === 0
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
        this.cargo = {
          id: res.data.id,
          nome: res.data.nome || '',
          descricao: res.data.descricao || '',
          createdAt: res.data.createdAt || '',
          updatedAt: res.data.updatedAt || ''
        }
      } catch (error) {
        console.error('Erro ao carregar cargo:', error)
        
        if (error.response?.status === 404) {
          // 404 Not Found
          const errorMsg = error.response?.data?.error || 'Cargo não encontrado'
          toast.error(errorMsg)
        } else if (error.response?.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
          this.$router.push('/login')
          return
        } else if (error.response?.status === 500) {
          // 500 Internal Server Error
          const errorMsg = error.response?.data?.error || 'Erro interno do servidor ao carregar cargo'
          toast.error(errorMsg)
        } else {
          const errorMsg = error.response?.data?.error || 'Erro ao carregar dados do cargo'
          toast.error(errorMsg)
        }
        
        this.$router.push('/cargo/list')
      } finally {
        this.loading = false
      }
    },
    
    validateForm() {
      this.errors = {}
      
      if (!this.cargo.nome.trim()) {
        this.errors.nome = 'O nome do cargo é obrigatório'
      } else if (this.cargo.nome.trim().length < 3) {
        this.errors.nome = 'O nome deve ter pelo menos 3 caracteres'
      } else if (this.cargo.nome.trim().length > 100) {
        this.errors.nome = 'O nome deve ter no máximo 100 caracteres'
      }
      
      if (this.cargo.descricao && this.cargo.descricao.length > 500) {
        this.errors.descricao = 'A descrição deve ter no máximo 500 caracteres'
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    async updateCargo() {
      if (!this.validateForm()) {
        toast.warn('Por favor, corrija os erros no formulário')
        return
      }
      
      this.submitting = true
      
      try {
        const payload = {
          nome: this.cargo.nome.trim(),
          descricao: this.cargo.descricao ? this.cargo.descricao.trim() : ''
        }
        
        await api.put(`/cargos/${this.cargo.id}`, payload)
        
        // Sucesso: 200 OK
        toast.success('Cargo atualizado com sucesso!')
        this.$router.push('/cargo/list')
      } catch (error) {
        console.error('Erro ao atualizar cargo:', error)
        
        if (error.response?.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
          this.$router.push('/login')
        } else if (error.response?.status === 404) {
          // 404 Not Found
          const errorMsg = error.response?.data?.error || 'Cargo não encontrado'
          toast.error(errorMsg)
          this.$router.push('/cargo/list')
        } else if (error.response?.status === 400) {
          // 400 Bad Request - erro de validação
          const errorMsg = error.response?.data?.error || 'Dados inválidos. Verifique os campos.'
          toast.error(errorMsg)
        } else if (error.response?.status === 500) {
          // 500 Internal Server Error
          const errorMsg = error.response?.data?.error || 'Erro interno do servidor ao atualizar cargo'
          toast.error(errorMsg)
        } else {
          // Outros erros
          const errorMsg = error.response?.data?.error || 'Erro ao atualizar cargo'
          toast.error(errorMsg)
        }
      } finally {
        this.submitting = false
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
.cargo-edit-container {
  max-width: 800px;
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

.form-label {
  margin-bottom: 0.5rem;
  color: var(--bs-dark);
}

.form-control:focus {
  border-color: #ffc107;
  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

@media (max-width: 768px) {
  .cargo-edit-container {
    margin: 1rem auto;
  }
  
  .card-body {
    padding: 1.5rem;
  }
  
  .d-flex.gap-2 {
    flex-direction: column;
  }
  
  .d-flex.gap-2 button {
    width: 100%;
  }
}
</style>
