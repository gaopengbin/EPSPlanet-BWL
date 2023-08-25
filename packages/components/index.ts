import * as components from './src/index';
export * from './src/index';
export * from './src/utils/index';
import { App } from 'vue';
import { createPinia } from 'pinia'

import "element-plus/theme-chalk/index.css"
// import "/EPSPlanet_Assets/assets/font/iconfont.css"

XE.HTML.xbsjBaseUrl = XE.HTML.xbsjEarthDir.split('EPSPlanet_SDK')[0]

let link = document.createElement('link')
link.setAttribute('rel', 'stylesheet')
link.setAttribute('href', XE.HTML.xbsjBaseUrl + '/EPSPlanet_Assets/assets/font/iconfont.css')
document.head.appendChild(link)

export default {
  install: (app: App) => {
    app.use(createPinia())
    // XE.HTML.loadCSS('/EPSPlanet_Assets/assets/font/iconfont.css')
    for (const c in components) {
      app.use((components as any)[c]);
    }
  }
};
