import api from '../axios';

/**
 * Obtém os dados completos do banco de horas do usuário logado
 * Inclui: saldo total e histórico de lançamentos
 * @param {string} dataInicio - Data inicial no formato YYYY-MM-DD (opcional)
 * @param {string} dataFim - Data final no formato YYYY-MM-DD (opcional)
 * @returns {Promise<{saldo_total_minutos: number, historico: Array}>}
 */
export async function getDashboardData(dataInicio, dataFim) {
  const params = {};
  if (dataInicio) params.data_inicio = dataInicio;
  if (dataFim) params.data_fim = dataFim;
  
  const { data } = await api.get('/bancohoras/dashboard/me', { params });
  return data;
}

export default { 
  getDashboardData,
};
