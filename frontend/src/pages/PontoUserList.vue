<template>
  <div class="card mt-4">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>📌 Meus Pontos</h3>
        <div class="d-flex gap-2">
          <button 
            v-if="hasPerm('CRIAR_JUSTIFICATIVA_PROPRIA')"
            class="btn btn-primary" 
            @click="abrirModalCriarJustificativa"
          >
            📋 Criar Justificativa
          </button>
          <button 
            v-if="hasPerm('CRIAR_JUSTIFICATIVA_PROPRIA')"
            class="btn btn-warning" 
            @click="ajustarPonto"
          >
            Ajuste de ponto
          </button>
        </div>
      </div>

      <!-- Configuração -->
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="form-check form-switch">
          <input 
            class="form-check-input" 
            type="checkbox" 
            v-model="usarAlmoco" 
            id="toggleAlmoco" 
          />
          <label class="form-check-label" for="toggleAlmoco">
            Usar intervalo de almoço
          </label>
        </div>
      </div>

      <!-- Resumo do dia -->
      <div class="alert alert-info mb-3">
        <p><strong>Horas trabalhadas:</strong> {{ horasTrabalhadas }}</p>
        <p><strong>Próximo ponto esperado:</strong> {{ proximoPonto }}</p>
        <p><strong>Status da jornada:</strong> {{ statusJornada }}</p>
      </div>

      <!-- Navegação -->
      <div class="d-flex justify-content-center align-items-center mb-3 gap-2 flex-wrap">
        <button 
          v-if="hasPerm('CRIAR_JUSTIFICATIVA_PROPRIA')"
          class="btn btn-success me-3" 
          @click="abrirModalPontoFaltante"
        >
          <i class="bi bi-plus-circle me-1"></i> ➕ Ponto Faltante
        </button>
        <button class="btn btn-primary me-3" @click="irParaRelatorio">
          <i class="bi bi-download me-1"></i> Exportar Relatório
        </button>
        <button class="btn btn-light" @click="alterarDia(-1)">⬅️ Dia anterior</button>
        
        <!-- Date Picker -->
        <input 
          type="date" 
          v-model="dataSelecionadaStr" 
          class="form-control w-auto"
          @change="fetchPontos" 
        />

        <button class="btn btn-light" @click="alterarDia(1)">Dia seguinte ➡️</button>
        <button class="btn btn-dark ms-2" @click="resetarHoje">Hoje</button>
      </div>

  <!-- Tabela -->
  <table class="table table-dark table-hover text-center align-middle table-mobile">
        <thead>
          <tr>
            <th>#</th>
            <th>Hora</th>
            <th>Método</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ponto, index) in pontos" :key="ponto.id">
            <td :data-label="'#'">{{ index + 1 }}</td>
            <td :data-label="'Hora'">{{ formatarHora(ponto.timestamp) }}</td>
            <td :data-label="'Método'">{{ ponto.metodo }}</td>
            <td :data-label="'Latitude'">{{ ponto.latitude }}</td>
            <td :data-label="'Longitude'">{{ ponto.longitude }}</td>
            <td :data-label="'Ações'">
              <button 
                class="btn btn-sm btn-info"
                @click="abrirModalCorrigirPonto(ponto)"
                title="Corrigir este ponto"
              >
                ✏️
              </button>
            </td>
          </tr>
          <tr v-if="pontos.length === 0">
            <td colspan="6">Nenhum ponto registrado nesse dia.</td>
          </tr>
        </tbody>
      </table>

      <!-- Modal de Justificativa -->
      <CriarJustificativaModal 
        ref="modalJustificativa"
        :ponto-selecionado="pontoSelecionado"
        @justificativa-criada="atualizarLista"
      />
    </div>
  </div>
</template>

<script>
import api from "../axios";
import CriarJustificativaModal from "../components/CriarJustificativaModal.vue";
import { getUserPermissions, hasPerm as hasPermission } from '../utils/permissions'

