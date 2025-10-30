<template>
  <div class="profile-page-complete">
    <div class="container py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="bi bi-person-circle me-2"></i>Meu Perfil</h2>
        <button class="btn btn-outline-danger" @click="handleLogout">
          <i class="bi bi-box-arrow-right me-2"></i>Sair
        </button>
      </div>

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
      <div v-else class="row g-4">
        
        <!-- Left Column - Avatar and Basic Info -->
        <div class="col-lg-4">
          <!-- Avatar Card -->
          <div class="card shadow-sm mb-3">
            <div class="card-body text-center">
              <div class="avatar-wrapper mb-3 position-relative">
                <img 
                  v-if="profile?.avatar"
                  :src="profile.avatar" 
                  :alt="profile?.nome"
                  class="avatar-image rounded-circle"
                  style="width: 150px; height: 150px; object-fit: cover;"
                  @error="handleImageError"
                />
                <div v-else class="avatar-initials" style="width: 150px; height: 150px;">
                  {{ getInitials(profile?.nome) }}
                </div>
                <label 
                  for="avatar-upload" 
                  class="position-absolute bottom-0 end-0 btn btn-primary btn-sm rounded-circle"
                  style="width: 40px; height: 40px; padding: 8px;"
                  title="Alterar foto"
                  :disabled="uploadingAvatar"
                >
                  <i class="bi bi-camera-fill"></i>
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  @change="handleAvatarUpload"
                  style="display: none"
                  :disabled="uploadingAvatar"
                />
              </div>
              
              <div v-if="uploadingAvatar" class="mb-2">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Enviando...</span>
                </div>
                <small class="d-block text-muted">Enviando avatar...</small>
              </div>

              <h4 class="mb-1">{{ profile?.nome }}</h4>
              <p class="text-muted mb-2">{{ profile?.cargo?.nome || 'Sem cargo' }}</p>
              <p class="text-muted small mb-3">
                <i class="bi bi-building me-1"></i>{{ profile?.empresa?.nome }}
              </p>

              <hr>

              <!-- Quick Stats -->
              <div class="row text-center g-3">
                <div class="col-6">
                  <div class="fw-bold text-primary h5 mb-0">{{ stats?.tempo_empresa_dias || 0 }}</div>
                  <small class="text-muted">Dias na empresa</small>
                </div>
                <div class="col-6">
                  <div class="fw-bold text-success h5 mb-0">{{ stats?.pontos?.total_mes_atual || 0 }}</div>
                  <small class="text-muted">Pontos este mês</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <i class="bi bi-graph-up me-2"></i>Estatísticas
            </div>
            <div class="card-body">
              <div class="mb-3">
                <small class="text-muted d-block mb-1">Banco de Horas</small>
                <h5 :class="getBancoHorasClass()">
                  {{ stats?.banco_horas?.saldo_atual_formatado || '00:00' }}
                </h5>
              </div>

              <div class="mb-3">
                <small class="text-muted d-block mb-1">Justificativas</small>
                <div class="d-flex justify-content-between">
                  <span class="badge bg-warning">{{ stats?.justificativas?.pendentes || 0 }} Pendentes</span>
                  <span class="badge bg-success">{{ stats?.justificativas?.aprovadas_mes || 0 }} Aprovadas</span>
                  <span class="badge bg-danger">{{ stats?.justificativas?.reprovadas_mes || 0 }} Reprovadas</span>
                </div>
              </div>

              <div v-if="stats?.ultimo_ponto">
                <small class="text-muted d-block mb-1">Último Ponto</small>
                <p class="mb-0 small">
                  <i class="bi bi-clock me-1"></i>{{ formatDateTime(stats.ultimo_ponto.data) }}
                  <br>
                  <i class="bi bi-geo-alt me-1"></i>{{ stats.ultimo_ponto.localidade }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Tabs -->
        <div class="col-lg-8">
          <!-- Tabs Navigation -->
          <ul class="nav nav-tabs mb-3" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link active" 
                :class="{ active: activeTab === 'info' }"
                @click="activeTab = 'info'"
              >
                <i class="bi bi-info-circle me-1"></i>Informações
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'calendario' }"
                @click="activeTab = 'calendario'"
              >
                <i class="bi bi-calendar3 me-1"></i>Calendário
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'atividades' }"
                @click="activeTab = 'atividades'"
              >
                <i class="bi bi-clock-history me-1"></i>Atividades
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'senha' }"
                @click="activeTab = 'senha'"
              >
                <i class="bi bi-key me-1"></i>Senha
              </button>
            </li>
          </ul>

          <!-- Tab Content -->
          <div class="tab-content">
            
            <!-- Tab 1: Informações -->
            <div v-show="activeTab === 'info'" class="tab-pane fade show active">
              <div class="card shadow-sm">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <span><i class="bi bi-person me-2"></i>Informações Pessoais</span>
                  <button 
                    v-if="!editingProfile" 
                    class="btn btn-sm btn-outline-primary"
                    @click="startEditProfile"
                  >
                    <i class="bi bi-pencil me-1"></i>Editar
                  </button>
                </div>
                <div class="card-body">
                  <form @submit.prevent="saveProfile">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Nome Completo</label>
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="profileForm.nome"
                          :disabled="!editingProfile"
                        />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Email</label>
                        <input 
                          type="email" 
                          class="form-control" 
                          :value="profile?.email"
                          disabled
                        />
                        <small class="text-muted">Email não pode ser alterado</small>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">CPF</label>
                        <input 
                          type="text" 
                          class="form-control" 
                          :value="profile?.cpf"
                          disabled
                        />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Telefone</label>
                        <input 
                          type="tel" 
                          class="form-control" 
                          v-model="profileForm.telefone"
                          :disabled="!editingProfile"
                        />
                      </div>
                    </div>

                    <div v-if="editingProfile" class="mt-3 d-flex gap-2">
                      <button type="submit" class="btn btn-primary" :disabled="savingProfile">
                        <span v-if="savingProfile" class="spinner-border spinner-border-sm me-1"></span>
                        <i v-else class="bi bi-check-lg me-1"></i>
                        Salvar
                      </button>
                      <button type="button" class="btn btn-secondary" @click="cancelEditProfile">
                        <i class="bi bi-x-lg me-1"></i>Cancelar
                      </button>
                    </div>
                  </form>

                  <hr class="my-4">

                  <!-- Contrato Info -->
                  <h6 class="mb-3"><i class="bi bi-file-text me-2"></i>Informações do Contrato</h6>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <small class="text-muted d-block">Tipo de Contrato</small>
                      <strong>{{ profile?.contrato?.tipo_contrato || '-' }}</strong>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">Data de Início</small>
                      <strong>{{ formatDate(profile?.contrato?.data_inicio) }}</strong>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">Carga Horária Semanal</small>
                      <strong>{{ minutesToHours(profile?.contrato?.carga_horaria_semanal) }}h</strong>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">Carga Horária Mensal</small>
                      <strong>{{ minutesToHours(profile?.contrato?.carga_horaria_mensal) }}h</strong>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">Horário de Entrada</small>
                      <strong>{{ profile?.contrato?.horario_entrada || '-' }}</strong>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">Horário de Saída</small>
                      <strong>{{ profile?.contrato?.horario_saida || '-' }}</strong>
                    </div>
                  </div>

                  <!-- Permissões -->
                  <hr class="my-4">
                  <h6 class="mb-3"><i class="bi bi-shield-check me-2"></i>Permissões</h6>
                  <div v-if="profile?.permissoes && profile.permissoes.length > 0" class="d-flex flex-wrap gap-2">
                    <span 
                      v-for="perm in profile.permissoes" 
                      :key="perm.id"
                      class="badge bg-info text-dark"
                    >
                      {{ perm.nome }}
                    </span>
                  </div>
                  <p v-else class="text-muted mb-0">Nenhuma permissão atribuída</p>
                </div>
              </div>
            </div>

            <!-- Tab 2: Calendário -->
            <div v-show="activeTab === 'calendario'" class="tab-pane">
              <div class="card shadow-sm">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <span><i class="bi bi-calendar3 me-2"></i>Calendário de Ponto</span>
                  <div class="d-flex gap-2">
                    <select v-model="selectedMonth" class="form-select form-select-sm" @change="loadCalendar">
                      <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
                    </select>
                    <select v-model="selectedYear" class="form-select form-select-sm" @change="loadCalendar">
                      <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
                    </select>
                  </div>
                </div>
                <div class="card-body">
                  <div v-if="loadingCalendar" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status"></div>
                  </div>
                  <div v-else-if="calendar">
                    <!-- Resumo do Mês -->
                    <div class="alert alert-info mb-3">
                      <div class="row text-center g-2">
                        <div class="col-3">
                          <strong class="d-block">{{ calendar.resumo?.total_dias_trabalhados || 0 }}</strong>
                          <small>Dias trabalhados</small>
                        </div>
                        <div class="col-3">
                          <strong class="d-block text-success">{{ calendar.resumo?.total_dias_completos || 0 }}</strong>
                          <small>Completos</small>
                        </div>
                        <div class="col-3">
                          <strong class="d-block text-warning">{{ calendar.resumo?.total_dias_incompletos || 0 }}</strong>
                          <small>Incompletos</small>
                        </div>
                        <div class="col-3">
                          <strong class="d-block" :class="calendar.resumo?.saldo_total_minutos >= 0 ? 'text-success' : 'text-danger'">
                            {{ calendar.resumo?.saldo_total_formatado || '00:00' }}
                          </strong>
                          <small>Saldo total</small>
                        </div>
                      </div>
                    </div>

                    <!-- Lista de Dias -->
                    <div class="calendar-days" style="max-height: 500px; overflow-y: auto;">
                      <div 
                        v-for="dia in calendar.dias" 
                        :key="dia.data"
                        class="card mb-2"
                        :class="getDayCardClass(dia)"
                      >
                        <div class="card-body py-2 px-3">
                          <div class="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{{ formatDate(dia.data) }}</strong>
                              <small class="text-muted ms-2">{{ dia.dia_semana }}</small>
                            </div>
                            <div class="text-end">
                              <span class="badge me-2" :class="getStatusBadgeClass(dia.status)">
                                {{ getStatusLabel(dia.status) }}
                              </span>
                              <small v-if="dia.tem_ponto">
                                {{ dia.primeiro_ponto }} - {{ dia.ultimo_ponto }}
                              </small>
                              <small v-else class="text-muted">Sem ponto</small>
                            </div>
                          </div>
                          <div v-if="dia.tem_ponto" class="mt-1">
                            <small class="text-muted">
                              Pontos: {{ dia.total_pontos }} | 
                              Saldo: 
                              <span :class="dia.saldo_dia_minutos >= 0 ? 'text-success' : 'text-danger'">
                                {{ dia.saldo_dia_formatado }}
                              </span>
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 3: Atividades Recentes -->
            <div v-show="activeTab === 'atividades'" class="tab-pane">
              <div class="card shadow-sm">
                <div class="card-header">
                  <i class="bi bi-clock-history me-2"></i>Atividades Recentes
                </div>
                <div class="card-body">
                  <div v-if="loadingActivities" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status"></div>
                  </div>
                  <div v-else-if="activities && activities.length > 0" class="timeline">
                    <div 
                      v-for="(activity, index) in activities" 
                      :key="activity.id"
                      class="timeline-item mb-3 pb-3"
                      :class="{ 'border-bottom': index < activities.length - 1 }"
                    >
                      <div class="d-flex align-items-start">
                        <div class="timeline-icon me-3">
                          <i class="bi" :class="getActivityIcon(activity.tipo)"></i>
                        </div>
                        <div class="flex-grow-1">
                          <div class="d-flex justify-content-between align-items-start">
                            <div>
                              <strong>{{ activity.descricao }}</strong>
                              <div class="text-muted small mt-1">
                                <i class="bi bi-clock me-1"></i>{{ formatDateTime(activity.data) }}
                              </div>
                            </div>
                            <span class="badge" :class="getActivityBadgeClass(activity.tipo)">
                              {{ activity.tipo }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p v-else class="text-muted text-center py-4">
                    Nenhuma atividade recente
                  </p>
                </div>
              </div>
            </div>

            <!-- Tab 4: Alterar Senha -->
            <div v-show="activeTab === 'senha'" class="tab-pane">
              <div class="card shadow-sm">
                <div class="card-header">
                  <i class="bi bi-key me-2"></i>Alterar Senha
                </div>
                <div class="card-body">
                  <form @submit.prevent="changePassword">
                    <div class="mb-3">
                      <label class="form-label">Senha Atual</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        v-model="passwordForm.senhaAtual"
                        required
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Nova Senha</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        v-model="passwordForm.senhaNova"
                        minlength="6"
                        required
                      />
                      <small class="text-muted">Mínimo 6 caracteres</small>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Confirmar Nova Senha</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        v-model="passwordForm.confirmarSenha"
                        required
                      />
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="changingPassword">
                      <span v-if="changingPassword" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else class="bi bi-check-lg me-1"></i>
                      Alterar Senha
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import ProfileService from '../services/ProfileService';
import { showToast } from '../toast';

export default {
  name: 'ProfilePageComplete',
  
  setup() {
    const router = useRouter();
    
    // State
    const loading = ref(true);
    const error = ref(null);
    const profile = ref(null);
    const stats = ref(null);
    const calendar = ref(null);
    const activities = ref([]);
    
    // UI State
    const activeTab = ref('info');
    const editingProfile = ref(false);
    const savingProfile = ref(false);
    const uploadingAvatar = ref(false);
    const changingPassword = ref(false);
    const loadingCalendar = ref(false);
    const loadingActivities = ref(false);
    
    // Forms
    const profileForm = reactive({
      nome: '',
      telefone: '',
    });
    
    const passwordForm = reactive({
      senhaAtual: '',
      senhaNova: '',
      confirmarSenha: '',
    });
    
    // Calendar
    const currentDate = new Date();
    const selectedMonth = ref(currentDate.getMonth() + 1);
    const selectedYear = ref(currentDate.getFullYear());
    const yearOptions = ref([2024, 2025, 2026]);
    
    // Methods
    const loadProfile = async () => {
      try {
        loading.value = true;
        error.value = null;
        profile.value = await ProfileService.getMyProfile();
        
        // Carregar stats em paralelo
        stats.value = await ProfileService.getMyStats();
      } catch (err) {
        error.value = err.response?.data?.error || 'Erro ao carregar perfil';
        showToast(error.value, 'error');
      } finally {
        loading.value = false;
      }
    };
    
    const loadCalendar = async () => {
      try {
        loadingCalendar.value = true;
        calendar.value = await ProfileService.getCalendar(selectedMonth.value, selectedYear.value);
      } catch (err) {
        showToast('Erro ao carregar calendário', 'error');
      } finally {
        loadingCalendar.value = false;
      }
    };
    
    const loadActivities = async () => {
      try {
        loadingActivities.value = true;
        const result = await ProfileService.getRecentActivity(20);
        activities.value = result.atividades || [];
      } catch (err) {
        showToast('Erro ao carregar atividades', 'error');
      } finally {
        loadingActivities.value = false;
      }
    };
    
    const startEditProfile = () => {
      editingProfile.value = true;
      profileForm.nome = profile.value.nome;
      profileForm.telefone = profile.value.telefone || '';
    };
    
    const cancelEditProfile = () => {
      editingProfile.value = false;
      profileForm.nome = '';
      profileForm.telefone = '';
    };
    
    const saveProfile = async () => {
      try {
        savingProfile.value = true;
        const updated = await ProfileService.updateProfile({
          nome: profileForm.nome,
          telefone: profileForm.telefone,
        });
        
        profile.value = updated;
        editingProfile.value = false;
        showToast('Perfil atualizado com sucesso!', 'success');
      } catch (err) {
        showToast(err.response?.data?.error || 'Erro ao atualizar perfil', 'error');
      } finally {
        savingProfile.value = false;
      }
    };
    
    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        uploadingAvatar.value = true;
        const result = await ProfileService.uploadAvatar(file);
        
        // Atualizar avatar no perfil
        if (profile.value) {
          profile.value.avatar = result.avatar_url;
        }
        
        showToast('Avatar atualizado com sucesso!', 'success');
      } catch (err) {
        showToast(err.message || 'Erro ao fazer upload do avatar', 'error');
      } finally {
        uploadingAvatar.value = false;
        event.target.value = ''; // Reset input
      }
    };
    
    const handleImageError = (event) => {
      // Remove avatar quebrado para mostrar iniciais
      if (profile.value) {
        profile.value.avatar = null;
      }
    };

    const getInitials = (nome) => {
      if (!nome) return '?';
      const words = nome.trim().split(' ').filter(w => w.length > 0);
      if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };
    
    const changePassword = async () => {
      if (passwordForm.senhaNova !== passwordForm.confirmarSenha) {
        showToast('As senhas não coincidem', 'error');
        return;
      }
      
      try {
        changingPassword.value = true;
        await ProfileService.changePassword(
          passwordForm.senhaAtual,
          passwordForm.senhaNova,
          passwordForm.confirmarSenha
        );
        
        // Limpar form
        passwordForm.senhaAtual = '';
        passwordForm.senhaNova = '';
        passwordForm.confirmarSenha = '';
        
        showToast('Senha alterada com sucesso!', 'success');
      } catch (err) {
        showToast(err.response?.data?.error || 'Erro ao alterar senha', 'error');
      } finally {
        changingPassword.value = false;
      }
    };
    
    const handleLogout = () => {
      // Remove tokens de autenticação
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('token');
      localStorage.removeItem('cargo');
      
      router.push('/login');
      showToast('Logout realizado com sucesso', 'success');
    };
    
    // Utilities
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    };
    
    const formatDateTime = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR');
    };
    
    // Convert minutes to hours
    const minutesToHours = (minutes) => {
      if (!minutes) return 0;
      return (minutes / 60).toFixed(1);
    };
    
    const getMonthName = (month) => {
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return months[month - 1];
    };
    
    const getBancoHorasClass = () => {
      const saldo = stats.value?.banco_horas?.saldo_atual_minutos || 0;
      return saldo >= 0 ? 'text-success' : 'text-danger';
    };
    
    const getDayCardClass = (dia) => {
      if (!dia.tem_ponto) return 'border-secondary';
      if (dia.status === 'completo') return 'border-success';
      if (dia.status === 'incompleto') return 'border-warning';
      return 'border-primary';
    };
    
    const getStatusBadgeClass = (status) => {
      const classes = {
        completo: 'bg-success',
        incompleto: 'bg-warning',
        em_andamento: 'bg-primary',
        sem_ponto: 'bg-secondary',
      };
      return classes[status] || 'bg-secondary';
    };
    
    const getStatusLabel = (status) => {
      const labels = {
        completo: 'Completo',
        incompleto: 'Incompleto',
        em_andamento: 'Em andamento',
        sem_ponto: 'Sem ponto',
      };
      return labels[status] || status;
    };
    
    const getActivityIcon = (tipo) => {
      const icons = {
        ponto: 'bi-clock-fill text-primary',
        justificativa: 'bi-file-text-fill text-warning',
        banco_horas: 'bi-graph-up text-success',
        perfil: 'bi-person-fill text-info',
      };
      return icons[tipo] || 'bi-circle-fill';
    };
    
    const getActivityBadgeClass = (tipo) => {
      const classes = {
        ponto: 'bg-primary',
        justificativa: 'bg-warning',
        banco_horas: 'bg-success',
        perfil: 'bg-info',
      };
      return classes[tipo] || 'bg-secondary';
    };
    
    // Lifecycle
    onMounted(async () => {
      await loadProfile();
      await loadCalendar();
      await loadActivities();
    });
    
    return {
      // State
      loading,
      error,
      profile,
      stats,
      calendar,
      activities,
      
      // UI State
      activeTab,
      editingProfile,
      savingProfile,
      uploadingAvatar,
      changingPassword,
      loadingCalendar,
      loadingActivities,
      
      // Forms
      profileForm,
      passwordForm,
      
      // Calendar
      selectedMonth,
      selectedYear,
      yearOptions,
      
      // Methods
      loadProfile,
      loadCalendar,
      loadActivities,
      startEditProfile,
      cancelEditProfile,
      saveProfile,
      handleAvatarUpload,
      handleImageError,
      changePassword,
      handleLogout,
      
      // Utilities
      formatDate,
      formatDateTime,
      getMonthName,
      getBancoHorasClass,
      getDayCardClass,
      getStatusBadgeClass,
      getStatusLabel,
      getActivityIcon,
      getActivityBadgeClass,
    };
  },
};
</script>

<style scoped>
.avatar-image {
  border: 4px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.avatar-initials {
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

.timeline-item {
  position: relative;
}

.timeline-icon {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.card {
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
