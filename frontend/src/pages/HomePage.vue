<template>
  <div class="home-page">
    <h1>Bem-vindo ao Nexora</h1>
    <p>Controle de Ponto</p>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120px;
  padding: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08); /* glass */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  color: white;
}

h1 {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #d4af37, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: rgba(255,255,255,0.8);
  font-size: 1.2rem;
  letter-spacing: 1px;
}
</style>
