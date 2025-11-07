<template>
  <div class="profile-page">
    <div class="container py-4">
      <h2 class="mb-4"><i class="bi bi-person-circle me-2"></i>Meu Perfil</h2>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
      </div>

      <!-- Profile Content -->
      <div v-else-if="profile" class="row g-4">
        <!-- Left Column - Avatar and Basic Info -->
        <div class="col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body text-center">
              <div class="avatar-container mb-3">
                <!-- Avatar com foto ou iniciais -->
                <div class="avatar-wrapper">
                  <img 
                    v-if="profile.avatar"
                    :src="profile.avatar" 
                    :alt="profile.nome"
                    class="avatar-image"
                    @error="handleImageError"
                  />
                  <div v-else class="avatar-initials">
                    {{ getInitials(profile.nome) }}
                  </div>
                </div>
                <label for="avatar-upload" class="avatar-upload-btn" title="Alterar foto">
                  <i class="bi bi-camera-fill"></i>
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  @change="handleAvatarUpload"
                  style="display: none"
                />
              </div>
              <h4 class="mb-1">{{ profile.nome }}</h4>
              <p class="text-muted mb-2">{{ profile.cargo?.nome || 'Sem cargo' }}</p>
              <p class="text-muted small mb-0">
                <i class="bi bi-building me-1"></i>{{ profile.empresa?.nome }}
              </p>
              <hr class="my-3">
              <div class="d-flex justify-content-around text-center">
                <div>
                  <div class="fw-bold text-primary">{{ stats?.tempo_empresa_dias || 0 }}</div>
                  <small class="text-muted">Dias na empresa</small>
                </div>
                <div>
                  <div class="fw-bold text-success">{{ stats?.pontos?.total_mes_atual || 0 }}</div>
                  <small class="text-muted">Pontos este mês</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="card shadow-sm mt-3">
            <div class="card-header bg-primary text-white">
              <i class="bi bi-graph-up me-2"></i>Estatísticas
            </div>
            <div class="card-body">
              <div class="stat-item">
                <span class="stat-label">Banco de Horas:</span>
                <span class="stat-value" :class="{'text-success': stats?.banco_horas?.saldo_atual_minutos >= 0, 'text-danger': stats?.banco_horas?.saldo_atual_minutos < 0}">
                  {{ stats?.banco_horas?.saldo_atual_formatado || '00:00' }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Justificativas Pendentes:</span>
                <span class="stat-value badge bg-warning">{{ stats?.justificativas?.pendentes || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total de Pontos:</span>
                <span class="stat-value">{{ stats?.pontos?.total_geral || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Details and Forms -->
        <div class="col-lg-8">
          <!-- Tabs -->
          <ul class="nav nav-tabs mb-3" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#info-tab" type="button">
                <i class="bi bi-info-circle me-1"></i>Informações
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" data-bs-toggle="tab" data-bs-target="#edit-tab" type="button">
                <i class="bi bi-pencil me-1"></i>Editar
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" data-bs-toggle="tab" data-bs-target="#password-tab" type="button">
                <i class="bi bi-key me-1"></i>Senha
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" data-bs-toggle="tab" data-bs-target="#activity-tab" type="button" @click="loadRecentActivity">
                <i class="bi bi-clock-history me-1"></i>Atividades
              </button>
            </li>
          </ul>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Info Tab -->
            <div class="tab-pane fade show active" id="info-tab">
              <div class="card shadow-sm">
                <div class="card-body">
                  <h5 class="card-title mb-3">Informações Pessoais</h5>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted small">Nome Completo</label>
                      <p class="fw-bold">{{ profile.nome }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small">Email</label>
                      <p class="fw-bold">{{ profile.email }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small">CPF</label>
                      <p class="fw-bold">{{ profile.cpf }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small">Telefone</label>
                      <p class="fw-bold">{{ formatPhoneDisplay(profile.telefone) }}</p>
                    </div>
                  </div>

                  <hr class="my-4">

                  <h5 class="card-title mb-3">Contrato</h5>
                  <div class="row g-3" v-if="profile.contrato">
                    <div class="col-md-6">
                      <label class="form-label text-muted small">Tipo de Contrato</label>
                      <p class="fw-bold">{{ profile.contrato.tipo_contrato || 'Não informado' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small">Data de Início</label>
                      <p class="fw-bold">{{ formatDate(profile.contrato.data_inicio) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small">Carga Horária Semanal</label>
                      <p class="fw-bold">{{ minutesToHours(profile.contrato.carga_horaria_semanal) }}h</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small">Carga Horária Mensal</label>
                      <p class="fw-bold">{{ minutesToHours(profile.contrato.carga_horaria_mensal) }}h</p>
                    </div>
                    <div class="col-12" v-if="profile.contrato.localidade">
                      <label class="form-label text-muted small">Localidade</label>
                      <p class="fw-bold">
                        <i class="bi bi-geo-alt me-1"></i>{{ profile.contrato.localidade.nome }}
                        <br><small class="text-muted">{{ profile.contrato.localidade.endereco_completo }}</small>
                      </p>
                    </div>
                  </div>
                  <p v-else class="text-muted">Nenhum contrato vinculado</p>

                  <hr class="my-4" v-if="profile.permissoes && profile.permissoes.length > 0">

                  <h5 class="card-title mb-3" v-if="profile.permissoes && profile.permissoes.length > 0">Permissões</h5>
                  <div class="d-flex flex-wrap gap-2" v-if="profile.permissoes && profile.permissoes.length > 0">
                    <span 
                      v-for="permissao in profile.permissoes" 
                      :key="permissao.id"
                      class="badge bg-secondary"
                      :title="permissao.descricao"
                    >
                      {{ permissao.nome }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Edit Tab -->
            <div class="tab-pane fade" id="edit-tab">
              <div class="card shadow-sm">
                <div class="card-body">
                  <h5 class="card-title mb-3">Editar Perfil</h5>
                  <form @submit.prevent="updateProfile">
                    <div class="mb-3">
                      <label for="nome" class="form-label">Nome Completo</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="nome" 
                        v-model="editForm.nome"
                        required
                      />
                    </div>
                    <div class="mb-3">
                      <label for="email" class="form-label">Email</label>
                      <input 
                        type="email" 
                        class="form-control" 
                        id="email" 
                        v-model="editForm.email"
                        @blur="handleEmailBlur"
                        placeholder="seu@email.com"
                        required
                      />
                      <small v-if="emailError" class="text-danger d-block mt-1">{{ emailError }}</small>
                      <small v-else class="form-text">
                        <i class="bi bi-info-circle me-1"></i>
                        Seu email será normalizado automaticamente
                      </small>
                    </div>
                    <div class="mb-3">
                      <label for="telefone" class="form-label">Telefone</label>
                      <input 
                        type="tel" 
                        class="form-control" 
                        id="telefone" 
                        v-model="editForm.telefone"
                        @input="handlePhoneInput"
                        placeholder="(00) 00000-0000"
                        maxlength="15"
                      />
                      <small v-if="phoneError" class="text-danger d-block mt-1">{{ phoneError }}</small>
                    </div>
                    <div class="alert alert-info small">
                      <i class="bi bi-info-circle me-1"></i>
                      CPF não pode ser alterado. Para alterá-lo, entre em contato com o administrador.
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="updating || !!emailError || !!phoneError">
                      <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="bi bi-check-lg me-1"></i>
                      Salvar Alterações
                    </button>
                    <small v-if="emailError || phoneError" class="text-danger d-block mt-2">
                      Corrija os erros acima para salvar
                    </small>
                  </form>
                </div>
              </div>
            </div>

            <!-- Password Tab -->
            <div class="tab-pane fade" id="password-tab">
              <div class="card shadow-sm">
                <div class="card-body">
                  <h5 class="card-title mb-3">Alterar Senha</h5>
                  <form @submit.prevent="changePassword">
                    <div class="mb-3">
                      <label for="senha_atual" class="form-label">Senha Atual</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        id="senha_atual" 
                        v-model="passwordForm.senha_atual"
                        required
                      />
                    </div>
                    <div class="mb-3">
                      <label for="senha_nova" class="form-label">Nova Senha</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        id="senha_nova" 
                        v-model="passwordForm.senha_nova"
                        required
                        minlength="8"
                      />
                      <PasswordStrengthIndicator :senha="passwordForm.senha_nova" />
                      <div class="form-text">Mínimo de 8 caracteres, com maiúscula, minúscula e número</div>
                    </div>
                    <div class="mb-3">
                      <label for="confirmar_senha" class="form-label">Confirmar Nova Senha</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        id="confirmar_senha" 
                        v-model="passwordForm.confirmar_senha"
                        required
                        minlength="8"
                      />
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="changingPassword">
                      <span v-if="changingPassword" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="bi bi-shield-lock me-1"></i>
                      Alterar Senha
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <!-- Activity Tab -->
            <div class="tab-pane fade" id="activity-tab">
              <div class="card shadow-sm">
                <div class="card-body">
                  <h5 class="card-title mb-3">Atividades Recentes</h5>
                  
                  <div v-if="loadingActivity" class="text-center py-3">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Carregando...</span>
                    </div>
                  </div>

                  <div v-else-if="activities.length === 0" class="text-center text-muted py-3">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">Nenhuma atividade recente</p>
                  </div>

                  <div v-else class="activity-timeline">
                    <div 
                      v-for="activity in activities" 
                      :key="activity.id"
                      class="activity-item"
                    >
                      <div class="activity-icon" :class="getActivityIconClass(activity.tipo)">
                        <i :class="getActivityIcon(activity.tipo)"></i>
                      </div>
                      <div class="activity-content">
                        <div class="activity-description">{{ activity.descricao }}</div>
                        <div class="activity-date text-muted small">
                          {{ formatDateTime(activity.data) }}
                        </div>
                        <div v-if="activity.detalhes" class="activity-details small text-muted">
                          <span v-for="(value, key) in activity.detalhes" :key="key" class="me-2">
                            <strong>{{ key }}:</strong> {{ value }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProfileService from '../services/ProfileService'
import { toast } from '../toast'
import { onlyDigits, formatPhoneBR, validarTelefoneBR, validarSenhaForte, normalizeEmail, validateEmail } from '../utils/validators'
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator.vue'

const profile = ref(null)
const stats = ref(null)
const activities = ref([])
const loading = ref(true)
const loadingActivity = ref(false)
const updating = ref(false)
const changingPassword = ref(false)
const error = ref(null)
const isInitialized = ref(false) // Previne múltiplos carregamentos
const phoneError = ref('')
const emailError = ref('')

const editForm = ref({
  nome: '',
  email: '',
  telefone: ''
})

const passwordForm = ref({
  senha_atual: '',
  senha_nova: '',
  confirmar_senha: ''
})

// Validar e formatar telefone
const handlePhoneInput = (event) => {
  const value = event.target.value
  const digits = onlyDigits(value)
  const formatted = formatPhoneBR(value)
  editForm.value.telefone = formatted
  
  // Apenas validar se tiver digitado algo
  if (digits.length > 0 && digits.length < 11) {
    phoneError.value = 'Telefone deve ter 11 dígitos'
  } else if (digits.length > 0 && !validarTelefoneBR(value)) {
    const ddd = parseInt(digits.substring(0, 2))
    if (ddd < 11 || ddd > 99) {
      phoneError.value = 'DDD inválido (deve ser entre 11 e 99)'
    } else if (digits[2] !== '9') {
      phoneError.value = 'Número de celular deve começar com 9'
    } else {
      phoneError.value = 'Telefone inválido'
    }
  } else {
    phoneError.value = ''
  }
}

// Validar email
const handleEmailBlur = () => {
  if (!editForm.value.email || editForm.value.email.trim() === '') {
    emailError.value = 'Email é obrigatório'
    return
  }
  
  // Normalizar email
  editForm.value.email = normalizeEmail(editForm.value.email)
  
  // Validar formato
  if (!validateEmail(editForm.value.email)) {
    emailError.value = 'Formato de email inválido'
    return
  }
  
  // Limpar erro se está tudo OK
  emailError.value = ''
}

// Load profile data with cache
const loadProfile = async () => {
  // Previne múltiplos carregamentos simultâneos
  if (loading.value && isInitialized.value) return
  
  try {
    loading.value = true
    profile.value = await ProfileService.getProfile()
    console.log('Profile loaded:', profile.value)
    
    // Populate edit form
    editForm.value.nome = profile.value.nome
    editForm.value.email = profile.value.email || ''
    editForm.value.telefone = profile.value.telefone || ''
    
    // Limpar erros ao carregar
    emailError.value = ''
    phoneError.value = ''
    
    error.value = null
    isInitialized.value = true
  } catch (err) {
    console.error('Error loading profile:', err)
    error.value = err.response?.data?.error || 'Erro ao carregar perfil'
    toast.error('Erro ao carregar perfil')
  } finally {
    loading.value = false
  }
}

// Load stats
const loadStats = async () => {
  try {
    stats.value = await ProfileService.getStats()
  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err)
  }
}

// Load recent activity
const loadRecentActivity = async () => {
  try {
    loadingActivity.value = true
    const data = await ProfileService.getRecentActivity(10)
    activities.value = data.atividades || []
  } catch (err) {
    console.error('Erro ao carregar atividades:', err)
    toast.error('Erro ao carregar atividades')
  } finally {
    loadingActivity.value = false
  }
}

// Update profile
const updateProfile = async () => {
  console.log('Update profile called')
  console.log('Errors:', { emailError: emailError.value, phoneError: phoneError.value })
  
  try {
    updating.value = true
    
    // Enviar apenas campos que foram preenchidos/alterados
    const updateData = {}
    if (editForm.value.nome && editForm.value.nome.trim()) {
      updateData.nome = editForm.value.nome.trim()
    }
    if (editForm.value.email && editForm.value.email.trim()) {
      updateData.email = normalizeEmail(editForm.value.email.trim())
    }
    if (editForm.value.telefone && editForm.value.telefone.trim()) {
      updateData.telefone = editForm.value.telefone.trim()
    }
    
    console.log('Data to send:', updateData)
    
    // Não enviar se não houver nada para atualizar
    if (Object.keys(updateData).length === 0) {
      toast.warning('Nenhuma alteração para salvar')
      updating.value = false
      return
    }
    
    await ProfileService.updateProfile(updateData)
    console.log('Profile updated successfully')
    
    toast.success('Perfil atualizado com sucesso!')
    await loadProfile()
  } catch (err) {
    console.error('Error updating profile:', err)
    const errorMsg = err.response?.data?.error || 'Erro ao atualizar perfil'
    
    // Tratar erro de email duplicado
    if (errorMsg.includes('email já está em uso')) {
      emailError.value = 'Este email já está sendo usado por outro usuário'
      toast.error('Email já está em uso. Tente outro.')
    } else {
      toast.error(errorMsg)
    }
  } finally {
    updating.value = false
  }
}

// Change password
const changePassword = async () => {
  // Verificar se todos os campos foram preenchidos
  if (!passwordForm.value.senha_atual || !passwordForm.value.senha_nova || !passwordForm.value.confirmar_senha) {
    toast.error('Preencha todos os campos de senha')
    return
  }

  if (passwordForm.value.senha_nova !== passwordForm.value.confirmar_senha) {
    toast.error('As senhas não coincidem')
    return
  }

  // Validar força da senha
  const senhaValidacao = validarSenhaForte(passwordForm.value.senha_nova)
  if (!senhaValidacao.valido) {
    toast.error(senhaValidacao.erros[0])
    return
  }

  try {
    changingPassword.value = true
    await ProfileService.changePassword(passwordForm.value)
    toast.success('Senha alterada com sucesso!')
    
    // Clear form
    passwordForm.value = {
      senha_atual: '',
      senha_nova: '',
      confirmar_senha: ''
    }
  } catch (err) {
    toast.error(err.response?.data?.error || 'Erro ao alterar senha')
  } finally {
    changingPassword.value = false
  }
}

// Handle avatar upload
const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    // ProfileService já faz as validações de tamanho (5MB) e tipo de arquivo
    const response = await ProfileService.uploadAvatar(file)
    
    toast.success('Avatar atualizado com sucesso!')
    
    // Update avatar in profile
    if (profile.value) {
      profile.value.avatar = response.avatar_url
    }
  } catch (err) {
    // ProfileService já retorna mensagens de erro descritivas
    toast.error(err.message || err.response?.data?.error || 'Erro ao fazer upload do avatar')
  }
}

// Handle image error - remove broken image and show initials
const handleImageError = (event) => {
  profile.value.avatar = null // Remove avatar quebrado para mostrar iniciais
}

// Get user initials for avatar
const getInitials = (nome) => {
  if (!nome) return '?'
  const words = nome.trim().split(' ').filter(w => w.length > 0)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

// Format date time
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR')
}

// Convert minutes to hours
const minutesToHours = (minutes) => {
  if (!minutes) return 0
  return (minutes / 60).toFixed(1)
}

// Format phone for display
const formatPhoneDisplay = (phone) => {
  if (!phone) return 'Não informado'
  
  // Remove tudo que não é dígito
  const digits = phone.replace(/\D/g, '')
  
  // Se já está formatado, retorna como está
  if (phone.includes('(') && phone.includes(')')) {
    return phone
  }
  
  // Formatar: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (digits.length === 11) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`
  } else if (digits.length === 10) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`
  }
  
  // Se não tem formato válido, retorna como está
  return phone || 'Não informado'
}

// Get activity icon
const getActivityIcon = (tipo) => {
  const icons = {
    ponto: 'bi bi-clock-fill',
    justificativa: 'bi bi-file-text-fill',
    banco_horas: 'bi bi-piggy-bank-fill',
    perfil: 'bi bi-person-fill'
  }
  return icons[tipo] || 'bi bi-circle-fill'
}

// Get activity icon class
const getActivityIconClass = (tipo) => {
  const classes = {
    ponto: 'bg-primary',
    justificativa: 'bg-warning',
    banco_horas: 'bg-success',
    perfil: 'bg-info'
  }
  return classes[tipo] || 'bg-secondary'
}

onMounted(() => {
  loadProfile()
  loadStats()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding-top: 80px;
  padding-bottom: 40px;
}

/* Glass Card Effect - igual ao resto do projeto */
.card {
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
}

.card-header {
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px 20px 0 0 !important;
  color: white;
}

.card-body {
  color: rgba(255, 255, 255, 0.9);
}

/* Avatar */
.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(212, 175, 55, 0.6);
  box-shadow: 0 8px 16px rgba(212, 175, 55, 0.3);
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #696000);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px solid rgba(0, 0, 36, 0.8);
  transition: all 0.3s;
}

.avatar-upload-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.5);
}

/* Avatar Wrapper */
.avatar-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.avatar-initials {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: rgba(0, 0, 36, 0.9);
  text-transform: uppercase;
  letter-spacing: 2px;
  border: 3px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

/* Stats */
.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.stat-value {
  font-weight: 600;
  color: #d4af37;
}

/* Activity Timeline */
.activity-timeline {
  position: relative;
  padding-left: 30px;
}

.activity-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.5), transparent);
}

.activity-item {
  position: relative;
  padding-bottom: 1.5rem;
  margin-bottom: 1rem;
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-icon {
  position: absolute;
  left: -30px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  border: 2px solid rgba(0, 0, 36, 0.8);
}

.activity-content {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.activity-description {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: white;
}

.activity-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.activity-details {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

/* Tabs */
.nav-tabs {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.nav-tabs .nav-link {
  color: rgba(255, 255, 255, 0.6);
  border: none;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.nav-tabs .nav-link:hover {
  color: #d4af37;
  border-bottom-color: rgba(212, 175, 55, 0.5);
}

.nav-tabs .nav-link.active {
  color: #d4af37;
  background: transparent;
  border-bottom-color: #d4af37;
}

/* Forms */
.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.form-control {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  transition: all 0.3s;
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: #d4af37;
  box-shadow: 0 0 0 0.2rem rgba(212, 175, 55, 0.25);
  color: white;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-text {
  color: rgba(255, 255, 255, 0.6);
}

/* Badges */
.badge {
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.badge.bg-warning {
  background: linear-gradient(135deg, #f39c12, #e67e22) !important;
}

.badge.bg-secondary {
  background: rgba(255, 255, 255, 0.2) !important;
}

/* Alerts */
.alert {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 12px;
}

.alert-info {
  background: rgba(52, 152, 219, 0.2);
  border-color: rgba(52, 152, 219, 0.4);
}

.alert-danger {
  background: rgba(231, 76, 60, 0.2);
  border-color: rgba(231, 76, 60, 0.4);
}

/* Text Colors */
.text-muted {
  color: rgba(255, 255, 255, 0.6) !important;
}

.text-primary {
  color: #d4af37 !important;
}

.text-success {
  color: #2ecc71 !important;
}

.text-danger {
  color: #e74c3c !important;
}

.fw-bold {
  color: white;
}

/* Headings */
h2, h4, h5, .card-title {
  color: white;
  background: linear-gradient(90deg, #d4af37, #fff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #d4af37, #696000);
  border: none;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  transform: none;
}

/* Spinner */
.spinner-border {
  border-color: #d4af37;
  border-right-color: transparent;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-page {
    padding-top: 60px;
  }
  
  .avatar-image {
    width: 120px;
    height: 120px;
  }
}

/* Light Mode Styles */
body.light-mode .card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(105, 96, 0, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: #333333;
}

body.light-mode .card-header {
  background: rgba(255, 215, 0, 0.15);
  border-bottom-color: rgba(105, 96, 0, 0.15);
  color: #333333;
}

body.light-mode .card-body {
  color: #333333;
}

body.light-mode .avatar-image {
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 8px 16px rgba(255, 215, 0, 0.3);
}

body.light-mode .avatar-upload-btn {
  background: linear-gradient(135deg, #FFD700, #696000);
  border-color: rgba(255, 255, 255, 0.8);
}

body.light-mode .avatar-upload-btn:hover {
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
}

body.light-mode .avatar-initials {
  background: linear-gradient(135deg, #FFD700, #696000);
  border-color: rgba(255, 215, 0, 0.6);
}

body.light-mode .form-label {
  color: #333333;
}

body.light-mode .form-control {
  background: #FFFFFF;
  border-color: rgba(105, 96, 0, 0.2);
  color: #333333;
}

body.light-mode .form-control:disabled,
body.light-mode .form-control[readonly] {
  background: rgba(248, 248, 248, 0.8);
  color: #666666;
}

body.light-mode .btn-outline-warning {
  border-color: #FFD700;
  color: #696000;
}

body.light-mode .btn-outline-warning:hover {
  background: #FFD700;
  border-color: #FFD700;
  color: #333333;
}

body.light-mode .btn-outline-warning:hover {
  background: #FFD700;
  border-color: #FFD700;
  color: #333333;
}

body.light-mode .stat-item {
  border-bottom-color: rgba(105, 96, 0, 0.1);
}

body.light-mode .stat-label {
  color: #666666;
}

body.light-mode .stat-value {
  color: #696000;
  font-weight: 700;
}

body.light-mode .activity-timeline::before {
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.5), transparent);
}

body.light-mode .activity-content {
  background: rgba(255, 215, 0, 0.08);
  border-color: rgba(105, 96, 0, 0.15);
}

body.light-mode .activity-description {
  color: #333333;
}

body.light-mode .activity-date {
  color: #666666;
}

body.light-mode .activity-details {
  border-top-color: rgba(105, 96, 0, 0.15);
  color: #666666;
}

body.light-mode .nav-tabs {
  border-bottom-color: rgba(105, 96, 0, 0.2);
}

body.light-mode .nav-tabs .nav-link {
  color: #666666;
}

body.light-mode .nav-tabs .nav-link.active {
  color: #696000;
  border-bottom-color: #FFD700;
}

body.light-mode .nav-tabs .nav-link:hover {
  color: #696000;
}

body.light-mode h4 {
  color: #333333 !important;
}

body.light-mode p.fw-bold {
  color: #333333 !important;
}

body.light-mode .text-muted {
  color: #666666 !important;
}

body.light-mode .fw-bold.text-primary {
  color: #696000 !important;
}

body.light-mode .fw-bold.text-success {
  color: #28a745 !important;
}

body.light-mode small.text-muted {
  color: #888888 !important;
}

body.light-mode .spinner-border {
  border-color: #FFD700;
  border-right-color: transparent;
}
</style>
