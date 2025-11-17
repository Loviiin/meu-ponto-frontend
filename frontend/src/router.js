import { createRouter, createWebHistory } from 'vue-router'

// Lazy load todas as pages para melhor chunking
const Login = () => import('./pages/LoginPage.vue')
const Home = () => import('./pages/HomePage.vue')
const EmployeeList = () => import('./pages/EmployeeList.vue')
const EmployeeNew = () => import('./pages/EmployeeNew.vue')
const EmployeeEdit = () => import('./pages/EmployeeEdit.vue')
const CargoList = () => import('./pages/CargoList.vue')
const EmpresaNew = () => import('./pages/EmpresaNew.vue')
const EmpresaList = () => import('./pages/EmpresaList.vue')
const CargoNew = () => import('./pages/CargoNew.vue')
const Permissoes = () => import('./pages/Permissoes.vue')
const PontoUserList = () => import('./pages/PontoUserList.vue')
const AjustePonto = () => import('./pages/AjustePonto.vue')
const JustificativasPendentes = () => import('./pages/JustificativasPendentes.vue')
const MinhasJustificativas = () => import('./pages/MinhasJustificativas.vue')
const SignUp = () => import('./pages/SignUpPage.vue')
const BancoHoras = () => import('./pages/BancoHoras.vue')
const ProfilePage = () => import('./pages/ProfilePage.vue')
const DashboardPage = () => import('./pages/DashboardPage.vue')
const CalendarioPage = () => import('./pages/CalendarioPage.vue')
const CargoDetail = () => import('./pages/CargoDetail.vue')
const CargoEdit = () => import('./pages/CargoEdit.vue')
const CargoPermissoes = () => import('./pages/CargoPermissoes.vue')
const RelatorioPonto = () => import('./pages/RelatorioPonto.vue')
const RelatorioGeral = () => import('./pages/RelatorioGeral.vue')
const EmpresaEdit = () => import('./pages/EmpresaEdit.vue')

const routes = [

  { 
    path: '/login',
    component: Login ,
    meta: { hideNavbar: true, hidePunchButton: true }
  },

  { 
    path: '/',
    component: Login ,
    meta: { hideNavbar: true, hidePunchButton: true }
  },

  { 
    path: '/signup',
    component: SignUp ,
    meta: { hideNavbar: true, hidePunchButton: true }
  },

  { path: '/home',
    component: Home,
    meta: { requiresAuth: true } 
  },  
  {
    path: '/usuario/list',
    component: EmployeeList,
    meta: { requiresAuth: true, permission: 'EDITAR_USUARIO' }
  },
  {
    path: '/usuario/new',
    component: EmployeeNew,
    meta: { requiresAuth: true, permission: 'EDITAR_USUARIO' }
  },
  {
    path: '/usuario/edit/:id',
    component: EmployeeEdit,
    meta: { requiresAuth: true, permission: 'EDITAR_USUARIO' }
  },
  {
    path: '/funcionarios/:id/editar',
    component: EmployeeEdit,
    meta: { requiresAuth: true, permission: 'EDITAR_USUARIO' }
  },
  {
    path: '/empresa/list',
    component: EmpresaList,
    meta: { requiresAuth: true }
  },
      {
    path: '/empresa/new',
    component: EmpresaNew,
    meta: { requiresAuth: true }
  },
  {
    path: '/cargo/list',
    component: CargoList,
    meta: { requiresAuth: true, permission: 'GERENCIAR_CARGOS' }
  },
  {
    path: '/cargo/new',
    component: CargoNew,
    meta: { requiresAuth: true, permission: 'GERENCIAR_CARGOS' }
  },
  {
    path: '/cargo/detail/:id',
    name: 'CargoDetail',
    component: CargoDetail,
    meta: { requiresAuth: true, permission: 'GERENCIAR_CARGOS' }
  },
  {
    path: '/cargo/edit/:id',
    name: 'CargoEdit',
    component: CargoEdit,
    meta: { requiresAuth: true, permission: 'GERENCIAR_CARGOS' }
  },
  {
    path: '/cargo/:id/permissoes',
    name: 'CargoPermissoes',
    component: CargoPermissoes,
    meta: { requiresAuth: true, permission: 'GERENCIAR_CARGOS' }
  },
  {
    path: '/permissoes',
    component: Permissoes,
    meta: { requiresAuth: true, permission: 'GERENCIAR_CARGOS' }
  },
    {
    path: '/Meus-Pontos',
    component: PontoUserList,
    meta: { requiresAuth: true }
  },

  {
    path: '/Ajuste-Ponto',
    component: AjustePonto,
    meta: { requiresAuth: true }
  },
  {
    path: '/minhas-justificativas',
    component: MinhasJustificativas,
    meta: { requiresAuth: true }
  },
  {
    path: '/Solicitacoes/Ajuste-Ponto',
    component: JustificativasPendentes,
    meta: { requiresAuth: true, permission: 'APROVAR_JUSTIFICATIVAS' }
  },

  // Relatórios de Ponto
  {
    path: '/ponto/relatorios/me',
    name: 'RelatorioProprio',
    component: RelatorioPonto,
    meta: { requiresAuth: true }
  },
  {
    path: '/ponto/relatorios/usuario/:id',
    name: 'RelatorioFuncionario',
    component: RelatorioPonto,
    meta: { requiresAuth: true, permission: 'VISUALIZAR_PONTO_FUNCIONARIOS' }
  },
  {
    path: '/relatorio-geral',
    name: 'RelatorioGeral',
    component: RelatorioGeral,
    meta: { requiresAuth: true, permission: 'VISUALIZAR_RELATORIOS_GERAIS' }
  },

  // Banco de Horas
  {
    path: '/meu-banco-horas',
    component: BancoHoras,
    meta: { requiresAuth: true }
  },

  // Perfil
  {
    path: '/perfil',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },

  // Dashboard de Estatísticas
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },

  // Calendário de Ponto
  {
    path: '/calendario',
    name: 'Calendario',
    component: CalendarioPage,
    meta: { requiresAuth: true }
  },
  
  // Empresa
  {
    path: '/empresa/edit/:id',
    name: 'EmpresaEdit',
    component: EmpresaEdit,
    meta: { requiresAuth: true }
  }
] 

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Importar funções de permissão
import { getUserPermissions, hasPerm } from './utils/permissions'

// Guard de autenticação e permissões
router.beforeEach((to, from, next) => {
  // Verifica autenticação (aceita 'token' ou 'access' por compatibilidade)
  const isAuthenticated = !!(localStorage.getItem('token') || localStorage.getItem('access'))
  const requiresAuth = to.meta.requiresAuth
  const requiredPermission = to.meta.permission

  // Se a rota requer autenticação e o usuário não está autenticado
  if (requiresAuth && !isAuthenticated) {
    console.log('❌ Não autenticado, redirecionando para /login')
    return next('/login')
  }

  // Se a rota requer permissão específica
  if (requiredPermission && isAuthenticated) {
    const userPermissions = getUserPermissions()
    
    if (!hasPerm(userPermissions, requiredPermission)) {
      // Redireciona para home com mensagem de erro
      console.warn(`⚠️ Acesso negado: permissão ${requiredPermission} necessária`)
      return next('/home')
    }
  }

  next()
})

// Toggle login theme class on body based on current route
router.afterEach((to) => {
  const isAuthPage = to.path === '/login' || to.path === '/' || to.path === '/signup'
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('theme-login', isAuthPage)
  }
})


export default router
