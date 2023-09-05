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
    // 基础组件
    EpsplanetEarth: typeof components.Earth;
    EpsplanetButton: typeof components.Button;
    EpsplanetToolbar: typeof components.Toolbar;
    EpsplanetBasemap: typeof components.Basemap;
    EpsplanetStatusbar: typeof components.StatusBar;
    EpsplanetLayerList: typeof components.LayerList;
    // 特效组件
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
    // 标绘组件
    EpsplanetPlotManager: typeof components.PlotManager;
    EpsplanetPoint: typeof components.Point;
    EpsplanetPolyline: typeof components.Polyline;
    EpsplanetPolygon: typeof components.Polygon;
    EpsplanetSmoothPolygon: typeof components.SmoothPolygon;
    EpsplanetRectangle: typeof components.Rectangle;
    EpsplanetCircle: typeof components.Circle;
    EpsplanetArrow: typeof components.Arrow;
    EpsplanetDoubleArrow: typeof components.DoubleArrow;
    EpsplanetGroundImage: typeof components.GroundImage;
    EpsplanetGroundRoad: typeof components.GroundRoad;
    EpsplanetDynamic: typeof components.Dynamic;
    EpsplanetModelBase: typeof components.Modelbase;
    EpsplanetMonomer: typeof components.Monomer;
    EpsplanetParticle: typeof components.Particle;
    EpsplanetWater: typeof components.Water;
    // 分析组件
    EpsplanetControlHeight: typeof components.ControlHeight;
    EpsplanetFlood: typeof components.Flood;
    EpsplanetCutFill: typeof components.CutFill;
    EpsplanetContour: typeof components.Contour;
    EpsplanetLeveling: typeof components.Leveling;
    EpsplanetLineOfSight: typeof components.LineOfSight;
    EpsplanetProfile: typeof components.Profile;



    EaTest: typeof components.Test;
  }
}

declare let XE: any;
declare let Cesium: any;
// import * as utils from './utils';

export { };
