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

      <div v-if="loadingCargos || loadingLocalidades" class="overlay">
        <div class="spinner"></div>
        <div class="overlay-text">Carregando dados...</div>
      </div>
      
      <form @submit.prevent="handleSubmit" novalidate :aria-busy="loadingCargos || loadingLocalidades" :inert="(loadingCargos || loadingLocalidades) ? true : null">
        
        <!-- Seção: Dados Pessoais -->
        <section class="form-section">
          <h3>👤 Dados Pessoais</h3>

          <!-- Nome -->
          <div class="form-row" :class="fieldClass('nome')">
            <label>Nome Completo *</label>
            <input 
              type="text" 
              v-model.trim="form.nome" 
              @blur="touch('nome')" 
              placeholder="Ex: João da Silva"
              :disabled="submitting"
            />
            <FieldError :error="errors.nome" />
          </div>

          <!-- CPF -->
          <div class="form-row" :class="fieldClass('cpf')">
            <label>CPF *</label>
            <input 
              type="text" 
              v-model="form.cpf" 
              @input="formatCPF"
              @blur="touch('cpf')" 
              placeholder="000.000.000-00"
              maxlength="14"
              :disabled="submitting"
            />
            <FieldError :error="errors.cpf" />
          </div>

          <!-- Email -->
          <div class="form-row" :class="fieldClass('email')">
            <label>Email *</label>
            <input 
              type="email" 
              v-model.trim="form.email" 
              @blur="touch('email')" 
              placeholder="funcionario@empresa.com"
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
              placeholder="Mínimo 8 caracteres"
              :disabled="submitting"
            />
            <small class="hint">A senha deve ter no mínimo 8 caracteres</small>
            <FieldError :error="errors.senha" />
          </div>
        </section>

        <!-- Seção: Dados do Contrato -->
        <section class="form-section">
          <h3>📋 Dados do Contrato</h3>

          <!-- Cargo -->
          <div class="form-row" :class="fieldClass('cargoId')">
            <label>Cargo *</label>
            <select 
              v-model="form.cargoId" 
              @change="carregarInfoCargo"
              @blur="touch('cargoId')"
              :disabled="submitting || loadingCargos"
            >
              <option value="">Selecione o cargo</option>
              <option v-for="c in cargos" :key="c.id" :value="c.id">
                {{ c.nome }}
              </option>
            </select>
            <small v-if="cargoSelecionado" class="info">
              💼 {{ cargoSelecionado.nome }} - {{ formatarMinutosParaHoras(cargoSelecionado.carga_horaria_diaria_minutos) }}h/dia
            </small>
            <FieldError :error="errors.cargoId" />
          </div>

          <!-- Tipo de Contrato -->
          <div class="form-row" :class="fieldClass('tipoContrato')">
            <label>Tipo de Contrato *</label>
            <select 
              v-model="form.tipoContrato" 
              @change="ajustarCargaPorTipo"
              @blur="touch('tipoContrato')"
              :disabled="submitting"
            >
              <option value="CLT">CLT (Regime CLT)</option>
              <option value="PJ">PJ (Pessoa Jurídica)</option>
              <option value="Part-time">Part-time (Meio Período)</option>
              <option value="Estagiário">Estagiário</option>
              <option value="Temporário">Temporário</option>
            </select>
            <small class="hint">{{ descricoesTipoContrato[form.tipoContrato] }}</small>
            <FieldError :error="errors.tipoContrato" />
          </div>

          <!-- Localidade -->
          <div class="form-row" :class="fieldClass('localidadeId')">
            <label>Localidade *</label>
            <select 
              v-model="form.localidadeId" 
              @blur="touch('localidadeId')"
              :disabled="submitting || loadingLocalidades"
            >
              <option value="">Selecione a localidade</option>
              <option v-for="l in localidades" :key="l.id" :value="l.id">
                {{ l.nome }}
              </option>
            </select>
            <FieldError :error="errors.localidadeId" />
          </div>

          <!-- Salário -->
          <div class="form-row" :class="fieldClass('salario')">
            <label>Salário (R$) *</label>
            <input 
              type="number" 
              v-model.number="form.salario" 
              @blur="touch('salario')" 
              placeholder="0.00"
              step="0.01"
              min="0"
              :disabled="submitting"
            />
            <small v-if="cargoSelecionado && cargoSelecionado.salario_minimo" class="info">
              Faixa do cargo: R$ {{ cargoSelecionado.salario_minimo.toFixed(2) }} - R$ {{ cargoSelecionado.salario_maximo.toFixed(2) }}
            </small>
            <FieldError :error="errors.salario" />
          </div>

          <!-- Data de Admissão -->
          <div class="form-row" :class="fieldClass('dataAdmissao')">
            <label>Data de Admissão *</label>
            <input 
              type="date" 
              v-model="form.dataAdmissao" 
              @blur="touch('dataAdmissao')" 
              :max="dataHoje"
              :disabled="submitting"
            />
            <FieldError :error="errors.dataAdmissao" />
          </div>
        </section>

        <!-- Seção: Carga Horária (Opcional) -->
        <section class="form-section">
          <div class="section-header">
            <h3>⏰ Carga Horária</h3>
            <label class="toggle">
              <input type="checkbox" v-model="usarCargaPersonalizada" :disabled="submitting" />
              <span>Personalizar carga horária</span>
            </label>
          </div>

          <!-- Info: Usando padrão -->
          <div v-if="!usarCargaPersonalizada" class="info-box">
            <p>
              ℹ️ Será utilizada a carga horária padrão do cargo<span v-if="cargoSelecionado">: 
              <strong>{{ formatarMinutosParaHoras(cargoSelecionado.carga_horaria_diaria_minutos) }}h/dia</strong></span>
            </p>
          </div>

          <!-- Personalização -->
          <div v-else class="custom-config">
            <!-- Presets Rápidos -->
            <div class="form-row">
              <label>Modelos Rápidos</label>
              <div class="preset-buttons">
                <button 
                  type="button"
                  class="btn-preset"
                  :class="{ active: presetSelecionado === 'meio-periodo' }"
                  @click="aplicarPreset('meio-periodo')"
                  :disabled="submitting"
                >
                  📅 Meio Período<br><small>4h/dia (20h/sem)</small>
                </button>
                <button 
                  type="button"
                  class="btn-preset"
                  :class="{ active: presetSelecionado === 'part-time' }"
                  @click="aplicarPreset('part-time')"
                  :disabled="submitting"
                >
                  ⏱️ Part-time<br><small>6h/dia (30h/sem)</small>
                </button>
                <button 
                  type="button"
                  class="btn-preset"
                  :class="{ active: presetSelecionado === 'clt-padrao' }"
                  @click="aplicarPreset('clt-padrao')"
                  :disabled="submitting"
                >
                  🕐 CLT Padrão<br><small>8h/dia (40h/sem)</small>
                </button>
                <button 
                  type="button"
                  class="btn-preset"
                  :class="{ active: presetSelecionado === 'comercial' }"
                  @click="aplicarPreset('comercial')"
                  :disabled="submitting"
                >
                  💼 Comercial<br><small>8h48/dia (44h/sem)</small>
                </button>
                <button 
                  type="button"
                  class="btn-preset"
                  :class="{ active: presetSelecionado === 'custom' }"
                  @click="presetSelecionado = 'custom'"
                  :disabled="submitting"
                >
                  ✏️ Personalizado
                </button>
              </div>
            </div>

            <!-- Configuração Manual -->
            <div v-if="presetSelecionado === 'custom'" class="form-row-grid">
              <div class="form-row">
                <label>Horas por Dia</label>
                <input 
                  type="number" 
                  v-model.number="horasPorDia" 
                  @input="calcularMinutosDiarios"
                  placeholder="8"
                  step="0.5"
                  min="0"
                  max="24"
                  :disabled="submitting"
                />
              </div>

              <div class="form-row">
                <label>Dias Trabalhados por Semana</label>
                <select v-model.number="form.diasTrabalhadosSemana" :disabled="submitting">
                  <option :value="3">3 dias</option>
                  <option :value="4">4 dias</option>
                  <option :value="5">5 dias (Seg-Sex)</option>
                  <option :value="6">6 dias (Seg-Sáb)</option>
                </select>
              </div>

              <div class="form-row">
                <label>Total Semanal (calculado)</label>
                <input 
                  type="text" 
                  :value="formatarMinutosParaHoras(cargaSemanalCalculada)"
                  readonly
                  class="calculated-field"
                  :disabled="submitting"
                />
              </div>
            </div>

            <!-- Validação em Tempo Real -->
            <div v-if="form.cargaHorariaDiariaMinutos" class="validation-alert">
              <div 
                class="alert"
                :class="{
                  'alert-success': validacaoCarga.valido && !validacaoCarga.aviso,
                  'alert-warning': validacaoCarga.aviso,
                  'alert-error': !validacaoCarga.valido
                }"
              >
                <span v-if="validacaoCarga.valido">✅ {{ validacaoCarga.mensagem }}</span>
                <span v-else>⚠️ {{ validacaoCarga.mensagem }}</span>
              </div>
            </div>
          </div>
        </section>

        <div class="actions">
          <button type="button" class="btn secondary" @click="goBack" :disabled="submitting || loadingCargos || loadingLocalidades">
            Cancelar
          </button>
          <button type="submit" class="btn primary" :disabled="submitting || loadingCargos || loadingLocalidades || !validacaoCarga.valido">
            <span v-if="!submitting">Cadastrar Funcionário</span>
            <span v-else>Cadastrando...</span>
          </button>
        </div>
        <div class="sr-only" aria-live="polite">{{ liveMessage }}</div>
      </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../axios';
