<template>
  <div class="relatorio-container">
    <div class="card shadow-lg">
      <div class="card-body">
        <h2 class="mb-3" v-if="!isAdminMode">Exportar Meu Relatório de Ponto</h2>
        <h2 class="mb-3" v-else>
          Exportar Relatório:
          <span class="text-info" v-if="nomeFuncionario && !loadingNome">{{ nomeFuncionario }}</span>
          <span v-else-if="loadingNome" class="nome-skeleton"></span>
          <span v-else class="text-muted">Funcionário #{{ usuarioId }}</span>
        </h2>

        <div class="periodo-badge mb-3" v-if="periodoFormatado">
          <i class="bi bi-calendar-range me-1"></i> {{ periodoFormatado }}
          <span v-if="diasNoIntervalo" class="ms-2">• {{ diasNoIntervalo }} dia<span v-if="diasNoIntervalo>1">s</span></span>
        </div>

        <div class="export-cta-wrapper mb-4">
          <button class="export-cta btn btn-primary" @click="handleExport" :disabled="loading || !formValido">
            <span class="cta-text" v-if="!loading"><i class="bi bi-download me-2"></i>Exportar</span>
            <span v-else class="cta-text"><span class="spinner-border spinner-border-sm me-2" role="status"></span>Gerando...</span>
          </button>
          <div class="helper-text mt-2">Use os filtros abaixo para definir o período e formato antes de exportar.</div>
        </div>

        <form @submit.prevent="handleExport" class="needs-validation form-export" novalidate>
          <div class="toggle-row mb-3">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="intervaloToggle" v-model="usarIntervalo" @change="onToggleIntervalo">
              <label class="form-check-label" for="intervaloToggle">Usar intervalo de datas</label>
            </div>
          </div>
          <div class="form-grid mb-3" :class="{ 'single-range': !usarIntervalo }">
            <div class="field">
              <label class="form-label fw-semibold">Data Início</label>
              <div class="calendar-picker">
                <input type="date" class="form-control calendar-input" v-model="dataInicioISO" @change="syncBR('inicio')" required />
                <i class="bi bi-calendar-event calendar-icon"></i>
              </div>
              <small class="text-muted">Selecione a data inicial</small>
            </div>
            <div class="field" v-if="usarIntervalo">
              <label class="form-label fw-semibold">Data Fim</label>
              <div class="calendar-picker">
                <input type="date" class="form-control calendar-input" v-model="dataFimISO" @change="syncBR('fim')" required />
                <i class="bi bi-calendar-check calendar-icon"></i>
              </div>
              <small class="text-muted">Último dia incluído</small>
            </div>
            <div class="field">
              <label class="form-label fw-semibold">Formato</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-file-earmark-text"></i></span>
                <select class="form-select" v-model="formato" required>
                  <option value="">Selecionar...</option>
                  <option value="CSV">CSV</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>
              <small class="text-muted">Escolha o tipo de arquivo</small>
            </div>
          </div>

          <transition name="fade">
            <div v-if="periodoFormatado" class="alert alert-info py-2 mb-2 periodo-resumo">
              <strong>Período:</strong> {{ periodoFormatado }}
              <span v-if="diasNoIntervalo"> ({{ diasNoIntervalo }} dia<span v-if="diasNoIntervalo>1">s</span>)</span>
            </div>
          </transition>

          <div class="quick-range mb-3">
            <div class="quick-label text-muted">Atalhos:</div>
            <div class="quick-buttons">
              <button type="button" class="btn btn-outline-light btn-sm" @click="setPeriodo('hoje')">Hoje</button>
              <button type="button" class="btn btn-outline-light btn-sm" @click="setPeriodo('ontem')">Ontem</button>
              <button type="button" class="btn btn-outline-light btn-sm" @click="setPeriodo('semana')">7 dias</button>
              <button type="button" class="btn btn-outline-light btn-sm" @click="setPeriodo('mes')">Este mês</button>
            </div>
          </div>

          <transition name="fade">
            <div v-if="erroValidacao" class="alert alert-danger py-2 mb-2">{{ erroValidacao }}</div>
          </transition>
          <transition name="fade">
            <div v-if="mensagemSucesso" class="alert alert-success py-2 mb-2">{{ mensagemSucesso }}</div>
          </transition>
          <transition name="fade">
            <div v-if="erroExportacao" class="alert alert-danger py-2 mb-2">{{ erroExportacao }}</div>
          </transition>

          <div class="actions mt-3">
            <button type="submit" class="btn btn-success" :disabled="loading || !formValido">
              <span v-if="!loading"><i class="bi bi-check2-circle me-1"></i>Exportar (Confirmar)</span>
              <span v-else><span class="spinner-border spinner-border-sm me-2" role="status"></span>Processando...</span>
            </button>
            <button type="button" class="btn btn-outline-warning" @click="limpar" :disabled="loading">Limpar</button>
            <button type="button" class="btn btn-outline-secondary" @click="voltar" :disabled="loading">Voltar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../axios'
