<template>
  <div class="banco-horas-page">
    <div class="container-fluid py-3 py-lg-4">
      <div class="content-narrow mx-auto">
        <header class="page-header text-center mb-4">
          <h1 class="mb-2">Meu Banco de Horas</h1>
          <p class="page-subtitle mb-0">Resumo do saldo, evolução recente e histórico detalhado.</p>
        </header>

        <div class="row g-3 mb-4">
          <div class="col-12 col-lg-5">
            <div class="card glass-card shadow-lg h-100">
              <div class="card-body">
                <div class="stat-card-label mb-2">Saldo Total Acumulado</div>
                <div class="d-flex align-items-center gap-3">
                  <div class="stat-icon">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <div>
                    <div :class="['stat-value', saldoTotalClass]">
                      {{ formatarMinutosParaHoras(saldoAtualFiltrado) }}
                    </div>
                    <div class="stat-hint">Saldo resultante do período selecionado</div>
                  </div>
                </div>
                <div class="mt-3 d-flex flex-wrap gap-2">
                  <span class="status-pill">
                    <i class="bi bi-journal-text me-1"></i>
                    {{ totalRegistrosFiltrados }} lançamentos
                  </span>
                  <span class="status-pill">
                    <i class="bi bi-diagram-3 me-1"></i>
                    Agrupado por {{ modoAgrupamento === 'mes' ? 'mês' : 'semana' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-7">
            <div class="card glass-card h-100">
              <div class="card-body chart-card-body">
                <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <h5 class="card-title mb-1"><i class="bi bi-bar-chart-line me-2"></i>Evolução do Saldo</h5>
                    <div class="card-description">Últimos {{ chartHistorico.length }} registros do período selecionado.</div>
                  </div>
                </div>
                <div class="chart-wrap">
                  <apexchart type="area" height="280" :options="chartOptions" :series="chartSeries" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card glass-card shadow-sm">
          <div class="card-header">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h2 class="h4 mb-0 d-flex align-items-center">
                <i class="bi bi-journal-check me-2"></i>
                Histórico de Lançamentos
              </h2>
              <div class="text-muted small">
                {{ formatarPeriodoAtual() }}
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loading" class="alert alert-secondary d-flex align-items-center" role="alert">
              <i class="bi bi-arrow-repeat me-2"></i>
              Carregando dados...
            </div>

            <div v-else-if="error" :class="['alert', 'd-flex', 'align-items-center', isMock ? 'alert-warning' : 'alert-danger']" role="alert">
              <i :class="['bi', isMock ? 'bi-info-circle' : 'bi-exclamation-triangle', 'me-2']"></i>
              <span>{{ error }}</span>
            </div>

            <div class="row g-2 g-md-3 align-items-end">
              <div class="col-12 col-sm-6 col-md-3">
                <label class="form-label mb-1"><i class="bi bi-calendar2 me-1"></i>Data de Início</label>
                <input v-model="dataInicio" type="date" class="form-control" />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <label class="form-label mb-1"><i class="bi bi-calendar2-week me-1"></i>Data de Fim</label>
                <input v-model="dataFim" type="date" class="form-control" />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <label class="form-label mb-1"><i class="bi bi-diagram-3 me-1"></i>Agrupar por</label>
                <select v-model="modoAgrupamento" class="form-select">
                  <option value="semana">Semana</option>
                  <option value="mes">Mês</option>
                </select>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="d-grid gap-2 d-sm-flex justify-content-sm-end">
                  <button class="btn btn-primary" @click="aplicarFiltro">
                    <i class="bi bi-funnel me-1"></i>Filtrar
                  </button>
                  <button class="btn btn-outline-secondary" @click="limparFiltro">
                    <i class="bi bi-x-circle me-1"></i>Limpar
                  </button>
                </div>
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

            <div class="table-responsive table-scroll">
              <table class="table table-hover align-middle table-mobile banco-horas-table mb-0">
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
                    <tr class="group-row">
                      <td :colspan="5">
                        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                          <span><i class="bi bi-journal-text me-1"></i>{{ grupo.titulo }}</span>
                          <span class="group-count">{{ grupo.items.length }} registro(s)</span>
                        </div>
                      </td>
                    </tr>
                    <tr v-for="item in grupo.items" :key="`${item.data}-${item.saldo_resultante_minutos}-${item.motivo}`">
                      <td :data-label="'Data'">{{ formatarDataISO(item.data) }}</td>
                      <td :data-label="'Dia da Semana'">{{ formatarDiaSemana(item.data) }}</td>
                      <td :class="item.valor_alterado_minutos >= 0 ? 'text-success' : 'text-danger'" :data-label="'Saldo do Dia'">
                        {{ formatarMinutosParaHoras(item.valor_alterado_minutos) }}
                      </td>
                      <td :data-label="'Saldo Resultante'">{{ formatarMinutosParaHoras(item.saldo_resultante_minutos) }}</td>
                      <td class="motivo-cell" :data-label="'Motivo'">{{ item.motivo }}</td>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDashboardData } from '../services/BancoHorasService';

const loading = ref(true);
const error = ref(null);
const dashboardData = ref(null);
const isMock = ref(false);

const dataInicio = ref('');
const dataFim = ref('');
const aplicado = ref({ inicio: null, fim: null });
const modoAgrupamento = ref('semana');
const route = useRoute();
const router = useRouter();

function parseLocalDate(isoString) {
  if (!isoString) return null;
  const partes = String(isoString).split('-').map(Number);
  if (partes.length !== 3 || partes.some(Number.isNaN)) return null;
  return new Date(partes[0], partes[1] - 1, partes[2]);
}

function formatarMinutosParaHoras(totalMinutos) {
  if (totalMinutos === null || totalMinutos === undefined) return '+00h 00m';
  const sign = totalMinutos >= 0 ? '+' : '-';
  const abs = Math.abs(totalMinutos);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

function formatarDataISO(isoString) {
  const data = parseLocalDate(isoString);
  if (!data) return '';
  return data.toLocaleDateString('pt-BR');
}

function formatarDiaSemana(isoString) {
  const data = parseLocalDate(isoString);
  if (!data) return '';
  return data.toLocaleDateString('pt-BR', { weekday: 'long' });
}

function toInputDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatarPeriodoAtual() {
  const inicio = dataInicio.value ? formatarDataISO(dataInicio.value) : 'início aberto';
  const fim = dataFim.value ? formatarDataISO(dataFim.value) : 'fim aberto';
  return `${inicio} a ${fim}`;
}

function aplicarFiltro() {
  aplicado.value.inicio = dataInicio.value ? parseLocalDate(dataInicio.value) : null;
  aplicado.value.fim = dataFim.value ? parseLocalDate(dataFim.value) : null;

  if (aplicado.value.fim) {
    aplicado.value.fim.setHours(23, 59, 59, 999);
  }

  router.replace({
    query: {
      ...route.query,
      di: dataInicio.value || undefined,
      df: dataFim.value || undefined,
      grp: modoAgrupamento.value || undefined,
    },
  });
}

function limparFiltro() {
  dataInicio.value = '';
  dataFim.value = '';
  aplicado.value = { inicio: null, fim: null };
  aplicarFiltro();
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

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
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

function formatarDataResumo(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

const historicoFiltrado = computed(() => {
  const items = dashboardData.value?.historico ?? [];
  const ini = aplicado.value.inicio;
  const fim = aplicado.value.fim;

  return [...items]
    .sort((a, b) => {
      const dataB = parseLocalDate(b.data);
      const dataA = parseLocalDate(a.data);
      return (dataB?.getTime() ?? 0) - (dataA?.getTime() ?? 0);
    })
    .filter((it) => {
      const d = parseLocalDate(it.data);
      if (!d) return false;
      if (ini && d < ini) return false;
      if (fim && d > fim) return false;
      return true;
    });
});

const historicoOrdenadoAsc = computed(() => [...historicoFiltrado.value].reverse());

const grupos = computed(() => {
  const mapa = new Map();

  for (const item of historicoFiltrado.value) {
    const d = parseLocalDate(item.data);
    if (!d) continue;

    let key;
    let titulo;

    if (modoAgrupamento.value === 'mes') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      titulo = `Mês: ${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } else {
      const s = startOfWeek(d);
      const e = endOfWeek(d);
      key = `W:${formatarDataResumo(s)}-${formatarDataResumo(e)}`;
      titulo = `Semana: ${formatarDataResumo(s)} a ${formatarDataResumo(e)}`;
    }

    if (!mapa.has(key)) {
      mapa.set(key, { key, titulo, items: [] });
    }

    mapa.get(key).items.push(item);
  }

  return Array.from(mapa.values()).map((grupo) => ({
    ...grupo,
    items: [...grupo.items].sort((a, b) => {
      const dataB = parseLocalDate(b.data);
      const dataA = parseLocalDate(a.data);
      return (dataB?.getTime() ?? 0) - (dataA?.getTime() ?? 0);
    }),
  }));
});

const totalRegistrosFiltrados = computed(() => historicoFiltrado.value.length);

const saldoAtualFiltrado = computed(() => {
  if (!historicoFiltrado.value.length) {
    return dashboardData.value?.saldo_total_minutos ?? 0;
  }

  const ultimoItem = historicoFiltrado.value[0];
  return ultimoItem?.saldo_resultante_minutos ?? 0;
});

const chartHistorico = computed(() => historicoOrdenadoAsc.value.slice(-30));
const chartLabels = computed(() => chartHistorico.value.map((item) => formatarDataISO(item.data)));
const chartSeries = computed(() => [{ name: 'Saldo resultante', data: chartHistorico.value.map((item) => item.saldo_resultante_minutos ?? 0) }]);

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    foreColor: '#adb5bd',
    animations: { enabled: true },
  },
  theme: { mode: 'dark' },
  colors: ['#d4af37'],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.3,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(255, 255, 255, 0.12)', strokeDashArray: 4 },
  markers: { size: 4, strokeWidth: 0, hover: { size: 6 } },
  xaxis: {
    categories: chartLabels.value,
    labels: {
      rotate: -45,
      hideOverlappingLabels: true,
      trim: true,
      style: { colors: '#ced4da', fontSize: '11px' },
    },
    axisBorder: { color: 'rgba(255, 255, 255, 0.18)' },
    axisTicks: { color: 'rgba(255, 255, 255, 0.18)' },
  },
  yaxis: {
    title: { text: 'Minutos' },
    labels: {
      formatter: (value) => `${Math.round(value)}`,
    },
  },
  tooltip: {
    y: {
      formatter: (val, opts) => {
        const idx = opts.dataPointIndex;
        const date = chartLabels.value[idx];
        return `${date}: ${formatarMinutosParaHoras(val)}`;
      },
    },
  },
  noData: {
    text: 'Sem dados para o gráfico',
  },
}));

const saldoTotalClass = computed(() => ((saldoAtualFiltrado.value ?? 0) >= 0 ? 'text-success' : 'text-danger'));

function setMockData(message) {
  isMock.value = true;
  error.value = message;
  dashboardData.value = {
    saldo_total_minutos: 755,
    historico: [
      { data: '2025-10-14', valor_alterado_minutos: 45, saldo_resultante_minutos: 755, motivo: 'Fechamento automático do dia 2025-10-14' },
      { data: '2025-10-13', valor_alterado_minutos: -15, saldo_resultante_minutos: 710, motivo: 'Ajuste manual pelo RH' },
      { data: '2025-10-12', valor_alterado_minutos: 0, saldo_resultante_minutos: 725, motivo: 'Sem lançamentos' },
      { data: '2025-10-11', valor_alterado_minutos: 120, saldo_resultante_minutos: 725, motivo: 'Horas extras' },
    ],
  };

  const datas = dashboardData.value.historico.map((h) => parseLocalDate(h.data)).filter(Boolean);
  if (datas.length) {
    const min = new Date(Math.min(...datas.map((d) => d.getTime())));
    const max = new Date(Math.max(...datas.map((d) => d.getTime())));
    dataInicio.value = toInputDate(min);
    dataFim.value = toInputDate(max);
    aplicarFiltro();
  }
}

async function carregarDados() {
  try {
    const resp = await getDashboardData(dataInicio.value, dataFim.value);
    dashboardData.value = {
      saldo_total_minutos: resp.saldo_total_minutos || 0,
      historico: resp.historico || [],
    };
  } catch (e) {
    console.error('Erro ao carregar banco de horas:', e);
    setMockData('Não foi possível carregar do servidor. Exibindo dados de demonstração.');
  }
}

onMounted(async () => {
  const qi = route.query.di;
  const qf = route.query.df;
  const qg = route.query.grp;

  if (typeof qi === 'string') dataInicio.value = qi;
  if (typeof qf === 'string') dataFim.value = qf;
  if (qg === 'semana' || qg === 'mes') modoAgrupamento.value = qg;

  aplicarFiltro();

  await carregarDados();
  loading.value = false;
});

async function toggleDemo() {
  if (!isMock.value) {
    setMockData('Modo demonstração ativado.');
    return;
  }

  loading.value = true;
  isMock.value = false;
  error.value = null;

  try {
    await carregarDados();
  } catch (e) {
    console.error(e);
    setMockData('Não foi possível carregar do servidor. Permanecendo em modo demonstração.');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.banco-horas-page {
  min-height: 100%;
}

.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.92);
}

.glass-card .card-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.96);
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}

.content-narrow {
  max-width: 1240px;
  padding-left: 12px;
  padding-right: 12px;
}

.page-header h1 {
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(90deg, #d4af37, #fff2b5);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
}

.stat-card-label {
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  font-weight: 700;
}

.stat-icon {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f3d36b;
  font-size: 1.35rem;
}

.stat-value {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1;
}

.stat-hint {
  margin-top: 0.3rem;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.92rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.88rem;
}

.chart-card-body {
  padding-bottom: 1rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
}

.card-description {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.92rem;
}

.chart-wrap {
  min-height: 280px;
}

.table-scroll {
  max-height: 68vh;
  overflow: auto;
  border-radius: 14px;
}

.banco-horas-table {
  min-width: 880px;
}

.glass-card .table {
  color: rgba(255, 255, 255, 0.92);
  background: transparent;
}

.glass-card .table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgba(18, 20, 28, 0.96);
  color: rgba(255, 255, 255, 0.9);
  border-bottom-color: rgba(255, 255, 255, 0.14);
}

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

.glass-card .table-hover > tbody > tr:hover > * {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.glass-card .table td,
.glass-card .table th {
  border-color: rgba(255, 255, 255, 0.09);
}

.group-row td {
  background: rgba(255, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.96);
  font-weight: 700;
}

.group-count {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.74);
}

.motivo-cell {
  max-width: 340px;
  white-space: normal;
  line-height: 1.35;
}

.glass-card .alert {
  background: rgba(0, 0, 0, 0.28);
  border-color: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
}

.glass-card .btn-outline-dark {
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.36);
}

.glass-card .btn-outline-dark:hover,
.glass-card .btn-outline-dark:focus {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.65);
}

.glass-card .form-control,
.glass-card .form-select {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.95);
}

.glass-card .form-control:focus,
.glass-card .form-select:focus {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(212, 175, 55, 0.6);
  box-shadow: 0 0 0 0.2rem rgba(212, 175, 55, 0.15);
}

.glass-card .form-control::placeholder {
  color: rgba(255, 255, 255, 0.55);
}

@media (max-width: 576px) {
  .page-header h1 {
    font-size: 1.8rem;
  }

  .chart-wrap {
    min-height: 240px;
  }

  .card-body {
    padding: 0.9rem;
  }

  .d-flex.flex-wrap.gap-2.mt-3 {
    gap: 0.5rem !important;
  }
}

body.light-mode .glass-card {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(105, 96, 0, 0.12);
  color: #2f2f2f;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
}

body.light-mode .glass-card .card-header {
  background: rgba(255, 215, 0, 0.12);
  border-bottom-color: rgba(105, 96, 0, 0.12);
  color: #2f2f2f;
}

body.light-mode .page-subtitle,
body.light-mode .stat-card-label,
body.light-mode .stat-hint,
body.light-mode .card-description,
body.light-mode .status-pill,
body.light-mode .group-count {
  color: #4d4d4d;
}

body.light-mode .page-header h1 {
  background: linear-gradient(90deg, #6f5f00, #2f2f2f);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

body.light-mode .stat-icon {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(255, 255, 255, 0.9));
  color: #7a6700;
  border-color: rgba(105, 96, 0, 0.12);
}

body.light-mode .status-pill {
  background: rgba(105, 96, 0, 0.06);
  border-color: rgba(105, 96, 0, 0.12);
}

body.light-mode .glass-card .table thead th {
  background: rgba(255, 255, 255, 0.98);
  color: #2f2f2f;
}

body.light-mode .glass-card .table,
body.light-mode .glass-card .table td,
body.light-mode .glass-card .table th,
body.light-mode .glass-card .form-control,
body.light-mode .glass-card .form-select {
  color: #2f2f2f;
}

body.light-mode .glass-card .form-control,
body.light-mode .glass-card .form-select {
  background-color: rgba(255, 255, 255, 0.96);
  border-color: rgba(105, 96, 0, 0.16);
}

body.light-mode .glass-card .form-control::placeholder {
  color: #7c7c7c;
}

body.light-mode .glass-card .alert {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(105, 96, 0, 0.16);
  color: #2f2f2f;
}

body.light-mode .glass-card .btn-outline-dark {
  color: #5f5300;
  border-color: rgba(105, 96, 0, 0.4);
}

body.light-mode .glass-card .btn-outline-dark:hover,
body.light-mode .glass-card .btn-outline-dark:focus {
  color: #2f2f2f;
  background-color: rgba(255, 215, 0, 0.18);
  border-color: rgba(105, 96, 0, 0.5);
}

body.light-mode .glass-card .table-hover > tbody > tr:hover > * {
  background-color: rgba(255, 215, 0, 0.08) !important;
}

body.light-mode .group-row td {
  background: rgba(255, 215, 0, 0.08) !important;
}
</style>