export default {
  name: "PontoUserList",
  components: {
    CriarJustificativaModal
  },
  data() {
    const hoje = new Date();
    // Define hora para meio-dia para evitar problemas de timezone
    hoje.setHours(12, 0, 0, 0);
    
    return {
      pontos: [],
      dataSelecionada: hoje,
      usarAlmoco: true, // toggle almoço ativado por padrão
      pontoSelecionado: null
    };
  },
  computed: {
    userPermissions() {
      return getUserPermissions()
    },
    dataSelecionadaStr: {
      get() {
        return this.dataSelecionada.toISOString().split("T")[0];
      },
      set(val) {
        this.dataSelecionada = new Date(val + "T12:00:00"); // Força meio-dia para evitar problemas de timezone
      },
    },
    horasTrabalhadas() {
      if (this.pontos.length < 2) return "0h00m";

      const inicio = new Date(this.pontos[0].timestamp);
      const fim = new Date(this.pontos[this.pontos.length - 1].timestamp);

      let diffMs = fim - inicio;
      if (diffMs <= 0) return "0h00m";

      const horas = Math.floor(diffMs / (1000 * 60 * 60));
      const minutos = Math.floor((diffMs / (1000 * 60)) % 60);

      return `${horas}h${minutos.toString().padStart(2, "0")}m`;
    },
    proximoPonto() {
      const qtd = this.pontos.length;
      const esperado = this.usarAlmoco ? 4 : 2;

      if (qtd >= esperado) return "✅ Jornada completa";

      if (qtd === 0) return "Bater entrada";
      if (qtd === 1) return this.usarAlmoco ? "Início almoço" : "Saída";
      if (qtd === 2) return this.usarAlmoco ? "Volta almoço" : "Saída";
      if (qtd === 3) return "Saída";

      return "Aguardando...";
    },
    statusJornada() {
      const qtd = this.pontos.length;
      const esperado = this.usarAlmoco ? 4 : 2;

      if (qtd === 0) return "Não iniciado";
      if (qtd < esperado) return "Em andamento";
      return "Finalizado";
    }
  },
  mounted() {
    this.fetchPontos();
  },
  methods: {
    hasPerm(permission) {
      return hasPermission(this.userPermissions, permission)
    },
    async fetchPontos() {
      try {
        const dia = this.dataSelecionadaStr;
        const response = await api.get(`/pontos/meus-registros`, {
          params: { dia }
        });

        this.pontos = response.data || [];
      } catch (error) {
        console.error("Erro ao carregar pontos:", error.response?.data || error);
        this.pontos = [];
      }
    },
    alterarDia(dias) {
      const novaData = new Date(this.dataSelecionada);
      novaData.setDate(novaData.getDate() + dias);
      this.dataSelecionada = novaData;
      this.$nextTick(() => {
        this.fetchPontos();
      });
    },
    resetarHoje() {
      this.dataSelecionada = new Date();
      this.$nextTick(() => {
        this.fetchPontos();
      });
    },
    ajustarPonto() {
      this.$router.push("/ajuste-ponto");
    },
    formatarHora(datetime) {
      return new Date(datetime).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    },
    irParaRelatorio() {
      const dia = this.dataSelecionadaStr
      this.$router.push({ name: 'RelatorioProprio', query: { dia } })
    },
    abrirModalCriarJustificativa() {
      this.pontoSelecionado = null;
      this.$refs.modalJustificativa?.abrir();
    },
    abrirModalPontoFaltante() {
      this.pontoSelecionado = null;
      // Pré-seta para PONTO_FALTANTE
      this.$refs.modalJustificativa?.abrir();
    },
    abrirModalCorrigirPonto(ponto) {
      this.pontoSelecionado = ponto;
      this.$refs.modalJustificativa?.abrir();
    },
    atualizarLista() {
      this.fetchPontos();
    }
  },
};
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  color: white;
  backdrop-filter: blur(8px);
}

.table-wrapper {
  overflow-x: auto;
}

.table thead {
  background: rgba(255, 255, 255, 0.1);
  font-weight: bold;
}

.table td,
.table th {
  padding: 14px;
  vertical-align: middle;
}
</style>
