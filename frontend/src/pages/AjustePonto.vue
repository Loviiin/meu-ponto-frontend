<template>
  <div class="card mt-4">
    <div class="card-body">
      <h3>🛠 Ajuste de Ponto</h3>
      <p class="text-muted">Selecione o ponto que deseja justificar/ajustar.</p>

      <!-- Selecionar data -->
      <div class="d-flex align-items-center gap-2 mb-3">
        <input 
          type="date" 
          v-model="dataSelecionadaStr" 
          class="form-control w-auto"
          @change="fetchPontos" 
        />
        <button class="btn btn-dark" @click="resetarHoje">Hoje</button>
      </div>

      <!-- Lista de pontos -->
      <div class="table-wrapper">
  <table class="table table-dark table-hover text-center align-middle">
    <thead>
      <tr>
        <th>#</th>
        <th>Hora</th>
        <th>Método</th>
        <th>Ação</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(ponto, index) in pontos" :key="ponto.id">
        <td>{{ index + 1 }}</td>
        <td>{{ formatarHora(ponto.timestamp) }}</td>
        <td>{{ ponto.metodo }}</td>
        <td>
          <button class="btn btn-warning btn-sm" @click="selecionarPonto(ponto)">
            Justificar
          </button>
        </td>
      </tr>
      <tr v-if="pontos.length === 0">
        <td colspan="4">Nenhum ponto registrado nesse dia.</td>
      </tr>
    </tbody>
  </table>
</div>


      <!-- Formulário de justificativa -->
      <div v-if="pontoSelecionado" class="mt-4">
        <h5>📄 Justificar ponto das {{ formatarHora(pontoSelecionado.timestamp) }}</h5>
        <form @submit.prevent="enviarJustificativa">
          <div class="mb-3">
            <label class="form-label">Novo horário</label>
            <input 
              type="time" 
              v-model="form.novoHorario" 
              class="form-control" 
              required 
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Motivo</label>
            <select v-model="form.motivo" class="form-select" required>
              <option value="">Selecione...</option>
              <option value="esqueci">Esqueci de bater ponto</option>
              <option value="erro">Erro no sistema</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Observações</label>
            <textarea 
              v-model="form.observacao" 
              class="form-control" 
              rows="3" 
              placeholder="Descreva o motivo do ajuste..."
            ></textarea>
          </div>

          <button type="submit" class="btn btn-success">Enviar Justificativa</button>
          <button type="button" class="btn btn-secondary ms-2" @click="cancelarJustificativa">
            Cancelar
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../axios";

export default {
  name: "AjustePonto",
  data() {
    return {
      pontos: [],
      dataSelecionada: new Date(),
      pontoSelecionado: null,
      form: {
        novoHorario: "",
        motivo: "",
        observacao: ""
      }
    };
  },
  computed: {
    dataSelecionadaStr: {
      get() {
        return this.dataSelecionada.toISOString().split("T")[0];
      },
      set(val) {
        this.dataSelecionada = new Date(val);
      }
    }
  },
  mounted() {
    this.fetchPontos();
  },
  methods: {
    async fetchPontos() {
      try {
        const dia = this.dataSelecionadaStr;
        const response = await api.get(`/api/v1/pontos/meus-registros`, {
          params: { dia }
        });
        this.pontos = response.data || [];
      } catch (error) {
        console.error("Erro ao carregar pontos:", error.response?.data || error);
        this.pontos = [];
      }
    },
    resetarHoje() {
      this.dataSelecionada = new Date();
      this.fetchPontos();
    },
    selecionarPonto(ponto) {
      this.pontoSelecionado = ponto;
      this.form = {
        novoHorario: this.formatarHora(ponto.timestamp),
        motivo: "",
        observacao: ""
      };
    },
    cancelarJustificativa() {
      this.pontoSelecionado = null;
      this.form = { novoHorario: "", motivo: "", observacao: "" };
    },
    async enviarJustificativa() {
      try {
        const payload = {
          ponto_id: this.pontoSelecionado.id,
          novo_horario: this.form.novoHorario,
          motivo: this.form.motivo,
          observacao: this.form.observacao
        };

        await api.post("/api/v1/justificativas", payload);

        alert("Justificativa enviada com sucesso!");
        this.cancelarJustificativa();
        this.fetchPontos();
      } catch (error) {
        console.error("Erro ao enviar justificativa:", error.response?.data || error);
        alert("Erro ao enviar justificativa.");
      }
    },
    formatarHora(datetime) {
      const d = new Date(datetime);
      return d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }
  }
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

/* deixa a tabela ocupar toda a largura */
.table {
  width: 100%;
  min-width: 800px; /* evita ficar espremida */
  table-layout: auto;
}

/* cabeçalho fixo e destacado */
.table thead {
  background: rgba(255, 255, 255, 0.1);
  font-weight: bold;
}

/* células mais espaçosas */
.table td, 
.table th {
  padding: 14px;
  vertical-align: middle;
}

/* para evitar que fique colada na borda do card */
.table-wrapper {
  overflow-x: auto;
}
</style>

