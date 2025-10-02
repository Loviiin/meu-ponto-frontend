<template>
  <div class="card mt-4">
    <div class="card-body">
      <h3>📑 Solicitações de Ajuste de Ponto</h3>
      <p class="">Gerencie as justificativas enviadas pelos colaboradores.</p>

      <!-- Lista -->
      <div class="table-wrapper">
        <table class="table table-dark table-hover text-center align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Colaborador</th>
              <th>Data Ocorrência</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(just, index) in justificativas" :key="just.id">
              <td>{{ index + 1 }}</td>
              <td>{{ just.usuario?.nome || "Usuário #" + just.usuario_id }}</td>
              <td>{{ formatarData(just.data_ocorrencia) }}</td>
              <td>{{ traduzTipo(just.tipo) }}</td>
              <td>{{ just.descricao }}</td>
              <td>
                <span :class="statusClass(just.status)">
                  {{ just.status }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn-success btn-sm me-2"
                  @click="atualizarStatus(just.id, 'APROVADO')"
                  :disabled="just.status !== 'PENDENTE'"
                >
                  ✅ Aprovar
                </button>
                <button 
                  class="btn btn-danger btn-sm"
                  @click="atualizarStatus(just.id, 'REJEITADO')"
                  :disabled="just.status !== 'PENDENTE'"
                >
                  ❌ Rejeitar
                </button>
              </td>
            </tr>
            <tr v-if="justificativas.length === 0">
              <td colspan="7">Nenhuma solicitação pendente encontrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../axios";

export default {
  name: "JustificativasPendentes",
  data() {
    return {
      justificativas: []
    };
  },
  async mounted() {
    await this.fetchJustificativas();
  },
  methods: {
    async fetchJustificativas() {
      try {
        const res = await api.get("/justificativas");
        this.justificativas = res.data || [];
      } catch (error) {
        console.error("Erro ao carregar justificativas:", error.response?.data || error);
        this.justificativas = [];
      }
    },
    async atualizarStatus(id, status) {
      try {
        await api.put(`/justificativas/${id}`, { status });
        alert(`Solicitação ${status.toLowerCase()} com sucesso!`);
        this.fetchJustificativas();
      } catch (error) {
        console.error("Erro ao atualizar status:", error.response?.data || error);
        alert("Erro ao atualizar solicitação.");
      }
    },
    formatarData(datetime) {
      return new Date(datetime).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    },
    traduzTipo(tipo) {
      const map = {
        ENTRADA_ESQUECIDA: "Entrada esquecida",
        SAIDA_ESQUECIDA: "Saída esquecida",
        INTERVALO_ESQUECIDO: "Intervalo esquecido",
        OUTRO: "Outro"
      };
      return map[tipo] || tipo;
    },
    statusClass(status) {
      if (status === "APROVADO") return "badge bg-success";
      if (status === "PENDENTE") return "badge bg-warning text-dark";
      if (status === "REJEITADO") return "badge bg-danger";
      return "badge bg-secondary";
    }
  }
};
</script>

<style scoped>
.card {
  margin-left: -300px;
  width: 100%;
  min-width: 1600px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  color: white;
  backdrop-filter: blur(8px);
}
.table {
  width: 100%;
  min-width: 1000px;
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
