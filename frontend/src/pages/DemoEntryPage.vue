<template>
  <div class="demo-entry-page d-flex align-items-center justify-content-center">
    <div class="demo-entry-card card shadow-lg text-center p-4 p-md-5">
      <div class="spinner-border text-info mb-3" role="status" aria-hidden="true"></div>
      <p class="demo-entry-title mb-1">Carregando demo</p>
      <p class="demo-entry-subtitle mb-0">Entrando automaticamente no ambiente de demonstração...</p>
    </div>
  </div>
</template>

<script>
import api from '../axios'

export default {
  name: 'DemoEntryPage',
  async mounted() {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('access')
      localStorage.removeItem('user')
      localStorage.removeItem('cargo_id')
      localStorage.removeItem('empresa_id')
      localStorage.removeItem('user_permissions')

      const response = await api.post('/auth/demo', {}, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      })

      const { token, empresa_id, cargo_id, permissoes } = response.data || {}
      if (!token) {
        throw new Error('Token não retornado pelo endpoint de demo.')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('access', token)
      if (empresa_id != null) localStorage.setItem('empresa_id', String(empresa_id))
      if (cargo_id != null) localStorage.setItem('cargo_id', String(cargo_id))
      localStorage.setItem('user_permissions', JSON.stringify(Array.isArray(permissoes) ? permissoes : []))

      await this.$router.replace('/home')
    } catch (error) {
      console.error('❌ Erro ao carregar demo:', error.response?.data || error.message)
      await this.$router.replace('/login?demo=1')
    }
  }
}
</script>

<style scoped>
.demo-entry-page {
  min-height: 100vh;
  padding: 24px;
}

.demo-entry-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-white);
}

.demo-entry-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.demo-entry-subtitle {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
}
</style>