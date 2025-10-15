<template>
  <div>
    <Header />
    <div class="container-fluid mt-4">
      <div class="content-narrow mx-auto">
        <h1 class="mb-4 text-center">Meu Banco de Horas</h1>

        <!-- Resumo + Gráfico: responsivo -->
        <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <div class="card shadow-lg h-100">
            <div class="card-body text-center">
              <h5 class="card-title mb-3">Saldo Total Acumulado</h5>
              <div class="d-flex justify-content-center align-items-center mb-2">
                <i class="bi bi-clock-history me-2" style="font-size: 2rem;"></i>
                <span :class="saldoTotalClass" style="font-size: 2.5rem; font-weight: bold;">
                  {{ formatarMinutosParaHoras(dashboardData?.saldo_total_minutos ?? 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title mb-3"><i class="bi bi-bar-chart-line me-2"></i>Evolução do Saldo Diário</h5>
              <apexchart type="bar" width="100%" height="300" :options="chartOptions" :series="chartSeries" />
            </div>
          </div>
        </div>
        </div>

        <!-- Histórico de Lançamentos em Card (melhor tipografia e responsividade) -->
        <div class="mt-5">
          <div class="card shadow-sm">
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
            <div class="row g-3 align-items-end">
              <div class="col-12 col-md-3">
                <label class="form-label mb-1"><i class="bi bi-calendar2 me-1"></i>Data de Início</label>
                <input type="date" v-model="dataInicio" class="form-control" />
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label mb-1"><i class="bi bi-calendar2-week me-1"></i>Data de Fim</label>
                <input type="date" v-model="dataFim" class="form-control" />
              </div>
              <div class="col-12 col-md-3">
                <div class="d-grid gap-2 d-md-flex">
                  <button class="btn btn-primary" @click="aplicarFiltro">
                    <i class="bi bi-funnel me-1"></i>Filtrar
                  </button>
                  <button class="btn btn-outline-secondary" @click="limparFiltro">
                    <i class="bi bi-x-circle me-1"></i>Limpar
                  </button>
                </div>
              </div>
              <div class="col-12 col-md-3">
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
              <button class="btn btn-outline-warning ms-auto" @click="toggleDemo">
                <i class="bi" :class="isMock ? 'bi-toggle-on' : 'bi-toggle-off'"></i>
                <span class="ms-1">Modo demonstração</span>
              </button>
            </div>

            <hr class="my-4" />

            <div class="table-responsive">
              <table class="table table-dark table-hover align-middle table-mobile">
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from '../components/Header.vue';
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
    const resp = await getDashboardData();
    dashboardData.value = resp;
  } catch (e) {
    console.error(e);
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
const saldoTotalClass = computed(() => ( (dashboardData.value?.saldo_total_minutos ?? 0) >= 0 ? 'text-success' : 'text-danger'));

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
      const resp = await getDashboardData();
      dashboardData.value = resp;
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
.card-title {
  font-size: 1.2rem;
  font-weight: 600;
}

/* Largura máxima confortável no desktop */
.content-narrow {
  max-width: 1200px;
  padding-left: 12px;
  padding-right: 12px;
}

/* Desktop: melhorar legibilidade da tabela */
@media (min-width: 577px) {
  .table-mobile.table {
    font-size: 0.975rem;
  }
  .table-mobile thead th {
    font-weight: 600;
  }
  .table-mobile td, .table-mobile th {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}

/* Mobile-first: transformar tabela em cards em telas pequenas */
@media (max-width: 576px) {
  .table-mobile thead {
    display: none;
  }
  .table-mobile tbody tr {
    display: block;
    margin-bottom: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0.5rem;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.2);
  }
  .table-mobile tbody tr td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border: 0 !important;
  }
  .table-mobile tbody tr td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--bs-secondary-color, #adb5bd);
    margin-right: 1rem;
  }
  .table-mobile tbody tr + tr td {
    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  }
  .table-mobile .group-row {
    display: block;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
    background-color: rgba(255, 255, 255, 0.06);
  }
}
</style>
