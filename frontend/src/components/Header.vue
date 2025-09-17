<template>
  <header>
    <div class="navbar-header">
      <img src="../assets/logoFab.png" alt="Logo" class="navbar-logo" />
      <span class="navbar-title">FabDnit</span>
    </div>
    <ul>
      <li><router-link to="/home">
        <i class="bi bi-house-fill"></i> Home</router-link></li>
      <li><router-link to="/employee">
        <i class="bi bi-person-lines-fill"></i> Funcionários</router-link>
      </li>
      <button class="btn btn-sm" title="Sair" style="color: aliceblue;"  @click="logoutUser">
      <i class="bi bi-box-arrow-right"></i>
    </button>
    </ul>
  </header>
</template>

<style scoped>

  header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 50px;
    background: #1a242d;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 100;
    padding: 0 10px;
  }

  .navbar-header {
    display: flex;
    align-items: center;
  }

  .navbar-logo {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 8px;
    background: #fff;
  }

  .navbar-title {
    color: #ecf0f1;
    font-size: 1.2rem;
    font-weight: semi-bold;
    letter-spacing: 1px;
  }

  ul {
    display: flex;
    gap: 16px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
  }

  a.router-link-active,
  a {
    color: #ecf0f1;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 4px;
    transition: background 0.2s;
    display: block;
  }

  a.router-link-active,
  a:hover {
    background: #424242;
  }
</style>

<script>
export default {
  name: 'Header'
}
</script>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logoutUser = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>