import api from '../axios';

/**
 * Service para gerenciar Justificativas de Ponto
 * Baseado no FRONTEND_GUIDE.md - Seção 16: Sistema de Justificativas
 * 
 * IMPORTANTE: Dois tipos de justificativa:
 * 1. PONTO_FALTANTE: Funcionário esqueceu de bater (cria novo ponto se aprovado)
 * 2. CORRECAO_PONTO: Funcionário bateu errado (corrige ponto existente se aprovado)
 */

const JustificativaService = {
  /**
   * TIPO 1: Solicitar Ponto Faltante
   * Quando: Funcionário ESQUECEU de bater o ponto
   * Endpoint: POST /api/v1/justificativas
   * Resultado se aprovado: CRIA novo ponto
   * 
   * @param {Object} dados - { data_ocorrencia, descricao }
   * @returns {Promise<Object>} Justificativa criada
   */
  async solicitarPontoFaltante(dados) {
    try {
      // Validação: não deve ter ponto_id
      if (dados.ponto_id) {
        throw new Error('Erro: justificativa de ponto faltante não pode ter ponto_id');
      }

      const response = await api.post('/api/v1/justificativas', {
        tipo: 'PONTO_FALTANTE',
        data_ocorrencia: dados.data_ocorrencia,
        descricao: dados.descricao,
      });

      console.log('✅ Ponto faltante solicitado com sucesso');
      return response.data;
    } catch (error) {
      console.error('Erro ao solicitar ponto faltante:', error);
      throw error;
    }
  },

  /**
   * TIPO 2: Solicitar Correção de Ponto Existente
   * Quando: Funcionário bateu ponto ERRADO/ATRASADO
   * Endpoint: POST /api/v1/justificativas/solicitar-correcao
   * Resultado se aprovado: ATUALIZA ponto existente
   * 
   * @param {Object} dados - { ponto_id, nova_data_hora, descricao }
   * @returns {Promise<Object>} Solicitação criada
   */
  async solicitarCorrecaoPonto(dados) {
    try {
      // Validação: ponto_id é obrigatório
      if (!dados.ponto_id) {
        throw new Error('Erro: selecione o ponto que deseja corrigir');
      }

      // Validação: não pode ser data futura
      if (new Date(dados.nova_data_hora) > new Date()) {
        throw new Error('Erro: não é possível corrigir ponto no futuro');
      }

      const response = await api.post('/api/v1/justificativas/solicitar-correcao', {
        ponto_id: dados.ponto_id,
        nova_data_hora: dados.nova_data_hora,
        descricao: dados.descricao,
      });

      console.log('✅ Correção de ponto solicitada com sucesso');
      return response.data;
    } catch (error) {
      console.error('Erro ao solicitar correção de ponto:', error);
      throw error;
    }
  },

  /**
   * (DEPRECATED) Método antigo - use solicitarPontoFaltante ou solicitarCorrecaoPonto
   * @deprecated
   */
  async criar(dados) {
    console.warn('⚠️ Método criar() está deprecated. Use solicitarPontoFaltante() ou solicitarCorrecaoPonto()');
    const response = await api.post('/api/v1/justificativas', dados);
    return response.data;
  },

  /**
   * Lista todas as justificativas do usuário logado
   * Endpoint: GET /api/v1/justificativas/minhas
   * @returns {Promise<Array>} Lista de justificativas
   */
  async listarMinhas() {
    try {
      const response = await api.get('/api/v1/justificativas/minhas');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao listar minhas justificativas:', error);
      throw error;
    }
  },

  /**
   * Lista justificativas pendentes (requer permissão GERENCIAR_JUSTIFICATIVAS)
   * Endpoint: GET /api/v1/justificativas/pendentes
   * @returns {Promise<Array>} Lista de justificativas pendentes
   */
  async listarPendentes() {
    try {
      const response = await api.get('/api/v1/justificativas/pendentes');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao listar justificativas pendentes:', error);
      throw error;
    }
  },

  /**
   * Processar justificativa (aprovar ou reprovar)
   * Endpoint: POST /api/v1/justificativas/:id/processar
   * 
   * Comportamento:
   * - Se tipo PONTO_FALTANTE + aprovado=true → CRIA novo ponto
   * - Se tipo CORRECAO_PONTO + aprovado=true → ATUALIZA ponto existente
   * - Se aprovado=false → Não faz nada com pontos (qualquer tipo)
   * 
   * @param {Number} id - ID da justificativa
   * @param {Boolean} aprovado - true para aprovar, false para reprovar
   * @param {String} motivoReprovacao - Motivo (obrigatório se aprovado=false)
   * @returns {Promise<Object>} Resposta do processamento
   */
  async processar(id, aprovado, motivoReprovacao = '') {
    try {
      // Validação: motivo obrigatório se reprovar
      if (!aprovado && !motivoReprovacao) {
        throw new Error('Motivo de reprovação é obrigatório');
      }

      const response = await api.post(`/api/v1/justificativas/${id}/processar`, {
        aprovado,
        motivo_reprovacao: motivoReprovacao,
      });

      console.log(`✅ Justificativa ${aprovado ? 'aprovada' : 'reprovada'} com sucesso`);
      return response.data;
    } catch (error) {
      console.error('Erro ao processar justificativa:', error);
      throw error;
    }
  },

  /**
   * Aprovar uma justificativa (requer permissão GERENCIAR_JUSTIFICATIVAS)
   * @param {Number} id - ID da justificativa
   * @returns {Promise<Object>} Justificativa aprovada
   */
  async aprovar(id) {
    return this.processar(id, true);
  },

  /**
   * Reprovar uma justificativa (requer permissão GERENCIAR_JUSTIFICATIVAS)
   * @param {Number} id - ID da justificativa
   * @param {String} motivoReprovacao - Motivo da reprovação
   * @returns {Promise<Object>} Justificativa reprovada
   */
  async reprovar(id, motivoReprovacao) {
    return this.processar(id, false, motivoReprovacao);
  },

  /**
   * Cancelar uma solicitação pendente (apenas o próprio usuário)
   * Endpoint: DELETE /api/v1/justificativas/:id/cancelar
   * @param {Number} id - ID da justificativa
   * @returns {Promise<Object>} Justificativa cancelada
   */
  async cancelar(id) {
    try {
      const response = await api.delete(`/api/v1/justificativas/${id}/cancelar`);
      console.log('✅ Justificativa cancelada com sucesso');
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar justificativa:', error);
      throw error;
    }
  },

  /**
   * Obtém detalhes de uma justificativa específica
   * @param {Number} id - ID da justificativa
   * @returns {Promise<Object>} Detalhes da justificativa
   */
  async obterDetalhes(id) {
    try {
      const response = await api.get(`/api/v1/justificativas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter detalhes da justificativa:', error);
      throw error;
    }
  },

  /**
   * Utilitário: Formata o tipo de justificativa para exibição
   * @param {String} tipo - PONTO_FALTANTE ou CORRECAO_PONTO
   * @returns {Object} { label, icon, color, description }
   */
  formatarTipo(tipo) {
    const tipos = {
      PONTO_FALTANTE: {
        label: 'Ponto Faltante',
        icon: '🕐',
        color: 'primary',
        description: 'Esqueci de bater o ponto',
      },
      CORRECAO_PONTO: {
        label: 'Correção de Ponto',
        icon: '✏️',
        color: 'warning',
        description: 'Bati no horário errado',
      },
    };

    return tipos[tipo] || {
      label: tipo,
      icon: '❓',
      color: 'secondary',
      description: 'Tipo desconhecido',
    };
  },

  /**
   * Utilitário: Formata o status da justificativa
   * @param {String} status - PENDENTE, APROVADO, REPROVADO
   * @returns {Object} { label, color, icon }
   */
  formatarStatus(status) {
    const statusMap = {
      PENDENTE: {
        label: 'Pendente',
        color: 'warning',
        icon: '⏳',
      },
      APROVADO: {
        label: 'Aprovado',
        color: 'success',
        icon: '✅',
      },
      REPROVADO: {
        label: 'Reprovado',
        color: 'danger',
        icon: '❌',
      },
    };

    return statusMap[status] || {
      label: status,
      color: 'secondary',
      icon: '❓',
    };
  },
};

export default JustificativaService;
