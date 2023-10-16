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
    EpsplanetVideo: typeof components.Video;
    // 分析组件
    EpsplanetControlHeight: typeof components.ControlHeight;
    EpsplanetFlood: typeof components.Flood;
    EpsplanetCutFill: typeof components.CutFill;
    EpsplanetContour: typeof components.Contour;
    EpsplanetLeveling: typeof components.Leveling;
    EpsplanetLineOfSight: typeof components.LineOfSight;
    EpsplanetProfile: typeof components.Profile;
    EpsplanetFlatten: typeof components.Flatten;
    EpsplanetViewshed: typeof components.Viewshed;
    EpsplanetSkylineV2: typeof components.SkylineV2;
    EpsplanetSkyline: typeof components.Skyline;
    EpsplanetSliced: typeof components.Sliced;
    EpsplanetSunShine: typeof components.SunShine;
    EpsplanetSurfaceOpacity: typeof components.SurfaceOpacity;
    EpsplanetPotholing: typeof components.Potholing;
    EpsplanetUnderground: typeof components.Underground;
    EpsplanetUndergroundV2: typeof components.UndergroundV2;
    EpsplanetTerrainCover: typeof components.TerrainCover;
    EpsplanetTerrainShading: typeof components.TerrainShading;

    //测量组件
    EpsplanetMeasurePoint: typeof components.MeasurePoint;
    EpsplanetMeasureDistance: typeof components.MeasureDistance;
    EpsplanetMeasureArea: typeof components.MeasureArea;
    EpsplanetMeasureHeight: typeof components.MeasureHeight;
    EpsplanetMeasureGroundDistance: typeof components.MeasureGroundDistance;
    EpsplanetMeasureGroundArea: typeof components.MeasureGroundArea;
    EpsplanetMeasureAzimuth: typeof components.MeasureAzimuth;
    EpsplanetMeasureClear: typeof components.MeasureClear;

    //视角组件
    EpsplanetCameraViewManager: typeof components.CameraViewManager;
    EpsplanetCameraHome: typeof components.CameraHome;
    EpsplanetQuickPosition: typeof components.QuickPosition;
    EpsplanetScreenShot: typeof components.Screenshot;
    EpsplanetAviation: typeof components.Aviation;

    //多屏组件
    EpsplanetDoubleView: typeof components.DoubleView;
    EpsplanetSliderScreen: typeof components.SliderScreen;

    //其他组件
    EpsplanetPick: typeof components.Pick;
    EpsplanetStatistics: typeof components.Statistics;

    EaTest: typeof components.Test;
  }
}

declare let XE: any;
declare let Cesium: any;
// import * as utils from './utils';

export { };
