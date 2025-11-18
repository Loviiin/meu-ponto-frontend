import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { VueTheMask } from 'vue-the-mask';
import VueApexCharts from 'vue3-apexcharts';
import { initializeTheme } from './utils/preferences';
import { initLoadingBar, setupRouterLoading } from './utils/loadingBar';
import { initCacheManager } from './utils/cacheManager';
// Ensure Bootstrap JS (with Popper) is loaded for navbar toggles/dropdowns
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Inicializar tema ao carregar a app
initializeTheme();

// Inicializar cache manager (monitora logout)
initCacheManager();

const app = createApp(App);

// Inicializar loading bar
initLoadingBar(app);
setupRouterLoading(router);

app.use(router);
app.use(VueTheMask);
app.use(VueApexCharts);
app.mount('#app');