import { exportarRelatorio } from '../services/PontoRelatorioService'

// Helpers internos
function formataBR(iso) {
  if (!iso) return ''
  const [y,m,d] = iso.split('-')
  if (!y || !m || !d) return ''
  return `${d}-${m}-${y}`
}
function converteParaISO(br) {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(br)) return null
  const [d,m,y] = br.split('-')
  const dt = new Date(`${y}-${m}-${d}T00:00:00`)
  if (isNaN(dt.getTime())) return null
  if (dt.getUTCFullYear().toString()!==y || (dt.getUTCMonth()+1).toString().padStart(2,'0')!==m || dt.getUTCDate().toString().padStart(2,'0')!==d) return null
  return `${y}-${m}-${d}`
}

export default {
  name: 'RelatorioPonto',
  data() {
    const hoje = new Date()
    const isoHoje = hoje.toISOString().slice(0,10)
    return {
      // datas internas ISO (YYYY-MM-DD)
      dataInicioISO: isoHoje,
      dataFimISO: isoHoje,
      // bindings em formato BR
  dataInicioBR: formataBR(isoHoje),
  dataFimBR: formataBR(isoHoje),
      formato: localStorage.getItem('formato_relatorio') || 'PDF',
      loading: false,
      erroValidacao: null,
      erroExportacao: null,
      mensagemSucesso: null,
      nomeFuncionario: null,
      loadingNome: false,
      usarIntervalo: true
    }
  },
  computed: {
    usuarioId() {
      return this.$route.params.id
    },
    isAdminMode() {
      return !!this.usuarioId
    },
    periodoFormatado() {
      if (!this.dataInicioISO || !this.dataFimISO) return ''
      return `${this.dataInicioBR} até ${this.dataFimBR}`
    },
    diasNoIntervalo() {
      if (!this.dataInicioISO || !this.dataFimISO) return ''
      const ini = new Date(this.dataInicioISO)
      const fim = new Date(this.dataFimISO)
      if (fim < ini) return ''
      return Math.round((fim - ini) / 86400000) + 1
    },
    formValido() {
      if (!this.dataInicioISO) return false
      if (this.usarIntervalo) {
        if (!this.dataFimISO) return false
        if (this.dataFimISO < this.dataInicioISO) return false
      } else {
        // força fim = início quando não usa intervalo
        this.dataFimISO = this.dataInicioISO
      }
      if (!this.formato) return false
      return true
    }
  },
  async mounted() {
    if (this.isAdminMode) {
      this.loadingNome = true
      await this.buscarNomeFuncionario(this.usuarioId)
      this.loadingNome = false
    }
    // Prefill via query ?dia=YYYY-MM-DD
    const diaQuery = this.$route.query.dia
    if (diaQuery && /^\d{4}-\d{2}-\d{2}$/.test(diaQuery)) {
      this.dataInicioISO = diaQuery
      this.dataFimISO = diaQuery
      this.dataInicioBR = formataBR(diaQuery)
      this.dataFimBR = formataBR(diaQuery)
      this.usarIntervalo = false
    }
  },
  methods: {
    validar() {
      this.erroValidacao = null
      if (!this.formValido) {
        this.erroValidacao = 'Preencha todos os campos.'
        return false
      }
      return true
    },
    async buscarNomeFuncionario(id) {
      try {
        const res = await api.get(`/usuarios/${id}`)
        this.nomeFuncionario = res.data.nome
      } catch (e) {
        console.warn('Não foi possível carregar o nome do funcionário.')
      }
    },
    async handleExport() {
      if (!this.validar()) return
      this.loading = true
      this.erroExportacao = null
      this.mensagemSucesso = null
      try {
        await exportarRelatorio(this.usuarioId, this.dataInicioISO, this.dataFimISO, this.formato)
        this.mensagemSucesso = 'Relatório gerado. O download deve iniciar automaticamente.'
        try { localStorage.setItem('formato_relatorio', this.formato) } catch(e) {}
      } catch (error) {
        this.erroExportacao = 'Falha ao exportar relatório.'
      } finally {
        this.loading = false
      }
    },
    onToggleIntervalo() {
      if (!this.usarIntervalo) {
        this.dataFimISO = this.dataInicioISO
        this.dataFimBR = this.dataInicioBR
      }
    },
    syncBR(tipo) {
      if (tipo === 'inicio') this.dataInicioBR = formataBR(this.dataInicioISO)
      if (tipo === 'fim') this.dataFimBR = formataBR(this.dataFimISO)
      if (!this.usarIntervalo) {
        // Se não usa intervalo, mantém fim igual ao início
        this.dataFimISO = this.dataInicioISO
        this.dataFimBR = this.dataInicioBR
      }
    },
    setPeriodo(tipo) {
      const hoje = new Date()
      let inicio = new Date(hoje)
      if (tipo === 'ontem') {
        inicio.setDate(inicio.getDate()-1)
        hoje.setDate(hoje.getDate()-1)
      } else if (tipo === 'semana') {
        inicio.setDate(inicio.getDate()-6)
      } else if (tipo === 'mes') {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      }
      this.dataInicioISO = inicio.toISOString().slice(0,10)
      this.dataFimISO = hoje.toISOString().slice(0,10)
      this.dataInicioBR = formataBR(this.dataInicioISO)
      this.dataFimBR = formataBR(this.dataFimISO)
    },
    limpar() {
      this.mensagemSucesso = null
      this.erroExportacao = null
      this.erroValidacao = null
      this.formato = 'PDF'
      const hoje = new Date().toISOString().slice(0,10)
      this.dataInicioISO = hoje
      this.dataFimISO = hoje
      this.dataInicioBR = formataBR(hoje)
      this.dataFimBR = formataBR(hoje)
    },
    voltar() {
      if (this.isAdminMode) {
        this.$router.push('/usuario/list')
      } else {
        this.$router.push('/home')
      }
    }
  }
}
</script>

