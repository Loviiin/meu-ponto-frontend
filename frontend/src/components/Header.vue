<template>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar shadow-sm">
    <div class="container-fluid">
      <router-link to="/home" class="navbar-brand d-flex align-items-center">
  <img src="/assets/Icon_horizontal_nexora.png" alt="Nexora" class="navbar-logo me-2" />
      </router-link>

      <!-- Hamburger (mobile only) -->
      <button
        class="navbar-toggler d-lg-none"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNavbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- Direct links -->
          <li class="nav-item">
            <router-link class="nav-link" to="/home"><i class="bi bi-house-fill me-1"></i>Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/meu-banco-horas"><i class="bi bi-clock-history me-1"></i>Meu Banco de Horas</router-link>
          </li>

          <!-- Cadastros -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-ui-checks-grid me-1"></i>Cadastros
            </a>
            <ul class="dropdown-menu">
              <li><router-link class="dropdown-item" to="/usuario/list">Listar Funcionários</router-link></li>
              <li><router-link class="dropdown-item" to="/usuario/new">Novo Funcionário</router-link></li>
              <li><hr class="dropdown-divider" /></li>
              <li><router-link class="dropdown-item" to="/cargo/list">Listar Cargos</router-link></li>
              <li><router-link class="dropdown-item" to="/cargo/new">Novo Cargo</router-link></li>
            </ul>
          </li>

          <!-- Administrativo -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-building-gear me-1"></i>Administrativo
            </a>
            <ul class="dropdown-menu">
              <li><router-link class="dropdown-item" to="/empresa/list">Listar Empresas</router-link></li>
              <li><router-link class="dropdown-item" to="/empresa/new">Nova Empresa</router-link></li>
              <li><hr class="dropdown-divider" /></li>
              <li><router-link class="dropdown-item" to="/permissoes">Gerenciar Permissões</router-link></li>
              <li><router-link class="dropdown-item" to="/Solicitacoes/Ajuste-Ponto">Justificativas Pendentes</router-link></li>
            </ul>
          </li>

          <!-- Relatórios -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-bar-chart-line me-1"></i>Relatórios
            </a>
            <ul class="dropdown-menu">
              <li><router-link class="dropdown-item" :to="{ name: 'RelatorioProprio' }">Exportar Relatório de Ponto</router-link></li>
              <li><router-link class="dropdown-item" :to="{ name: 'RelatorioGeral' }">Relatório Geral de Ponto</router-link></li>
            </ul>
          </li>

          <!-- Ponto (colaborador) -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-clock me-1"></i>Ponto
            </a>
            <ul class="dropdown-menu">
              <li><router-link class="dropdown-item" to="/Meus-Pontos">Meus Registros</router-link></li>
              <li><router-link class="dropdown-item" to="/Ajuste-Ponto">Solicitar Ajuste</router-link></li>
              <li><router-link class="dropdown-item" to="/minhas-justificativas">Minhas Solicitações</router-link></li>
            </ul>
          </li>
        </ul>

        <!-- Right side: account actions -->
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-light btn-sm" title="Sair" @click="logoutUser">
            <i class="bi bi-box-arrow-right me-1"></i> Sair
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('cargo')
  router.push('/login')
}
</script>

<style scoped>
/* Restore previous look: translucent dark with blur and subtle border */
.custom-navbar {
  background: rgba(26, 36, 45, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.navbar-logo {
  height: 52px; /* slightly larger per request */
  width: auto;
  object-fit: contain;
}

/* Increase toggler icon visual size a touch */
.navbar-toggler {
  padding: 0.4rem 0.6rem;
}
.navbar-toggler .navbar-toggler-icon {
  width: 1.6em;
  height: 1.6em;
}

/* Dropdown menu styling to match theme */
.dropdown-menu {
  background: rgba(26, 36, 45, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.dropdown-item {
  color: #fff;
}
.dropdown-item:hover,
.dropdown-item:focus {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
</style>






