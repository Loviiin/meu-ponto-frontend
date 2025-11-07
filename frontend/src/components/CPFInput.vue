<template>
  <div class="cpf-input-group">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div class="input-wrapper">
      <input
        :id="inputId"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': error, 'is-valid': isValid && modelValue }"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        :placeholder="placeholder"
        maxlength="14"
        :required="required"
        :disabled="disabled"
      />
      <span v-if="isValid && modelValue" class="validation-icon success">
        <i class="bi bi-check-circle-fill"></i>
      </span>
      <span v-else-if="error" class="validation-icon error">
        <i class="bi bi-x-circle-fill"></i>
      </span>
    </div>
    <small v-if="error" class="text-danger d-block mt-1">
      <i class="bi bi-exclamation-circle"></i> {{ error }}
    </small>
    <small v-else-if="hint" class="text-muted d-block mt-1">{{ hint }}</small>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatCPF, onlyDigits, validarCPF } from '../utils/validators'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'CPF'
  },
  placeholder: {
    type: String,
    default: '000.000.000-00'
  },
  hint: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  validateOnBlur: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const inputId = `cpf-input-${Math.random().toString(36).substr(2, 9)}`
const error = ref('')
const touched = ref(false)

const isValid = computed(() => {
  if (!props.modelValue) return false
  return validarCPF(props.modelValue)
})

const handleInput = (event) => {
  const formatted = formatCPF(event.target.value)
  emit('update:modelValue', formatted)
  
  // Limpar erro ao digitar
  if (error.value) {
    error.value = ''
  }
}

const handleBlur = () => {
  touched.value = true
  
  if (!props.validateOnBlur) return
  
  const digits = onlyDigits(props.modelValue)
  
  if (props.required && !digits) {
    error.value = 'CPF é obrigatório'
    return
  }
  
  if (digits && digits.length < 11) {
    error.value = 'CPF deve conter 11 dígitos'
    return
  }
  
  if (digits && !validarCPF(props.modelValue)) {
    error.value = 'CPF inválido. Verifique os números digitados'
    return
  }
  
  error.value = ''
}

// Validar quando o valor mudar externamente
watch(() => props.modelValue, (newVal) => {
  if (touched.value && newVal) {
    const digits = onlyDigits(newVal)
    if (digits.length === 11 && !validarCPF(newVal)) {
      error.value = 'CPF inválido. Verifique os números digitados'
    }
  }
})
</script>

<style scoped>
.cpf-input-group {
  position: relative;
}

.input-wrapper {
  position: relative;
}

.validation-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 1.125rem;
}

.validation-icon.success {
  color: #2ecc71;
}

.validation-icon.error {
  color: #e74c3c;
}

.form-control.is-valid {
  border-color: #2ecc71;
  padding-right: 2.5rem;
}

.form-control.is-invalid {
  border-color: #e74c3c;
  padding-right: 2.5rem;
}

.form-control:focus.is-valid {
  box-shadow: 0 0 0 0.2rem rgba(46, 204, 113, 0.25);
}

.form-control:focus.is-invalid {
  box-shadow: 0 0 0 0.2rem rgba(231, 76, 60, 0.25);
}

/* Dark mode - cores mais claras */
body.dark-mode .validation-icon.success {
  color: #51cf66;
}

body.dark-mode .validation-icon.error {
  color: #ff6b6b;
}

body.dark-mode .form-control.is-valid {
  border-color: #51cf66;
}

body.dark-mode .form-control.is-invalid {
  border-color: #ff6b6b;
}

body.dark-mode .text-danger {
  color: #ff6b6b !important;
}
</style>
