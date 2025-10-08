<template>
  <div class="signup-page">
    <h1 class="logo">
      <img src="../assets/Icon_vertical_nexora-removebg-preview.png" alt="logoNexora" class="navbar-logo" />
    </h1>

    <div class="card">
      <div class="card-body">
  <h2 class="title">Cadastro Inicial</h2>
  <div class="progress-text">Passo {{ currentStep + 1 }} de {{ steps.length }} – {{ progressPercent }}%</div>
        <div class="stepper">
          <div v-for="(s, idx) in steps" :key="idx" class="step" :class="{ active: currentStep === idx, done: idx < currentStep }">
            <div class="circle">{{ idx + 1 }}</div>
            <div class="label">{{ s.label }}</div>
          </div>
        </div>

        <form @submit.prevent="handleNext">
          <!-- Passo 1 Empresa -->
          <div v-if="currentStep === 0" class="step-pane">
            <div class="input-group" :class="fieldClass('empresa.nome_fantasia')">
              <input type="text" placeholder="Nome Fantasia" v-model.trim="formData.empresa.nome_fantasia" @blur="touch('empresa.nome_fantasia')" />
              <span class="input-icon"><i class="bi bi-building"></i></span>
            </div>
            <FieldError :error="errors['empresa.nome_fantasia']" />

            <div class="input-group" :class="fieldClass('empresa.razao_social')">
              <input type="text" placeholder="Razão Social" v-model.trim="formData.empresa.razao_social" @blur="touch('empresa.razao_social')" />
              <span class="input-icon"><i class="bi bi-card-text"></i></span>
            </div>
            <FieldError :error="errors['empresa.razao_social']" />

            <div class="input-group" :class="fieldClass('empresa.cnpj')">
              <input type="text" placeholder="CNPJ" v-mask="'##.###.###/####-##'" v-model="masked.cnpj" maxlength="18" @blur="handleBlurCnpj" />
              <span class="input-icon"><i class="bi bi-upc-scan"></i></span>
            </div>
            <FieldError :error="errors['empresa.cnpj']" />
            <div class="cancel-wrap" v-if="currentStep === 0">
              <button type="button" class="btn btn-link cancel-btn" @click="goToLogin">Cancelar / Voltar ao Login</button>
            </div>
          </div>

          <!-- Passo 2 Localidade -->
          <div v-if="currentStep === 1" class="step-pane">
            <div class="input-group" :class="fieldClass('localidade.nome')">
              <input type="text" placeholder="Nome da Localidade (ex: Matriz)" v-model.trim="formData.localidade.nome" @blur="touch('localidade.nome')" />
              <span class="input-icon"><i class="bi bi-geo-alt"></i></span>
            </div>
            <FieldError :error="errors['localidade.nome']" />

            <div class="input-group" :class="fieldClass('localidade.cep')">
              <input type="text" placeholder="CEP" v-mask="'#####-###'" v-model="masked.cep" maxlength="9" @blur="handleBlurCep" />
              <span class="input-icon"><i class="bi bi-mailbox"></i></span>
            </div>
            <FieldError :error="errors['localidade.cep']" />

            <div class="input-group" :class="fieldClass('localidade.raio_geofence_metros')">
              <input type="number" placeholder="Raio Geofence (metros)" v-model.number="formData.localidade.raio_geofence_metros" min="1" @blur="touch('localidade.raio_geofence_metros')" />
              <span class="input-icon"><i class="bi bi-broadcast"></i></span>
            </div>
            <FieldError :error="errors['localidade.raio_geofence_metros']" />
          </div>

          <!-- Passo 3 Usuário -->
          <div v-if="currentStep === 2" class="step-pane">
            <div class="input-group" :class="fieldClass('usuario.nome')">
              <input type="text" placeholder="Seu Nome" v-model.trim="formData.usuario.nome" @blur="touch('usuario.nome')" />
              <span class="input-icon"><i class="bi bi-person"></i></span>
            </div>
            <FieldError :error="errors['usuario.nome']" />

            <div class="input-group" :class="fieldClass('usuario.email')">
              <input type="email" placeholder="Email" v-model.trim="formData.usuario.email" @blur="touch('usuario.email')" />
              <span class="input-icon"><i class="bi bi-at"></i></span>
            </div>
            <FieldError :error="errors['usuario.email']" />

            <div class="input-group" :class="fieldClass('usuario.password')">
              <input type="password" placeholder="Senha (mín. 6)" v-model="formData.usuario.password" @blur="touch('usuario.password')" />
              <span class="input-icon"><i class="bi bi-lock"></i></span>
            </div>
            <FieldError :error="errors['usuario.password']" />

            <div class="input-group" :class="fieldClass('usuario.password_confirm')">
              <input type="password" placeholder="Confirmar Senha" v-model="passwordConfirm" @blur="touch('usuario.password_confirm')" />
              <span class="input-icon"><i class="bi bi-lock-fill"></i></span>
            </div>
            <FieldError :error="errors['usuario.password_confirm']" />

            <div class="input-group" :class="fieldClass('usuario.cpf')">
              <input type="text" placeholder="CPF" v-mask="'###.###.###-##'" v-model="masked.cpf" maxlength="14" @blur="handleBlurCpf" />
              <span class="input-icon"><i class="bi bi-person-vcard"></i></span>
            </div>
            <FieldError :error="errors['usuario.cpf']" />

            <div class="input-group" :class="fieldClass('usuario.salario')">
              <input type="number" step="0.01" placeholder="Salário" v-model.number="formData.usuario.salario" min="0" @blur="touch('usuario.salario')" />
              <span class="input-icon"><i class="bi bi-cash"></i></span>
            </div>
            <FieldError :error="errors['usuario.salario']" />

            <div class="input-group" :class="fieldClass('usuario.data_admissao')">
              <input type="date" placeholder="Data de Admissão" v-model="usuarioDataAdmissao" @blur="touch('usuario.data_admissao')" />
              <span class="input-icon"><i class="bi bi-calendar-event"></i></span>
            </div>
            <FieldError :error="errors['usuario.data_admissao']" />
          </div>

          <div class="actions">
            <button type="button" class="btn btn-secondary" @click="prevStep" :disabled="currentStep === 0 || loading">Voltar</button>
            <button v-if="currentStep < steps.length - 1" type="submit" class="btn btn-primary" :disabled="loading">Próximo</button>
            <button v-else type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="!loading">Concluir Cadastro</span>
              <span v-else>Enviando...</span>
            </button>
          </div>
        </form>

  <div class="sr-only" aria-live="polite">{{ liveMessage }}</div>

        <div class="login-switch">Já tem conta? <a @click.prevent="goToLogin" href="/login">Entrar</a></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted } from 'vue';
