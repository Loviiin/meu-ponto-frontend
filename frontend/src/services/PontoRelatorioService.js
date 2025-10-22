import api from '../axios'

function extrairFilename(contentDisposition) {
  if (!contentDisposition) return null
  // Exemplo: attachment; filename="relatorio_123.pdf"; filename*=UTF-8''relatorio_123.pdf
  const filenameRegex = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i
  const match = filenameRegex.exec(contentDisposition)
  if (match) {
    return decodeURIComponent(match[1] || match[2])
  }
  return null
}

function forcarDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'relatorio_ponto'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export async function exportarRelatorio(idUsuario, dataInicio, dataFim, formato) {
  const params = { data_inicio: dataInicio, data_fim: dataFim, formato }
  let endpoint
  if (idUsuario) {
    endpoint = `/relatorios/ponto/usuario/${idUsuario}/export`
  } else {
    endpoint = '/relatorios/ponto/meus-registros/export'
  }
  try {
    const response = await api.get(endpoint, {
      params,
      responseType: 'blob'
    })
    const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
    const filename = extrairFilename(contentDisposition) || `relatorio_ponto_${Date.now()}.${formato.toLowerCase()}`
    forcarDownload(response.data, filename)
    return { sucesso: true }
  } catch (error) {
    console.error('Erro ao exportar relatório', error)
    throw error
  }
}

/**
 * Gera o relatório geral de ponto para um ou todos os funcionários
 * @param {string} dataInicio - Data de início no formato YYYY-MM-DD
 * @param {string} dataFim - Data de fim no formato YYYY-MM-DD
 * @param {number|null} usuarioId - ID do usuário específico ou null para todos
 * @returns {Promise<Object>} - Dados do relatório geral
 */
export async function gerarRelatorioGeral(dataInicio, dataFim, usuarioId = null) {
  try {
    const params = { 
      data_inicio: dataInicio, 
      data_fim: dataFim 
    }
    
    if (usuarioId) {
      params.usuario_id = usuarioId
    }
    
    const response = await api.get('/relatorios/geral', { params })
    return response.data
  } catch (error) {
    console.error('Erro ao gerar relatório geral', error)
    throw error
  }
}

/**
 * Exporta o relatório geral de ponto em PDF ou CSV
 * @param {string} dataInicio - Data de início no formato YYYY-MM-DD
 * @param {string} dataFim - Data de fim no formato YYYY-MM-DD
 * @param {string} formato - 'PDF' ou 'CSV'
 * @param {number|null} usuarioId - ID do usuário específico ou null para todos
 * @param {number} pagina - Número da página (default 1)
 * @param {number} limite - Itens por página (default 100)
 * @returns {Promise<Object>} - Resultado da exportação
 */
export async function exportarRelatorioGeral(dataInicio, dataFim, formato = 'PDF', usuarioId = null, pagina = 1, limite = 100) {
  try {
    const params = {
      data_inicio: dataInicio,
      data_fim: dataFim,
      formato: formato.toLowerCase(),
      pagina,
      limite
    }
    
    if (usuarioId) {
      params.usuario_id = usuarioId
    }
    
    const response = await api.get('/relatorios/geral/export', {
      params,
      responseType: 'blob'
    })
    
    const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
    const filename = extrairFilename(contentDisposition) || `relatorio_geral_${Date.now()}.${formato.toLowerCase()}`
    
    forcarDownload(response.data, filename)
    return { sucesso: true }
  } catch (error) {
    console.error('Erro ao exportar relatório geral', error)
    throw error
  }
}

export default { exportarRelatorio, gerarRelatorioGeral, exportarRelatorioGeral }
