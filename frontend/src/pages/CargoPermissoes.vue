<template>
  <div class="card mt-4">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>🔑 Gerenciar Permissões do Cargo</h3>
          <p v-if="cargo" class="mb-0">Cargo: <strong>{{ cargo.nome }}</strong></p>
        </div>
        <button class="btn btn-secondary" @click="voltarParaCargo">
          ← Voltar ao Cargo
        </button>
      </div>

      <!-- Loading -->
      <div v-if="carregando" class="text-center py-4">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      </div>

      <div v-else>
        <!-- Permissões Atuais -->
        <div class="mb-4">
          <h4>✅ Permissões Atribuídas</h4>
          <div v-if="permissoesAtribuidas.length === 0" class="alert alert-info">
            Nenhuma permissão atribuída a este cargo.
          </div>
          <div v-else class="permissions-grid">
            <div 
              v-for="perm in permissoesAtribuidas" 
              :key="perm.id"
              class="permission-card assigned"
            >
              <div class="permission-info">
                <strong>{{ getPermissionLabel(perm.nome) }}</strong>
                <small class="text-muted d-block">{{ perm.descricao }}</small>
              </div>
              <button 
                class="btn btn-sm btn-danger"
                @click="removerPermissao(perm.id)"
                :disabled="processando === perm.id"
              >
                <span v-if="processando === perm.id">...</span>
                <span v-else>🗑️</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Permissões Disponíveis -->
        <div class="mb-4">
          <h4>➕ Permissões Disponíveis</h4>
          
          <!-- Filtro por categoria -->
          <div class="mb-3">
            <select v-model="categoriaFiltro" class="form-select w-auto">
              <option value="">Todas as categorias</option>
              <option value="empresa">Empresa</option>
              <option value="usuarios">Usuários</option>
              <option value="cargos">Cargos</option>
              <option value="ponto">Ponto</option>
              <option value="justificativas">Justificativas</option>
              <option value="banco_horas">Banco de Horas</option>
              <option value="localidades">Localidades</option>
              <option value="relatorios">Relatórios</option>
            </select>
          </div>

          <div v-if="permissoesDisponiveis.length === 0" class="alert alert-warning">
            Todas as permissões já foram atribuídas a este cargo.
          </div>
          <div v-else class="permissions-grid">
            <div 
              v-for="perm in permissoesDisponiveis" 
              :key="perm.id"
              class="permission-card available"
            >
              <div class="permission-info">
                <strong>{{ getPermissionLabel(perm.nome) }}</strong>
                <small class="text-muted d-block">{{ perm.descricao }}</small>
                <span class="badge bg-secondary mt-1">{{ getCategoryLabel(perm.nome) }}</span>
              </div>
              <button 
                class="btn btn-sm btn-success"
                @click="atribuirPermissao(perm.id)"
                :disabled="processando === perm.id"
              >
                <span v-if="processando === perm.id">...</span>
                <span v-else>➕</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileService from '../services/ProfileService'
import { toast } from '../toast'
import { PERMISSION_LABELS, PERMISSION_CATEGORIES } from '../utils/permissions'

export default {
  name: 'CargoPermissoes',
  data() {
    return {
      cargo: null,
      carregando: true,
      processando: null,
      todasPermissoes: [],
      permissoesAtribuidas: [],
      categoriaFiltro: ''
    }
  },
  computed: {
    permissoesDisponiveis() {
      const atribuidasIds = new Set(this.permissoesAtribuidas.map(p => p.id))
      let disponiveis = this.todasPermissoes.filter(p => !atribuidasIds.has(p.id))
      
      // Aplicar filtro de categoria
      if (this.categoriaFiltro) {
        const nomesCategoria = PERMISSION_CATEGORIES[this.categoriaFiltro] || []
        disponiveis = disponiveis.filter(p => nomesCategoria.includes(p.nome))
      }
      
      return disponiveis
    }
  },
  async mounted() {
    await this.carregarDados()
  },
  methods: {
    async carregarDados() {
      try {
        this.carregando = true
        const cargoId = this.$route.params.id

        // Carregar cargo
        const cargosRes = await this.$axios.get(`/cargos/${cargoId}`)
        this.cargo = cargosRes.data

        // Carregar todas as permissões disponíveis
        const todasRes = await ProfileService.listAllPermissions()
        this.todasPermissoes = todasRes || []

        // Carregar permissões atribuídas ao cargo
        const atribuidasRes = await ProfileService.getCargoPermissions(cargoId)
        this.permissoesAtribuidas = atribuidasRes || []

      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        const msg = error.response?.data?.error || 'Erro ao carregar permissões'
        toast.error(`❌ ${msg}`)
        
        if (error.response?.status === 403) {
          toast.error('❌ Você não tem permissão para gerenciar permissões de cargos')
          this.$router.push('/cargo/list')
        }
      } finally {
        this.carregando = false
      }
    },

    async atribuirPermissao(permissaoId) {
      try {
        this.processando = permissaoId
        const cargoId = this.$route.params.id

        await ProfileService.addPermissionToCargo(cargoId, permissaoId)
        toast.success('✅ Permissão atribuída com sucesso!')

        // Recarregar permissões
        await this.carregarDados()
      } catch (error) {
        console.error('Erro ao atribuir permissão:', error)
        const msg = error.response?.data?.error || 'Erro ao atribuir permissão'
        toast.error(`❌ ${msg}`)
      } finally {
        this.processando = null
      }
    },

    async removerPermissao(permissaoId) {
      if (!confirm('Tem certeza que deseja remover esta permissão do cargo?')) {
        return
      }

      try {
        this.processando = permissaoId
        const cargoId = this.$route.params.id

        await ProfileService.removePermissionFromCargo(cargoId, permissaoId)
        toast.success('✅ Permissão removida com sucesso!')

        // Recarregar permissões
        await this.carregarDados()
      } catch (error) {
        console.error('Erro ao remover permissão:', error)
        const msg = error.response?.data?.error || 'Erro ao remover permissão'
        toast.error(`❌ ${msg}`)
      } finally {
        this.processando = null
      }
    },

    getPermissionLabel(nome) {
      return PERMISSION_LABELS[nome] || nome
    },

    getCategoryLabel(nome) {
      for (const [categoria, nomes] of Object.entries(PERMISSION_CATEGORIES)) {
        if (nomes.includes(nome)) {
          const labels = {
            empresa: 'Empresa',
            usuarios: 'Usuários',
            cargos: 'Cargos',
            ponto: 'Ponto',
            justificativas: 'Justificativas',
            banco_horas: 'Banco de Horas',
            localidades: 'Localidades',
            relatorios: 'Relatórios'
          }
          return labels[categoria] || categoria
        }
      }
      return 'Outros'
    },

    voltarParaCargo() {
      this.$router.push(`/cargo/detail/${this.$route.params.id}`)
    }
  }
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  color: white;
  backdrop-filter: blur(8px);
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.permission-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.permission-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.permission-card.assigned {
  border-left: 3px solid rgba(40, 167, 69, 0.8);
}

.permission-card.available {
  border-left: 3px solid rgba(13, 110, 253, 0.6);
}

.permission-info {
  flex: 1;
}

.permission-info strong {
  display: block;
  margin-bottom: 0.25rem;
}

.permission-info small {
  font-size: 0.875rem;
  opacity: 0.8;
}

.form-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.form-select:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
}

.form-select option {
  background: #1a242d;
  color: white;
}

@media (max-width: 768px) {
  .permissions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
