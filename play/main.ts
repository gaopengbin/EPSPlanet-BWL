import { createApp } from 'vue';
import App from './app.vue';
// import epsplanet from '@epsplanet/components';
import epsplanet from 'epsplanet';
XE.ready().then(() => {
    const app = createApp(App);
    app.use(epsplanet);
    app.mount('#app');
})