import { REGEX, onlyDigits as digitsOnlyExternal, normalizeEmail, isFutureDate } from '../utils/validators.js';
import { toast } from '../toast.js';
import { useRouter } from 'vue-router';
import api from '../axios';

const router = useRouter();

const steps = [
  { key: 'empresa', label: 'Empresa' },
  { key: 'localidade', label: 'Localidade' },
  { key: 'usuario', label: 'Seu Perfil' }
];

const DRAFT_KEY = 'signup_draft_v1';
const formData = reactive({
  empresa: { nome_fantasia: '', razao_social: '', cnpj: '' },
  localidade: { nome: '', cep: '', raio_geofence_metros: null },
  usuario: { nome: '', email: '', password: '', cpf: '', salario: null, data_admissao: '' }
});
const passwordConfirm = ref('');
const masked = reactive({ cnpj: '', cpf: '', cep: '' });
const liveMessage = ref('');

const usuarioDataAdmissao = ref('');
watch(usuarioDataAdmissao, (val) => {
  if (val) {
    // Convert local date (yyyy-mm-dd) to ISO date at midnight Z
    formData.usuario.data_admissao = new Date(val + 'T00:00:00Z').toISOString();
  } else {
    formData.usuario.data_admissao = '';
  }
});

const currentStep = ref(0);
const touched = reactive(new Set());
function touch(field){ touched.add(field); }
function isTouched(field){ return touched.has(field); }
const progressPercent = computed(()=> Math.round(((currentStep.value+1)/steps.length)*100));

