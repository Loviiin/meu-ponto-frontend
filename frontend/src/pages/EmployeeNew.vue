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

      <div v-if="loadingSupport" class="overlay">
        <div class="spinner"></div>
        <div class="overlay-text">Carregando dados (cargos & localidades)...</div>
      </div>
      <form @submit.prevent="handleSubmit" novalidate :aria-busy="loadingSupport" :inert="loadingSupport ? true : null">
        <!-- Nome -->
        <div class="form-row" :class="fieldClass('nome')">
          <label>Nome *</label>
          <input type="text" v-model.trim="form.nome" @blur="touch('nome')" placeholder="Nome completo" />
          <FieldError :error="errors.nome" />
        </div>

        <!-- Email -->
        <div class="form-row" :class="fieldClass('email')">
          <label>Email *</label>
          <input type="email" v-model.trim="form.email" @blur="touch('email')" placeholder="email@empresa.com" />
          <FieldError :error="errors.email" />
        </div>

        <!-- CPF -->
        <div class="form-row" :class="fieldClass('cpf')">
          <label>CPF *</label>
          <input type="text" v-mask="'###.###.###-##'" v-model="masked.cpf" @blur="onBlurCpf" placeholder="000.000.000-00" />
          <FieldError :error="errors.cpf" />
        </div>

        <!-- Senha -->
        <div class="form-row" :class="fieldClass('senha')">
          <label>Senha *</label>
          <input type="password" v-model="form.senha" @blur="touch('senha')" placeholder="Mínimo 6 caracteres" />
          <FieldError :error="errors.senha" />
        </div>

        <!-- Cargo -->
        <div class="form-row" :class="fieldClass('cargo_id')">
          <label>
            Cargo *
            <i class="bi bi-info-circle" style="margin-left:6px; opacity:.85;" :title="cargoTooltip"></i>
          </label>
          <select v-model="form.cargo_id" @blur="touch('cargo_id')">
            <option value="">Selecione</option>
            <option v-for="c in cargos" :key="c.id" :value="c.id">
              {{ c.nome }} ({{ c.nivel_hierarquia ?? '?' }})
            </option>
          </select>
          <FieldError :error="errors.cargo_id" />
        </div>

        <!-- Localidade -->
        <div class="form-row" :class="fieldClass('localidade_id')">
          <label>Local de Trabalho *</label>
          <select v-model="form.localidade_id" @blur="touch('localidade_id')">
            <option value="">Selecione</option>
            <option v-for="l in localidades" :key="l.id" :value="l.id">{{ l.nome }}</option>
          </select>
          <FieldError :error="errors.localidade_id" />
        </div>

        <!-- Salário -->
        <div class="form-row" :class="fieldClass('salario')">
          <label>Salário (R$) *</label>
            <input type="number" step="0.01" min="0" v-model.number="form.salario" @blur="touch('salario')" />
          <FieldError :error="errors.salario" />
        </div>

        <!-- Data Admissão -->
        <div class="form-row" :class="fieldClass('data_admissao')">
          <label>Data de Admissão *</label>
          <input type="date" v-model="dataAdmissaoLocal" @blur="onBlurDataAdmissao" />
          <FieldError :error="errors.data_admissao" />
        </div>

        <div class="actions">
          <button type="button" class="btn secondary" @click="goBack" :disabled="submitting || loadingSupport">Cancelar</button>
          <button type="submit" class="btn primary" :disabled="submitting || loadingSupport">
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
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../axios';
import { toast } from '../toast.js';
import { onlyDigits, REGEX, normalizeEmail, isFutureDate } from '../utils/validators.js';

// ---- Estado principal ----
const router = useRouter();
const empresaId = Number(localStorage.getItem('empresa_id')) || null;
const meNivel = ref(null); // nível hierárquico do cargo de quem está criando
const cargoTooltip = computed(()=>
  'Você só pode criar usuários com cargos até o seu nível hierárquico.' + (meNivel.value != null ? ` (Seu nível: ${meNivel.value})` : '')
);

const form = reactive({
  nome: '',
  cpf: '',          // armazenado somente dígitos
  email: '',
  senha: '',
  empresa_id: empresaId, // usado apenas para contexto local (carregar localidades); backend ignora no POST
  localidade_id: '',
  cargo_id: '',
  salario: null,
  data_admissao: '' // ISO gerado no submit
});

const masked = reactive({ cpf: '' });
const dataAdmissaoLocal = ref('');
const cargos = ref([]);
const localidades = ref([]);
const loadingSupport = ref(false);
const DRAFT_KEY = 'employee_new_draft_v1';
const submitting = ref(false);
const errors = reactive({});
const touched = reactive(new Set());
const liveMessage = ref('');

