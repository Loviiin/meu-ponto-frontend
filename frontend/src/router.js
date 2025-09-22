import { createRouter, createWebHistory } from 'vue-router'
import Login from './pages/LoginPage.vue'
import Home from './pages/HomePage.vue'
import EmployeeList from './pages/EmployeeList.vue'
import EmployeeNew from './pages/EmployeeNew.vue'
// import EmployeeEdit from './pages/EmployeeEdit.vue'

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
    /* {
    path: '/usuarios/edit/:id',
    component: EmployeeList,
    meta: { requiresAuth: true }
  },  */
  
] 

const router = createRouter({
  history: createWebHistory(),
  routes
})


export default router