<template>
  <div class="card mt-4">
    <div class="card-body">
      <h3>🛠 Ajuste de Ponto</h3>
      <p class="">Selecione o ponto que deseja justificar/ajustar.</p>

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
              <th>Modelo</th>
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
        <h5>    
          📄 Justificar ponto das {{ formatarHora(pontoSelecionado.timestamp) }} 
          <span class="">- {{ pontoSelecionado.metodo }}</span>
        </h5>
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
            <select v-model="form.tipo" class="form-select" required>
              <option value="">Selecione...</option>
              <option value="ENTRADA_ESQUECIDA">Saída antecipada</option>
              <option value="SAIDA_ESQUECIDA">Atraso</option>
              <option value="INTERVALO_ESQUECIDO">Esqueci de bater ponto</option>
              <option value="INTERVALO_ESQUECIDO">Problemas técnicos</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Descrição</label>
            <textarea 
              v-model="form.descricao" 
              class="form-control" 
              rows="3" 
              placeholder="Explique o motivo do ajuste..."
              required
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
        tipo: "",
        descricao: ""
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
        tipo: "",
        descricao: ""
      };
    },
    cancelarJustificativa() {
      this.pontoSelecionado = null;
      this.form = { novoHorario: "", tipo: "", descricao: "" };
    },
    async enviarJustificativa() {
      try {
        const dataISO = this.dataSelecionadaStr + "T" + this.form.novoHorario + ":00Z";

        const payload = {
          data_ocorrencia: dataISO,
          descricao: this.form.descricao,
          tipo: this.form.tipo
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
        minute: "2-digit"
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
.table {
  width: 100%;
  min-width: 800px;
  table-layout: auto;
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
.table-wrapper {
  overflow-x: auto;
}
</style>