// Máscaras helpers
function onlyDigits(v){ return digitsOnlyExternal(v); }
function maskCnpj(v){
  const d = onlyDigits(v).slice(0,14);
  return d.replace(/(\d{2})(\d)/,'$1.$2')
          .replace(/(\d{2})\.(\d{3})(\d)/,'$1.$2.$3')
          .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/,'$1.$2.$3/$4')
          .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{2})/,'$1.$2.$3/$4-$5'); }
function maskCpf(v){
  const d = onlyDigits(v).slice(0,11);
  return d.replace(/(\d{3})(\d)/,'$1.$2')
          .replace(/(\d{3})\.(\d{3})(\d)/,'$1.$2.$3')
          .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{2})/,'$1.$2.$3-$4'); }
function maskCep(v){
  const d = onlyDigits(v).slice(0,8);
  return d.replace(/(\d{5})(\d)/,'$1-$2'); }

function syncMasked(){
  masked.cnpj = maskCnpj(formData.empresa.cnpj);
  masked.cpf = maskCpf(formData.usuario.cpf);
  masked.cep = maskCep(formData.localidade.cep);
}
function handleBlurCnpj(){ formData.empresa.cnpj = onlyDigits(masked.cnpj).slice(0,14); touch('empresa.cnpj'); validateStep(0); }
function handleBlurCpf(){ formData.usuario.cpf = onlyDigits(masked.cpf).slice(0,11); touch('usuario.cpf'); validateStep(2); }
function handleBlurCep(){ formData.localidade.cep = onlyDigits(masked.cep).slice(0,8); touch('localidade.cep'); validateStep(1); }
onMounted(syncMasked);

function fieldValid(field){
  // run validation for its step silently
  validateField(field);
  return isTouched(field) && !errors[field];
}
function fieldClass(field){
  return { 'has-error': isTouched(field) && !!errors[field], 'is-valid': fieldValid(field) };
}

function validateField(field){
  // Call validateStep for the step containing this field
  const stepIndex = steps.findIndex(s=> field.startsWith(s.key));
  if(stepIndex!==-1) validateStep(stepIndex);
}
const errors = reactive({});
const generalError = ref('');
const successMessage = ref('');
const loading = ref(false);

function validateStep(stepIndex) {
  const stepKey = steps[stepIndex].key;
  const stepErrors = {};
  // Empresa
  if (stepKey === 'empresa') {
    if (!formData.empresa.nome_fantasia) stepErrors['empresa.nome_fantasia'] = 'Nome fantasia é obrigatório';
    if (!formData.empresa.razao_social) stepErrors['empresa.razao_social'] = 'Razão social é obrigatória';
    if (!formData.empresa.cnpj) stepErrors['empresa.cnpj'] = 'CNPJ é obrigatório';
    else if (!/^\d{14}$/.test(formData.empresa.cnpj)) stepErrors['empresa.cnpj'] = 'CNPJ deve ter 14 dígitos numéricos';
    if (stepKey === 'usuario') {
      if (passwordConfirm.value && formData.usuario.password && passwordConfirm.value !== formData.usuario.password) {
        stepErrors['usuario.password_confirm'] = 'Senhas não conferem';
      } else if (errors['usuario.password_confirm'] && passwordConfirm.value === formData.usuario.password) {
        delete errors['usuario.password_confirm'];
      }
    }
  }
  // Localidade
  if (stepKey === 'localidade') {
    if (!formData.localidade.nome) stepErrors['localidade.nome'] = 'Nome da localidade é obrigatório';
    if (!formData.localidade.cep) stepErrors['localidade.cep'] = 'CEP é obrigatório';
    else if (!/^\d{5}-?\d{3}$/.test(formData.localidade.cep)) stepErrors['localidade.cep'] = 'CEP inválido (ex: 01001000 ou 01001-000)';
    if (!formData.localidade.raio_geofence_metros || formData.localidade.raio_geofence_metros <= 0) stepErrors['localidade.raio_geofence_metros'] = 'Informe um raio válido (>0)';
  }
  // Usuário
  if (stepKey === 'usuario') {
    if (!formData.usuario.nome) stepErrors['usuario.nome'] = 'Nome é obrigatório';
    if (!formData.usuario.email) stepErrors['usuario.email'] = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.usuario.email)) stepErrors['usuario.email'] = 'Formato de email inválido';
    if (!formData.usuario.password) stepErrors['usuario.password'] = 'Senha é obrigatória';
    else if (formData.usuario.password.length < 6) stepErrors['usuario.password'] = 'Senha deve ter pelo menos 6 caracteres';
    if (!formData.usuario.cpf) stepErrors['usuario.cpf'] = 'CPF é obrigatório';
    else if (!/^\d{11}$/.test(formData.usuario.cpf)) stepErrors['usuario.cpf'] = 'CPF deve ter 11 dígitos';
    if (formData.usuario.salario == null || formData.usuario.salario < 0) stepErrors['usuario.salario'] = 'Salário deve ser >= 0';
  if (!formData.usuario.data_admissao) stepErrors['usuario.data_admissao'] = 'Data de admissão é obrigatória';
  if (usuarioDataAdmissao.value && isFutureDate(usuarioDataAdmissao.value)) stepErrors['usuario.data_admissao'] = 'Data não pode ser futura';
  }

  Object.keys(stepErrors).forEach(k => errors[k] = stepErrors[k]);
  // Clear old errors of this step not present now
  Object.keys(errors).forEach(k => {
    if (k.startsWith(stepKey) && !stepErrors[k]) delete errors[k];
  });

  return Object.keys(stepErrors).length === 0;
}

