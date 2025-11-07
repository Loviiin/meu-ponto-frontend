<template>
  <div class="password-strength">
    <div class="indicator">
      <div class="bar" :class="forca" :style="{ width: `${(cumpridos / 4) * 100}%` }"></div>
    </div>
    <span class="label" :class="forca">
      Senha {{ forca === 'forte' ? 'Forte' : forca === 'media' ? 'Média' : 'Fraca' }}
    </span>
    <ul class="requirements">
      <li v-for="(req, i) in requisitos" :key="i" :class="{ ok: req.cumprido, pendente: !req.cumprido }">
        <i :class="req.cumprido ? 'bi bi-check-circle-fill' : 'bi bi-x-circle'"></i>
        {{ req.nome }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  senha: {
    type: String,
    default: ''
  }
})

const requisitos = computed(() => [
  { nome: 'Mínimo 8 caracteres', cumprido: props.senha.length >= 8 },
  { nome: 'Letra maiúscula (A-Z)', cumprido: /[A-Z]/.test(props.senha) },
  { nome: 'Letra minúscula (a-z)', cumprido: /[a-z]/.test(props.senha) },
  { nome: 'Número (0-9)', cumprido: /[0-9]/.test(props.senha) },
])

const cumpridos = computed(() => requisitos.value.filter(r => r.cumprido).length)

const forca = computed(() => {
  if (cumpridos.value === 4) return 'forte'
  if (cumpridos.value >= 2) return 'media'
  return 'fraca'
})
</script>

<style scoped>
.password-strength {
  margin-top: 0.5rem;
}

.indicator {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.bar {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 3px;
}

.bar.fraca {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
  box-shadow: 0 0 8px rgba(231, 76, 60, 0.5);
}

.bar.media {
  background: linear-gradient(90deg, #f39c12, #e67e22);
  box-shadow: 0 0 8px rgba(243, 156, 18, 0.5);
}

.bar.forte {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
  box-shadow: 0 0 8px rgba(46, 204, 113, 0.5);
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.label.fraca {
  color: #e74c3c;
}

.label.media {
  color: #f39c12;
}

.label.forte {
  color: #2ecc71;
}

.requirements {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.8rem;
}

.requirements li {
  margin: 0.375rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.requirements li i {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.requirements li.ok {
  color: #2ecc71;
}

.requirements li.pendente {
  color: rgba(255, 255, 255, 0.5);
}

/* Dark mode - cores mais claras */
body.dark-mode .indicator {
  background: rgba(255, 255, 255, 0.15);
}

body.dark-mode .label.fraca {
  color: #ff6b6b;
}

body.dark-mode .label.media {
  color: #ffa94d;
}

body.dark-mode .label.forte {
  color: #51cf66;
}

body.dark-mode .requirements li.ok {
  color: #51cf66;
}

body.dark-mode .requirements li.pendente {
  color: rgba(255, 255, 255, 0.6);
}
</style>