function touch(field){ touched.add(field); validateField(field); }
function isTouched(field){ return touched.has(field); }
function fieldClass(field){ return { 'has-error': isTouched(field) && errors[field], 'is-valid': isTouched(field) && !errors[field] }; }

function onBlurCpf(){
  form.cpf = onlyDigits(masked.cpf).slice(0,11);
  touch('cpf');
}
function onBlurDataAdmissao(){
  if (dataAdmissaoLocal.value) {
    if (isFutureDate(dataAdmissaoLocal.value)) {
      errors.data_admissao = 'Data não pode ser futura';
    } else {
      delete errors.data_admissao;
      form.data_admissao = new Date(dataAdmissaoLocal.value + 'T00:00:00Z').toISOString();
    }
  } else {
    errors.data_admissao = 'Data de admissão é obrigatória';
  }
  touched.add('data_admissao');
}

function validateField(field){
  switch(field){
    case 'nome': errors.nome = form.nome ? '' : 'Nome é obrigatório'; if(!errors.nome) delete errors.nome; break;
    case 'email':
      if(!form.email) errors.email='Email é obrigatório';
      else if(!REGEX.EMAIL.test(form.email)) errors.email='Formato de email inválido';
      else delete errors.email; break;
    case 'cpf':
      if(!form.cpf) errors.cpf='CPF é obrigatório';
      else if(!REGEX.CPF.test(form.cpf)) errors.cpf='CPF deve ter 11 dígitos';
      else delete errors.cpf; break;
    case 'senha':
      if(!form.senha) errors.senha='Senha é obrigatória';
      else if(form.senha.length < 6) errors.senha='Senha deve ter pelo menos 6 caracteres';
      else delete errors.senha; break;
    case 'cargo_id':
      if(!form.cargo_id) errors.cargo_id='Selecione um cargo'; else delete errors.cargo_id; break;
    case 'localidade_id':
      if(!form.localidade_id) errors.localidade_id='Selecione uma localidade'; else delete errors.localidade_id; break;
    case 'salario':
      if(form.salario == null) errors.salario='Informe o salário';
      else if(form.salario < 0) errors.salario='Salário inválido';
      else delete errors.salario; break;
    case 'data_admissao':
      if(!form.data_admissao) errors.data_admissao='Data de admissão é obrigatória'; else delete errors.data_admissao; break;
  }
}

function validateAll(){
  ['nome','email','cpf','senha','cargo_id','localidade_id','salario','data_admissao'].forEach(f=>{ if(!touched.has(f)) touch(f); else validateField(f); });
  return Object.keys(errors).length===0;
}

async function loadSupport(){
  if(!empresaId){ toast.error('empresa_id não encontrado. Faça login novamente.'); router.push('/login'); return; }
  loadingSupport.value = true;
  try {
    // 1) Obter nível hierárquico do requisitante
    const meRes = await api.get('/usuarios/me');
    meNivel.value = meRes?.data?.contrato?.cargo?.nivel_hierarquia ?? null;

    // 2) Carregar cargos e localidades
    const [cargosRes, locRes] = await Promise.all([
      api.get('/cargos'),
      api.get(`/empresas/${empresaId}/localidades`)
    ]);

    const allCargos = (cargosRes.data || []).map(c=>({
      id: c.id || c.ID,
      nome: c.nome || c.Nome,
      nivel_hierarquia: c.nivel_hierarquia ?? c.nivelHierarquia ?? 0
    })).filter(c=>c.id && c.nome);

    // 3) Filtrar cargos pelo nível do requisitante
    cargos.value = (typeof meNivel.value === 'number')
      ? allCargos.filter(c => (c.nivel_hierarquia ?? 0) <= meNivel.value)
      : allCargos; // fallback: sem nível, não filtra, mas backend ainda validará

    localidades.value = (locRes.data || []).map(l=>({ id: l.id||l.ID, nome: l.nome||l.Nome })).filter(l=>l.id && l.nome);
  } catch(err){
    const status = err.response?.status;
    if(status === 401){
      toast.error('Sessão expirada. Faça login novamente.');
      router.push('/login');
      return;
    }
    if(status === 403){
      toast.error('Você não tem permissão para acessar estes dados.');
      return;
    }
    toast.error(err.response?.data?.message || 'Falha ao carregar dados de suporte');
  } finally { loadingSupport.value = false; }
}

onMounted(()=>{
  // restaurar rascunho
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if(raw){
      const draft = JSON.parse(raw);
      Object.assign(form, { ...form, ...draft, empresa_id: empresaId });
      if(draft.cpf){ masked.cpf = draft.cpf; form.cpf = onlyDigits(draft.cpf); }
      if(draft.dataAdmissaoLocal) dataAdmissaoLocal.value = draft.dataAdmissaoLocal;
    }
  } catch(e){ /* ignore */ }
  loadSupport();
});

