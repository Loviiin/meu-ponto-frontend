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

  // ====== MÉTODOS AUXILIARES DE CACHE (Frontend) ======

  /**
   * Busca perfil com cache (LocalStorage)
   * Cache de 15 minutos conforme recomendação do guia
   * @returns {Promise<Object>} Dados do perfil (do cache ou API)
   */
  async getProfileCached() {
    const cached = localStorage.getItem('userCache')
    
    if (cached) {
      const { user, timestamp, expiresIn } = JSON.parse(cached)
      
      // Cache ainda válido?
      if (Date.now() - timestamp < expiresIn) {
        console.log('✅ Cache HIT - Profile (0ms)')
        return user
      }
    }
    
    // Cache expirado - buscar da API
    console.log('⚠️ Cache MISS - Profile')
    const profile = await this.getProfile()
    
    // Atualizar cache (15 minutos)
    localStorage.setItem('userCache', JSON.stringify({
      user: profile,
      timestamp: Date.now(),
      expiresIn: 15 * 60 * 1000 // 15 minutos
    }))
    
    return profile
  }

  /**
   * Invalida o cache do perfil
   * Deve ser chamado após logout ou atualização de perfil
   */
  clearCache() {
    localStorage.removeItem('userCache')
    localStorage.removeItem('permissions')
    console.log('🗑️ Cache limpo')
  }

  /**
   * Busca permissões com cache (30 minutos)
   * @returns {Promise<Object>} Permissões (do cache ou API)
   */
  async getPermissionsCached() {
    const cached = localStorage.getItem('permissionsCache')
    
    if (cached) {
      const { permissions, timestamp, expiresIn } = JSON.parse(cached)
      
      if (Date.now() - timestamp < expiresIn) {
        console.log('✅ Cache HIT - Permissions (0ms)')
        return permissions
      }
    }
    
    console.log('⚠️ Cache MISS - Permissions')
    const permissions = await this.getPermissions()
    
    // Atualizar cache (30 minutos)
    localStorage.setItem('permissionsCache', JSON.stringify({
      permissions,
      timestamp: Date.now(),
      expiresIn: 30 * 60 * 1000 // 30 minutos
    }))
    
    return permissions
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   * @param {string} permissionName - Nome da permissão (ex: "VER_SALDO_FUNCIONARIOS")
   * @returns {Promise<boolean>} True se tem a permissão
   */
  async hasPermission(permissionName) {
    try {
      const data = await this.getPermissionsCached()
      const permissions = data.permissoes || []
      return permissions.some(p => p.nome === permissionName)
    } catch (error) {
      console.error('Erro ao verificar permissão:', error)
      return false
    }
  }
}

// Exporta uma instância única do serviço (Singleton)
export default new ProfileService()
