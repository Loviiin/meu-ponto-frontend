<template>
  <div class="employee-page">
    <div class="card glass-card">
      <div class="card-header">
        <h2 class="h4 mb-0 d-flex align-items-center">
          <i class="bi bi-pencil-square me-2"></i>
          Editar Funcionário
        </h2>
      </div>
      <div class="card-body">
        <p class="subtitle">Atualize os dados do colaborador</p>

        <!-- Loading Indicator -->
        <div v-if="loading" class="overlay">
          <div class="spinner"></div>
          <div class="overlay-text">Carregando dados do funcionário...</div>
        </div>

        <!-- Error Message -->
        <div v-else-if="loadError" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ loadError }}
          <button class="btn btn-sm btn-outline-danger ms-3" @click="loadEmployee">
            <i class="bi bi-arrow-clockwise"></i> Tentar Novamente
          </button>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleSubmit" novalidate>
          <!-- Nome -->
          <div class="form-row" :class="fieldClass('nome')">
            <label>Nome Completo *</label>
            <input 
              type="text" 
              v-model.trim="form.nome" 
              @blur="touch('nome')" 
              placeholder="Nome completo do funcionário"
              :disabled="submitting"
            />
            <FieldError :error="errors.nome" />
          </div>

          <!-- Email -->
          <div class="form-row" :class="fieldClass('email')">
            <label>Email *</label>
            <input 
              type="email" 
              v-model.trim="form.email" 
              @blur="touch('email')" 
              placeholder="email@empresa.com"
              :disabled="submitting"
            />
            <FieldError :error="errors.email" />
          </div>

          <!-- Cargo -->
          <div class="form-row" :class="fieldClass('cargoId')">
            <label>Cargo *</label>
            <select 
              v-model="form.cargoId" 
              @blur="touch('cargoId')"
              :disabled="submitting || loadingCargos"
            >
              <option value="">Selecione um cargo</option>
              <option v-for="c in cargos" :key="c.id" :value="c.id">
                {{ c.nome }}
              </option>
            </select>
            <FieldError :error="errors.cargoId" />
          </div>

          <div class="actions">
            <button type="button" class="btn secondary" @click="goBack" :disabled="submitting">
              Cancelar
            </button>
            <button type="submit" class="btn primary" :disabled="submitting || loadingCargos">
              <span v-if="!submitting">Salvar Alterações</span>
              <span v-else>Salvando...</span>
            </button>
          </div>
          <div class="sr-only" aria-live="polite">{{ liveMessage }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../axios';
import { toast } from '../toast.js';
import { REGEX } from '../utils/validators.js';

// ---- Estado principal ----
const router = useRouter();
const route = useRoute();
const userId = ref(null);

// Validar e normalizar o ID
onMounted(() => {
  const rawId = route.params.id;
  console.log('Raw ID from route:', rawId, 'Type:', typeof rawId);
  
  if (!rawId || rawId === 'undefined' || rawId === 'null') {
    console.error('ID inválido detectado:', rawId);
    toast.error('ID do funcionário não fornecido ou inválido.');
    router.push('/usuario/list');
    return;
  }
  
  const parsedId = Number(rawId);
  if (isNaN(parsedId) || parsedId <= 0) {
    console.error('ID não é um número válido:', rawId);
    toast.error('ID do funcionário inválido.');
    router.push('/usuario/list');
    return;
  }
  
  userId.value = parsedId;
  console.log('ID válido definido:', userId.value);
  
  // Carregar dados apenas após validar o ID
  Promise.all([loadCargos(), loadEmployee()]);
});

const form = reactive({
  nome: '',
  email: '',
  cargoId: ''
});

const cargos = ref([]);
const loading = ref(false);
const loadingCargos = ref(false);
const loadError = ref(null);
const submitting = ref(false);
const errors = reactive({});
const touched = reactive(new Set());
const liveMessage = ref('');

// ---- Funções de Validação ----
function touch(field) { 
  touched.add(field); 
  validateField(field); 
}

function isTouched(field) { 
  return touched.has(field); 
}

function fieldClass(field) { 
  return { 
    'has-error': isTouched(field) && errors[field], 
    'is-valid': isTouched(field) && !errors[field] 
  }; 
}

function validateField(field) {
  switch(field) {
    case 'nome': 
      errors.nome = form.nome ? '' : 'Nome é obrigatório'; 
      if (!errors.nome) delete errors.nome; 
      break;
    case 'email':
      if (!form.email) {
        errors.email = 'Email é obrigatório';
      } else if (!REGEX.EMAIL.test(form.email)) {
        errors.email = 'Formato de email inválido';
      } else {
        delete errors.email;
      }
      break;
    case 'cargoId':
      if (!form.cargoId) {
        errors.cargoId = 'Selecione um cargo';
      } else {
        delete errors.cargoId;
      }
      break;
  }
}

function validateAll() {
  ['nome', 'email', 'cargoId'].forEach(f => { 
    if (!touched.has(f)) touch(f); 
    else validateField(f); 
  });
  return Object.keys(errors).length === 0;
}

// ---- Carregar Cargos ----
async function loadCargos() {
  loadingCargos.value = true;
  try {
    const res = await api.get('/cargos');
    cargos.value = (res.data || []).map(c => ({
      id: c.id || c.ID,
      nome: c.nome || c.Nome
    })).filter(c => c.id && c.nome);
  } catch(err) {
    const status = err.response?.status;
    if (status === 401) {
      toast.error('Sessão expirada. Faça login novamente.');
      router.push('/login');
      return;
    }
    toast.error('Falha ao carregar cargos.');
    console.error('Erro ao carregar cargos:', err);
  } finally { 
    loadingCargos.value = false; 
  }
}

// ---- Carregar Funcionário ----
async function loadEmployee() {
  if (!userId.value) {
    console.error('loadEmployee chamado sem userId válido');
    return;
  }
  
  loading.value = true;
  loadError.value = null;
  
  console.log(`Carregando funcionário com ID: ${userId.value}`);
  
  try {
    const res = await api.get(`/usuarios/${userId.value}`);
    const usuario = res.data;
    
    console.log('Dados do funcionário recebidos:', usuario);
    
    // Preencher formulário com dados do usuário
    form.nome = usuario.nome || usuario.Nome || '';
    form.email = usuario.email || usuario.Email || '';
    form.cargoId = usuario.contrato?.cargo?.id || usuario.contrato?.cargo?.ID || '';
    
    console.log('Formulário preenchido:', { ...form });
    
  } catch (err) {
    const status = err.response?.status;
    console.error('Erro ao carregar funcionário:', err);
    console.error('Status:', status, 'URL:', err.config?.url);
    
    if (status === 401) {
      toast.error('Sessão expirada. Faça login novamente.');
      router.push('/login');
      return;
    } else if (status === 404) {
      loadError.value = 'Funcionário não encontrado.';
      toast.error('Funcionário não encontrado.');
    } else if (status === 403) {
      loadError.value = 'Você não tem permissão para visualizar este funcionário.';
    } else if (status >= 500) {
      loadError.value = 'Erro no servidor. Tente novamente mais tarde.';
    } else {
      loadError.value = 'Erro ao carregar dados do funcionário.';
    }
  } finally {
    loading.value = false;
  }
}

// ---- Submit ----
async function handleSubmit() {
  liveMessage.value = '';
  
  if (!userId.value) {
    toast.error('ID do funcionário inválido.');
    return;
  }
  
  if (!validateAll()) { 
    liveMessage.value = 'Erros de validação no formulário.'; 
    toast.error('Verifique os campos destacados.'); 
    return; 
  }
  
  submitting.value = true;
  try {
    const payload = {
      nome: form.nome.trim(),
      email: form.email.toLowerCase().trim(),
      cargoId: Number(form.cargoId)
    };
    
    console.log(`Atualizando usuário ${userId.value} com payload:`, payload);
    
    await api.put(`/usuarios/${userId.value}`, payload, { 
      headers: { 'Content-Type': 'application/json' }
    });
    
    toast.success('Funcionário atualizado com sucesso!');
    router.push('/usuario/list');
  } catch(err) {
    handleSubmitError(err);
  } finally { 
    submitting.value = false; 
  }
}

function handleSubmitError(err) {
  const status = err.response?.status;
  const data = err.response?.data;
  let msg = 'Erro ao atualizar funcionário';
  
  if (status === 400) {
    // Bad Request - dados inválidos
    msg = data?.error || data?.message || 'Dados inválidos. Verifique os campos.';
  } else if (status === 404) {
    // Not Found - usuário não existe
    msg = data?.error || data?.message || 'Funcionário não encontrado.';
  } else if (status === 409) {
    // Conflict - email duplicado
    msg = data?.error || data?.message || 'Email já pertence a outro usuário.';
    errors.email = msg;
    touched.add('email');
  } else if (status === 401) {
    msg = 'Sessão expirada. Faça login novamente.';
    toast.error(msg);
    router.push('/login');
    return;
  } else if (status === 403) {
    msg = 'Você não tem permissão para editar este funcionário.';
  } else if (status >= 500) {
    msg = data?.error || data?.message || 'Erro no servidor. Tente novamente mais tarde.';
  } else if (data?.error) {
    msg = data.error;
  } else if (data?.message) {
    msg = data.message;
  }
  
  toast.error(msg);
  liveMessage.value = msg;
  console.error('Erro ao atualizar funcionário:', err);
}

function goBack() { 
  router.push('/usuario/list'); 
}

// Component inline
const FieldError = { 
  name: 'FieldError', 
  props: { error: { type: String, default: '' } }, 
  template: `<div v-if="error" class='field-error'>{{ error }}</div>` 
};
</script>

<style scoped>
/* Layout com o mesmo glass do EmployeeNew */
.employee-page { 
  min-height: 100vh; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 20px; 
  color: white; 
}

.glass-card { 
  background: rgba(255, 255, 255, 0.08); 
  backdrop-filter: blur(12px); 
  -webkit-backdrop-filter: blur(12px); 
  border: 1px solid rgba(255, 255, 255, 0.18); 
  border-radius: 16px; 
  box-shadow: 0 8px 32px rgba(0,0,0,0.3); 
  color: rgba(255,255,255,0.92); 
}

.glass-card .card-header { 
  background: rgba(255, 255, 255, 0.04); 
  border-bottom: 1px solid rgba(255, 255, 255, 0.12); 
  backdrop-filter: blur(12px); 
  -webkit-backdrop-filter: blur(12px); 
  color: rgba(255, 255, 255, 0.95); 
  border-top-left-radius: 16px; 
  border-top-right-radius: 16px; 
}

.card { 
  padding: 30px; 
  max-width: 620px; 
  width: 100%; 
}

.subtitle { 
  margin-top: -4px; 
  color: #ddd; 
  font-size: 14px; 
  text-align: center; 
  margin-bottom: 16px; 
}

form { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 16px; 
}

.form-row { 
  display: flex; 
  flex-direction: column; 
}

.form-row label { 
  font-weight: 600; 
  font-size: 13px; 
  margin-bottom: 6px; 
  color: #f5f5f5; 
}

.form-row input, 
.form-row select { 
  background: rgba(255,255,255,0.12); 
  border: 1px solid rgba(255,255,255,0.25); 
  border-radius: 10px; 
  padding: 10px 12px; 
  color: #fff; 
  font-size: 14px; 
}

.form-row select option {
  background: #1a242d;
  color: #fff;
  padding: 8px;
}

.form-row select option:hover {
  background: rgba(105, 96, 0, 0.3);
}

.form-row input::placeholder { 
  color: rgba(255,255,255,0.7); 
}

.form-row.has-error input, 
.form-row.has-error select { 
  box-shadow: 0 0 0 2px rgba(255,80,80,0.6); 
}

.form-row.is-valid input, 
.form-row.is-valid select { 
  box-shadow: 0 0 0 2px rgba(80,200,120,0.6); 
}

.form-row input:focus, 
.form-row select:focus { 
  outline: none; 
  border-color: rgba(255,255,255,0.5); 
}

.actions { 
  display: flex; 
  justify-content: flex-end; 
  gap: 12px; 
  margin-top: 8px; 
}

.btn { 
  border: none; 
  border-radius: 10px; 
  padding: 10px 18px; 
  font-weight: 700; 
  letter-spacing: 0.5px; 
  cursor: pointer; 
  transition: .25s; 
}

.btn.primary { 
  background: rgba(105,96,0,0.9); 
  color: #fff; 
}

.btn.primary:hover { 
  background: rgba(105,96,0,1); 
  transform: translateY(-1px); 
}

.btn.secondary { 
  background: rgba(255,255,255,0.2); 
  color: #fff; 
}

.btn.secondary:hover { 
  background: rgba(255,255,255,0.3); 
}

.btn:disabled { 
  opacity: .55; 
  cursor: not-allowed; 
}

.field-error { 
  color: #ff9b9b; 
  font-size: 12px; 
  margin-top: 4px; 
}

.alert {
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.alert-danger {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.4);
  color: #ff9b9b;
}

.alert .btn {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid rgba(220, 53, 69, 0.6);
  color: #ff9b9b;
}

.btn-outline-danger:hover {
  background: rgba(220, 53, 69, 0.2);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
}

.spinner {
  border: 4px solid rgba(255,255,255,0.2);
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.overlay-text {
  color: white;
  margin-top: 16px;
  font-size: 14px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border-width: 0;
}
</style>