let draftTimeout;
watch(form, ()=>{
  clearTimeout(draftTimeout);
  draftTimeout = setTimeout(()=>{
    const payload = { ...form, senha: '', dataAdmissaoLocal: dataAdmissaoLocal.value };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  }, 400);
},{ deep:true });

async function handleSubmit(){
  liveMessage.value='';
  if(!form.data_admissao && dataAdmissaoLocal.value){ onBlurDataAdmissao(); }
  if(!validateAll()) { liveMessage.value='Erros de validação no formulário.'; toast.error('Verifique os campos destacados.'); return; }
  submitting.value = true;
  try {
    // Sanitizar nome: collapse espaços múltiplos
    const sanitizedNome = form.nome.replace(/\s+/g,' ').trim();
    const payload = {
      nome: sanitizedNome,
      cpf: form.cpf,
      email: normalizeEmail(form.email),
      senha: form.senha,
      localidade_id: Number(form.localidade_id),
      cargo_id: Number(form.cargo_id),
      salario: Number(form.salario),
      data_admissao: form.data_admissao || new Date(dataAdmissaoLocal.value + 'T00:00:00Z').toISOString()
    };
    const res = await api.post('/usuarios', payload, { headers: { 'Content-Type': 'application/json' }});
  localStorage.removeItem(DRAFT_KEY);
  toast.success('Funcionário criado com sucesso!');
    router.push('/usuario/list');
  } catch(err){
    const status = err.response?.status;
    const data = err.response?.data;
    let msg = 'Erro ao criar funcionário';
    if(status === 400){
      // regra de hierarquia do backend
      msg = 'Você não pode atribuir um cargo com nível hierárquico superior ao seu.';
    } else if(status === 401){
      msg = 'Sessão expirada. Faça login novamente.';
      toast.error(msg);
      router.push('/login');
      return;
    } else if(status === 403){
      msg = 'Você não tem permissão para realizar esta ação.';
    } else if(data){
      if(typeof data === 'string') msg = data;
      else if(data.message) msg = data.message;
      else if(data.error) msg = data.error;
      else if(data.errors) msg = Object.values(data.errors).flat().join(' | ');
    }
    toast.error(msg);
    liveMessage.value = msg;
  } finally { submitting.value = false; }
}

function goBack(){ router.push('/usuario/list'); }

// Component inline
const FieldError = { name:'FieldError', props:{ error:{ type:String, default:'' } }, template:`<div v-if="error" class='field-error'>{{ error }}</div>` };
</script>

<style scoped>
/* Layout com o mesmo glass do BancoHoras */
.employee-page { min-height: 100vh; display:flex; align-items:center; justify-content:center; padding: 20px; color:white; }
.glass-card { background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); color: rgba(255,255,255,0.92); }
.glass-card .card-header { background: rgba(255, 255, 255, 0.04); border-bottom: 1px solid rgba(255, 255, 255, 0.12); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: rgba(255, 255, 255, 0.95); border-top-left-radius: 16px; border-top-right-radius: 16px; }
.card { padding:30px; max-width:720px; width:100%; }
.title { text-align:center; margin: 0 0 6px 0; }
.subtitle { margin-top:-4px; color:#ddd; font-size:14px; text-align:center; margin-bottom: 16px; }

form { display:grid; grid-template-columns: 1fr 1fr; gap:16px 28px; }
.form-row { display:flex; flex-direction:column; grid-column: span 1; }
.form-row label { font-weight:600; font-size:13px; margin-bottom:6px; color:#f5f5f5; }
.form-row input, .form-row select { background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); border-radius:10px; padding:10px 12px; color:#fff; font-size:14px; }
.form-row input::placeholder { color: rgba(255,255,255,0.7); }
.form-row.has-error input, .form-row.has-error select { box-shadow:0 0 0 2px rgba(255,80,80,0.6); }
.form-row.is-valid input, .form-row.is-valid select { box-shadow:0 0 0 2px rgba(80,200,120,0.6); }
.form-row input:focus, .form-row select:focus { outline:none; border-color:rgba(255,255,255,0.5); }
.actions { grid-column: 1 / -1; display:flex; justify-content:flex-end; gap:12px; margin-top:8px; }
.btn { border:none; border-radius:10px; padding:10px 18px; font-weight:700; letter-spacing:0.5px; cursor:pointer; transition:.25s; }
.btn.primary { background:rgba(105,96,0,0.9); color:#fff; }
.btn.primary:hover { background:rgba(105,96,0,1); transform: translateY(-1px); }
.btn.secondary { background:rgba(255,255,255,0.2); color:#fff; }
.btn.secondary:hover { background:rgba(255,255,255,0.3); }
.btn:disabled { opacity:.55; cursor:not-allowed; }
.field-error { color:#ff9b9b; font-size:12px; margin-top:4px; }
@media (max-width: 780px){ form { grid-template-columns:1fr; } }
</style>
