<template>
  <div class="employee-list-page">
    <div class="glass-card">
      <div class="card-header">
        <h2 class="h4 mb-0 d-flex align-items-center justify-content-between">
          <span>
            <i class="bi bi-people-fill me-2"></i>
            Funcionários
          </span>
          <div class="d-flex gap-2 align-items-center">
            <!-- Toggle para mostrar saldo de banco de horas (apenas se tiver permissão) -->
            <button 
              v-if="hasPerm('VER_SALDO_FUNCIONARIOS')"
              class="btn btn-toggle" 
              @click="toggleMostrarSaldo" 
              :class="{ 'active': mostrarSaldo }"
              :disabled="loading"
              title="Mostrar/Ocultar Banco de Horas"
            >
              <i class="bi" :class="mostrarSaldo ? 'bi-eye-fill' : 'bi-eye-slash-fill'"></i>
              <span class="ms-2 d-none d-md-inline">Banco de Horas</span>
            </button>
            <button 
              v-if="hasPerm('EDITAR_USUARIO')"
              class="btn btn-new" 
              @click="$router.push('/usuario/new')" 
              :disabled="loading"
            >
              <i class="bi bi-person-plus-fill me-2"></i>
              Novo Funcionário
            </button>
          </div>
        </h2>
      </div>

      <div class="card-body">
        <!-- Loading Indicator -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p class="mt-3">Carregando funcionários...</p>
        </div>

        <!-- Error Message -->
        <div v-else-if="error" class="error-state">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <p>{{ error }}</p>
          <button class="btn btn-retry" @click="fetchUsuarios">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Tentar Novamente
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="usuarios.length === 0" class="empty-state">
          <i class="bi bi-people"></i>
          <h4>Nenhum funcionário cadastrado</h4>
          <p>Comece adicionando o primeiro funcionário ao sistema.</p>
          <button class="btn btn-primary" @click="$router.push('/usuario/new')">
            <i class="bi bi-person-plus-fill me-2"></i>
            Cadastrar Primeiro Funcionário
          </button>
        </div>

        <!-- Table -->
        <div v-else class="table-container">
          <div class="table-scroll">
            <table class="employee-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Cargo</th>
                  <th v-if="mostrarSaldo && hasPerm('VER_SALDO_FUNCIONARIOS')">Banco de Horas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usuario in usuarios" :key="usuario.id">
                  <td data-label="ID">
                    <span class="badge-id">{{ usuario.id }}</span>
                  </td>
                  <td data-label="Nome">
                    <div class="user-info">
                      <i class="bi bi-person-circle me-2"></i>
                      <strong>{{ usuario.nome }}</strong>
                    </div>
                  </td>
                  <td data-label="Email">
                    <span class="text-email">{{ usuario.email }}</span>
                  </td>
                  <td data-label="Cargo">
                    <span class="badge-cargo">
                      {{ getCargo(usuario) }}
                    </span>
                  </td>
                  <td v-if="mostrarSaldo && hasPerm('VER_SALDO_FUNCIONARIOS')" data-label="Banco de Horas">
                    <span class="badge-hours" :class="getSaldoBancoHorasClass(usuario)">
                      {{ getSaldoBancoHoras(usuario) }}
                    </span>
                  </td>
                  <td data-label="Ações">
                    <div class="action-buttons">
                      <button 
                        v-if="hasPerm('VISUALIZAR_PONTO_FUNCIONARIOS')"
                        class="btn-action btn-view" 
                        title="Visualizar" 
                        @click="viewUsuario(usuario.id)"
                      >
                        <i class="bi bi-eye-fill"></i>
                      </button>
                      <button 
                        v-if="hasPerm('EDITAR_USUARIO')"
                        class="btn-action btn-edit" 
                        title="Editar" 
                        @click="editUsuario(usuario.id)"
                      >
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button 
                        v-if="hasPerm('VISUALIZAR_PONTO_FUNCIONARIOS')"
                        class="btn-action btn-report" 
                        title="Relatório" 
                        @click="viewReport(usuario.id)"
                      >
                        <i class="bi bi-file-earmark-text-fill"></i>
                      </button>
                      <button 
                        v-if="hasPerm('DELETAR_USUARIO')"
                        class="btn-action btn-delete" 
                        title="Excluir" 
                        @click="deleteUsuario(usuario.id)"
                      >
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../axios'
import { toast } from '../toast.js'
import { getUserPermissions, hasPerm as hasPermission } from '../utils/permissions'

