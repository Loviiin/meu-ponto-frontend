<template>
  <header>
    <div class="navbar-header">
      <img src="/assets/Icon_horizontal_nexora.png" alt="Logo" class="navbar-logo" />
    </div>
    <ul>
      <li><router-link to="/home"><i class="bi bi-house-fill"></i> Home</router-link></li>
      <li><router-link to="/employee"><i class="bi bi-person-lines-fill"></i> Funcionários</router-link></li>
      <button class="btn btn-sm" title="Sair" @click="logoutUser">
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

button.btn-sm {
  margin-left: 12px;
  background: rgba(212, 175, 55, 0.85);
  border: none;
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button.btn-sm i {
  color: white;
  font-size: 1.2rem;
}

button.btn-sm:hover {
  background: rgba(212, 175, 55, 1);
  transform: scale(1.05);
}
</style>