function validateAll() {
  let ok = true;
  for (let i = 0; i < steps.length; i++) {
    if (!validateStep(i)) ok = false;
  }
  return ok;
}

function nextStep() {
  if (currentStep.value < steps.length - 1) currentStep.value++;
}
function prevStep() {
  if (currentStep.value > 0) currentStep.value--;
}

// Persist draft on every meaningful change (debounced approach simple)
let saveTimeout;
watch(formData, () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(()=>{
    const draft = { ...JSON.parse(JSON.stringify(formData)), usuario: { ...formData.usuario, password: formData.usuario.password ? '***' : '', } };
    // não salvar senha real no draft
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      empresa: formData.empresa,
      localidade: formData.localidade,
      usuario: { ...formData.usuario, password: '', },
      passwordConfirm: ''
    }));
  },300);
},{ deep:true });

onMounted(()=>{
  const raw = localStorage.getItem(DRAFT_KEY);
  if(raw){
    try {
      const parsed = JSON.parse(raw);
      Object.assign(formData.empresa, parsed.empresa||{});
      Object.assign(formData.localidade, parsed.localidade||{});
      Object.assign(formData.usuario, parsed.usuario||{});
    } catch(e){ console.warn('Falha ao restaurar rascunho', e); }
  }
});

async function handleNext() {
  generalError.value = '';
  successMessage.value = '';
  liveMessage.value = '';

  if (!validateStep(currentStep.value)) return;
  // If not last step, just proceed
  if (currentStep.value < steps.length - 1) {
    nextStep();
    return;
  }
  // Submit
  if (!validateAll()) return;
  loading.value = true;
  try {
    const payload = JSON.parse(JSON.stringify(formData));
    // Normalizar dados (tirar máscaras) e remover campos auxiliares
    payload.empresa.cnpj = onlyDigits(payload.empresa.cnpj);
    payload.localidade.cep = onlyDigits(payload.localidade.cep);
  payload.usuario.cpf = onlyDigits(payload.usuario.cpf);
  payload.usuario.email = normalizeEmail(payload.usuario.email);
    delete payload.usuario.password_confirm;
    const response = await api.post('/auth/signup', payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
    });

    const token = response.data.token;
    if (token) localStorage.setItem('token', token);
    localStorage.removeItem(DRAFT_KEY);
    formData.usuario.password = '';
    passwordConfirm.value = '';
    successMessage.value = 'Cadastro realizado com sucesso!';
    liveMessage.value = successMessage.value;
    toast.success('Cadastro realizado! Redirecionando...');
    setTimeout(() => router.push('/home'), 1000);
  } catch (err) {
    const msg = parseError(err);
    console.error('Erro no signup', err.response?.data || err.message);
    generalError.value = msg;
    liveMessage.value = msg;
    toast.error(msg || 'Falha no cadastro');
  } finally {
    loading.value = false;
  }
}

