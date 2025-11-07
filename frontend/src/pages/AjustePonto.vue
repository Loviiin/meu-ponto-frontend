<template>
  <div class="card mt-4">
    <div class="card-body">
  <h3>🛠 Solicitar Ajuste de Ponto</h3>
  <p>Escolha entre criar um ponto faltante ou corrigir um ponto existente.</p>

      <!-- Formulário de solicitação -->
      <form @submit.prevent="enviarJustificativa" class="mt-4">
        <!-- Tipo de justificativa -->
        <div class="mb-3">
          <label class="form-label fw-bold">Tipo de Justificativa *</label>
          <div class="btn-group w-100" role="group">
            <input 
              type="radio" 
              class="btn-check" 
              name="tipo"
              id="tipoFaltantePg"
              value="PONTO_FALTANTE"
              v-model="form.tipo"
            >
            <label class="btn btn-outline-primary" for="tipoFaltantePg">
              🕐 Ponto Faltante
            </label>

            <input 
              type="radio" 
              class="btn-check" 
              name="tipo"
              id="tipoCorrecaoPg"
              value="CORRECAO_PONTO"
              v-model="form.tipo"
              @change="carregarPontos"
            >
            <label class="btn btn-outline-primary" for="tipoCorrecaoPg">
              ✏️ Correção de Ponto
            </label>
          </div>
        </div>

        <!-- Ajuda do modo selecionado -->
        <div v-if="form.tipo" class="alert alert-info py-2 small mb-3">
          <strong>Modo:</strong>
          <span v-if="form.tipo === 'PONTO_FALTANTE'">Criar ponto faltante</span>
          <span v-else>Correção de ponto existente</span>
          <br />
          <span v-if="form.tipo === 'PONTO_FALTANTE'">Um novo registro de ponto será criado quando aprovado.</span>
          <span v-else-if="form.tipo === 'CORRECAO_PONTO'">O ponto selecionado será atualizado para o novo horário quando aprovado.</span>
        </div>

        <!-- Data de ocorrência -->
        <div class="mb-3">
          <label class="form-label">Data e Hora da Ocorrência *</label>
          <input 
            type="datetime-local" 
            v-model="form.dataOcorrencia" 
            class="form-control"
            required
          />
          <small class="text-muted">Data/hora do fato relacionado ao ajuste</small>
        </div>

        <!-- Novo horário -->
        <div class="mb-3">
          <label class="form-label">Novo Horário *</label>
          <input 
            type="datetime-local" 
            v-model="form.novoHorario" 
            class="form-control"
            required
          />
          <small class="text-muted">Horário a ser criado (faltante) ou aplicado à correção</small>
        </div>

        <!-- Seleção de ponto (somente correção) -->
        <div class="mb-3" v-if="form.tipo === 'CORRECAO_PONTO'">
          <label class="form-label">Selecione o Ponto a Corrigir *</label>
          <div v-if="pontos.length > 0" class="list-group">
            <button 
              v-for="p in pontos"
              :key="p.id"
              type="button"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ponto-item"
              :class="{ 'active': form.pontoId === p.id }"
              @click="form.pontoId = p.id"
            >
              <span><strong>{{ formatarData(p.timestamp) }}</strong> <small class="text-muted">(#{{ p.id }})</small></span>
              <input type="radio" class="form-check-input" :checked="form.pontoId === p.id" />
            </button>
          </div>
          <div v-else class="alert alert-warning">Nenhum ponto recente encontrado.</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Descrição *</label>
          <textarea 
            v-model="form.descricao" 
            class="form-control" 
            rows="4" 
            placeholder="Explique detalhadamente o motivo da solicitação..."
            required
            minlength="10"
          ></textarea>
          <small class="text-muted">Mínimo de 10 caracteres</small>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-success" :disabled="enviando">
            <span v-if="enviando">Enviando...</span>
            <span v-else-if="form.tipo === 'PONTO_FALTANTE'">📤 Enviar criação de ponto</span>
            <span v-else-if="form.tipo === 'CORRECAO_PONTO'">📤 Enviar correção de ponto</span>
            <span v-else>📤 Enviar Solicitação</span>
          </button>
          <button type="button" class="btn btn-secondary" @click="limparFormulario" :disabled="enviando">
            Limpar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from "../axios";
import { toast } from "../toast";
import { getUserPermissions, hasPerm as hasPermission } from '../utils/permissions'

export default {
  name: "AjustePonto",
  data() {
    return {
      enviando: false,
      form: {
        dataOcorrencia: "",
        novoHorario: "",
        tipo: "",
        descricao: "",
        pontoId: null
      }
      ,
      pontos: [],
      tiposPermitidos: ['PONTO_FALTANTE', 'CORRECAO_PONTO']
    };
  },
  computed: {
    userPermissions() {
      return getUserPermissions()
    }
  },
  mounted() {
    // Verificar se tem permissão para criar justificativas
    if (!this.hasPerm('CRIAR_JUSTIFICATIVA_PROPRIA')) {
      toast.error('❌ Você não tem permissão para criar justificativas')
      this.$router.push('/home')
      return
    }
    
    // Define data/hora atual como padrão
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    const local = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    this.form.dataOcorrencia = local;
    this.form.novoHorario = local;
  },
  methods: {
    hasPerm(permission) {
      return hasPermission(this.userPermissions, permission)
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
    async carregarPontos() {
      try {
        const res = await api.get('/pontos/meus-registros');
        const pontos = res.data || [];
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        this.pontos = pontos
          .filter(p => new Date(p.timestamp) > umMesAtras)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } catch (e) {
        console.error('Erro ao carregar pontos:', e);
        this.pontos = [];
      }
    },
    async enviarJustificativa() {
      try {
        this.enviando = true;

        if (!this.tiposPermitidos.includes(this.form.tipo)) {
          toast.error('❌ Tipo de justificativa inválido');
          return;
        }

        // Converte para ISO 8601 (UTC)
        const dataOcISO = new Date(this.form.dataOcorrencia).toISOString();
        const novoHorISO = new Date(this.form.novoHorario).toISOString();

        const payload = {
          data_ocorrencia: dataOcISO,
          novo_horario: novoHorISO,
          tipo: this.form.tipo,
          descricao: this.form.descricao.trim()
        };

        if (this.form.tipo === 'CORRECAO_PONTO') {
          if (!this.form.pontoId) {
            toast.error('❌ Selecione o ponto a corrigir');
            return;
          }
          payload.ponto_id = this.form.pontoId;
        }

        await api.post("/justificativas", payload);

        toast.success("✅ Solicitação enviada com sucesso! Aguarde aprovação.");
        this.limparFormulario();
        
        // Redireciona para ver minhas justificativas após 1.5s
        setTimeout(() => {
          this.$router.push('/minhas-justificativas');
        }, 1500);
      } catch (error) {
        console.error("Erro ao enviar justificativa:", error.response?.data || error);
        const mensagem = error.response?.data?.message || error.response?.data?.error || "Erro ao enviar justificativa.";
        toast.error(`❌ ${mensagem}`);
      } finally {
        this.enviando = false;
      }
    },
    limparFormulario() {
      const agora = new Date();
      const ano = agora.getFullYear();
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const dia = String(agora.getDate()).padStart(2, '0');
      const hora = String(agora.getHours()).padStart(2, '0');
      const minuto = String(agora.getMinutes()).padStart(2, '0');
      
      this.form = {
        dataOcorrencia: `${ano}-${mes}-${dia}T${hora}:${minuto}`,
        novoHorario: `${ano}-${mes}-${dia}T${hora}:${minuto}`,
        tipo: "",
        descricao: "",
        pontoId: null
      };
      this.pontos = [];
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

.form-control, .form-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.form-control:focus, .form-select:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
}

.list-group-item.ponto-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.list-group-item.ponto-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.list-group-item.ponto-item.active {
  background: rgba(13, 110, 253, 0.3);
  border-color: rgba(13, 110, 253, 0.6);
  color: white;
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

/* Light Mode Styles */
body.light-mode .card {
  background: rgba(255, 255, 255, 0.9);
  color: #333333;
  border: 1px solid rgba(105, 96, 0, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

body.light-mode .form-control,
body.light-mode .form-select {
  background: #FFFFFF;
  border-color: rgba(105, 96, 0, 0.25);
  color: #333333;
}

body.light-mode .form-control::placeholder {
  color: #888888;
}

body.light-mode .form-control:focus,
body.light-mode .form-select:focus {
  background: #FFFFFF;
  border-color: #FFD700;
  color: #333333;
}

body.light-mode .list-group-item.ponto-item {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(105, 96, 0, 0.15);
  color: #333333;
}

body.light-mode .list-group-item.ponto-item:hover {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.4);
}

body.light-mode .list-group-item.ponto-item.active {
  background: rgba(255, 215, 0, 0.3);
  border-color: #FFD700;
  color: #333333;
}

body.light-mode .table {
  color: #333333;
}

body.light-mode .table thead {
  background: rgba(255, 215, 0, 0.15);
  color: #333333;
}

body.light-mode .table td,
body.light-mode .table th {
  color: #333333;
}
</style>