export default {
  name: 'EmployeeList',
  data() {
    return {
      usuarios: [],
      loading: false,
      error: null,
      mostrarSaldo: true, // Toggle para mostrar/ocultar banco de horas
      saldosBancoHoras: {} // Mapa: { userId: saldoMinutos }
    }
  },
  computed: {
    userPermissions() {
      return getUserPermissions()
    }
  },
  async mounted() {
    // Verificar se tem permissão básica para estar aqui
    if (!this.hasPerm('EDITAR_USUARIO')) {
      toast.error('❌ Você não tem permissão para visualizar esta página')
      this.$router.push('/home')
      return
    }
    
    // Carregar preferência do localStorage
    const preferencia = localStorage.getItem('mostrarSaldoBancoHoras')
    if (preferencia !== null) {
      this.mostrarSaldo = preferencia === 'true'
    }
    
    // Só mostrar saldo se tiver permissão
    if (!this.hasPerm('VER_SALDO_FUNCIONARIOS')) {
      this.mostrarSaldo = false
    }
    
    await this.fetchUsuarios()
  },
  methods: {
    hasPerm(permission) {
      return hasPermission(this.userPermissions, permission)
    },
    async fetchUsuarios() {
      this.loading = true
      this.error = null
      try {
        // ✅ Só busca saldos se o toggle estiver ativo E tiver permissão
        const params = {}
        if (this.mostrarSaldo && this.hasPerm('VER_SALDO_FUNCIONARIOS')) {
          params.include_saldo = true
        }
        
        const res = await api.get('/usuarios', { params })
        console.log('Resposta da API /usuarios:', res.data)
        
        // A API retorna um objeto com paginação: { usuarios: [...], total, page, ... }
        const usuariosArray = res.data.usuarios || res.data || []
        
        // Normalizar dados da API
        this.usuarios = usuariosArray.map(u => {
          console.log('Processando usuário:', u)
          return {
            id: u.id || u.ID,
            nome: u.nome || u.Nome || 'Sem nome',
            email: u.email || u.Email || 'Sem email',
            cpf: u.cpf || u.CPF,
            // ✅ Saldo vem direto do endpoint (se include_saldo=true)
            saldo_banco_horas_minutos: u.saldo_banco_horas_minutos ?? u.SaldoBancoHorasMinutos ?? 0,
            // Estrutura nova do backend
            cargo: u.cargo || null,
            banco_horas_saldo: u.banco_horas_saldo || 'PT0H',
            // Estrutura antiga (fallback)
            cargo_id: u.cargo_id || u.CargoId,
            empresa_id: u.empresa_id || u.EmpresaId,
            created_at: u.created_at || u.CreatedAt || u.data_criacao,
            updated_at: u.updated_at || u.UpdatedAt || u.data_atualizacao,
            contrato: u.contrato
          }
        })
        console.log('Usuários processados:', this.usuarios)
        console.log('Total de usuários:', res.data.total)
        
        // ✅ Popular o mapa de saldos direto da resposta (se tiver)
        if (this.mostrarSaldo) {
          this.saldosBancoHoras = this.usuarios.reduce((map, u) => {
            if (u.saldo_banco_horas_minutos !== undefined) {
              map[u.id] = u.saldo_banco_horas_minutos
            }
            return map
          }, {})
          console.log('Saldos extraídos da resposta:', this.saldosBancoHoras)
        }
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
      if (!this.hasPerm('DELETAR_USUARIO')) {
        toast.error('❌ Você não tem permissão para excluir funcionários')
        return
      }
      
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
    },
    getCargo(usuario) {
      // Primeira prioridade: dados novos do backend (cargo.nome)
      if (usuario.cargo?.nome) {
        return usuario.cargo.nome
      }
      // Segunda prioridade: estrutura contrato.cargo.nome (compatibilidade)
      if (usuario.contrato?.cargo?.nome) {
        return usuario.contrato.cargo.nome
      }
      // Terceira prioridade: mapa de cargos (compatibilidade)
      if (usuario.cargo_id && this.cargos[usuario.cargo_id]) {
        return this.cargos[usuario.cargo_id]
      }
      // Fallback
      if (usuario.cargo_id) {
        return `Cargo #${usuario.cargo_id}`
      }
      return 'Sem cargo'
    },
    formatarDuracaoISO8601(duracao) {
      /**
       * Converte duração ISO 8601 para formato legível em português
       * Exemplos: "PT8H30M" -> "+8h 30min", "-PT1H15M" -> "-1h 15min"
       * @param {string} duracao - Duração em formato ISO 8601
       * @returns {string} - Duração formatada
       */
      if (!duracao || typeof duracao !== 'string') {
        return '0h 0min'
      }

      // Detectar se é negativo
      const isNegative = duracao.startsWith('-')
      const cleanDuration = duracao.replace('-', '')

      // Regex para extrair valores ISO 8601: PT[nH][nM][nS]
      const regex = /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/
      const match = cleanDuration.match(regex)

      if (!match) {
        console.warn('Formato ISO 8601 inválido:', duracao)
        return '0h 0min'
      }

      const horas = parseInt(match[5] || 0)
      const minutos = parseInt(match[6] || 0)
      const segundos = parseInt(parseFloat(match[7] || 0))

      // Converter segundos para minutos
      let totalMinutos = minutos + Math.round(segundos / 60)

      // Se houver mais de 60 minutos, converter para horas
      const horasAdicionais = Math.floor(totalMinutos / 60)
      const minutosRestantes = totalMinutos % 60

      const horasTotal = horas + horasAdicionais
      const sign = isNegative ? '-' : '+'

      return `${sign}${horasTotal}h ${minutosRestantes}min`
    },
    formatMinutes(minutes) {
      if (!minutes && minutes !== 0) return '0h 0min'
      const absMinutes = Math.abs(minutes)
      const hours = Math.floor(absMinutes / 60)
      const mins = absMinutes % 60
      const sign = minutes < 0 ? '-' : '+'
      return `${sign}${hours}h ${mins}min`
    },
    getSaldoBancoHoras(usuario) {
      // Busca o saldo do mapa (populado direto da resposta da API)
      const saldo = this.saldosBancoHoras[usuario.id]
      if (saldo !== undefined && saldo !== null) {
        return this.formatMinutes(saldo)
      }
      
      // Fallback: tenta usar dados direto do usuário
      if (usuario.saldo_banco_horas_minutos !== undefined) {
        return this.formatMinutes(usuario.saldo_banco_horas_minutos)
      }
      if (usuario.banco_horas_saldo) {
        return this.formatarDuracaoISO8601(usuario.banco_horas_saldo)
      }
      
      return '0h 0min'
    },
    getSaldoBancoHorasClass(usuario) {
      const saldo = this.saldosBancoHoras[usuario.id]
      if (saldo !== undefined && saldo !== null) {
        if (saldo > 0) return 'positive'
        if (saldo < 0) return 'negative'
        return 'neutral'
      }
      // Fallback
      if (usuario.banco_horas_saldo) {
        return this.hoursClassISO(usuario.banco_horas_saldo)
      }
      if (usuario.saldo_banco_horas_minutos !== undefined) {
        return this.hoursClass(usuario.saldo_banco_horas_minutos)
      }
      return 'neutral'
    },
    hoursClass(minutes) {
      if (!minutes) return 'neutral'
      return minutes > 0 ? 'positive' : 'negative'
    },
    hoursClassISO(duracao) {
      /**
       * Retorna a classe CSS baseada no sinal da duração ISO 8601
       * @param {string} duracao - Duração em formato ISO 8601
       * @returns {string} - 'positive', 'negative' ou 'neutral'
       */
      if (!duracao || typeof duracao !== 'string') {
        return 'neutral'
      }
      
      return duracao.startsWith('-') ? 'negative' : 'positive'
    },
    viewUsuario(id) {
      if (!id) {
        toast.error('ID do usuário inválido.')
        console.error('Tentativa de visualizar usuário sem ID:', id)
        return
      }
      this.$router.push(`/usuario/${id}`)
    },
    editUsuario(id) {
      if (!id) {
        toast.error('ID do usuário inválido.')
        console.error('Tentativa de editar usuário sem ID:', id)
        return
      }
      this.$router.push(`/funcionarios/${id}/editar`)
    },
    viewReport(id) {
      if (!id) {
        toast.error('ID do usuário inválido.')
        console.error('Tentativa de visualizar relatório sem ID:', id)
        return
      }
      this.$router.push(`/ponto/relatorios/usuario/${id}`)
    },
    toggleMostrarSaldo() {
      this.mostrarSaldo = !this.mostrarSaldo
      // Salva a preferência no localStorage
      localStorage.setItem('mostrarSaldoBancoHoras', this.mostrarSaldo)
      // Recarrega os dados se ativou o saldo (para buscar do backend)
      if (this.mostrarSaldo && Object.keys(this.saldosBancoHoras).length === 0) {
        this.fetchUsuarios()
      }
    }
  }
}
</script>

<style scoped>
.employee-list-page {
  min-height: 100vh;
  padding: 20px;
  color: white;
}

.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.92);
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding: 20px 30px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.card-header h2 {
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.5rem;
  font-weight: 600;
}

