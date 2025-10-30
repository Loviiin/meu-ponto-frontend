<template>
  <div 
    class="modal fade" 
    id="justificativaModal" 
    tabindex="-1" 
    ref="modalElement"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content bg-dark text-white border-secondary">
        <div class="modal-header">
          <h5 class="modal-title">📋 Nova Justificativa de Ponto</h5>
          <button 
            type="button" 
            class="btn-close btn-close-white" 
            data-bs-dismiss="modal"
            @click="limparFormulario"
          ></button>
        </div>

        <div class="modal-body">
          <!-- Seleção de Tipo -->
          <div class="mb-4">
            <label class="form-label fw-bold">Tipo de Justificativa *</label>
            <div class="btn-group w-100" role="group">
              <input 
                type="radio" 
                class="btn-check" 
                name="tipo"
                id="tipoFaltante"
                value="PONTO_FALTANTE"
                v-model="formulario.tipo"
                @change="limparCamposCondicionais"
              >
              <label class="btn btn-outline-primary" for="tipoFaltante">
                🕐 Esqueci de bater o ponto
              </label>

              <input 
                type="radio" 
                class="btn-check" 
                name="tipo"
                id="tipoCorrecao"
                value="CORRECAO_PONTO"
                v-model="formulario.tipo"
                @change="carregarPontosParaCorrecao"
              >
              <label class="btn btn-outline-primary" for="tipoCorrecao">
                ✏️ Corrigir ponto já batido
              </label>
            </div>
          </div>

          <!-- Campos para PONTO_FALTANTE -->
          <div v-if="formulario.tipo === 'PONTO_FALTANTE'" class="mb-4">
            <label class="form-label fw-bold">
              Data e Hora do Ponto Esquecido *
            </label>
            <input 
              type="datetime-local" 
              class="form-control form-control-dark"
              v-model="formulario.novo_horario"
              required
            >
            <small class="text-muted">Selecione quando deveria ter batido o ponto</small>
          </div>

          <!-- Campos para CORRECAO_PONTO -->
          <div v-if="formulario.tipo === 'CORRECAO_PONTO'" class="mb-4">
            <label class="form-label fw-bold">Selecione o Ponto a Corrigir *</label>
            
            <div v-if="pontosFiltrados.length > 0" class="list-group mb-3">
              <div 
                v-for="ponto in pontosFiltrados"
                :key="ponto.id"
                class="list-group-item list-group-item-dark"
                :class="{ 'border-primary': formulario.ponto_id === ponto.id }"
                @click="selecionarPonto(ponto)"
                style="cursor: pointer;"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>🕐 {{ formatarHora(ponto.timestamp) }}</strong>
                    <br>
                    <small class="text-muted">Status: {{ traduzStatusPonto(ponto.status) }}</small>
                  </div>
                  <input 
                    type="radio" 
                    class="form-check-input"
                    :checked="formulario.ponto_id === ponto.id"
                  >
                </div>
              </div>
            </div>

            <div v-else class="alert alert-warning">
              <small>
                ⚠️ Nenhum ponto encontrado para o dia de hoje ou próximos dias.
                <br>
                Talvez você precise usar "Esqueci de bater o ponto" em vez disso.
              </small>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">
                Novo Horário Corrigido *
              </label>
              <input 
                type="datetime-local" 
                class="form-control form-control-dark"
                v-model="formulario.novo_horario"
                required
              >
              <small class="text-muted">Selecione o horário correto</small>
            </div>
          </div>

          <!-- Descrição -->
          <div class="mb-4">
            <label class="form-label fw-bold">
              Motivo da Justificativa * (mínimo 10 caracteres)
            </label>
            <textarea 
              class="form-control form-control-dark"
              rows="4"
              v-model="formulario.descricao"
              placeholder="Descreva por que precisa fazer este ajuste..."
              maxlength="500"
              required
            ></textarea>
            <small class="text-muted">
              {{ formulario.descricao.length }}/500 caracteres
              <span v-if="formulario.descricao.length < 10" class="text-warning">
                (mínimo 10 necessários)
              </span>
            </small>
          </div>

          <!-- Data de Ocorrência -->
          <div class="mb-4">
            <label class="form-label fw-bold">Data de Ocorrência *</label>
            <input 
              type="date" 
              class="form-control form-control-dark"
              v-model="formulario.data_ocorrencia"
              required
            >
            <small class="text-muted">Data em que o evento ocorreu</small>
          </div>
        </div>

        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            data-bs-dismiss="modal"
            @click="limparFormulario"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            @click="enviarFormulario"
            :disabled="!formularioValido || enviando"
          >
            <span v-if="enviando">⏳ Enviando...</span>
            <span v-else>✅ Enviar Justificativa</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import JustificativaService from '../services/JustificativaService';
import PontoService from '../services/PontoService';
import { toast } from '../toast';

