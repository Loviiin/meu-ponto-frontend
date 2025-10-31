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
   * Endpoint: PUT /api/v1/profile/me
   * Atualiza informações editáveis do perfil (nome e telefone)
   * @param {Object} data - Dados a serem atualizados
   * @param {string} [data.nome] - Nome completo do usuário
   * @param {string} [data.telefone] - Telefone do usuário
   * @returns {Promise<Object>} Perfil completo atualizado
   */
  async updateProfile(data) {
    try {
      const response = await api.put('/profile/me', data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  }

  /**
   * 3. Alterar Senha
   * Endpoint: PUT /api/v1/profile/me/password
   * Permite o usuário alterar sua própria senha
   * @param {Object} data - Dados da alteração de senha
   * @param {string} data.senha_atual - Senha atual (obrigatório)
   * @param {string} data.senha_nova - Nova senha (mínimo 6 caracteres)
   * @param {string} data.confirmar_senha - Confirmação da nova senha
   * @returns {Promise<Object>} Mensagem de sucesso
   */
  async changePassword(data) {
    try {
      const response = await api.put('/profile/me/password', data)
      return response.data
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
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
   * @returns {Promise<Object>} Dashboard de estatísticas
   */
  async getStats() {
    try {
      const response = await api.get('/profile/me/stats')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
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
   * @returns {Promise<Object>} Calendário mensal com resumo
   */
  async getCalendar(mes, ano) {
    try {
      const params = {}
      if (mes) params.mes = mes
      if (ano) params.ano = ano

      const response = await api.get('/profile/me/calendar', { params })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar calendário:', error)
      throw error
    }
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
      console.log(`[ProfileService] Buscando permissões do cargo ${cargoId}`)
      const response = await api.get(`/cargos/${cargoId}/permissoes`)
      console.log('[ProfileService] Resposta recebida:', response.data)
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
      console.log(`[ProfileService] Atribuindo permissão ${permissaoId} ao cargo ${cargoId}`)
      const response = await api.post(`/cargos/${cargoId}/permissoes/${permissaoId}`)
      console.log('[ProfileService] Permissão atribuída:', response.data)
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
