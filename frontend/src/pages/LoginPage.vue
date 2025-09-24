<template>
  <div class="login-page" >
    <h1>
      <img src="../assets/Icon_vertical_nexora-removebg-preview.png" alt="logoNexora" class="navbar-logo"><img/>
    </h1>
    <div class="login-logo">

    </div>
    <div class="card">
      <div class="card-body">
        <p class="login-box-msg">Bem-vindo ao Nexora</p>
        <p class="login-box-msg2">Faça seu login</p>
        <form @submit.prevent="loginUser">
  <div class="input-group">
    <input type="text" name="username" placeholder="Usuário" v-model="username"  />
    <span class="input-icon"><i class="bi bi-person-fill"></i></span>
  </div>
  <p>ou</p>
    <div class="input-group">
    <input type="email" name="email" placeholder="Email" v-model="email" />
    <span class="input-icon"><i class="bi bi-at"></i></span>
  </div>
  <div class="input-group">
    <input type="password" name="password" placeholder="Senha" v-model="password" required />
    <span class="input-icon"><i class="bi bi-lock-fill"></i></span>
  </div>
  <button class="btn btn-primary" style="margin: 10px;" type="submit">
    <i class="bi bi-door-open-fill"></i>
    Acessar
  </button>
</form>

      </div>
    </div>
  </div>


</template>

<style>
/* habilita propriedades customizadas animáveis */
@property --stop1 {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 30%;
}
@property --stop2 {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 80%;
}

body {
  margin: 0;
  min-height: 100vh;

  /* usamos variáveis para os stops */
  background: linear-gradient(
    30deg,
    rgba(105, 96, 0, 1) 0%,
    rgba(0, 0, 36, 1) var(--stop1),
    rgba(0, 0, 36, 1) var(--stop2),
    rgba(105, 96, 0, 1) 100%
  );

  /* animação suave */
  animation: breathe 3s ease-in-out infinite alternate;
}

/* anima as duas variáveis ao mesmo tempo */
@keyframes breathe {
  from {
    --stop1: 30%;
    --stop2: 80%;
  }
  to {
    --stop1: 20%;
    --stop2: 90%;
  }
}


  .navbar-logo {
    width: 250px;
    height: 200px;
    object-fit: cover;
    margin-right: 8px;
    /* margin-bottom: -70px; */
  }
  .login-box-msg {
    margin-top: -40px;
    font-weight: bold;
  }
  .login-box-msg2 {
    margin-top: -20px;
    font-style: italic;
    font-weight: 100;
    color: gray;
    font-size: 15px;
  }
  .card {
    background: rgba(255, 255, 255, 0.1); /* transparência */
    border-radius: 20px;
    padding: 30px;
    backdrop-filter: blur(10px); /* efeito de vidro */
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    max-width: 400px;
    width: 100%;
    text-align: center;
    color: white;
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
  border-radius: 10px 0 0 10px; /* arredondado só na esquerda */
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 14px;
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.input-group .input-icon {
  width: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0 10px 10px 0; /* arredondado só na direita */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  pointer-events: none;
}



button.btn-primary {
  width: 150px;
  border-radius: 10px;
  background: rgba(105, 96, 0, 0.8);
  border: none;
  padding: 12px;
  font-weight: bold;
  letter-spacing: 1px;
  transition: 0.3s;
  text-align: center;
}

button.btn-primary:hover {
  background: rgba(105, 96, 0, 1);
  transform: scale(1.05);
}
  </style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const email = ref('')
const username = ref('')
const password = ref('')

const loginUser = async () => {
  try {
    const response = await axios.post('http://localhost:8083/api/v1/auth/login', {
      username: username.value,
      email: email.value,
      password: password.value
    })

    if (response.status !== 200) {
      throw new Error('Login failed')
    }

    const token = response.data.token
    localStorage.setItem('token', token)

    // 👇 Salvar cargo corretamente
    // se a API retorna o cargo no login:
    if (response.data.usuario && response.data.usuario.cargo) {
      localStorage.setItem('cargo', response.data.usuario.cargo.toLowerCase())
    } else {
      // hardcoded só pra teste
      localStorage.setItem('cargo', 'admin') // pode trocar por dono/gerente/colaborador
    }

    router.push('/home')

  } catch (error) {
    alert('Erro no login: usuário ou senha inválidos')
    console.error(error)
  }
}

</script>