.btn-new {
  background: rgba(105, 96, 0, 0.9);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-new:hover:not(:disabled) {
  background: rgba(105, 96, 0, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(105, 96, 0, 0.4);
}

.btn-new:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Toggle Button */
.btn-toggle {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-toggle:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-toggle.active {
  background: rgba(105, 96, 0, 0.3);
  color: #d4af37;
  border-color: rgba(105, 96, 0, 0.5);
}

.btn-toggle.active:hover:not(:disabled) {
  background: rgba(105, 96, 0, 0.4);
  border-color: rgba(105, 96, 0, 0.6);
}

.btn-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-body {
  padding: 30px;
  min-height: 400px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.8);
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-state i {
  font-size: 3rem;
  color: #ff6b6b;
  margin-bottom: 16px;
}

.error-state p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  font-size: 16px;
}

.btn-retry {
  background: rgba(255, 107, 107, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 107, 107, 0.5);
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-retry:hover {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.7);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state i {
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 16px;
}

.empty-state h4 {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
}

.btn-primary {
  background: rgba(105, 96, 0, 0.9);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: rgba(105, 96, 0, 1);
  transform: translateY(-2px);
}

/* Table */
.table-container {
  width: 100%;
  overflow-x: auto;
}

.table-scroll {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.employee-table thead {
  background: rgba(105, 96, 0, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.employee-table thead th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}

.employee-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}

.employee-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.08);
}

.employee-table tbody td {
  padding: 16px;
  color: rgba(255, 255, 255, 0.87);
}

/* Badges and Special Cells */
.badge-id {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info i {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
}

.text-email {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.badge-cargo {
  display: inline-block;
  background: rgba(105, 96, 0, 0.3);
  border: 1px solid rgba(105, 96, 0, 0.5);
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 13px;
}

.badge-hours {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
}

.badge-hours.positive {
  background: rgba(80, 200, 120, 0.2);
  border: 1px solid rgba(80, 200, 120, 0.5);
  color: #90ee90;
}

.badge-hours.negative {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.5);
  color: #ff9999;
}

.badge-hours.neutral {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.btn-view:hover {
  background: rgba(13, 110, 253, 0.3);
  border-color: rgba(13, 110, 253, 0.5);
}

.btn-edit:hover {
  background: rgba(255, 193, 7, 0.3);
  border-color: rgba(255, 193, 7, 0.5);
}

.btn-report:hover {
  background: rgba(25, 135, 84, 0.3);
  border-color: rgba(25, 135, 84, 0.5);
}

.btn-delete:hover {
  background: rgba(220, 53, 69, 0.3);
  border-color: rgba(220, 53, 69, 0.5);
}

/* Responsive */
@media (max-width: 1200px) {
  .employee-table {
    font-size: 13px;
  }
  
  .employee-table thead th,
  .employee-table tbody td {
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .card-header h2 {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start !important;
  }
  
  .btn-new {
    width: 100%;
  }
  
  .employee-table thead {
    display: none;
  }
  
  .employee-table tbody tr {
    display: block;
    margin-bottom: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    overflow: hidden;
  }
  
  .employee-table tbody td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .employee-table tbody td:last-child {
    border-bottom: none;
  }
  
  .employee-table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    text-transform: uppercase;
  }
  
  .action-buttons {
    justify-content: flex-end;
    width: 100%;
  }
}

/* Light Mode Styles */
body.light-mode .employee-list-page {
  color: #333333;
}

body.light-mode .glass-card {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(105, 96, 0, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: #333333;
}

body.light-mode .card-header {
  background: rgba(255, 215, 0, 0.15);
  border-bottom-color: rgba(105, 96, 0, 0.15);
}

body.light-mode .card-header h2 {
  color: #333333;
}

body.light-mode .btn-new {
  background: #FFD700;
  color: #333333;
}

body.light-mode .btn-new:hover:not(:disabled) {
  background: #E6C200;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

body.light-mode .employee-table thead th {
  color: #333333;
  border-bottom-color: rgba(105, 96, 0, 0.2);
}

body.light-mode .employee-table tbody tr {
  border-bottom-color: rgba(105, 96, 0, 0.1);
}

body.light-mode .employee-table tbody tr:hover {
  background: rgba(255, 215, 0, 0.1);
}

body.light-mode .employee-table tbody td {
  color: #333333;
}

body.light-mode .form-control,
body.light-mode .form-select {
  background: #FFFFFF;
  border-color: rgba(105, 96, 0, 0.2);
  color: #333333;
}

body.light-mode .form-control::placeholder {
  color: #888888;
}

body.light-mode .btn-toggle {
  background: rgba(255, 255, 255, 0.9);
  color: #696000;
  border-color: rgba(105, 96, 0, 0.3);
}

body.light-mode .btn-toggle:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.2);
  color: #333333;
  border-color: #FFD700;
}

body.light-mode .btn-toggle.active {
  background: linear-gradient(135deg, #FFD700, #696000);
  color: #333333;
  border-color: #FFD700;
}

body.light-mode .btn-toggle.active:hover:not(:disabled) {
  background: linear-gradient(135deg, #E6C200, #504700);
  border-color: #E6C200;
}

body.light-mode .badge-id {
  background: rgba(255, 215, 0, 0.2);
  color: #696000;
  border: 1px solid rgba(105, 96, 0, 0.3);
}

body.light-mode .user-info i {
  color: #696000;
}

body.light-mode .text-email {
  color: #666666;
}

body.light-mode .badge-cargo {
  background: rgba(255, 215, 0, 0.25);
  border-color: rgba(105, 96, 0, 0.4);
  color: #696000;
}

body.light-mode .badge-hours.positive {
  background: rgba(40, 167, 69, 0.15);
  border-color: rgba(40, 167, 69, 0.4);
  color: #28a745;
}

body.light-mode .badge-hours.negative {
  background: rgba(220, 53, 69, 0.15);
  border-color: rgba(220, 53, 69, 0.4);
  color: #dc3545;
}

body.light-mode .badge-hours.neutral {
  background: rgba(108, 117, 125, 0.15);
  border-color: rgba(108, 117, 125, 0.3);
  color: #6c757d;
}

body.light-mode .btn-action {
  background: #FFFFFF;
  border-color: rgba(105, 96, 0, 0.3);
  color: #333333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

body.light-mode .btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

body.light-mode .btn-view {
  background: #FFFFFF;
  border-color: rgba(13, 110, 253, 0.3);
  color: #0d6efd;
}

body.light-mode .btn-view:hover {
  background: rgba(13, 110, 253, 0.1);
  border-color: #0d6efd;
  color: #0d6efd;
}

body.light-mode .btn-edit {
  background: #FFFFFF;
  border-color: rgba(255, 193, 7, 0.4);
  color: #856404;
}

body.light-mode .btn-edit:hover {
  background: rgba(255, 193, 7, 0.15);
  border-color: #ffc107;
  color: #856404;
}

body.light-mode .btn-delete {
  background: #FFFFFF;
  border-color: rgba(220, 53, 69, 0.3);
  color: #dc3545;
}

body.light-mode .btn-delete:hover {
  background: rgba(220, 53, 69, 0.1);
  border-color: #dc3545;
  color: #dc3545;
}

@media (max-width: 768px) {
  body.light-mode .employee-table tbody td::before {
    color: #666666;
  }
}
</style>