import { toast } from '../toast.js';
import { REGEX } from '../utils/validators.js';

// ---- Estado principal ----
const router = useRouter();
const empresaId = Number(localStorage.getItem('empresa_id')) || null;

const form = reactive({
  nome: '',
  cpf: '',
  email: '',
  senha: '',
  cargoId: '',
  localidadeId: '',
  salario: 0,
  dataAdmissao: new Date().toISOString().split('T')[0],
  tipoContrato: 'CLT',
  cargaHorariaDiariaMinutos: null,
  cargaHorariaSemanalMinutos: null,
  diasTrabalhadosSemana: 5,
  empresaId: empresaId
});

const cargos = ref([]);
const localidades = ref([]);
const loadingCargos = ref(false);
const loadingLocalidades = ref(false);
const submitting = ref(false);
const errors = reactive({});
const touched = reactive(new Set());
const liveMessage = ref('');

// Carga horária personalizada
const usarCargaPersonalizada = ref(false);
const presetSelecionado = ref(null);
const horasPorDia = ref(8);

// ---- Computed ----
const dataHoje = computed(() => new Date().toISOString().split('T')[0]);

const cargoSelecionado = computed(() => 
  cargos.value.find(c => c.id === Number(form.cargoId))
);

const cargaSemanalCalculada = computed(() => {
  const diaria = form.cargaHorariaDiariaMinutos || 0;
  const dias = form.diasTrabalhadosSemana || 5;
  return diaria * dias;
});