export default {
  name: 'CriarJustificativaModal',
  props: {
    pontoSelecionado: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formulario: {
        tipo: '',
        data_ocorrencia: this.obterDataHoje(),
        novo_horario: '',
        descricao: '',
        ponto_id: null
      },
      pontosFiltrados: [],
      modalElement: null,
      modal: null,
      enviando: false,
      carregandoPontos: false
    };
  },
  computed: {
    formularioValido() {
      if (!this.formulario.tipo) return false;
      if (!this.formulario.data_ocorrencia) return false;
      if (!this.formulario.novo_horario) return false;
      if (this.formulario.descricao.trim().length < 10) return false;
      
      if (this.formulario.tipo === 'CORRECAO_PONTO') {
        if (!this.formulario.ponto_id) return false;
      }
      
      return true;
    }
  },
  mounted() {
    this.modalElement = this.$refs.modalElement;
    this.modal = new Modal(this.modalElement);
  },
  watch: {
    pontoSelecionado(novoValor) {
      if (novoValor) {
        // Pré-preencher para correção
        this.formulario.tipo = 'CORRECAO_PONTO';
        this.formulario.ponto_id = novoValor.id;
        this.formulario.novo_horario = novoValor.timestamp;
        this.formulario.data_ocorrencia = novoValor.timestamp.split('T')[0];
      }
    }
  },
  methods: {
    obterDataHoje() {
      const hoje = new Date();
      return hoje.toISOString().split('T')[0];
    },

    formatarHora(timestamp) {
      return new Date(timestamp).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    traduzStatusPonto(status) {
      const map = {
        CONFIRMADO: 'Confirmado',
        APROVADO: 'Aprovado',
        PENDENTE: 'Pendente',
        JUSTIFICADO: 'Justificado'
      };
      return map[status] || status;
    },

    limparCamposCondicionais() {
      this.formulario.ponto_id = null;
      this.formulario.novo_horario = '';
      this.pontosFiltrados = [];
    },

    async carregarPontosParaCorrecao() {
      try {
        this.carregandoPontos = true;
        const response = await PontoService.listarMeus();
        
        // Filtrar apenas pontos do último mês
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        
        this.pontosFiltrados = response
          .filter(ponto => new Date(ponto.timestamp) > umMesAtras)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } catch (error) {
        console.error('Erro ao carregar pontos:', error);
        toast.error('❌ Erro ao carregar seus pontos');
        this.pontosFiltrados = [];
      } finally {
        this.carregandoPontos = false;
      }
    },

    selecionarPonto(ponto) {
      this.formulario.ponto_id = ponto.id;
      // Pré-preencher o horário atual do ponto
      this.formulario.novo_horario = ponto.timestamp;
    },

    async enviarFormulario() {
      if (!this.formularioValido) {
        toast.error('❌ Preencha todos os campos obrigatórios corretamente');
        return;
      }

      try {
        this.enviando = true;

        const dados = {
          tipo: this.formulario.tipo,
          data_ocorrencia: this.formulario.data_ocorrencia + 'T12:00:00Z',
          novo_horario: this.formulario.novo_horario,
          descricao: this.formulario.descricao
        };

        // Adicionar ponto_id se for correção
        if (this.formulario.tipo === 'CORRECAO_PONTO') {
          dados.ponto_id = this.formulario.ponto_id;
        }

        const response = await JustificativaService.criar(dados);

        toast.success('✅ Justificativa enviada para aprovação!');

        // Emitir evento para atualizar a lista
        this.$emit('justificativa-criada', response);

        this.limparFormulario();
        this.modal.hide();
      } catch (error) {
        console.error('Erro ao criar justificativa:', error);
        
        const mensagem = error.response?.data?.message 
          || error.response?.data?.error 
          || 'Erro ao enviar justificativa';
        
        if (error.response?.status === 400) {
          toast.error(`❌ Erro de validação: ${mensagem}`);
        } else if (error.response?.status === 403) {
          toast.error('❌ Você não tem permissão para criar justificativas');
        } else {
          toast.error(`❌ ${mensagem}`);
        }
      } finally {
        this.enviando = false;
      }
    },

    limparFormulario() {
      this.formulario = {
        tipo: '',
        data_ocorrencia: this.obterDataHoje(),
        novo_horario: '',
        descricao: '',
        ponto_id: null
      };
      this.pontosFiltrados = [];
    },

    abrir() {
      this.limparFormulario();
      this.modal.show();
    }
  }
};
</script>

<style scoped>
.form-control-dark {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.form-control-dark:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.form-control-dark::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.list-group-item-dark {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.2s;
}

.list-group-item-dark:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.list-group-item-dark.border-primary {
  background: rgba(13, 110, 253, 0.15);
  border-color: #0d6efd !important;
}

.btn-group .btn {
  border-radius: 8px !important;
  margin: 0 4px;
  flex: 1;
}

.btn-check:checked + .btn-outline-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>
