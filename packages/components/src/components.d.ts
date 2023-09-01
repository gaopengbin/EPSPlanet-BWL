/*
 * @Description:
 * @Date: 2023-02-20 19:20:06
 * @Author: didi
 * @LastEditTime: 2023-05-22 16:12:52
 */
import * as components from './index';
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    ElButton: typeof import('element-plus/es')['ElButton'];
    EaButton: typeof components.Button;
    EaIcon: typeof components.Icon;
    EpsplanetEarth: typeof components.Earth;
    EpsplanetButton: typeof components.Button;
    EpsplanetToolbar: typeof components.Toolbar;
    EpsplanetBasemap: typeof components.Basemap;
    EpsplanetStatusbar: typeof components.StatusBar;
    EpsplanetLayerList: typeof components.LayerList;
    EpsplanetBlackWhite: typeof components.Blackwhite;
    EpsplanetMosaic: typeof components.Mosaic;
    EpsplanetBloom: typeof components.Bloom;
    EpsplanetSnow: typeof components.Snow;
    EpsplanetRain: typeof components.Rain;
    EpsplanetCloud: typeof components.Cloud;
    EpsplanetNightvision: typeof components.Nightvision;
    EpsplanetBrightness: typeof components.Brightness;
    EpsplanetShadow: typeof components.Shadow;
    EpsplanetSilhouette: typeof components.Silhouette;
    EpsplanetPoint: typeof components.Point;
    EaTest: typeof components.Test;
  }
}
// import * as utils from './utils';

export { };
