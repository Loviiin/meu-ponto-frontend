import api from '../axios';

/**
 * Service para gerenciar Justificativas de Ponto
 * Baseado na documentação: docs/FLUXO_JUSTIFICATIVAS.md
 */

const JustificativaService = {
  /**
   * Cria uma nova solicitação de ajuste de ponto
   * @param {Object} dados - { data_ocorrencia, tipo, descricao }
   * @returns {Promise<Object>} Justificativa criada
   */
  async criar(dados) {
    const response = await api.post('/api/v1/justificativas', dados);
    return response.data;
  },

  /**
   * Lista todas as justificativas do usuário logado
   * @returns {Promise<Array>} Lista de justificativas
   */
  async listarMinhas() {
    const response = await api.get('/api/v1/justificativas/minhas');
    return response.data || [];
  },

  /**
   * Lista justificativas pendentes (requer permissão GERENCIAR_JUSTIFICATIVAS)
   * @returns {Promise<Array>} Lista de justificativas pendentes
   */
  async listarPendentes() {
    const response = await api.get('/api/v1/justificativas/pendentes');
    return response.data || [];
  },

  /**
   * Aprovar uma justificativa (requer permissão GERENCIAR_JUSTIFICATIVAS)
   * @param {Number} id - ID da justificativa
   * @returns {Promise<Object>} Justificativa aprovada
   */
  async aprovar(id) {
    const response = await api.post(`/api/v1/justificativas/${id}/processar`, {
      aprovado: true
    });
    return response.data;
  },

  /**
   * Reprovar uma justificativa (requer permissão GERENCIAR_JUSTIFICATIVAS)
   * @param {Number} id - ID da justificativa
   * @param {String} motivoReprovacao - Motivo da reprovação
   * @returns {Promise<Object>} Justificativa reprovada
   */
  async reprovar(id, motivoReprovacao) {
    const response = await api.post(`/api/v1/justificativas/${id}/processar`, {
      aprovado: false,
      motivo_reprovacao: motivoReprovacao
    });
    return response.data;
  },

  /**
   * Cancelar uma solicitação pendente (apenas o próprio usuário)
   * @param {Number} id - ID da justificativa
   * @returns {Promise<Object>} Justificativa cancelada
   */
  async cancelar(id) {
    const response = await api.delete(`/api/v1/justificativas/${id}/cancelar`);
    return response.data;
  }
};

export default JustificativaService;
