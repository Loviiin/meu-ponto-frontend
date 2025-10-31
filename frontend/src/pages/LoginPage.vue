<template>
  <div class="login-page d-flex align-items-center justify-content-center">
    <div class="login-card card shadow-lg">
      <div class="card-body p-4 p-md-5 text-center">
        <img src="../assets/Icon_vertical_nexora-removebg-preview.png" alt="Nexora" class="brand-logo mb-2" />
        <p class="login-box-msg">Bem-vindo ao Nexora</p>
        <p class="login-box-msg2">Faça seu login</p>
        <form @submit.prevent="loginUser" class="mt-3">
          <div class="input-group">
            <input type="email" name="email" placeholder="Email" v-model="email" :disabled="loading" />
            <span class="input-icon"><i class="bi bi-at"></i></span>
          </div>
          <div class="input-group">
            <input type="password" name="password" placeholder="Senha" v-model="password" :disabled="loading" required />
            <span class="input-icon"><i class="bi bi-lock-fill"></i></span>
          </div>
          
          <!-- Indicador de servidor acordando -->
          <transition name="fade">
            <div v-if="serverWakingUp && !loading" class="server-waking-info">
              <i class="bi bi-lightning-charge me-1"></i>
              <span>Preparando servidor...</span>
            </div>
          </transition>
          
          <!-- Mensagem de cold start -->
          <transition name="fade">
            <div v-if="loading" class="cold-start-info">
              <i class="bi bi-hourglass-split me-1"></i>
              <span>Aguarde, conectando ao servidor...</span>
            </div>
          </transition>
          
          <div class="button-wrapper">
            <button class="btn btn-primary mt-2" type="submit" :disabled="loading">
              <span v-if="!loading">
                <i class="bi bi-door-open-fill"></i>
                Acessar
              </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Entrando...
              </span>
            </button>
          </div>
          
          <div class="signup-redirect">
            <span>Não tem conta?</span>
            <a href="#" @click.prevent="goToSignUp">Cadastre-se</a>
          </div>
        </form>
      </div>
    </div>
  </div>


</template>

<style scoped>
/* Full-height center for login page */
.login-page {
  min-height: 100vh;
  padding: 24px;
}

.brand-logo {
  width: 220px;
  height: auto;
  object-fit: contain;
}

.login-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: var(--color-white);
  width: 100%;
  max-width: 420px; /* prevents stretched layout on desktop */
}

.login-box-msg {
  margin-top: 0.25rem;
  font-weight: 700;
}
.login-box-msg2 {
  margin-top: -4px;
  font-style: italic;
  font-weight: 300;
  color: #c9c9c9;
  font-size: 0.95rem;
}

.input-group {
  position: relative;
  width: 100%;
  margin: 10px 0;
  display: flex;
}
.input-group input {
  flex: 1;
  padding: 10px 10px;
  border: none;
  outline: none;
  border-radius: 10px 0 0 10px;
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-white);
  font-size: 14px;
}
.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
.input-group .input-icon {
  width: 44px;
  background: rgba(255, 255, 255, 0.15);
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0 10px 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 16px;
  pointer-events: none;
}

