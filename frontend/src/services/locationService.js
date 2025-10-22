import api from '../axios';

/**
 * Busca endereço/informações de um CEP no backend de localidades.
 *
 * Contrato:
 * - Input: cep (string) – pode estar mascarado (#####-###) ou apenas dígitos
 * - Output: response.data do backend (objeto com dados do CEP)
 * - Erros: relança o erro para o chamador tratar (toast, mensagens, etc.)
 */
export async function getAddressByCEP(cep) {
  try {
    // Aceita CEP mascarado ou apenas dígitos. O backend geralmente espera apenas números.
    const digits = String(cep || '').replace(/\D/g, '');
    const url = `/cep/v2/${digits}`; // usa baseURL do axios instance
    const { data } = await api.get(url);
    return data;
  } catch (err) {
    // Deixa o componente decidir como lidar (exibir toast, setar erro de campo, etc.)
    throw err;
  }
}

export default { getAddressByCEP };
