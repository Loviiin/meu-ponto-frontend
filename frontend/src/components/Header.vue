<template>
  <header>
    <div class="navbar-header">
      <img src="/assets/Icon_horizontal_nexora.png" alt="Logo" class="navbar-logo" />
    </div>
    <ul>
      <!-- Todos -->
      <li>
        <router-link to="/home"><i class="bi bi-house-fill"></i> Home</router-link>
      </li>

      <!-- Admin Nexora -->
      <template v-if="cargo === 'colaborador'">
        <li class="dropdown">
          <a href="#"><i class="bi bi-briefcase-fill"></i> Clientes</a>
          <ul class="dropdown-menu">
            <li><router-link to="/empresa/list">Listar Empresas</router-link></li>
            <li><router-link to="/empresa/new">Cadastrar Nova</router-link></li>
          </ul>
        </li>

        <li class="dropdown">
          <a href="#"><i class="bi bi-wallet"></i> Financeiro</a>
          <ul class="dropdown-menu">
            <li><router-link to="/planos">Planos e Assinaturas</router-link></li>
            <li><router-link to="/faturas">Faturas / Cobranças</router-link></li>
            <li><router-link to="/relatorios">Relatórios de Receita</router-link></li>
          </ul>
        </li>

        <li>
          <router-link to="/usuario/list"><i class="bi bi-person-fill"></i> Usuários</router-link>
        </li>

        <li class="dropdown">
          <a href="#"><i class="bi bi-gear"></i> Configurações</a>
          <ul class="dropdown-menu">
            <li><router-link to="/parametros">Parametrizações Globais</router-link></li>
            <li><router-link to="/logs">Logs / Auditoria</router-link></li>
            <li>
              <router-link to="/permissoes"><i class="bi bi-shield-lock"></i> Gerenciar Permissões</router-link>
            </li>
          </ul>
        </li>
      </template>

      <!-- Admin Empresa -->
      <template v-if="cargo === 'dono' || cargo === 'gerente' || cargo === 'colaborador' "  >
        <li class="dropdown">
          <a href="#"><i class="bi bi-building"></i> Minha Empresa</a>
          <ul class="dropdown-menu">
            <li><router-link to="/empresa/detail">Dados da Empresa</router-link></li>
            <li><router-link to="/cargo/list">Cargos</router-link></li>
            <li><router-link to="/usuario/list">Colaboradores</router-link></li>
          </ul>
        </li>

        <!-- Dono/Gerente -->

        <li class="dropdown">
          <a href="#"><i class="bi bi-calendar-week"></i> Escalas e Jornada</a>
          <ul class="dropdown-menu">
            <li><router-link to="/escalas">Escalas de Trabalho</router-link></li>
            <li><router-link to="/ajustes">Ajuste de Jornada</router-link></li>
          </ul>
        </li>

        <li class="dropdown">
          <a href="#"><i class="bi bi-mailbox-flag"></i> Ausências</a>
          <ul class="dropdown-menu">
            <li><router-link to="/ferias">Férias</router-link></li>
            <li><router-link to="/licencas">Licenças Médicas</router-link></li>
            <li><router-link to="/justificativas">Justificativas</router-link></li>
          </ul>
        </li>
          <li class="dropdown">
            <a href="#"><i class="bi bi-mailbox-flag"></i>Ponto Eletrônico</a>
            <ul class="dropdown-menu">
              <li><router-link to="/Solicitacoes/Ajuste-Ponto">Pedidos</router-link></li>
              <li><router-link to="/Pontos/Funcionarios">Controle de ponto</router-link></li>
            </ul>
          </li>

        <li><router-link to="/beneficios"><i class="bi bi-coin"></i> Benefícios</router-link></li>
        <li><router-link to="/folha"><i class="bi bi-file-earmark-text-fill"></i> Pagamentos/Folha</router-link></li>
      </template>

      <!-- Colaborador -->
      <template v-if="cargo === 'colaborador'">
        <li><router-link to="/Meus-Pontos"><i class="bi bi-clock"></i> Ponto</router-link></li>
        <li><router-link to="/solicitacoes"><i class="bi bi-mailbox-flag"></i> Solicitações</router-link></li>
        <li><router-link to="/meus-beneficios"><i class="bi bi-coin"></i> Benefícios</router-link></li>
        <li><router-link to="/minha-folha"><i class="bi bi-file-earmark-text-fill"></i> Folha</router-link></li>
        <li><router-link to="/perfil"><i class="bi bi-person-vcard"></i> Meu Perfil</router-link></li>
      </template>

      <!-- Botão logout -->
      <button class="btn" title="Sair" style="color: aliceblue;" @click="logoutUser">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </ul>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Sempre lê o cargo do localStorage
const cargo = computed(() => {
  const stored = localStorage.getItem('cargo')
  return stored ? stored.toLowerCase() : 'colaborador'
})

const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('cargo')
  router.push('/login')
}
</script>




<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 60px;
  background: rgba(26, 36, 45, 0.6); /* translúcido */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.navbar-header {
  display: flex;
  align-items: center;
}

.navbar-logo {
  width: 125px;
  height: 40px;
  object-fit: cover;
}

ul {
  display: flex;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

li {
  margin: 0;
}

a.router-link-active,
a {
  color: #fff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
}

a.router-link-active,
a:hover {
  background: rgba(255, 255, 255, 0.15);
}


button.btn i:hover {
  color: white;
  color:rgba(212, 175, 55, 1);
  line-height: 1;
}

button.btn:hover {
  transform: scale(1.05);
  color: rgba(212, 175, 55, 1);
}
.dropdown {
  position: relative;
}

.dropdown > a {
  cursor: pointer;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(26, 36, 45, 0.95);
  list-style: none;
  padding: 10px 0;
  margin: 0;
  border-radius: 12px;
  min-width: 200px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  z-index: 200;
}

.dropdown-menu li {
  margin: 0;
}

.dropdown-menu a {
  display: block;
  padding: 8px 16px;
  color: #fff;
  text-decoration: none;
  transition: background 0.3s ease;
}

.dropdown-menu a:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Exibir submenu ao passar mouse */
.dropdown:hover .dropdown-menu {
  display: block;
}

</style>






