import { createApp } from 'vue';
import App from './app.vue';
import epsplanet from '@epsplanet/components';
// import epsplanet from 'epsplanet';
// import { createPinia } from 'pinia'
XE.ready().then(() => {
    const app = createApp(App);
    // app.use(createPinia())
    app.use(epsplanet);
    console.log('epsplanet', app);
    app.mount('#app');
})

