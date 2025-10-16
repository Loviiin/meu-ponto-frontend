import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { VueTheMask } from 'vue-the-mask';
import VueApexCharts from 'vue3-apexcharts';
// Ensure Bootstrap JS (with Popper) is loaded for navbar toggles/dropdowns
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const app = createApp(App);
app.use(router);
app.use(VueTheMask);
app.use(VueApexCharts);
app.mount('#app');