// Descrições dos tipos de contrato
const descricoesTipoContrato = {
  'CLT': 'Regime CLT padrão - 44h semanais, todos os direitos trabalhistas',
  'PJ': 'Pessoa Jurídica - Autônomo/Freelancer',
  'Part-time': 'Meio período - Até 6h diárias, 30h semanais',
  'Estagiário': 'Estágio - Até 6h diárias (Lei 11.788/2008)',
  'Temporário': 'Contrato temporário (Lei 6.019/74)'
};

// Validação de carga horária por tipo de contrato
const validacaoCarga = computed(() => {
  const diaria = form.cargaHorariaDiariaMinutos;
  const tipo = form.tipoContrato;

  if (!diaria || !usarCargaPersonalizada.value) {
    return { valido: true, mensagem: 'Usando padrão do cargo' };
  }

  // Part-time / Estagiário: máximo 6h (360 minutos)
  if ((tipo === 'Part-time' || tipo === 'Estagiário') && diaria > 360) {
    return {
      valido: false,
      mensagem: 'Part-time e Estagiário: máximo 6h/dia (360 minutos)'
    };
  }

  // CLT: máximo 10h (8h + 2h extras = 600 minutos)
  if (tipo === 'CLT' && diaria > 600) {
    return {
      valido: false,
      mensagem: 'CLT: máximo 10h/dia (8h normais + 2h extras)'
    };
  }

  // CLT: aviso se passar de 8h
  if (tipo === 'CLT' && diaria > 480 && diaria <= 600) {
    return {
      valido: true,
      aviso: true,
      mensagem: `${formatarMinutosParaHoras(diaria)}h/dia - Acima da jornada padrão (8h)`
    };
  }

  // PJ: máximo recomendado 12h (720 minutos)
  if (tipo === 'PJ' && diaria > 720) {
    return {
      valido: false,
      mensagem: 'Carga horária excessiva. Máximo recomendado: 12h/dia'
    };
  }

  return {
    valido: true,
    mensagem: `${formatarMinutosParaHoras(diaria)}h/dia - Dentro dos limites legais`
  };
});

