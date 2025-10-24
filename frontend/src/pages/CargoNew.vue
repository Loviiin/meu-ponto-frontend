<template>
  <div class="cargo-new-container">
    <div class="card shadow">
      <div class="card-header bg-primary text-white">
        <h3 class="mb-0">
          <i class="bi bi-plus-circle me-2"></i>
          Novo Cargo
        </h3>
      </div>
      
      <div class="card-body">
        <p class="text-muted mb-4">
          <i class="bi bi-info-circle me-1"></i>
          Preencha as informações para cadastrar um novo cargo no sistema
        </p>

        <form @submit.prevent="createCargo">
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
              placeholder="Ex: Desenvolvedor Frontend, Analista de QA..."
              required
              maxlength="100"
              @blur="validateField('nome')"
            />
            <div v-if="errors.nome" class="invalid-feedback">
              {{ errors.nome }}
            </div>
            <small class="form-text text-muted">
              Nome que identificará o cargo no sistema
            </small>
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
              placeholder="Descreva as responsabilidades, requisitos e detalhes importantes deste cargo..."
              maxlength="500"
              @blur="validateField('descricao')"
            ></textarea>
            <div class="form-text">
              {{ cargo.descricao ? cargo.descricao.length : 0 }}/500 caracteres
            </div>
            <div v-if="errors.descricao" class="invalid-feedback">
              {{ errors.descricao }}
            </div>
          </div>

          <hr class="my-4" />

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
              class="btn btn-primary"
              :disabled="submitting || !isFormValid"
            >
              <span v-if="submitting">
                <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Criando...
              </span>
              <span v-else>
                <i class="bi bi-check-circle me-1"></i>
                Criar Cargo
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
  name: 'CargoNew',
  data() {
    return {
      cargo: {
        nome: '',
        descricao: ''
      },
      submitting: false,
      errors: {}
    }
  },
  computed: {
    isFormValid() {
      return (
        this.cargo.nome.trim().length >= 3 && 
        Object.keys(this.errors).length === 0
      )
    }
  },
  methods: {
    validateField(fieldName) {
      if (fieldName === 'nome') {
        if (!this.cargo.nome.trim()) {
          this.errors.nome = 'O nome do cargo é obrigatório'
        } else if (this.cargo.nome.trim().length < 3) {
          this.errors.nome = 'O nome deve ter pelo menos 3 caracteres'
        } else if (this.cargo.nome.trim().length > 100) {
          this.errors.nome = 'O nome deve ter no máximo 100 caracteres'
        } else {
          delete this.errors.nome
        }
      }
      
      if (fieldName === 'descricao') {
        if (this.cargo.descricao && this.cargo.descricao.length > 500) {
          this.errors.descricao = 'A descrição deve ter no máximo 500 caracteres'
        } else {
          delete this.errors.descricao
        }
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

    async createCargo() {
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

        const response = await api.post('/cargos', payload)
        
        // Sucesso: 201 Created ou 200 OK
        toast.success('Cargo criado com sucesso!')
        
        // Redireciona para a lista de cargos
        this.$router.push('/cargo/list')
      } catch (error) {
        console.error('Erro ao criar cargo:', error)
        
        if (error.response?.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
          this.$router.push('/login')
        } else if (error.response?.status === 400) {
          // 400 Bad Request - erro de validação
          const errorMsg = error.response?.data?.error || 'Dados inválidos. Verifique os campos.'
          toast.error(errorMsg)
        } else if (error.response?.status === 500) {
          // 500 Internal Server Error
          const errorMsg = error.response?.data?.error || 'Erro interno do servidor ao criar cargo'
          toast.error(errorMsg)
        } else {
          // Outros erros
          const errorMsg = error.response?.data?.error || 'Erro ao criar cargo'
          toast.error(errorMsg)
        }
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.cargo-new-container {
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
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

@media (max-width: 768px) {
  .cargo-new-container {
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

