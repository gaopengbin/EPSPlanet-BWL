import { createApp } from 'vue';
import App from './app.vue';
import epsplanet from '@epsplanet/components';
import { setConfigUrl } from '@epsplanet/components'
import 'element-plus/theme-chalk/dark/css-vars.css'
// import epsplanet from 'epsplanet';
// import { createPinia } from 'pinia'
XE.ready().then(() => {
    const app = createApp(App);
    // app.use(createPinia())
    console.log(setConfigUrl);
    setConfigUrl('/config.json');
    app.use(epsplanet);
    console.log('epsplanet', app);
    app.mount('#app');
})