// ---- Funções auxiliares ----
function formatarMinutosParaHoras(minutos) {
  if (!minutos) return '0';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return mins > 0 ? `${horas}:${mins.toString().padStart(2, '0')}` : `${horas}`;
}

function formatCPF() {
  let cpf = form.cpf.replace(/\D/g, '');
  if (cpf.length > 11) cpf = cpf.slice(0, 11);
  
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  
  form.cpf = cpf;
}

// ---- Presets de carga horária ----
const presets = {
  'meio-periodo': { diaria: 240, semanal: 1200, dias: 5 }, // 4h/dia
  'part-time': { diaria: 360, semanal: 1800, dias: 5 }, // 6h/dia
  'clt-padrao': { diaria: 480, semanal: 2400, dias: 5 }, // 8h/dia
  'comercial': { diaria: 528, semanal: 2640, dias: 5 } // 8h48/dia (44h semanais)
};

function aplicarPreset(preset) {
  presetSelecionado.value = preset;
  const config = presets[preset];
  form.cargaHorariaDiariaMinutos = config.diaria;
  form.cargaHorariaSemanalMinutos = config.semanal;
  form.diasTrabalhadosSemana = config.dias;
  horasPorDia.value = config.diaria / 60;
}

function calcularMinutosDiarios() {
  form.cargaHorariaDiariaMinutos = Math.round(horasPorDia.value * 60);
  form.cargaHorariaSemanalMinutos = form.cargaHorariaDiariaMinutos * form.diasTrabalhadosSemana;
}

function ajustarCargaPorTipo() {
  const tipo = form.tipoContrato;

  if (tipo === 'Part-time') {
    aplicarPreset('part-time');
    usarCargaPersonalizada.value = true;
  } else if (tipo === 'Estagiário') {
    aplicarPreset('part-time'); // Estagiário também é 6h
    usarCargaPersonalizada.value = true;
  } else if (tipo === 'CLT') {
    aplicarPreset('clt-padrao');
    usarCargaPersonalizada.value = false; // CLT usa padrão do cargo
  }
}

// Watch para resetar carga ao desmarcar personalização
watch(usarCargaPersonalizada, (personalizada) => {
  if (!personalizada) {
    form.cargaHorariaDiariaMinutos = null;
    form.cargaHorariaSemanalMinutos = null;
    form.diasTrabalhadosSemana = 5;
    presetSelecionado.value = null;
  }
});

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

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) {
    return false;
  }

  // CPFs com todos dígitos iguais são inválidos
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

function validateField(field) {
  switch(field) {
    case 'nome': 
      errors.nome = form.nome ? '' : 'Nome é obrigatório'; 
      if (!errors.nome) delete errors.nome; 
      break;
    case 'cpf':
      if (!form.cpf) {
        errors.cpf = 'CPF é obrigatório';
      } else if (!validarCPF(form.cpf)) {
        errors.cpf = 'CPF inválido';
      } else {
        delete errors.cpf;
      }
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
      } else if (form.senha.length < 8) {
        errors.senha = 'Senha deve ter pelo menos 8 caracteres';
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
    case 'localidadeId':
      if (!form.localidadeId) {
        errors.localidadeId = 'Selecione uma localidade';
      } else {
        delete errors.localidadeId;
      }
      break;
    case 'salario':
      if (!form.salario || form.salario <= 0) {
        errors.salario = 'Informe um salário válido';
      } else {
        delete errors.salario;
      }
      break;
    case 'dataAdmissao':
      if (!form.dataAdmissao) {
        errors.dataAdmissao = 'Data de admissão é obrigatória';
      } else {
        delete errors.dataAdmissao;
      }
      break;
    case 'tipoContrato':
      if (!form.tipoContrato) {
        errors.tipoContrato = 'Selecione um tipo de contrato';
      } else {
        delete errors.tipoContrato;
      }
      break;
  }
}

function validateAll() {
  ['nome', 'cpf', 'email', 'senha', 'cargoId', 'localidadeId', 'salario', 'dataAdmissao', 'tipoContrato'].forEach(f => { 
    if (!touched.has(f)) touch(f); 
    else validateField(f); 
  });
  return Object.keys(errors).length === 0;
}

