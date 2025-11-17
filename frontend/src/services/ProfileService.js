import api from '../axios'

/**
 * Serviço para gerenciar operações relacionadas ao perfil do usuário
 * Baseado na documentação: FRONTEND_GUIDE.md
 * API Version: v1
 */
class ProfileService {
  /**
   * 1. Obter Perfil Completo
   * Endpoint: GET /api/v1/profile/me
   * Retorna todas as informações do perfil do usuário autenticado
   * @returns {Promise<Object>} Dados completos do perfil
   */
  async getProfile() {
    try {
      const response = await api.get('/profile/me')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      throw error
    }
  }

  /**
   * 2. Atualizar Perfil
   * Endpoint: PATCH /api/v1/profile/me (ATUALIZADO v2.0)
   * Atualiza informações editáveis do perfil (nome, telefone e email)
   * @param {Object} data - Dados a serem atualizados
   * @param {string} [data.nome] - Nome completo do usuário
   * @param {string} [data.telefone] - Telefone do usuário
   * @param {string} [data.email] - Email do usuário (NOVO: editável)
   * @returns {Promise<Object>} Perfil completo atualizado
   */
  async updateProfile(data) {
    try {
      const response = await api.patch('/profile/me', data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  }

  /**
   * 3. Alterar Senha
   * Endpoint: PATCH /api/v1/profile/me/password (ATUALIZADO v2.0)
   * Permite o usuário alterar sua própria senha
   * @param {Object} data - Dados da alteração de senha
   * @param {string} data.senha_atual - Senha atual (obrigatório)
   * @param {string} data.senha_nova - Nova senha (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número)
   * @param {string} data.confirmar_senha - Confirmação da nova senha
   * @returns {Promise<Object>} Mensagem de sucesso
   */
  async changePassword(data) {
    try {
      const response = await api.patch('/profile/me/password', data)
      return response.data
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      throw error
    }
  }

  /**
   * 13. Atualizar CPF de Usuário (Admin)
   * Endpoint: PATCH /api/v1/admin/users/:user_id/cpf (NOVO v2.0)
   * Requer permissão: EDITAR_USUARIO
   * @param {number} userId - ID do usuário
   * @param {string} cpf - Novo CPF (formato: 999.999.999-99)
   * @returns {Promise<Object>} Mensagem de sucesso
   */
  async updateUserCPF(userId, cpf) {
    try {
      const response = await api.patch(`/admin/users/${userId}/cpf`, { cpf })
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar CPF:', error)
      throw error
    }
  }

  /**
   * 4. Upload de Avatar
   * Endpoint: POST /api/v1/profile/me/avatar
   * Faz upload de uma foto de avatar para o Cloudinary
   * @param {File} file - Arquivo de imagem (JPEG, PNG, JPG, WebP)
   * @returns {Promise<Object>} URL do avatar no Cloudinary
   */
  async uploadAvatar(file) {
    try {
      // Validação de tamanho (5MB máximo)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande (máximo: 5MB)')
      }

      // Validação de tipo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
      if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo inválido (aceitos: jpeg, png, jpg, webp)')
      }

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.post('/profile/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error)
      throw error
    }
  }

  /**
   * 5. Obter Estatísticas do Usuário
   * Endpoint: GET /api/v1/profile/me/stats
   * Retorna estatísticas (pontos, banco de horas, justificativas, tempo na empresa)
   * @returns {Promise<Object>} Dashboard de estatísticas transformadas
   */
  async getStats() {
    try {
      const response = await api.get('/profile/me/stats')
      const data = response.data

      // Transformar estrutura do backend para o formato esperado pelo frontend
      return this._transformStatsData(data)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  /**
   * Transforma os dados de stats do backend para o formato esperado pelo frontend
   * @private
   */
  _transformStatsData(backendData) {
    // Estrutura esperada pelo DashboardStats.vue
    return {
      // Dados de pontos
      pontos: {
        total_mes_atual: backendData.geral?.total_pontos_registrados || 0,
        total_mes_anterior: 0, // Backend não fornece, usar 0
        total_geral: backendData.geral?.total_pontos_registrados || 0
      },

      // Dados de banco de horas
      banco_horas: {
        saldo_atual_minutos: this._formatarSaldoParaMinutos(backendData.banco_horas?.saldo_formato || '+00:00'),
        saldo_atual_formatado: backendData.banco_horas?.saldo_formato || '00:00',
        total_credito_mes: 0, // Backend não fornece detalhado por mês
        total_debito_mes: 0   // Backend não fornece detalhado por mês
      },

      // Dados de justificativas
      justificativas: {
        pendentes: backendData.geral?.justificativas_pendentes || 0,
        aprovadas_mes: 0, // Backend não fornece
        reprovadas_mes: 0  // Backend não fornece
      },

      // Tempo na empresa (não disponível no response atual, usar dias trabalhados como proxy)
      tempo_empresa_dias: backendData.mes_atual?.dias_trabalhados || 0,

      // Último ponto registrado
      ultimo_ponto: this._extractUltimoPonto(backendData.ultimos_registros)
    }
  }

  /**
   * Extrai o último ponto dos registros
   * @private
   */
  _extractUltimoPonto(registros) {
    if (!registros || registros.length === 0) {
      return null
    }

    const ultimo = registros[0]
    return {
      data: ultimo.data,
      tipo: ultimo.tipo,
      localidade: 'Local não disponível' // Backend não fornece localidade
    }
  }

  /**
   * Converte formato HH:MM ou +HH:MM para minutos
   * @private
   */
  _formatarSaldoParaMinutos(saldoFormato) {
    if (!saldoFormato) return 0

    // Remove o + ou - e split por :
    const isNegativo = saldoFormato.startsWith('-')
    const formatoLimpo = saldoFormato.replace(/[+-]/g, '')
    const [horas, minutos] = formatoLimpo.split(':').map(Number)

    let totalMinutos = (horas * 60) + (minutos || 0)
    return isNegativo ? -totalMinutos : totalMinutos
  }

  /**
   * 6. Obter Permissões do Usuário
   * Endpoint: GET /api/v1/profile/me/permissions
   * Retorna todas as permissões do usuário (baseadas no cargo)
   * @returns {Promise<Object>} Lista de permissões
   */
  async getPermissions() {
    try {
      const response = await api.get('/profile/me/permissions')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar permissões:', error)
      throw error
    }
  }

  /**
   * 7. Obter Calendário de Ponto Mensal
   * Endpoint: GET /api/v1/profile/me/calendar
   * Retorna calendário com todos os pontos do mês
   * @param {number} [mes] - Número do mês (1-12). Padrão: mês atual
   * @param {number} [ano] - Ano (ex: 2025). Padrão: ano atual
   * @returns {Promise<Object>} Calendário mensal com resumo transformado
   */
  async getCalendar(mes, ano) {
    try {
      const params = {}
      if (mes) params.mes = mes
      if (ano) params.ano = ano

      const response = await api.get('/profile/me/calendar', { params })
      return this._transformCalendarData(response.data)
    } catch (error) {
      console.error('Erro ao buscar calendário:', error)
      throw error
    }
  }

  /**
   * Transforma os dados de calendário do backend para o formato esperado pelo frontend
   * @private
   */
  _transformCalendarData(backendData) {
    if (!backendData || !backendData.dias) {
      return {
        mes: backendData?.mes,
        ano: backendData?.ano,
        dias: [],
        resumo: {
          total_dias_trabalhados: 0,
          total_dias_completos: 0,
          total_dias_incompletos: 0,
          saldo_total_minutos: 0,
          saldo_total_formatado: '00:00'
        }
      }
    }

    // Transformar cada dia
    const diasTransformados = backendData.dias.map(dia => {
      const status = this._mapearStatusDia(dia.status)
      return {
        data: this._criarDataFormatada(backendData.ano, backendData.mes, dia.dia),
        dia_semana: this._obterDiaSemana(backendData.ano, backendData.mes, dia.dia),
        tem_ponto: dia.status === 'trabalhado',
        total_pontos: 1, // Simplificado: se tem ponto registrado = 1
        primeiro_ponto: '00:00', // Backend não fornece detalhe de horários
        ultimo_ponto: null,       // Backend não fornece detalhe de horários
        saldo_dia_minutos: dia.horas_trabalhadas * 60,
        saldo_dia_formatado: this._formatarHoras(dia.horas_trabalhadas),
        status: status,
        original_status: dia.status
      }
    })

    // Calcular resumo
    const resumo = this._calcularResumoCalendario(diasTransformados, backendData)

    return {
      mes: backendData.mes,
      ano: backendData.ano,
      dias: diasTransformados,
      resumo: resumo
    }
  }

  /**
   * Mapeia o status do backend para o status esperado pelo frontend
   * @private
   */
  _mapearStatusDia(statusBackend) {
    const mapeamento = {
      'trabalhado': 'completo',
      'ausente': 'sem_ponto',
      'fim_de_semana': 'sem_ponto',
      'futuro': 'sem_ponto'
    }
    return mapeamento[statusBackend] || 'sem_ponto'
  }

  /**
   * Cria uma data formatada como YYYY-MM-DD
   * @private
   */
  _criarDataFormatada(ano, mes, dia) {
    return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  }

  /**
   * Obtém o dia da semana em português
   * @private
   */
  _obterDiaSemana(ano, mes, dia) {
    const date = new Date(ano, mes - 1, dia)
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return dias[date.getDay()]
  }

  /**
   * Formata horas (número decimal) para HH:MM
   * @private
   */
  _formatarHoras(horas) {
    if (!horas || horas === 0) return '00:00'
    const h = Math.floor(horas)
    const m = Math.round((horas - h) * 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  /**
   * Calcula o resumo do calendário
   * @private
   */
  _calcularResumoCalendario(diasTransformados, backendData) {
    const trabalhados = diasTransformados.filter(d => d.original_status === 'trabalhado')
    const totalDiasTrabalhados = trabalhados.length
    const totalSaldoMinutos = trabalhados.reduce((sum, d) => sum + d.saldo_dia_minutos, 0)

    return {
      total_dias_trabalhados: totalDiasTrabalhados,
      total_dias_completos: totalDiasTrabalhados, // Considerando que se tem ponto é completo
      total_dias_incompletos: 0, // Backend não fornece este detalhe
      saldo_total_minutos: totalSaldoMinutos,
      saldo_total_formatado: this._formatarMinutosParaHoras(totalSaldoMinutos)
    }
  }

  /**
   * Formata minutos para HH:MM
   * @private
   */
  _formatarMinutosParaHoras(minutos) {
    const h = Math.floor(Math.abs(minutos) / 60)
    const m = Math.abs(minutos) % 60
    const sinal = minutos < 0 ? '-' : '+'
    return `${sinal}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  /**
   * 8. Obter Atividades Recentes
   * Endpoint: GET /api/v1/profile/me/recent-activity
   * Retorna as últimas atividades do usuário
   * @param {number} [limit=10] - Número de atividades (padrão: 10, máximo: 50)
   * @returns {Promise<Object>} Lista de atividades recentes
   */
  async getRecentActivity(limit = 10) {
    try {
      const response = await api.get('/profile/me/recent-activity', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error)
      throw error
    }
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   * @param {string} permissionName - Nome da permissão (ex: "VER_SALDO_FUNCIONARIOS")
   * @returns {Promise<boolean>} True se tem a permissão
   */
  async hasPermission(permissionName) {
    try {
      const data = await this.getPermissions()
      const permissions = data.permissoes || []
      return permissions.some(p => p.nome === permissionName)
    } catch (error) {
      console.error('Erro ao verificar permissão:', error)
      return false
    }
  }

  /**
   * 9. Listar Todas as Permissões Disponíveis
   * Endpoint: GET /api/v1/permissoes
   * Retorna todas as permissões cadastradas no sistema
   * @returns {Promise<Array>} Lista de permissões
   */
  async listAllPermissions() {
    try {
      const response = await api.get('/permissoes')
      return response.data
    } catch (error) {
      console.error('Erro ao listar permissões:', error)
      throw error
    }
  }

  /**
   * 10. Listar Permissões de um Cargo
   * Endpoint: GET /api/v1/cargos/:id/permissoes
   * Requer permissão: GERENCIAR_CARGOS
   * @param {number} cargoId - ID do cargo
   * @returns {Promise<Array>} Lista de permissões do cargo
   */
  async getCargoPermissions(cargoId) {
    try {
      const response = await api.get(`/cargos/${cargoId}/permissoes`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar permissões do cargo:', error)
      throw error
    }
  }

  /**
   * 11. Atribuir Permissão a um Cargo
   * Endpoint: POST /api/v1/cargos/:id/permissoes/:permissaoId
   * Requer permissão: GERENCIAR_CARGOS
   * @param {number} cargoId - ID do cargo
   * @param {number} permissaoId - ID da permissão
   * @returns {Promise<Object>} Confirmação
   */
  async addPermissionToCargo(cargoId, permissaoId) {
    try {
      const response = await api.post(`/cargos/${cargoId}/permissoes/${permissaoId}`)
      return response.data
    } catch (error) {
      console.error('Erro ao adicionar permissão ao cargo:', error)
      throw error
    }
  }

  /**
   * 12. Remover Permissão de um Cargo
   * Endpoint: DELETE /api/v1/cargos/:id/permissoes/:permissaoId
   * Requer permissão: GERENCIAR_CARGOS
   * @param {number} cargoId - ID do cargo
   * @param {number} permissaoId - ID da permissão
   * @returns {Promise<Object>} Confirmação
   */
  async removePermissionFromCargo(cargoId, permissaoId) {
    try {
      const response = await api.delete(`/cargos/${cargoId}/permissoes/${permissaoId}`)
      return response.data
    } catch (error) {
      console.error('Erro ao remover permissão do cargo:', error)
      throw error
    }
  }
}

// Exporta uma instância única do serviço (Singleton)
export default new ProfileService()
