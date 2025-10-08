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

export default { exportarRelatorio }
