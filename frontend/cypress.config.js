// frontend/cypress.config.js
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // URL base para todos os testes
    baseUrl: "http://localhost:3000",
    
    // Timeouts (em ms)
    defaultCommandTimeout: 10000,    // Padrão para cada comando
    requestTimeout: 10000,            // Para requisições HTTP
    responseTimeout: 10000,           // Para respostas
    
    // Viewport padrão
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video e screenshots
    video: false,                      // Desabilitar video por padrão (pesado)
    videoOnFailOnly: true,            // Gravar apenas falhas
    screenshotOnRunFailure: true,     // Screenshot automático em falhas
    
    // Retries (tentar novamente falhas)
    retries: {
      runMode: 1,                     // Modo headless - 1 retry
      openMode: 0                     // Modo interativo - sem retry
    },
    
    // Desabilitar comportamentos que causam problemas
    chromeWebSecurity: false,
    
    // Numeral de tentativas de waiters
    numTestsKeptInMemory: 0,
    
    setupNodeEvents(on, config) {
      // Aqui você pode adicionar plugins customizados
      // Exemplo: plugin para logs, performance monitoring, etc
    },
  },
  
  // Configurações globais
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}'
  }
});
