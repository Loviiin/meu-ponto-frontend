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
    const response = await api.post('justificativas', dados);
    return response.data;
  },

  /**
   * Lista todas as justificativas do usuário logado
   * @returns {Promise<Array>} Lista de justificativas
   */
  async listarMinhas() {
    const response = await api.get('justificativas/minhas');
    return response.data || [];
  },

  /**
   * Lista justificativas pendentes (requer permissão GERENCIAR_JUSTIFICATIVAS)
   * @returns {Promise<Array>} Lista de justificativas pendentes
   */
  async listarPendentes() {
    const response = await api.get('justificativas/pendentes');
    return response.data || [];
  },

  /**
   * Aprovar uma justificativa (requer permissão GERENCIAR_JUSTIFICATIVAS)
   * @param {Number} id - ID da justificativa
   * @returns {Promise<Object>} Justificativa aprovada
   */
  async aprovar(id) {
    const response = await api.post(`justificativas/${id}/processar`, {
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
    const response = await api.post(`justificativas/${id}/processar`, {
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
    const response = await api.delete(`justificativas/${id}/cancelar`);
    return response.data;
  },

  /**
   * Solicitar correção de ponto (endpoint deprecated)
   * @param {Object} dados - { ponto_id, nova_data_hora, descricao }
   * @returns {Promise<Object>}
   * @deprecated Use criar() com tipo CORRECAO_PONTO
   */
  async solicitarCorrecao(dados) {
    const response = await api.post('justificativas/solicitar-correcao', dados);
    return response.data;
  },

  /**
   * Processar justificativa (aprovar ou reprovar)
   * @param {Number} id - ID da justificativa
   * @param {Object} dados - { aprovado: boolean, motivo_reprovacao?: string }
   * @returns {Promise<Object>}
   */
  async processar(id, dados) {
    const response = await api.post(`justificativas/${id}/processar`, dados);
    return response.data;
  }
};

export default JustificativaService;
