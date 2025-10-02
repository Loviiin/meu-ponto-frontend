<template>
    <footer class="footer d-flex align-items-center">
        <p><strong>Copyright © 2025 Nexora - Controle de ponto eletrônico e pessoas - 2025. </strong> All rights reserved.</p>
            <div class=" d-sm-inline">
            <b>Nexora version</b> 1.0.0
        </div>
    </footer>
</template>

<style scoped>
.footer {
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1); /* fundo transparente */
  backdrop-filter: blur(10px); /* efeito glass */
  -webkit-backdrop-filter: blur(10px);
  padding: 12px 20px;
  font-size: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.2); /* borda sutil */
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 100;
  color: white; /* texto branco para contraste */
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3); /* leve sombra superior */
}

</style>

<script>
export default {
  name: 'Footer'
}
</script>