<style scoped>
.relatorio-container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
}
.card {
  border-radius: 16px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
}
.form-export { position:relative; }
.form-grid { display:grid; gap:1.25rem; grid-template-columns: repeat(auto-fit,minmax(230px,1fr)); }
.form-grid .field { display:flex; flex-direction:column; }
.quick-range { display:flex; flex-wrap:wrap; align-items:center; gap:.75rem; }
.quick-range .quick-label { font-size:.85rem; }
.quick-buttons { display:flex; flex-wrap:wrap; gap:.5rem; }
.actions { display:flex; flex-wrap:wrap; gap:.75rem;justify-content:center; }
.actions .btn { min-width:170px; }
.periodo-resumo { font-size:.9rem; }
.calendar-picker .form-control { background: rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.25); }
.calendar-picker .form-control:focus { border-color:#66afe9; box-shadow:0 0 0 0.15rem rgba(102,175,233,.25); }
.input-group-text { min-width:44px; justify-content:center; }
.form-select, .form-control { height:42px; }

@media (max-width: 720px) {
  .export-cta { width:100%; }
  .actions { flex-direction:column; align-items:stretch; }
  .actions .btn { width:100%; }
  .quick-buttons { width:100%; }
}

@media (min-width: 1300px) {
  .relatorio-container { max-width: 1250px; }
}
.input-group-text { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color:#fff; }
select.form-select, .form-control { background: rgba(0,0,0,0.25); color:#fff; border:1px solid rgba(255,255,255,0.2); }
select.form-select:focus, .form-control:focus { border-color:#66afe9; box-shadow:0 0 0 0.2rem rgba(102,175,233,.3); }
.btn-primary { background: linear-gradient(90deg,#007bff,#0056b3); border:none; }
.btn-outline-secondary { border-color: rgba(255,255,255,0.3); color:#ddd; }
.btn-outline-secondary:hover { background: rgba(255,255,255,0.1); }
.btn-outline-warning { border-color:#b38600; color:#ffce3d; }
.btn-outline-warning:hover { background:#b38600; color:#000; }
.filtros-rapidos button { --bs-btn-padding-y: .25rem; --bs-btn-padding-x: .75rem; }
.fade-enter-active,.fade-leave-active { transition: opacity .3s; }
.fade-enter-from,.fade-leave-to { opacity:0; }
.export-cta-wrapper { text-align:center; }
.export-cta { font-size:1.05rem; letter-spacing:.4px; box-shadow:0 4px 18px -4px rgba(0,123,255,0.5); white-space:nowrap; }

/* Light Mode Styles */
body.light-mode .relatorio-container {
  color: #333333;
}

body.light-mode .card {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(105, 96, 0, 0.15);
  color: #333333;
}

body.light-mode .calendar-picker .form-control {
  background: #FFFFFF;
  border-color: rgba(105, 96, 0, 0.25);
  color: #333333;
}

body.light-mode .calendar-picker .form-control:focus {
  border-color: #FFD700;
  box-shadow: 0 0 0 0.15rem rgba(255, 215, 0, 0.25);
}

body.light-mode .input-group-text {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(105, 96, 0, 0.2);
  color: #333333;
}

body.light-mode select.form-select,
body.light-mode .form-control {
  background: #FFFFFF;
  color: #333333;
  border-color: rgba(105, 96, 0, 0.2);
}

body.light-mode select.form-select:focus,
body.light-mode .form-control:focus {
  border-color: #FFD700;
  box-shadow: 0 0 0 0.2rem rgba(255, 215, 0, 0.3);
}

body.light-mode .btn-outline-secondary {
  border-color: rgba(105, 96, 0, 0.3);
  color: #696000;
}

body.light-mode .btn-outline-secondary:hover {
  background: rgba(255, 215, 0, 0.2);
  color: #333333;
}

body.light-mode .btn-outline-warning {
  border-color: #FFD700;
  color: #696000;
}

body.light-mode .btn-outline-warning:hover {
  background: #FFD700;
  color: #333333;
}

body.light-mode .btn-success {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

body.light-mode .btn-success:hover {
  background: #218838;
  border-color: #1e7e34;
}

body.light-mode .btn-primary {
  background: #696000;
  border-color: #696000;
  color: white;
}

body.light-mode .btn-primary:hover {
  background: #504700;
  border-color: #504700;
}

body.light-mode .btn-outline-light {
  border-color: rgba(105, 96, 0, 0.3);
  color: #696000;
}

body.light-mode .btn-outline-light:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
  color: #333333;
}

body.light-mode .export-cta {
  background: linear-gradient(90deg, #696000, #504700);
  box-shadow: 0 4px 18px -4px rgba(105, 96, 0, 0.5);
}

body.light-mode .helper-text {
  color: #666666;
}

body.light-mode .periodo-badge {
  background: rgba(255, 215, 0, 0.2);
  color: #333333;
  border: 1px solid rgba(105, 96, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: inline-block;
}

body.light-mode .nome-skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
}

.export-cta:disabled { opacity:.7; }
.export-cta.btn-primary { background: linear-gradient(90deg,#2563eb,#1d4ed8); border:none; }
.export-cta.btn-primary:hover:not(:disabled) { background: linear-gradient(90deg,#1d4ed8,#1e40af); }
.helper-text { color:#fff !important; font-size:.8rem; opacity:.9; }
.periodo-badge { display:inline-flex; align-items:center; background:rgba(255,255,255,0.12); padding:6px 14px; border-radius:30px; font-size:.8rem; backdrop-filter:blur(4px); }
.nome-skeleton { display:inline-block; width:140px; height:1.1em; background:linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05),rgba(255,255,255,0.15)); background-size:200% 100%; animation:skeleton 1.2s infinite; border-radius:4px; }
@keyframes skeleton { 0% { background-position:0 0 } 100% { background-position:200% 0 } }
.single-range .field:nth-child(2) { display:none; }
.cta-text { display:inline-flex; align-items:center; }

@media (max-width: 540px) {
  .export-cta { width:100%; padding:14px 24px; font-size:.95rem; }
  .form-grid { grid-template-columns: 1fr; }
  .helper-text { font-size:.72rem; }
}
.calendar-picker { position:relative; }
.calendar-picker .calendar-input { padding-right:38px; }
.calendar-icon { position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none; opacity:.7; }
.calendar-picker .calendar-input::-webkit-calendar-picker-indicator { cursor:pointer; }
.calendar-picker .calendar-input:focus + .calendar-icon { opacity:1; }
</style>
