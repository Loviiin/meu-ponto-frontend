<template>
  <div class="login-page d-flex align-items-center justify-content-center">
    <div class="login-card card shadow-lg">
      <div class="card-body p-4 p-md-5 text-center">
        <img src="../assets/Icon_vertical_nexora-removebg-preview.png" alt="Nexora" class="brand-logo mb-2" />
        <p class="login-box-msg">Bem-vindo ao Nexora</p>
        <p class="login-box-msg2">Faça seu login</p>
        <form @submit.prevent="loginUser" class="mt-3">
          <div class="input-group">
            <input type="email" name="email" placeholder="Email" v-model="email" />
            <span class="input-icon"><i class="bi bi-at"></i></span>
          </div>
          <div class="input-group">
            <input type="password" name="password" placeholder="Senha" v-model="password" required />
            <span class="input-icon"><i class="bi bi-lock-fill"></i></span>
          </div>
          <button class="btn btn-primary mt-2" type="submit">
            <i class="bi bi-door-open-fill"></i>
            Acessar
          </button>
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
}
button.btn-primary:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
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
      password: ''
    }
  },
  methods: {
    async loginUser() {
      try {
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

        this.$router.push('/home');
      } catch (error) {
        console.error("Erro no login:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Não foi possível fazer login");
      }
    },
    goToSignUp() {
      this.$router.push('/signup');
    }
  }
}
</script>