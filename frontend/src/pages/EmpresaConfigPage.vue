<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="md:flex md:items-center md:justify-between mb-8">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Configurações da Empresa
          </h2>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Autenticação e Segurança
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Gerencie como seus funcionários acessam o sistema.
          </p>
        </div>
        <div class="px-4 py-5 sm:p-6 space-y-6">
          
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-900 dark:text-white" id="google-link-label">
                Permitir vinculação Google com email diferente
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                Se ativado, funcionários poderão vincular contas Google pessoais (ex: @gmail.com) mesmo que sejam diferentes do email corporativo cadastrado.
              </span>
            </div>
            <button 
              type="button" 
              class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexora-blue"
              :class="googleLinkFlexible ? 'bg-nexora-blue' : 'bg-gray-200 dark:bg-gray-700'"
              role="switch" 
              :aria-checked="googleLinkFlexible"
              @click="toggleGoogleStrategy"
              :disabled="loading"
            >
              <span class="sr-only">Use setting</span>
              <span 
                aria-hidden="true" 
                class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                :class="googleLinkFlexible ? 'translate-x-5' : 'translate-x-0'"
              ></span>
            </button>
          </div>

          <div v-if="message" class="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-green-800 dark:text-green-200">
                  {{ message }}
                </p>
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
import api from '../axios'

const loading = ref(false)
const googleLinkFlexible = ref(true) // Default to flexible
const message = ref('')
const empresaId = ref(null)

const fetchConfig = async () => {
  try {
    loading.value = true
    // Get empresa_id from localStorage (set during login)
    empresaId.value = localStorage.getItem('empresa_id')
    
    if (!empresaId.value) {
      console.error('Empresa ID não encontrado')
      return
    }
    
    // Fetch empresa configuration
    const response = await api.get(`/empresas/${empresaId.value}`)
    const strategy = response.data.google_link_strategy || 'flexible'
    googleLinkFlexible.value = strategy === 'flexible'
  } catch (err) {
    console.error('Erro ao buscar configuração:', err)
    // Keep default value on error
  } finally {
    loading.value = false
  }
}

const toggleGoogleStrategy = async () => {
  loading.value = true
  message.value = ''
  
  try {
    const newStrategy = googleLinkFlexible.value ? 'strict' : 'flexible'
    
    await api.put(`/empresas/${empresaId.value}`, {
      google_link_strategy: newStrategy
    })
    
    googleLinkFlexible.value = !googleLinkFlexible.value
    message.value = 'Configuração atualizada com sucesso.'
    
    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (err) {
    console.error('Erro ao atualizar configuração:', err)
    message.value = 'Erro ao atualizar configuração. Tente novamente.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>
