<template>
  <div class="card mt-4">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>📌 Meus Pontos</h3>
        <button class="btn btn-warning" @click="ajustarPonto">
          Ajuste de ponto
        </button>
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
      <div class="d-flex justify-content-center align-items-center mb-3 gap-2">
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
      <table class="table table-dark table-hover text-center align-middle">
        <thead>
          <tr>
            <th>#</th>
            <th>Hora</th>
            <th>Método</th>
            <th>Latitude</th>
            <th>Longitude</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ponto, index) in pontos" :key="ponto.id">
            <td>{{ index + 1 }}</td>
            <td>{{ formatarHora(ponto.timestamp) }}</td>
            <td>{{ ponto.metodo }}</td>
            <td>{{ ponto.latitude }}</td>
            <td>{{ ponto.longitude }}</td>
          </tr>
          <tr v-if="pontos.length === 0">
            <td colspan="5">Nenhum ponto registrado nesse dia.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from "../axios";

export default {
  name: "PontoUserList",
  data() {
    return {
      pontos: [],
      dataSelecionada: new Date(),
      usarAlmoco: true // toggle almoço ativado por padrão
    };
  },
  computed: {
    dataSelecionadaStr: {
      get() {
        return this.dataSelecionada.toISOString().split("T")[0];
      },
      set(val) {
        this.dataSelecionada = new Date(val);
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
      this.dataSelecionada.setDate(this.dataSelecionada.getDate() + dias);
      this.fetchPontos();
    },
    resetarHoje() {
      this.dataSelecionada = new Date();
      this.fetchPontos();
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
    }
  },
};
</script>

<style scoped>
.card {
  margin-left: -300px;
  width: 100%;
  min-width: 1900px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  color: white;
  backdrop-filter: blur(8px);
}

/* Wrapper para scroll horizontal em telas pequenas */
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