// ---- Carregar Dados ----
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
      nome: c.nome || c.Nome,
      carga_horaria_diaria_minutos: c.carga_horaria_diaria_minutos || c.CargaHorariaDiariaMinutos || 480,
      salario_minimo: c.salario_minimo || c.SalarioMinimo || 0,
      salario_maximo: c.salario_maximo || c.SalarioMaximo || 0
    })).filter(c => c.id && c.nome);
    
    if (cargos.value.length === 0) {
      toast.warning('Nenhum cargo cadastrado. Cadastre cargos primeiro.');
    }
  } catch(err) {
    const status = err.response?.status;
    const data = err.response?.data;
    
    if (status === 401) {
      // Verificar se é realmente falta de autenticação ou apenas permissão
      const errorMsg = data?.error || data?.message || '';
      if (errorMsg.toLowerCase().includes('token') || 
          errorMsg.toLowerCase().includes('expirado') ||
          errorMsg.toLowerCase().includes('autenticação')) {
        toast.error('Sessão expirada. Faça login novamente.');
        router.push('/login');
        return;
      }
      // Se for erro de autorização mas o token existe, mostrar mensagem sem deslogar
      toast.warning('Você não tem permissão para acessar os cargos.');
    } else if (status === 403) {
      toast.warning('Você não tem permissão para acessar os cargos.');
    } else {
      toast.error('Falha ao carregar cargos. Tente novamente.');
    }
    console.error('Erro ao carregar cargos:', err);
  } finally { 
    loadingCargos.value = false; 
  }
}

async function loadLocalidades() {
  if (!empresaId) return;
  
  loadingLocalidades.value = true;
  try {
    const res = await api.get('/localidades');
    localidades.value = (res.data || []).map(l => ({
      id: l.id || l.ID,
      nome: l.nome || l.Nome
    })).filter(l => l.id && l.nome);
    
    if (localidades.value.length === 0) {
      toast.warning('Nenhuma localidade cadastrada. Cadastre localidades primeiro.');
    }
  } catch(err) {
    const status = err.response?.status;
    const data = err.response?.data;
    
    if (status === 401) {
      // Verificar se é realmente falta de autenticação ou apenas permissão
      const errorMsg = data?.error || data?.message || '';
      if (errorMsg.toLowerCase().includes('token') || 
          errorMsg.toLowerCase().includes('expirado') ||
          errorMsg.toLowerCase().includes('autenticação')) {
        toast.error('Sessão expirada. Faça login novamente.');
        router.push('/login');
        return;
      }
      // Se for erro de autorização mas o token existe, mostrar mensagem sem deslogar
      toast.warning('Você não tem permissão para acessar as localidades.');
    } else if (status === 403) {
      toast.warning('Você não tem permissão para acessar as localidades.');
    } else {
      toast.error('Falha ao carregar localidades. Tente novamente.');
    }
    console.error('Erro ao carregar localidades:', err);
  } finally { 
    loadingLocalidades.value = false; 
  }
}

function carregarInfoCargo() {
  if (cargoSelecionado.value) {
    const { salario_minimo, salario_maximo } = cargoSelecionado.value;

    // Ajustar faixa salarial se o salário estiver fora
    if (salario_minimo && form.salario < salario_minimo) {
      form.salario = salario_minimo;
    }
  }
}

onMounted(() => {
  loadCargos();
  loadLocalidades();
});

