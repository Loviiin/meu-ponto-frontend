<template>
  <div class="employee-page">
    <div class="card glass-card">
      <div class="card-header">
        <h2 class="h4 mb-0 d-flex align-items-center">
          <i class="bi bi-person-plus-fill me-2"></i>
          Novo Funcionário
        </h2>
      </div>
      <div class="card-body">
        <p class="subtitle">Preencha os dados do novo colaborador</p>

      <div v-if="loadingCargos" class="overlay">
        <div class="spinner"></div>
        <div class="overlay-text">Carregando cargos...</div>
      </div>
      
      <form @submit.prevent="handleSubmit" novalidate :aria-busy="loadingCargos" :inert="loadingCargos ? true : null">
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

        <!-- Senha -->
        <div class="form-row" :class="fieldClass('senha')">
          <label>Senha *</label>
          <input 
            type="password" 
            v-model="form.senha" 
            @blur="touch('senha')" 
            placeholder="Mínimo 6 caracteres"
            :disabled="submitting"
          />
          <FieldError :error="errors.senha" />
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
          <button type="button" class="btn secondary" @click="goBack" :disabled="submitting || loadingCargos">
            Cancelar
          </button>
          <button type="submit" class="btn primary" :disabled="submitting || loadingCargos">
            <span v-if="!submitting">Salvar Funcionário</span>
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
import { useRouter } from 'vue-router';
import api from '../axios';
import { toast } from '../toast.js';
import { REGEX } from '../utils/validators.js';

// ---- Estado principal ----
const router = useRouter();
const empresaId = Number(localStorage.getItem('empresa_id')) || null;

const form = reactive({
  nome: '',
  email: '',
  senha: '',
  cargoId: '',
  empresaId: empresaId
});

const cargos = ref([]);
const loadingCargos = ref(false);
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
    case 'senha':
      if (!form.senha) {
        errors.senha = 'Senha é obrigatória';
      } else if (form.senha.length < 6) {
        errors.senha = 'Senha deve ter pelo menos 6 caracteres';
      } else {
        delete errors.senha;
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
  ['nome', 'email', 'senha', 'cargoId'].forEach(f => { 
    if (!touched.has(f)) touch(f); 
    else validateField(f); 
  });
  return Object.keys(errors).length === 0;
}

// ---- Carregar Cargos ----
async function loadCargos() {
  if (!empresaId) { 
    toast.error('empresa_id não encontrado. Faça login novamente.'); 
    router.push('/login'); 
    return; 
  }
  
  loadingCargos.value = true;
  try {
    const res = await api.get('/cargos');
    cargos.value = (res.data || []).map(c => ({
      id: c.id || c.ID,
      nome: c.nome || c.Nome
    })).filter(c => c.id && c.nome);
    
    if (cargos.value.length === 0) {
      toast.warning('Nenhum cargo cadastrado. Cadastre cargos primeiro.');
    }
  } catch(err) {
    const status = err.response?.status;
    if (status === 401) {
      toast.error('Sessão expirada. Faça login novamente.');
      router.push('/login');
      return;
    }
    if (status === 403) {
      toast.error('Você não tem permissão para acessar os cargos.');
      return;
    }
    toast.error('Falha ao carregar cargos. Tente novamente.');
    console.error('Erro ao carregar cargos:', err);
  } finally { 
    loadingCargos.value = false; 
  }
}

onMounted(() => {
  loadCargos();
});

// ---- Submit ----
async function handleSubmit() {
  liveMessage.value = '';
  
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
      senha: form.senha,
      cargoId: Number(form.cargoId),
      empresaId: Number(form.empresaId)
    };
    
    const res = await api.post('/usuarios', payload, { 
      headers: { 'Content-Type': 'application/json' }
    });
    
    toast.success('Funcionário criado com sucesso!');
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
  let msg = 'Erro ao criar funcionário';
  
  if (status === 400) {
    // Bad Request - dados inválidos
    msg = data?.error || data?.message || 'Dados inválidos. Verifique os campos.';
  } else if (status === 409) {
    // Conflict - email duplicado
    msg = data?.error || data?.message || 'Email já cadastrado no sistema.';
    errors.email = msg;
    touched.add('email');
  } else if (status === 401) {
    msg = 'Sessão expirada. Faça login novamente.';
    toast.error(msg);
    router.push('/login');
    return;
  } else if (status === 403) {
    msg = 'Você não tem permissão para criar funcionários.';
  } else if (status >= 500) {
    msg = data?.error || data?.message || 'Erro no servidor. Tente novamente mais tarde.';
  } else if (data?.error) {
    msg = data.error;
  } else if (data?.message) {
    msg = data.message;
  }
  
  toast.error(msg);
  liveMessage.value = msg;
  console.error('Erro ao criar funcionário:', err);
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
/* Layout com o mesmo glass do BancoHoras */
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

.title { 
  text-align: center; 
  margin: 0 0 6px 0; 
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

@media (max-width: 780px) { 
  form { 
    grid-template-columns: 1fr; 
  } 
}
</style>
