<template>
  <div class="container mt-4">
    <h2 class="mb-4">Gerenciamento de Cargos e Permissões</h2>

    <Can perm="GERENCIAR_CARGOS" mode="hide">
      <div class="alert alert-info mb-4">
        <i class="bi bi-info-circle me-2"></i>
        <strong>Nova Interface:</strong> A gestão de permissões agora é feita diretamente em cada cargo.
        Acesse a lista de cargos e clique em um cargo para gerenciar suas permissões.
      </div>

      <div class="d-flex justify-content-center gap-3">
        <button class="btn btn-primary btn-lg" @click="$router.push('/cargo/list')">
          <i class="bi bi-briefcase-fill me-2"></i>
          Ver Lista de Cargos
        </button>
        <button class="btn btn-success btn-lg" @click="$router.push('/cargo/new')">
          <i class="bi bi-plus-circle me-2"></i>
          Criar Novo Cargo
        </button>
      </div>

      <div class="mt-5">
        <h4 class="mb-3">📋 Permissões Disponíveis no Sistema</h4>
        
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

        <!-- Loading -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>

        <!-- Lista de permissões -->
        <div v-else class="permissions-grid">
          <div 
            v-for="perm in permissoesFiltradas" 
            :key="perm.id"
            class="permission-card"
          >
            <div class="permission-info">
              <strong>{{ getPermissionLabel(perm.nome) }}</strong>
              <small class="d-block">{{ perm.descricao }}</small>
              <span class="badge mt-1">{{ getCategoryLabel(perm.nome) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Can>

    <!-- Sem permissão -->
    <div v-if="!podeGerenciarCargos" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Você não tem permissão para gerenciar cargos e permissões.
    </div>
  </div>
</template>

<script>
import Can from '../components/Can.vue'
import ProfileService from '../services/ProfileService'
import { PERMISSIONS, PERMISSION_LABELS, PERMISSION_CATEGORIES, getUserPermissions, hasPerm } from '../utils/permissions'
import { toast } from '../toast'

export default {
  name: 'Permissoes',
  components: {
    Can
  },
  data() {
    return {
      permissoes: [],
      loading: false,
      categoriaFiltro: ''
    }
  },
  computed: {
    userPermissions() {
      return getUserPermissions()
    },
    podeGerenciarCargos() {
      return hasPerm(this.userPermissions, PERMISSIONS.GERENCIAR_CARGOS)
    },
    permissoesFiltradas() {
      if (!this.categoriaFiltro) {
        return this.permissoes
      }
      const nomesCategoria = PERMISSION_CATEGORIES[this.categoriaFiltro] || []
      return this.permissoes.filter(p => nomesCategoria.includes(p.nome))
    }
  },
  async mounted() {
    if (!this.podeGerenciarCargos) {
      toast.error('❌ Você não tem permissão para acessar esta página')
      this.$router.push('/home')
      return
    }
    await this.fetchPermissoes()
  },
  methods: {
    async fetchPermissoes() {
      this.loading = true
      try {
        const data = await ProfileService.listAllPermissions()
        this.permissoes = data || []
      } catch (error) {
        console.error('Erro ao carregar permissões', error)
        toast.error('❌ Erro ao carregar permissões do sistema')
      } finally {
        this.loading = false
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
    }
  }
}
</script>

<style scoped>
.container {
  color: white;
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
  transition: all 0.2s;
}

.permission-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.permission-info {
  flex: 1;
}

.permission-info strong {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  color: white;
}

.permission-info small {
  font-size: 0.9rem;
  color: #ffd700;
  line-height: 1.5;
  font-weight: 400;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 215, 0, 0.2) !important;
  color: #ffd700 !important;
  border: 1px solid rgba(255, 215, 0, 0.3);
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

.alert {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

@media (max-width: 768px) {
  .permissions-grid {
    grid-template-columns: 1fr;
  }
}

/* Light Mode Styles */
body.light-mode .container {
  color: #333333;
}

body.light-mode .permission-card {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(105, 96, 0, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

body.light-mode .permission-card:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.4);
}

body.light-mode .permission-info strong {
  color: #333333;
}

body.light-mode .permission-info small {
  color: #696000;
}

body.light-mode .badge {
  background: rgba(255, 215, 0, 0.3) !important;
  color: #696000 !important;
  border-color: rgba(255, 215, 0, 0.5);
}

body.light-mode .form-select {
  background: #FFFFFF;
  border-color: rgba(105, 96, 0, 0.3);
  color: #333333;
}

body.light-mode .form-select:focus {
  background: #FFFFFF;
  border-color: #FFD700;
  color: #333333;
}

body.light-mode .form-select option {
  background: #FFFFFF;
  color: #333333;
}

body.light-mode .alert {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(105, 96, 0, 0.2);
  color: #333333;
}
</style>
