<template>
    <footer class="footer">
        <p class="footer-text mb-0">
            <strong>© 2025 Nexora</strong> <span class="separator">•</span> <span class="version-text">v1.0.0</span>
        </p>
    </footer>
</template>

<style scoped>
.footer {
  background: rgba(26, 36, 45, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 1100; /* Sempre acima de todo conteúdo */
  color: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
  padding: 0.4rem 1.5rem;
  text-align: center;
}

.footer-text {
  font-size: 0.75rem;
  opacity: 0.9;
  line-height: 1.2;
}

.footer-text strong {
  font-weight: 600;
}

.version-text {
  padding: 0.1rem 0.4rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 0.7rem;
}

.separator {
  margin: 0 0.3rem;
  opacity: 0.6;
}

/* Responsividade para mobile - ultra compacto */
@media (max-width: 768px) {
  .footer {
    padding: 0.25rem 0.75rem;
  }
  
  .footer-text {
    font-size: 0.65rem;
  }
  
  .version-text {
    font-size: 0.6rem;
    padding: 0.05rem 0.3rem;
  }
  
  .separator {
    margin: 0 0.2rem;
  }
}

@media (max-width: 576px) {
  .footer {
    padding: 0.2rem 0.5rem;
  }
  
  .footer-text {
    font-size: 0.6rem;
  }
  
  .version-text {
    font-size: 0.55rem;
  }
  
  /* Oculta texto desnecessário no mobile pequeno */
  .footer-text strong::after {
    content: " • Ponto";
  }
}

/* Mobile extra pequeno - minimal */
@media (max-width: 375px) {
  .footer {
    padding: 0.15rem 0.4rem;
  }
  
  .footer-text {
    font-size: 0.55rem;
  }
  
  .version-text {
    font-size: 0.5rem;
    padding: 0.05rem 0.25rem;
  }
}

</style>

<script>
export default {
  name: 'Footer'
}
</script>