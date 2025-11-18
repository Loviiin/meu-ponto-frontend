/**
 * Plugin de Prefetch automático de rotas
 * Carrega chunks de rotas importantes ao hover (não automático)
 * 
 * IMPORTANTE: Isso faz PREFETCH apenas de chunks de código JavaScript,
 * NÃO faz requisições de dados da API (dados são carregados sob demanda)
 */

export function setupRoutePrefetch(router) {
  // Prefetch APENAS ao hover em links (conservador, não automático)
  let hoverTimeout
  document.addEventListener('mouseover', (e) => {
    clearTimeout(hoverTimeout)
    const link = e.target.closest('a[href]')
    if (!link) return

    const href = link.getAttribute('href')
    if (!href || !href.startsWith('/')) return

    // Pequeno delay de 200ms para dar chance do usuário apenas passar mouse
    hoverTimeout = setTimeout(() => {
      const route = router.getRoutes().find(r => r.path === href)
      if (route?.component && typeof route.component === 'function') {
        // Prefetch silencioso no background (apenas chunk, sem API calls)
        route.component()
          .catch(() => {}) // Ignorar erros de prefetch
      }
    }, 200)
  })

  document.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout)
  })
}


