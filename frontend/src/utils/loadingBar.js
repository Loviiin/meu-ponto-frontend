/**
 * Plugin de Loading Global para Vite
 * Mostra uma barra de progresso enquanto carrega rotas/componentes
 */

let progressBar = null
let progressTimeout = null

export function initLoadingBar(app) {
  // Criar elemento de loading bar
  progressBar = document.createElement('div')
  progressBar.id = 'global-progress-bar'
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #d4af37, #FFD700);
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
    width: 0;
    z-index: 9999;
    transition: width 0.3s ease;
  `
  document.body.appendChild(progressBar)

  // Exposar métodos globais
  window.$loading = {
    start() {
      if (progressBar) {
        progressBar.style.width = '10%'
        progressTimeout = setTimeout(() => {
          if (progressBar) progressBar.style.width = '40%'
        }, 200)
      }
    },
    finish() {
      if (progressTimeout) clearTimeout(progressTimeout)
      if (progressBar) {
        progressBar.style.width = '100%'
        setTimeout(() => {
          if (progressBar) progressBar.style.width = '0'
        }, 500)
      }
    },
    set(percent) {
      if (progressBar) progressBar.style.width = percent + '%'
    }
  }
}

export function setupRouterLoading(router) {
  // Start loading quando navega
  router.beforeEach((to, from, next) => {
    window.$loading?.start()
    next()
  })

  // Finish loading quando termina
  router.afterEach(() => {
    setTimeout(() => {
      window.$loading?.finish()
    }, 100)
  })
}
