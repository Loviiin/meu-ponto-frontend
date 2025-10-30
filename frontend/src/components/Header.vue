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
        @click="toggleMobileMenu"
        aria-controls="mainNavbar"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNavbar" :class="{ show: isMobileMenuOpen }">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- Direct links -->
          <li class="nav-item">
            <router-link class="nav-link" to="/home"><i class="bi bi-house-fill me-1"></i>Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard"><i class="bi bi-speedometer2 me-1"></i>Dashboard</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/calendario"><i class="bi bi-calendar3 me-1"></i>Calendário</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/meu-banco-horas"><i class="bi bi-clock-history me-1"></i>Meu Banco de Horas</router-link>
          </li>

          <!-- Cadastros -->
          <li class="nav-item dropdown" ref="cadastrosDropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" @click.prevent="toggleDropdown($event)">
              <i class="bi bi-ui-checks-grid me-1"></i>Cadastros
            </a>
            <ul class="dropdown-menu">
              <li><router-link class="dropdown-item" to="/usuario/list" @click="closeAllDropdowns">Listar Funcionários</router-link></li>
              <li><router-link class="dropdown-item" to="/usuario/new" @click="closeAllDropdowns">Novo Funcionário</router-link></li>
              <li><hr class="dropdown-divider" /></li>
              <li><router-link class="dropdown-item" to="/cargo/list" @click="closeAllDropdowns">Listar Cargos</router-link></li>
              <li><router-link class="dropdown-item" to="/cargo/new" @click="closeAllDropdowns">Novo Cargo</router-link></li>
            </ul>
          </li>

          <!-- Administrativo -->
          <li class="nav-item dropdown" ref="administrativoDropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" @click.prevent="toggleDropdown($event)">
              <i class="bi bi-building-gear me-1"></i>Administrativo
            </a>
            <ul class="dropdown-menu">
              <li><router-link class="dropdown-item" to="/empresa/list" @click="closeAllDropdowns">Listar Empresas</router-link></li>
              <li><router-link class="dropdown-item" to="/empresa/new" @click="closeAllDropdowns">Nova Empresa</router-link></li>
              <li><hr class="dropdown-divider" /></li>
              <li><router-link class="dropdown-item" to="/permissoes" @click="closeAllDropdowns">Gerenciar Permissões</router-link></li>
              <li><router-link class="dropdown-item" to="/Solicitacoes/Ajuste-Ponto" @click="closeAllDropdowns">Justificativas Pendentes</router-link></li>
            </ul>
          </li>

          <!-- Relatórios -->
          <li class="nav-item dropdown" ref="relatoriosDropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" @click.prevent="toggleDropdown($event)">
              <i class="bi bi-bar-chart-line me-1"></i>Relatórios
            </a>
            <ul class="dropdown-menu">
              <li><router-link class="dropdown-item" :to="{ name: 'RelatorioProprio' }" @click="closeAllDropdowns">Exportar Relatório de Ponto</router-link></li>
              <li><router-link class="dropdown-item" :to="{ name: 'RelatorioGeral' }" @click="closeAllDropdowns">Relatório Geral de Ponto</router-link></li>
            </ul>
          </li>

          <!-- Ponto (colaborador) -->
          <li class="nav-item dropdown" ref="pontoDropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" @click.prevent="toggleDropdown($event)">
              <i class="bi bi-clock me-1"></i>Ponto
            </a>
            <ul class="dropdown-menu">
              <li><router-link class="dropdown-item" to="/Meus-Pontos" @click="closeAllDropdowns">Meus Registros</router-link></li>
              <li><router-link class="dropdown-item" to="/Ajuste-Ponto" @click="closeAllDropdowns">Solicitar Ajuste</router-link></li>
              <li><router-link class="dropdown-item" to="/minhas-justificativas" @click="closeAllDropdowns">Minhas Solicitações</router-link></li>
            </ul>
          </li>
        </ul>

        <!-- Right side: account actions -->
        <div class="d-flex align-items-center gap-2">
          <router-link to="/perfil" class="btn btn-outline-light btn-sm" title="Meu Perfil">
            <i class="bi bi-person-circle me-1"></i> Perfil
          </router-link>
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
import { logout } from '../auth'
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const isMobileMenuOpen = ref(false)

const logoutUser = () => {
  // Chama a função logout do auth.js que limpa o cache e todos os tokens
  logout()
  
  // Remove outros dados se necessário
  localStorage.removeItem('cargo')
  
  // Redireciona para login
  router.push('/login')
}

// Toggle menu mobile
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Função para abrir/fechar dropdown
const toggleDropdown = (event) => {
  const dropdownElement = event.target.closest('.dropdown')
  if (!dropdownElement) return
  
  const isOpen = dropdownElement.classList.contains('show')
  
  // Fecha todos os dropdowns primeiro
  closeAllDropdowns()
  
  // Se não estava aberto, abre este
  if (!isOpen) {
    dropdownElement.classList.add('show')
    const menu = dropdownElement.querySelector('.dropdown-menu')
    if (menu) {
      menu.classList.add('show')
    }
  }
}

// Função para fechar todos os dropdowns
const closeAllDropdowns = () => {
  document.querySelectorAll('.dropdown.show').forEach(dropdown => {
    dropdown.classList.remove('show')
    const menu = dropdown.querySelector('.dropdown-menu')
    if (menu) {
      menu.classList.remove('show')
    }
  })
  // Fecha menu mobile também ao navegar
  isMobileMenuOpen.value = false
}

// Fecha dropdowns ao clicar fora
const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown')) {
    closeAllDropdowns()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Restore previous look: translucent dark with blur and subtle border */
.custom-navbar {
  background: rgba(26, 36, 45, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 1040;
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
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dropdown-item {
  color: #fff;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover,
.dropdown-item:focus {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.dropdown-divider {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Fix dropdown positioning */
.dropdown-menu.show {
  display: block;
}

/* Nav links styling */
.nav-link {
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.85) !important;
}

/* Mobile menu improvements */
@media (max-width: 991.98px) {
  .navbar-collapse {
    background: rgba(26, 36, 45, 0.98);
    margin-top: 0.5rem;
    padding: 1rem;
    border-radius: 0.5rem;
  }
  
  .dropdown-menu {
    border: none;
    background: rgba(255, 255, 255, 0.05);
  }
}
.dropdown-item:hover,
.dropdown-item:focus {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
</style>