// ---- Submit ----
async function handleSubmit() {
  liveMessage.value = '';
  
  if (!validateAll()) { 
    liveMessage.value = 'Erros de validação no formulário.'; 
    toast.error('Verifique os campos destacados.'); 
    return; 
  }

  if (!validacaoCarga.value.valido) {
    toast.error('Carga horária inválida para o tipo de contrato selecionado.');
    return;
  }
  
  submitting.value = true;
  try {
    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.replace(/\D/g, ''),
      email: form.email.toLowerCase().trim(),
      senha: form.senha,
      cargo_id: Number(form.cargoId),
      localidade_id: Number(form.localidadeId),
      salario: Number(form.salario),
      data_admissao: new Date(form.dataAdmissao).toISOString()
    };

    // Adicionar tipo de contrato se diferente de CLT
    if (form.tipoContrato && form.tipoContrato !== 'CLT') {
      payload.tipo_contrato = form.tipoContrato;
    }

    // Adicionar carga horária se personalizada
    if (usarCargaPersonalizada.value && form.cargaHorariaDiariaMinutos) {
      payload.carga_horaria_diaria_minutos = Number(form.cargaHorariaDiariaMinutos);
      payload.carga_horaria_semanal_minutos = Number(form.cargaHorariaSemanalMinutos);
      payload.dias_trabalhados_semana = Number(form.diasTrabalhadosSemana);
    }
    
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
    msg = data?.error || data?.message || 'Dados inválidos. Verifique os campos.';
  } else if (status === 409) {
    msg = data?.error || data?.message || 'Email ou CPF já cadastrado no sistema.';
    if (msg.toLowerCase().includes('email')) {
      errors.email = msg;
      touched.add('email');
    } else if (msg.toLowerCase().includes('cpf')) {
      errors.cpf = msg;
      touched.add('cpf');
    }
  } else if (status === 401) {
    // Verificar se é realmente falta de autenticação ou apenas permissão
    const errorMsg = data?.error || data?.message || '';
    if (errorMsg.toLowerCase().includes('token') || 
        errorMsg.toLowerCase().includes('expirado') ||
        errorMsg.toLowerCase().includes('autenticação')) {
      msg = 'Sessão expirada. Faça login novamente.';
      toast.error(msg);
      router.push('/login');
      return;
    }
    // Se for erro de autorização mas o token existe, mostrar mensagem sem deslogar
    msg = 'Você não tem permissão para criar funcionários.';
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
  max-width: 900px; 
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

/* Seções do formulário */
.form-section {
  background: rgba(255, 255, 255, 0.06);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-section h3 {
  margin: 0 0 20px;
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.95);
  border-bottom: 2px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 12px;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  border: none;
  padding: 0;
}

/* Toggle/Checkbox */
.toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.toggle input[type="checkbox"] {
  width: auto;
  cursor: pointer;
  accent-color: rgba(105, 96, 0, 0.9);
}

form { 
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-row { 
  display: flex; 
  flex-direction: column;
  margin-bottom: 16px;
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

/* Hints e informações */
.hint,
.info {
  display: block;
  margin-top: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.info {
  color: rgba(135, 206, 250, 0.9);
}

/* Info box */
.info-box {
  background: rgba(135, 206, 250, 0.15);
  border: 1px solid rgba(135, 206, 250, 0.3);
  border-radius: 10px;
  padding: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 16px 0;
}

.info-box p {
  margin: 0;
}

/* Custom config */
.custom-config {
  margin-top: 16px;
}

/* Presets de carga horária */
.preset-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 8px;
}

.btn-preset {
  padding: 12px 10px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-weight: 600;
}

.btn-preset small {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
  font-weight: 400;
}

.btn-preset:hover {
  border-color: rgba(105, 96, 0, 0.8);
  background: rgba(105, 96, 0, 0.2);
}

.btn-preset.active {
  border-color: rgba(105, 96, 0, 0.9);
  background: rgba(105, 96, 0, 0.4);
  color: white;
  font-weight: 700;
}

/* Form row grid (campos lado a lado) */
.form-row-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

/* Campo calculado */
.calculated-field {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  cursor: not-allowed;
}

/* Alertas de validação */
.validation-alert {
  margin-top: 16px;
}

.alert {
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.alert-success {
  background: rgba(72, 187, 120, 0.2);
  border: 1px solid rgba(72, 187, 120, 0.4);
  color: rgba(154, 230, 180, 1);
}

.alert-warning {
  background: rgba(237, 137, 54, 0.2);
  border: 1px solid rgba(237, 137, 54, 0.4);
  color: rgba(251, 211, 141, 1);
}

.alert-error {
  background: rgba(245, 101, 101, 0.2);
  border: 1px solid rgba(245, 101, 101, 0.4);
  color: rgba(254, 178, 178, 1);
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

.btn.primary:hover:not(:disabled) { 
  background: rgba(105,96,0,1); 
  transform: translateY(-1px); 
}

.btn.secondary { 
  background: rgba(255,255,255,0.2); 
  color: #fff; 
}

.btn.secondary:hover:not(:disabled) { 
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

/* Responsive */
@media (max-width: 780px) { 
  .card {
    padding: 20px;
  }

  .form-section {
    padding: 16px;
  }

  .preset-buttons {
    grid-template-columns: 1fr;
  }

  .form-row-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
