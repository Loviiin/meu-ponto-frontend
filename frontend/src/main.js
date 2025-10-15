import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { VueTheMask } from 'vue-the-mask';
import VueApexCharts from 'vue3-apexcharts';

const app = createApp(App);
app.use(router);
app.use(VueTheMask);
app.use(VueApexCharts);
app.mount('#app');