button.btn-primary {
  width: 160px;
  border-radius: 10px;
  background: var(--color-primary-80);
  border: none;
  padding: 12px;
  font-weight: bold;
  letter-spacing: 0.5px;
  transition: 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
button.btn-primary:hover:not(:disabled) {
  background: var(--color-primary);
  transform: translateY(-1px);
}
button.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.server-waking-info {
  background: rgba(84, 206, 255, 0.15);
  border: 1px solid rgba(84, 206, 255, 0.3);
  border-radius: 8px;
  padding: 6px 10px;
  margin: 8px 0;
  font-size: 0.8rem;
  color: #54ceff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cold-start-info {
  background: rgba(255, 206, 84, 0.15);
  border: 1px solid rgba(255, 206, 84, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 8px 0;
  font-size: 0.85rem;
  color: #ffce54;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.signup-redirect { margin-top: 10px; font-size: 13px; }
.signup-redirect a { color: #ffe27a; text-decoration: underline; cursor: pointer; margin-left: 4px; }
.signup-redirect a:hover { color: #fff2b3; }
</style>

<script>
import api from '../axios'

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      serverWakingUp: false,
      wakeUpTimeout: null,
      serverAwake: false
    }
  },
  watch: {
    // Observa mudanças no email
    email() {
      this.scheduleServerWakeUp()
    },
    // Observa mudanças na senha
    password() {
      this.scheduleServerWakeUp()
    }
  },
  beforeUnmount() {
    // Limpa o timeout quando o componente é destruído
    if (this.wakeUpTimeout) {
      clearTimeout(this.wakeUpTimeout)
    }
  },
  methods: {
    scheduleServerWakeUp() {
      // Se o servidor já está acordado ou já está fazendo login, não faz nada
      if (this.serverAwake || this.loading) return
      
      // Limpa timeout anterior
      if (this.wakeUpTimeout) {
        clearTimeout(this.wakeUpTimeout)
      }
      
      // Aguarda 800ms após a última digitação para fazer o ping
      this.wakeUpTimeout = setTimeout(() => {
        this.wakeUpServer()
      }, 800)
    },
    
    async wakeUpServer() {
      // Só faz wake-up se houver pelo menos algum conteúdo digitado
      if (!this.email && !this.password) return
      
      // Se já está acordado, não precisa fazer de novo
      if (this.serverAwake) return
      
      this.serverWakingUp = true
      
      try {
        // Faz um ping leve no servidor usando o endpoint de health check
        // Usando um timeout menor para não travar a UI
        await api.get('/health', { 
          timeout: 5000,
          // Ignora erros de autenticação, só queremos acordar o servidor
          validateStatus: () => true 
        })
        
        this.serverAwake = true
        console.log('✅ Servidor acordado e pronto!')
      } catch (error) {
        // Mesmo com erro, considera que tentou acordar
        // (o servidor pode não ter endpoint /health, mas já acordou)
        this.serverAwake = true
        console.log('⚡ Ping enviado ao servidor')
      } finally {
        // Esconde o indicador após 1 segundo
        setTimeout(() => {
          this.serverWakingUp = false
        }, 1000)
      }
    },
    
    async loginUser() {
      this.loading = true
      try {
        // 1. Fazer login
        const response = await api.post(
          "/auth/login",
          {
            email: this.email,
            password: this.password
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            }
          }
        );

        const token = response.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("access", token); // Para compatibilidade com auth.js

        // 2. Buscar dados do usuário
        const userResponse = await api.get(
          "/usuarios/me",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const userData = userResponse.data;
        const contrato = userData?.contrato;
        if (contrato) {
          if (contrato.cargo_id != null) localStorage.setItem("cargo_id", String(contrato.cargo_id));
          if (contrato.empresa_id != null) localStorage.setItem("empresa_id", String(contrato.empresa_id));
        } else {
          localStorage.removeItem("cargo_id");
          localStorage.removeItem("empresa_id");
          console.warn("Contrato não encontrado no payload de /usuarios/me. Verifique o backend ou o vínculo do usuário.");
        }

        // 3. Carregar permissões do usuário
        try {
          const permResponse = await api.get("/profile/me/permissions");
          const permissions = permResponse.data.permissoes || [];
          
          // Salvar permissões no localStorage
          const permissionNames = permissions.map(p => p.nome);
          localStorage.setItem('user_permissions', JSON.stringify(permissionNames));
          
          console.log('✅ Permissões carregadas:', permissionNames);
        } catch (permError) {
          console.warn('⚠️ Erro ao carregar permissões:', permError);
          // Continua mesmo sem permissões
        }

        // 4. Redirecionar para home
        console.log('✅ Login bem-sucedido, redirecionando para /home...');
        
        // Usar nextTick para garantir que o router está pronto
        await this.$nextTick();
        
        // Tentar redirecionar
        await this.$router.push('/home');
        console.log('✅ Redirecionamento concluído');
      } catch (error) {
        console.error("❌ Erro no login:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || "Não foi possível fazer login. Verifique suas credenciais.";
        alert(errorMessage);
      } finally {
        this.loading = false
      }
    },
    goToSignUp() {
      this.$router.push('/signup');
    }
  }
}
</script>