<template>
    <footer class="footer">
        <div class="footer-content">
            <p class="footer-text mb-0">
                <strong>© 2025 Nexora</strong> - Controle de ponto eletrônico
            </p>
            <div class="footer-version">
                <span class="version-badge">v1.0.0</span>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer {
  background: rgba(26, 36, 45, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 100;
  color: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  max-width: 100%;
  margin: 0 auto;
}

.footer-text {
  font-size: 0.75rem;
  opacity: 0.9;
}

.footer-text strong {
  font-weight: 600;
}

.footer-version {
  display: flex;
  align-items: center;
}

.version-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 500;
}

/* Responsividade para mobile */
@media (max-width: 576px) {
  .footer-content {
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.35rem 0.5rem;
    text-align: center;
  }
  
  .footer-text {
    font-size: 0.6rem;
    line-height: 1.2;
  }
  
  .footer-text strong {
    display: inline; /* manter na mesma linha para economizar espaço */
  }
  
  .version-badge {
    font-size: 0.6rem;
    padding: 0.1rem 0.35rem;
  }
}

/* Extra small devices */
@media (max-width: 375px) {
  .footer-content {
    padding: 0.3rem 0.4rem;
  }
  
  .footer-text {
    font-size: 0.55rem;
  }
  
  .version-badge {
    font-size: 0.55rem;
  }
}

/* Tablet */
@media (min-width: 577px) and (max-width: 991px) {
  .footer-content {
    padding: 0.5rem 1.5rem;
  }
  
  .footer-text {
    font-size: 0.7rem;
  }
}

</style>

<script>
export default {
  name: 'Footer'
}
</script>