<template>
  <div class="card mt-4">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3>📋 Minhas Solicitações de Ajuste</h3>
          <p>Acompanhe o status das suas solicitações de ajuste de ponto.</p>
        </div>
        <router-link to="/Ajuste-Ponto" class="btn btn-primary">
          ➕ Nova Solicitação
        </router-link>
      </div>

      <!-- Filtros -->
      <div class="mb-3">
        <select v-model="filtroStatus" class="form-select w-auto" @change="filtrarJustificativas">
          <option value="">Todos os Status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="APROVADO">Aprovado</option>
          <option value="REPROVADO">Reprovado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="carregando" class="text-center py-4">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      </div>

      <!-- Lista -->
      <div v-else class="table-wrapper">
        <table class="table table-dark table-hover text-center align-middle table-mobile">
          <thead>
            <tr>
              <th>#</th>
              <th>Data Ocorrência</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Status</th>
              <th>Aprovador</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(just, index) in justificativasFiltradas" :key="just.id">
              <td :data-label="'#'">{{ index + 1 }}</td>
              <td :data-label="'Data Ocorrência'">{{ formatarData(just.data_ocorrencia) }}</td>
              <td :data-label="'Tipo'">
                <span class="badge bg-info">{{ traduzTipo(just.tipo) }}</span>
              </td>
              <td :data-label="'Descrição'" class="text-start">
                <small>{{ just.descricao }}</small>
              </td>
              <td :data-label="'Status'">
                <span :class="statusClass(just.status)">
                  {{ traduzStatus(just.status) }}
                </span>
              </td>
              <td :data-label="'Aprovador'">
                {{ just.aprovador?.nome || '-' }}
              </td>
              <td :data-label="'Observação'" class="text-start">
                <small>{{ just.observacao_aprovador || '-' }}</small>
              </td>
              <td :data-label="'Ações'">
                <button 
                  v-if="just.status === 'PENDENTE'"
                  class="btn btn-danger btn-sm"
                  @click="confirmarCancelamento(just.id)"
                  :disabled="cancelando === just.id"
                >
                  <span v-if="cancelando === just.id">...</span>
                  <span v-else>🗑️ Cancelar</span>
                </button>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>
            <tr v-if="justificativasFiltradas.length === 0">
              <td colspan="8" class="text-center py-4">
                <div v-if="filtroStatus">
                  Nenhuma solicitação com status "{{ traduzStatus(filtroStatus) }}".
                </div>
                <div v-else>
                  Você ainda não possui solicitações de ajuste.
                  <br>
                  <router-link to="/Ajuste-Ponto" class="btn btn-sm btn-primary mt-2">
                    Criar primeira solicitação
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../axios";
import { toast } from "../toast";

export default {
  name: "MinhasJustificativas",
  data() {
    return {
      justificativas: [],
      justificativasFiltradas: [],
      filtroStatus: "",
      carregando: true,
      cancelando: null
    };
  },
  async mounted() {
    await this.fetchJustificativas();
  },
  methods: {
    async fetchJustificativas() {
      try {
        this.carregando = true;
        const res = await api.get("/api/v1/justificativas/minhas");
        this.justificativas = res.data || [];
        this.filtrarJustificativas();
      } catch (error) {
        console.error("Erro ao carregar justificativas:", error.response?.data || error);
        toast.error("❌ Erro ao carregar suas solicitações.");
        this.justificativas = [];
        this.justificativasFiltradas = [];
      } finally {
        this.carregando = false;
      }
    },
    filtrarJustificativas() {
      if (!this.filtroStatus) {
        this.justificativasFiltradas = [...this.justificativas];
      } else {
        this.justificativasFiltradas = this.justificativas.filter(
          j => j.status === this.filtroStatus
        );
      }
    },
    async confirmarCancelamento(id) {
      if (!confirm("Tem certeza que deseja cancelar esta solicitação? Esta ação não pode ser desfeita.")) {
        return;
      }
      await this.cancelarSolicitacao(id);
    },
    async cancelarSolicitacao(id) {
      try {
        this.cancelando = id;
        await api.delete(`/api/v1/justificativas/${id}/cancelar`);
        toast.success("✅ Solicitação cancelada com sucesso!");
        await this.fetchJustificativas();
      } catch (error) {
        console.error("Erro ao cancelar solicitação:", error.response?.data || error);
        const mensagem = error.response?.data?.message || error.response?.data?.error || "Erro ao cancelar solicitação.";
        
        if (error.response?.status === 404) {
          toast.error("❌ Solicitação não encontrada ou não está mais pendente.");
        } else if (error.response?.status === 403) {
          toast.error("❌ Você não tem permissão para cancelar esta solicitação.");
        } else {
          toast.error(`❌ ${mensagem}`);
        }
      } finally {
        this.cancelando = null;
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
        ENTRADA_ESQUECIDA: "Entrada Esquecida",
        SAIDA_ESQUECIDA: "Saída Esquecida",
        PONTO_INCORRETO: "Ponto Incorreto",
        SISTEMA_INDISPONIVEL: "Sistema Indisponível",
        OUTROS: "Outros"
      };
      return map[tipo] || tipo;
    },
    traduzStatus(status) {
      const map = {
        PENDENTE: "Pendente",
        APROVADO: "Aprovado",
        REPROVADO: "Reprovado",
        CANCELADO: "Cancelado"
      };
      return map[status] || status;
    },
    statusClass(status) {
      if (status === "APROVADO") return "badge bg-success";
      if (status === "PENDENTE") return "badge bg-warning text-dark";
      if (status === "REPROVADO") return "badge bg-danger";
      if (status === "CANCELADO") return "badge bg-secondary";
      return "badge bg-secondary";
    }
  }
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

.table {
  width: 100%;
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

@media (max-width: 768px) {
  .table-mobile thead {
    display: none;
  }
  
  .table-mobile tbody tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
  }
  
  .table-mobile tbody td {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    border: none;
    text-align: left !important;
  }
  
  .table-mobile tbody td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 1rem;
  }
}
</style>