function parseError(err) {
  const data = err.response?.data;
  if (!data) return 'Erro inesperado. Tente novamente.';
  // Possíveis formatos: {message: '...'} ou {errors: {...}}
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).flat().join(' | ');
  }
  return 'Falha ao realizar cadastro.';
}

function goToLogin() { router.push('/login'); }

// Componente de erro de campo (registrado automaticamente pelo <script setup>)
const FieldError = {
  name: 'FieldError',
  props: { error: { type: String, default: '' } },
  template: `<div v-if="error" class='field-error'>{{ error }}</div>`
};

</script>

<style scoped>
.signup-page { min-height: 100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; }
.logo { text-align:center; }
.navbar-logo { width:200px; height:160px; object-fit:contain; }
.card { background: rgba(255,255,255,0.1); border-radius:20px; padding:30px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border:1px solid rgba(255,255,255,0.2); box-shadow:0 8px 32px rgba(0,0,0,.4); max-width:520px; width:100%; }
.title { text-align:center; margin-top:0; }
.stepper { display:flex; justify-content:space-between; margin-bottom:20px; }
.step { flex:1; text-align:center; position:relative; }
.step:not(:last-child)::after { content:''; position:absolute; top:16px; right:-50%; width:100%; height:2px; background:rgba(255,255,255,0.3); }
.step.done:not(:last-child)::after { background:rgba(105,96,0,0.8); }
.circle { width:32px; height:32px; line-height:32px; margin:0 auto 4px; border-radius:50%; background:rgba(255,255,255,0.2); }
.step.active .circle, .step.done .circle { background:rgba(105,96,0,0.9); font-weight:bold; }
.label { font-size:12px; }
.input-group { position:relative; width:100%; margin:10px 0; display:flex; }
.input-group input { flex:1; padding:10px 10px; border:none; outline:none; border-radius:10px 0 0 10px; background:rgba(255,255,255,0.15); color:white; font-size:14px; }
.input-group .input-icon { width:40px; background:rgba(255,255,255,0.15); border-left:1px solid rgba(255,255,255,0.3); border-radius:0 10px 10px 0; display:flex; align-items:center; justify-content:center; color:white; font-size:16px; }
.input-group.has-error input { box-shadow:0 0 0 2px rgba(255,80,80,0.6); }
.input-group.is-valid input { box-shadow:0 0 0 2px rgba(80,200,120,0.6); }
.progress-text { text-align:center; font-size:13px; margin:-4px 0 8px; color:#ddd; }
.cancel-btn { background:none; border:none; color:#ffe27a; text-decoration:underline; padding:4px 0; cursor:pointer; font-size:12px; }
.cancel-btn:hover { color:#fff2b3; }
.cancel-wrap { text-align:right; margin-top:4px; }
.actions { display:flex; justify-content:space-between; margin-top:10px; }
button { cursor:pointer; }
.btn { border:none; padding:12px 18px; border-radius:10px; font-weight:bold; letter-spacing:1px; transition:.3s; }
.btn-primary { background:rgba(105,96,0,0.8); color:#fff; }
.btn-primary:hover { background:rgba(105,96,0,1); transform:scale(1.03); }
.btn-secondary { background:rgba(255,255,255,0.25); color:#fff; }
.btn-secondary:disabled, .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
.general-error { margin-top:15px; color:#ffb3b3; font-size:14px; font-weight:500; }
.success-msg { margin-top:15px; color:#b5ffb3; font-size:14px; font-weight:500; }
.login-switch { margin-top:20px; text-align:center; font-size:14px; }
.login-switch a { color:#ffe27a; cursor:pointer; text-decoration:underline; }
.field-error { color:#ff9b9b; font-size:12px; margin-top:-6px; margin-bottom:6px; }
</style>
