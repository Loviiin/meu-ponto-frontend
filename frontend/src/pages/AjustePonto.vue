<template>
  <div class="card mt-4">
    <div class="card-body">
      <h3>🛠 Solicitar Ajuste de Ponto</h3>
      <p>Solicite um ajuste de ponto caso tenha esquecido de registrar ou tenha ocorrido algum problema.</p>

      <!-- Formulário de solicitação -->
      <form @submit.prevent="enviarJustificativa" class="mt-4">
        <div class="mb-3">
          <label class="form-label">Data e Hora da Ocorrência *</label>
          <input 
            type="datetime-local" 
            v-model="form.dataOcorrencia" 
            class="form-control"
            required
          />
          <small class="text-muted">Quando deveria ter sido registrado o ponto</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Tipo de Justificativa *</label>
          <select v-model="form.tipo" class="form-select" required>
            <option value="">Selecione...</option>
            <option value="ENTRADA_ESQUECIDA">Entrada Esquecida</option>
            <option value="SAIDA_ESQUECIDA">Saída Esquecida</option>
            <option value="PONTO_INCORRETO">Ponto Incorreto</option>
            <option value="SISTEMA_INDISPONIVEL">Sistema Indisponível</option>
            <option value="OUTROS">Outros</option>
          </select>
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

export default {
  name: "AjustePonto",
  data() {
    return {
      enviando: false,
      form: {
        dataOcorrencia: "",
        tipo: "",
        descricao: ""
      }
    };
  },
  mounted() {
    // Define data/hora atual como padrão
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    this.form.dataOcorrencia = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
  },
  methods: {
    async enviarJustificativa() {
      try {
        this.enviando = true;

        // Converte para ISO 8601 (UTC)
        const dataLocal = new Date(this.form.dataOcorrencia);
        const dataISO = dataLocal.toISOString();

        const payload = {
          data_ocorrencia: dataISO,
          tipo: this.form.tipo,
          descricao: this.form.descricao.trim()
        };

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
        tipo: "",
        descricao: ""
      };
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
</style>
