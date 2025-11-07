<template>
  <div>
  <div class="container-fluid py-3">
      <div class="content-narrow mx-auto">
        <h1 class="mb-4 text-center">Meu Banco de Horas</h1>

        <!-- Resumo + Gráfico: responsivo -->
        <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <div class="card glass-card shadow-lg h-100">
            <div class="card-body text-center">
              <h5 class="card-title mb-3">Saldo Total Acumulado</h5>
              <div class="d-flex justify-content-center align-items-center mb-2">
                <i class="bi bi-clock-history me-2" style="font-size: 2rem;"></i>
                <span :class="saldoTotalClass" style="font-size: 2.5rem; font-weight: bold; color: #d4af37; text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);">
                  {{ formatarMinutosParaHoras(saldoAtualFiltrado) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="card glass-card h-100">
            <div class="card-body">
              <h5 class="card-title mb-3"><i class="bi bi-bar-chart-line me-2"></i>Evolução do Saldo Diário</h5>
              <apexchart type="bar" width="100%" height="300" :options="chartOptions" :series="chartSeries" />
            </div>
          </div>
        </div>
        </div>

        <!-- Histórico de Lançamentos em Card (melhor tipografia e responsividade) -->
        <div class="mt-5">
          <div class="card glass-card shadow-sm">
            <div class="card-header">
              <h2 class="h4 mb-0 d-flex align-items-center">
                <i class="bi bi-journal-check me-2"></i>
                Histórico de Lançamentos
              </h2>
            </div>
            <div class="card-body">
            <!-- Estados de carregamento/erro -->
            <div v-if="loading" class="alert alert-secondary d-flex align-items-center" role="alert">
              <i class="bi bi-arrow-repeat me-2"></i> Carregando dados...
            </div>
            <div v-else-if="error" :class="['alert','d-flex','align-items-center', isMock ? 'alert-warning' : 'alert-danger']" role="alert">
              <i :class="['bi', isMock ? 'bi-info-circle' : 'bi-exclamation-triangle', 'me-2']"></i>
              <span>{{ error }}</span>
            </div>

            <!-- Filtros de Período -->
            <div class="row g-2 g-md-3 align-items-end">
              <div class="col-12 col-sm-6 col-md-3">
                <label class="form-label mb-1"><i class="bi bi-calendar2 me-1"></i>Data de Início</label>
                <input type="date" v-model="dataInicio" class="form-control" />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <label class="form-label mb-1"><i class="bi bi-calendar2-week me-1"></i>Data de Fim</label>
                <input type="date" v-model="dataFim" class="form-control" />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="d-grid gap-2 d-sm-flex">
                  <button class="btn btn-primary" @click="aplicarFiltro">
                    <i class="bi bi-funnel me-1"></i>Filtrar
                  </button>
                  <button class="btn btn-outline-secondary" @click="limparFiltro">
                    <i class="bi bi-x-circle me-1"></i>Limpar
                  </button>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <label class="form-label mb-1"><i class="bi bi-diagram-3 me-1"></i>Agrupar por</label>
                <select v-model="modoAgrupamento" class="form-select">
                  <option value="semana">Semana</option>
                  <option value="mes">Mês</option>
                </select>
              </div>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-3">
              <button class="btn btn-outline-dark" @click="quickUltimos7">
                <i class="bi bi-calendar-week me-1"></i>Últimos 7 dias
              </button>
              <button class="btn btn-outline-dark" @click="quickEsteMes">
                <i class="bi bi-calendar-event me-1"></i>Este Mês
              </button>
              <button class="btn btn-outline-dark" @click="quickMesAnterior">
                <i class="bi bi-calendar2-minus me-1"></i>Mês Anterior
              </button>
              <button class="btn btn-outline-warning ms-sm-auto" @click="toggleDemo">
                <i class="bi" :class="isMock ? 'bi-toggle-on' : 'bi-toggle-off'"></i>
                <span class="ms-1">Modo demonstração</span>
              </button>
            </div>

            <hr class="my-4" />

            <div class="table-responsive">
              <table class="table table-hover align-middle table-mobile">
                <thead>
                  <tr>
                    <th><i class="bi bi-calendar-range me-1"></i>Data</th>
                    <th><i class="bi bi-calendar3-week me-1"></i>Dia da Semana</th>
                    <th><i class="bi bi-plus-slash-minus me-1"></i>Saldo do Dia</th>
                    <th><i class="bi bi-collection me-1"></i>Saldo Resultante</th>
                    <th><i class="bi bi-info-circle me-1"></i>Motivo</th>
                  </tr>
                </thead>
                <tbody v-if="!loading && grupos.length">
                  <template v-for="grupo in grupos" :key="grupo.key">
                    <tr class="table-active group-row">
                      <td :colspan="5">
                        <i class="bi bi-journal-text me-1"></i>{{ grupo.titulo }}
                      </td>
                    </tr>
                    <tr v-for="item in grupo.items" :key="item.data + '-' + item.saldo_resultante_minutos">
                      <td :data-label="'Data'">{{ formatarDataISO(item.data) }}</td>
                      <td :data-label="'Dia da Semana'">{{ new Date(item.data).toLocaleDateString('pt-BR', { weekday: 'long' }) }}</td>
                      <td :class="(item.valor_alterado_minutos >= 0 ? 'text-success' : 'text-danger')" :data-label="'Saldo do Dia'">
                        {{ formatarMinutosParaHoras(item.valor_alterado_minutos) }}
                      </td>
                      <td :data-label="'Saldo Resultante'">{{ formatarMinutosParaHoras(item.saldo_resultante_minutos) }}</td>
                      <td :data-label="'Motivo'">{{ item.motivo }}</td>
                    </tr>
                  </template>
                </tbody>
                <tbody v-else-if="!loading && !grupos.length">
                  <tr>
                    <td colspan="5" class="text-center py-4">
                      <i class="bi bi-emoji-frown me-2"></i>
                      Nenhum registro encontrado para o período selecionado.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDashboardData } from '../services/BancoHorasService';

// Estado principal
const loading = ref(true);
const error = ref(null);
const dashboardData = ref(null);
const isMock = ref(false);

// Utilitários de formatação
function formatarMinutosParaHoras(totalMinutos) {
  if (totalMinutos === null || totalMinutos === undefined) return '0h 00m';
  const sign = totalMinutos >= 0 ? '+' : '-';
  const abs = Math.abs(totalMinutos);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

function formatarDataISO(isoString) {
  // isoString: YYYY-MM-DD
  if (!isoString) return '';
  const [yyyy, mm, dd] = isoString.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

// Filtros e Agrupamento (adaptados para a nova estrutura)
const dataInicio = ref(''); // yyyy-mm-dd
const dataFim = ref('');    // yyyy-mm-dd
const aplicado = ref({ inicio: null, fim: null });
const modoAgrupamento = ref('semana'); // 'semana' | 'mes'
const route = useRoute();
const router = useRouter();

function aplicarFiltro() {
  aplicado.value.inicio = dataInicio.value ? new Date(dataInicio.value) : null;
  aplicado.value.fim = dataFim.value ? new Date(dataFim.value) : null;
  if (aplicado.value.fim) aplicado.value.fim.setHours(23, 59, 59, 999);
  // Escrever na URL
  router.replace({ query: {
    ...route.query,
    di: dataInicio.value || undefined,
    df: dataFim.value || undefined,
    grp: modoAgrupamento.value || undefined,
  }});
}
function limparFiltro() {
  dataInicio.value = '';
  dataFim.value = '';
  aplicado.value = { inicio: null, fim: null };
}
function quickUltimos7() {
  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 6);
  dataInicio.value = toInputDate(inicio);
  dataFim.value = toInputDate(hoje);
  aplicarFiltro();
}
function quickEsteMes() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  dataInicio.value = toInputDate(inicio);
  dataFim.value = toInputDate(fim);
  aplicarFiltro();
}
function quickMesAnterior() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
  dataInicio.value = toInputDate(inicio);
  dataFim.value = toInputDate(fim);
  aplicarFiltro();
}
function toInputDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday-based
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfWeek(date) {
  const s = startOfWeek(date);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

const historicoFiltrado = computed(() => {
  const items = dashboardData.value?.historico ?? [];
  const ini = aplicado.value.inicio;
  const fim = aplicado.value.fim;
  // Ordenar por data desc (ISO)
  const sorted = [...items].sort((a, b) => new Date(b.data) - new Date(a.data));
  return sorted.filter((it) => {
    const d = new Date(it.data);
    if (ini && d < ini) return false;
    if (fim && d > fim) return false;
    return true;
  });
});

const grupos = computed(() => {
  const mapa = new Map();
  for (const item of historicoFiltrado.value) {
    const d = new Date(item.data);
    let key, titulo;
    if (modoAgrupamento.value === 'mes') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      titulo = `Mês: ${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } else {
      const s = startOfWeek(d);
      const e = endOfWeek(d);
      const fmt = (x) => `${String(x.getDate()).padStart(2,'0')}/${String(x.getMonth()+1).padStart(2,'0')}/${x.getFullYear()}`;
      key = `W:${fmt(s)}-${fmt(e)}`;
      titulo = `Semana: ${fmt(s)} a ${fmt(e)}`;
    }
    if (!mapa.has(key)) mapa.set(key, { key, titulo, items: [] });
    mapa.get(key).items.push(item);
  }
  return Array.from(mapa.values());
});

// Calcular saldo atual baseado no período filtrado
const saldoAtualFiltrado = computed(() => {
  if (historicoFiltrado.value.length === 0) {
    return dashboardData.value?.saldo_total_minutos ?? 0;
  }
  // Retorna o saldo_resultante_minutos do último item (mais recente)
  const ultimoItem = historicoFiltrado.value[0];
  return ultimoItem?.saldo_resultante_minutos ?? 0;
});

// Gráfico: baseado diretamente nos minutos do histórico filtrado
const chartLabels = computed(() => historicoFiltrado.value.map(i => formatarDataISO(i.data)));
const chartData = computed(() => historicoFiltrado.value.map(i => i.valor_alterado_minutos));
const chartColors = computed(() => chartData.value.map(v => (v >= 0 ? '#198754' : '#dc3545')));
const chartSeries = computed(() => [{ name: 'Saldo do Dia (min)', data: chartData.value }]);
const chartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, foreColor: '#adb5bd' },
  plotOptions: { bar: { columnWidth: '50%', distributed: true } },
  dataLabels: { enabled: false },
  xaxis: { categories: chartLabels.value, labels: { rotate: -45 } },
  yaxis: { title: { text: 'Minutos' } },
  tooltip: { y: { formatter: (val, opts) => {
    const idx = opts.dataPointIndex;
    const date = chartLabels.value[idx];
    const sign = val >= 0 ? '+' : '-';
    const abs = Math.abs(val);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `Dia ${date}: ${sign}${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`;
  } } },
  colors: chartColors.value,
  theme: { mode: 'dark' },
}));

// Carregar dados na montagem
onMounted(async () => {
  // Ler filtros da URL
  const qi = route.query.di;
  const qf = route.query.df;
  const qg = route.query.grp;
  if (typeof qi === 'string') dataInicio.value = qi;
  if (typeof qf === 'string') dataFim.value = qf;
  if (qg === 'semana' || qg === 'mes') modoAgrupamento.value = qg;
  aplicarFiltro();

  try {
    // Carregar dados completos do banco de horas com filtros opcionais
    const resp = await getDashboardData(dataInicio.value, dataFim.value);
    console.log('Dados do banco de horas:', resp);
    
    // Estrutura esperada do backend conforme documentação:
    // {
    //   saldo_total_minutos: number,
    //   historico: array de { data, valor_alterado_minutos, saldo_resultante_minutos, motivo }
    // }
    dashboardData.value = {
      saldo_total_minutos: resp.saldo_total_minutos || 0,
      historico: resp.historico || [],
    };
    
  } catch (e) {
    console.error('Erro ao carregar banco de horas:', e);
    // Fallback de mock para demonstrar a funcionalidade quando o backend não estiver disponível
    isMock.value = true;
    error.value = 'Não foi possível carregar do servidor. Exibindo dados de demonstração.';
    dashboardData.value = {
      saldo_total_minutos: 755,
      historico: [
        { data: '2025-10-14', valor_alterado_minutos: 45, saldo_resultante_minutos: 755, motivo: 'Fechamento automático do dia 2025-10-14' },
        { data: '2025-10-13', valor_alterado_minutos: -15, saldo_resultante_minutos: 710, motivo: 'Ajuste manual pelo RH' },
        { data: '2025-10-12', valor_alterado_minutos: 0, saldo_resultante_minutos: 725, motivo: 'Sem lançamentos' },
        { data: '2025-10-11', valor_alterado_minutos: 120, saldo_resultante_minutos: 725, motivo: 'Horas extras' },
      ],
    };
    // Ajustar filtros para cobrir o intervalo inteiro do mock
    const datas = dashboardData.value.historico.map(h => new Date(h.data));
    const min = new Date(Math.min(...datas));
    const max = new Date(Math.max(...datas));
    dataInicio.value = toInputDate(min);
    dataFim.value = toInputDate(max);
    aplicarFiltro();
  } finally {
    loading.value = false;
  }
});

// Classes e derivados do saldo total
const saldoTotalClass = computed(() => ( (saldoAtualFiltrado.value ?? 0) >= 0 ? 'text-success' : 'text-danger'));

// Alternar modo demonstração
async function toggleDemo() {
  if (!isMock.value) {
    // Ativar mock
    isMock.value = true;
    error.value = 'Modo demonstração ativado.';
    dashboardData.value = {
      saldo_total_minutos: 755,
      historico: [
        { data: '2025-10-14', valor_alterado_minutos: 45, saldo_resultante_minutos: 755, motivo: 'Fechamento automático do dia 2025-10-14' },
        { data: '2025-10-13', valor_alterado_minutos: -15, saldo_resultante_minutos: 710, motivo: 'Ajuste manual pelo RH' },
        { data: '2025-10-12', valor_alterado_minutos: 0, saldo_resultante_minutos: 725, motivo: 'Sem lançamentos' },
        { data: '2025-10-11', valor_alterado_minutos: 120, saldo_resultante_minutos: 725, motivo: 'Horas extras' },
      ],
    };
    const datas = dashboardData.value.historico.map(h => new Date(h.data));
    const min = new Date(Math.min(...datas));
    const max = new Date(Math.max(...datas));
    dataInicio.value = toInputDate(min);
    dataFim.value = toInputDate(max);
    aplicarFiltro();
  } else {
    // Desativar mock e tentar recarregar da API
    loading.value = true;
    isMock.value = false;
    error.value = null;
    try {
      const resp = await getDashboardData(dataInicio.value, dataFim.value);
      
      dashboardData.value = {
        saldo_total_minutos: resp.saldo_total_minutos || 0,
        historico: resp.historico || [],
      };
    } catch (e) {
      console.error(e);
      isMock.value = true;
      error.value = 'Não foi possível carregar do servidor. Permanecendo em modo demonstração.';
    } finally {
      loading.value = false;
    }
  }
}
</script>

<style scoped>
/* Dark theme + glassmorphism to match Home */
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.92);
}

.glass-card .card-header {
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.95);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

/* Gradient title echoing Home */
h1 {
  font-weight: 800;
  background: linear-gradient(90deg, #d4af37, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
}

/* Largura máxima confortável no desktop */
.content-narrow {
  max-width: 1200px;
  padding-left: 12px;
  padding-right: 12px;
  color: rgba(255, 255, 255, 0.9);
}

/* Desktop: melhorar legibilidade da tabela */
@media (min-width: 577px) {
  .table-mobile.table {
    font-size: 0.975rem;
  }
  .table-mobile thead th {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }
  .table-mobile td, .table-mobile th {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}

/* Botões outline escuros ficam claros sobre fundo escuro */
.glass-card .btn-outline-dark {
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.5);
}
.glass-card .btn-outline-dark:hover,
.glass-card .btn-outline-dark:focus {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.7);
}

/* Alertas com melhor contraste no tema escuro */
.glass-card .alert {
  background: rgba(0, 0, 0, 0.35);
  /* Ensure Bootstrap table uses transparent background inside glass card */
  --bs-table-bg: transparent;
  --bs-table-color: rgba(255, 255, 255, 0.9);
  --bs-table-border-color: rgba(255, 255, 255, 0.15);
  background-color: transparent !important;
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.9);
}

/* Table contrast inside glass card */
.glass-card .table {
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
}
.glass-card .table thead th {

/* Stronger background reset for all table cells and sections */
.glass-card .table > :not(caption) > * > * {
  background-color: transparent !important;
  box-shadow: none !important;
}
.glass-card .table thead,
.glass-card .table tbody,
.glass-card .table tfoot,
.glass-card .table tr,
.glass-card .table td,
.glass-card .table th {
  background-color: transparent !important;
}

/* Hover and active states adapted to dark glass */
.glass-card .table-hover > tbody > tr:hover > * {
  background-color: rgba(255, 255, 255, 0.06) !important;
}
.glass-card .table .table-active > * {
  background-color: rgba(255, 255, 255, 0.06) !important;
}
  color: rgba(255, 255, 255, 0.85);
    background: transparent;
}
.glass-card .table tbody td {
  color: rgba(255, 255, 255, 0.92);
    background: transparent;
  
}
.glass-card .table .group-row {
  background-color: rgba(255, 255, 255, 0.06);
    background: transparent;
}

/* Responsive table styles moved to global src/style.css (.table-mobile) */

/* Mobile refinements for BancoHoras */
@media (max-width: 576px) {
  h1 { font-size: 1.6rem; }
  .row.g-3 > [class^='col-'] {
    margin-bottom: 0.5rem;
  }
  .card-body {
    padding: 0.75rem;
  }
  .d-flex.flex-wrap.gap-2.mt-3 {
    gap: 0.5rem !important;
  }
  .table-mobile tbody tr td {
    padding: 0.6rem 0.75rem;
    color: white;
  }
}

/* Light Mode Styles */
body.light-mode .glass-card {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(105, 96, 0, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: #333333;
}

body.light-mode .glass-card .card-header {
  background: rgba(255, 215, 0, 0.15);
  border-bottom-color: rgba(105, 96, 0, 0.15);
  color: #333333;
}

body.light-mode h1 {
  background: linear-gradient(90deg, #696000, #333333);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

body.light-mode .content-narrow {
  color: #333333;
}

body.light-mode .card-title {
  color: #333333;
}

body.light-mode .table-mobile thead th {
  color: #333333;
}

body.light-mode .glass-card .btn-outline-dark {
  color: #696000;
  border-color: rgba(105, 96, 0, 0.5);
}

body.light-mode .glass-card .btn-outline-dark:hover,
body.light-mode .glass-card .btn-outline-dark:focus {
  color: #333333;
  background-color: rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
}

body.light-mode .glass-card .alert {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(105, 96, 0, 0.2);
  color: #333333;
  --bs-table-color: #333333;
  --bs-table-border-color: rgba(105, 96, 0, 0.15);
}

body.light-mode .glass-card .table {
  color: #333333;
}

body.light-mode .glass-card .table thead th {
  color: #333333;
}

body.light-mode .glass-card .table tbody td {
  color: #333333;
}

body.light-mode .glass-card .table-hover > tbody > tr:hover > * {
  background-color: rgba(255, 215, 0, 0.1) !important;
}

body.light-mode .glass-card .table .table-active > * {
  background-color: rgba(255, 215, 0, 0.1) !important;
}

body.light-mode .glass-card .table .group-row {
  background-color: rgba(255, 215, 0, 0.08);
}

@media (max-width: 576px) {
  body.light-mode .table-mobile tbody tr td {
    color: #333333;
  }
}
</style>
