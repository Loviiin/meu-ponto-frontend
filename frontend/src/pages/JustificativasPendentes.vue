<template>
  <div class="card mt-4">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3>📑 Solicitações de Ajuste Pendentes</h3>
          <p>Gerencie as justificativas enviadas pelos colaboradores.</p>
        </div>
        <button class="btn btn-secondary" @click="fetchJustificativas" :disabled="carregando">
          <span v-if="carregando">🔄 Carregando...</span>
          <span v-else>🔄 Atualizar</span>
        </button>
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
              <th>Colaborador</th>
              <th>Data Ocorrência</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(just, index) in justificativas" :key="just.id">
              <td :data-label="'#'">{{ index + 1 }}</td>
              <td :data-label="'Colaborador'">
                <strong>{{ just.usuario?.nome || "Usuário #" + just.usuario_id }}</strong>
                <br>
                <small class="text-muted">{{ just.usuario?.email }}</small>
              </td>
              <td :data-label="'Data Ocorrência'">{{ formatarData(just.data_ocorrencia) }}</td>
              <td :data-label="'Tipo'">
                <span class="badge bg-info">{{ traduzTipo(just.tipo) }}</span>
              </td>
              <td :data-label="'Descrição'" class="text-start">
                <small>{{ just.descricao }}</small>
              </td>
              <td :data-label="'Ações'">
                <button 
                  class="btn btn-success btn-sm me-2 mb-1"
                  @click="aprovar(just.id)"
                  :disabled="processando === just.id"
                >
                  <span v-if="processando === just.id">...</span>
                  <span v-else>✅ Aprovar</span>
                </button>
                <button 
                  class="btn btn-danger btn-sm mb-1"
                  @click="abrirModalReprovacao(just)"
                  :disabled="processando === just.id"
                >
                  ❌ Reprovar
                </button>
              </td>
            </tr>
            <tr v-if="justificativas.length === 0">
              <td colspan="6" class="text-center py-4">
                🎉 Nenhuma solicitação pendente no momento.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Reprovação -->
    <div v-if="modalReprovacao" class="modal-overlay" @click.self="fecharModalReprovacao">
      <div class="modal-content">
        <h5 class="mb-3">❌ Reprovar Solicitação</h5>
        <p class="mb-3">
          <strong>Funcionário:</strong> {{ justificativaSelecionada?.usuario?.nome }}<br>
          <strong>Data:</strong> {{ formatarData(justificativaSelecionada?.data_ocorrencia) }}<br>
          <strong>Tipo:</strong> {{ traduzTipo(justificativaSelecionada?.tipo) }}
        </p>
        
        <div class="mb-3">
          <label class="form-label">Motivo da Reprovação *</label>
          <textarea 
            v-model="motivoReprovacao" 
            class="form-control" 
            rows="4" 
            placeholder="Explique o motivo da reprovação..."
            required
            minlength="10"
          ></textarea>
          <small class="text-muted">Mínimo de 10 caracteres</small>
        </div>
        
        <div class="d-flex gap-2 justify-content-end">
          <button class="btn btn-secondary" @click="fecharModalReprovacao" :disabled="processando">
            Cancelar
          </button>
          <button 
            class="btn btn-danger" 
            @click="reprovar" 
            :disabled="processando || !motivoReprovacao || motivoReprovacao.length < 10"
          >
            <span v-if="processando">Processando...</span>
            <span v-else>Confirmar Reprovação</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../axios";
import { toast } from "../toast";

export default {
  name: "JustificativasPendentes",
  data() {
    return {
      justificativas: [],
      carregando: true,
      processando: null,
      modalReprovacao: false,
      justificativaSelecionada: null,
      motivoReprovacao: ""
    };
  },
  async mounted() {
    await this.fetchJustificativas();
  },
  methods: {
    async fetchJustificativas() {
      try {
        this.carregando = true;
        const res = await api.get("/justificativas/pendentes");
        this.justificativas = res.data || [];
      } catch (error) {
        console.error("Erro ao carregar justificativas:", error.response?.data || error);
        
        if (error.response?.status === 403) {
          toast.error("❌ Você não tem permissão para visualizar justificativas pendentes.");
        } else {
          toast.error("❌ Erro ao carregar justificativas.");
        }
        
        this.justificativas = [];
      } finally {
        this.carregando = false;
      }
    },
    async aprovar(id) {
      if (!confirm("Tem certeza que deseja aprovar esta solicitação? Um ponto será criado automaticamente.")) {
        return;
      }

      try {
        this.processando = id;
        
        await api.post(`/justificativas/${id}/processar`, {
          aprovado: true
        });

        toast.success("✅ Solicitação aprovada com sucesso! Ponto criado automaticamente.");
        await this.fetchJustificativas();
      } catch (error) {
        console.error("Erro ao aprovar solicitação:", error.response?.data || error);
        const mensagem = error.response?.data?.message || error.response?.data?.error || "Erro ao aprovar solicitação.";
        toast.error(`❌ ${mensagem}`);
      } finally {
        this.processando = null;
      }
    },
    abrirModalReprovacao(justificativa) {
      this.justificativaSelecionada = justificativa;
      this.motivoReprovacao = "";
      this.modalReprovacao = true;
    },
    fecharModalReprovacao() {
      this.modalReprovacao = false;
      this.justificativaSelecionada = null;
      this.motivoReprovacao = "";
    },
    async reprovar() {
      if (!this.motivoReprovacao || this.motivoReprovacao.trim().length < 10) {
        toast.error("❌ O motivo da reprovação deve ter no mínimo 10 caracteres.");
        return;
      }

      try {
        this.processando = this.justificativaSelecionada.id;
        
        await api.post(`/justificativas/${this.justificativaSelecionada.id}/processar`, {
          aprovado: false,
          motivo_reprovacao: this.motivoReprovacao.trim()
        });

        toast.success("✅ Solicitação reprovada.");
        this.fecharModalReprovacao();
        await this.fetchJustificativas();
      } catch (error) {
        console.error("Erro ao reprovar solicitação:", error.response?.data || error);
        const mensagem = error.response?.data?.message || error.response?.data?.error || "Erro ao reprovar solicitação.";
        toast.error(`❌ ${mensagem}`);
      } finally {
        this.processando = null;
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
        PONTO_FALTANTE: "🕐 Ponto Faltante",
        CORRECAO_PONTO: "✏️ Correção de Ponto",
        // Tipos legados
        ENTRADA_ESQUECIDA: "Entrada Esquecida",
        SAIDA_ESQUECIDA: "Saída Esquecida",
        PONTO_INCORRETO: "Ponto Incorreto",
        SISTEMA_INDISPONIVEL: "Sistema Indisponível",
        OUTROS: "Outros"
      };
      return map[tipo] || tipo;
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-content h5 {
  color: white;
  margin-bottom: 1rem;
}

.modal-content .form-control {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.modal-content .form-control:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
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
