import { createRouter, createWebHistory } from 'vue-router'
import Login from './pages/LoginPage.vue'
import Home from './pages/HomePage.vue'

const routes = [

  { 
    path: '/login',
    component: Login ,
    meta: { hideNavbar: true }
  },

  { 
    path: '/',
    component: Login ,
    meta: { hideNavbar: true }
  },

  { path: '/home',
    component: Home,
    meta: { requiresAuth: true } 
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


export default router