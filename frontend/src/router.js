import { createRouter, createWebHistory } from 'vue-router'
import Login from './pages/LoginPage.vue'
import Home from './pages/HomePage.vue'
import EmployeeList from './pages/EmployeeList.vue'
import EmployeeNew from './pages/EmployeeNew.vue'
import EmployeeEdit from './pages/EmployeeEdit.vue'
import CargoList from './pages/CargoList.vue'
import EmpresaNew from './pages/EmpresaNew.vue'
import EmpresaList from './pages/EmpresaList.vue'
import CargoNew from './pages/CargoNew.vue'
import Permissoes from './pages/Permissoes.vue'
import PontoUserList from './pages/PontoUserList.vue'
import AjustePonto from './pages/AjustePonto.vue'
import JustificativasPendentes from './pages/JustificativasPendentes.vue'
import SignUp from './pages/SignUpPage.vue'
import BancoHoras from './pages/BancoHoras.vue';

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
    meta: { requiresAuth: true }
  },
    {
    path: '/usuario/new',
    component: EmployeeNew,
    meta: { requiresAuth: true }
  },
   {
    path: '/usuario/edit/:id',
    component: EmployeeEdit,
    meta: { requiresAuth: true }
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
    meta: { requiresAuth: true }
  },
      {
    path: '/cargo/new',
    component: CargoNew,
    meta: { requiresAuth: true }
  },
{
  path: '/cargo/detail/:id',
  name: 'CargoDetail',
  component: () => import('../src/pages/CargoDetail.vue'),
  meta: { requiresAuth: true }
},
  {
    path: '/permissoes',
    component: Permissoes,
    meta: { requiresAuth: true }
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
    path: '/Solicitacoes/Ajuste-Ponto',
    component: JustificativasPendentes,
    meta: { requiresAuth: true }
  },

  // Relatórios de Ponto
  {
    path: '/ponto/relatorios/me',
    name: 'RelatorioProprio',
    component: () => import('./pages/RelatorioPonto.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ponto/relatorios/usuario/:id',
    name: 'RelatorioFuncionario',
    component: () => import('./pages/RelatorioPonto.vue'),
    meta: { requiresAuth: true, permission: 'VISUALIZAR_PONTO_FUNCIONARIOS' }
  },

  // Banco de Horas
  {
    path: '/meu-banco-horas',
    component: BancoHoras,
    meta: { requiresAuth: true }
  },


  
] 

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Toggle login theme class on body based on current route
router.afterEach((to) => {
  const isAuthPage = to.path === '/login' || to.path === '/' || to.path === '/signup'
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('theme-login', isAuthPage)
  }
})


export default router