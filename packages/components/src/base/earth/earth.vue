<template>
  <div
    :id="container"
    style="width: 100%; height: 100%; display: inline-block; position: relative"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { earthProps, earthEmits } from './earth';
import { emitter } from '../../utils';
import { useStore } from '../../utils/strore/index';
const { setEarth } = useStore();
defineOptions({ name: 'EpsplanetEarth' });

const props = defineProps(earthProps);
const emit = defineEmits(earthEmits);
// console.log(props);
const {
  container,
  showCompass,
  compassStyle,
  showDistanceLegend,
  distanceLegendStyle,
  showDefaultBasemap
} = props;

if (compassStyle.left) {
  compassStyle.right = undefined;
}
if (compassStyle.bottom) {
  compassStyle.top = undefined;
}

let _earth: any;

onMounted(() => {
  init();
});
function init() {
  XE.ready()
    .then(() => {
      XE.HTML.loadJS('/EPSPlanet_SDK/XbsjEarth-Plugins/turf.min.js');
      XE.HTML.loadJS(
        '/EPSPlanet_SDK/XbsjEarth-Plugins/plottingSymbol/plottingSymbol.js'
      );
      // XE.HTML.loadJS(
      //   "EPSPlanet_SDK/XbsjEarth-Plugins/plottingSymbol2/plottingSymbol2.js"
      // );
      XE.HTML.loadJS(
        '/EPSPlanet_SDK/XbsjEarth-Plugins/customPrimitive/customPrimitive.js'
      );
      XE.HTML.loadJS(
        '/EPSPlanet_SDK/XbsjEarth-Plugins/customPrimitiveCone/customPrimitiveCone.js'
      );
      XE.HTML.loadJS(
        '/EPSPlanet_SDK/XbsjEarth-Plugins/customPrimitiveImage/customPrimitiveImage.js'
      );
    })
    .then(() => {
      var earth = new XE.Earth(container);
      _earth = earth;
      setEarth(earth._viewer.container.id, earth);
      (window as any).earth = earth;
      let list = [
        {
          title: 'layers'
        },
        {
          title: 'basemap',
          children: ['imagery', 'terrain']
        },
        {
          title: 'plots',
          children: [
            'point',
            'polyline',
            'polygon',
            'rectangle',
            'circle',
            'arrow',
            'doubleArrow',
            'smoothPolygon',
            'groundImage',
            'groundRoad',
            'particle',
            'water',
            'model',
            'geoPin', //立体标注
            'monomer' //单体化
          ]
        },
        {
          title: 'analysis',
          children: ['flatten', 'potholing', 'visual']
        }
      ];
      earth.sceneTree.layers = new XE.SceneTree.Group(earth);

      earth.sceneTree.basemap = {
        imagery: new XE.SceneTree.Group(earth),
        terrain: new XE.SceneTree.Group(earth)
      };

      earth.sceneTree.plots = {
        point: new XE.SceneTree.Group(earth)
      };

      earth.sceneTree.analysis = new XE.SceneTree.Group(earth);
      initSceneTree(list);
      function initSceneTree(list: any[]) {
        list.forEach((item: { children: any[]; title: string | number }) => {
          if (item.children) {
            earth.sceneTree[item.title] = {};
            item.children.forEach((e: string | number) => {
              earth.sceneTree[item.title][e] = new XE.SceneTree.Group(earth);
              earth.sceneTree[item.title][e].title = e;
            });
          } else {
            earth.sceneTree[item.title] = new XE.SceneTree.Group(earth);
            earth.sceneTree[item.title].title = item.title;
          }
        });
      }

      //     // ctx.type.earth = earth;
      //     // 1.1.2 添加默认地球影像
      if (showDefaultBasemap) {
        earth.sceneTree.basemap.imagery.children.push({
          czmObject: {
            name: '默认离线影像',
            xbsjType: 'Imagery',
            xbsjImageryProvider: {
              createTileMapServiceImageryProvider: {
                url: XE.HTML.cesiumDir + 'Assets/Textures/NaturalEarthII',
                fileExtension: 'jpg'
              },
              type: 'createTileMapServiceImageryProvider'
            }
          }
        });
      }

      earth.camera.navigator.showCompass = showCompass;
      earth.camera.navigator.compassStyle = compassStyle;
      earth.camera.navigator.showDistanceLegend = showDistanceLegend;
      earth.camera.navigator.distanceLegendStyle = distanceLegendStyle;
      earth.analyzation.measurement.clearGroundDistanceFunctions = [];
      earth.analyzation.measurement.clearGroundDistance = function () {
        earth.analyzation.measurement.clearGroundDistanceFunctions.forEach(
          (item: () => void) => {
            item();
          }
        );
      };
      earth.analyzation.measurement.clearThreeDAreaFunctions = [];
      earth.analyzation.measurement.clearThreeDArea = function () {
        earth.analyzation.measurement.clearThreeDAreaFunctions.forEach(
          (item: () => void) => {
            item();
          }
        );
      };

      let interval = setInterval(async () => {
        let loadOK = await loaded();
        if (loadOK) {
          clearInterval(interval);
          emitter.emit('earthReady', earth);
          emit('onReady', earth);
        }
      }, 1000);
      //     (window as any).getEarth = service.getEarth();
    });
}
function loaded() {
  return new Promise((resolve, reject) => {
    if (
      XE &&
      XE.Obj &&
      XE.Obj.Plots &&
      XE.Obj.Plots.GeoArc &&
      XE.Obj.Plots.GeoArrow &&
      XE.Obj.Plots.GeoBezier2 &&
      XE.Obj.Plots.GeoBezier3 &&
      XE.Obj.Plots.GeoCircle &&
      XE.Obj.Plots.GeoCurve &&
      XE.Obj.Plots.GeoCurveArrow &&
      XE.Obj.Plots.GeoCurveFlag &&
      XE.Obj.Plots.GeoDoubleArrow &&
      XE.Obj.Plots.GeoParallelSearch &&
      XE.Obj.Plots.GeoPin &&
      XE.Obj.Plots.GeoPolygon &&
      XE.Obj.Plots.GeoPolyline &&
      XE.Obj.Plots.GeoPolylineArrow &&
      XE.Obj.Plots.GeoRectangle &&
      XE.Obj.Plots.GeoRightAngleFlag &&
      XE.Obj.Plots.GeoSector &&
      XE.Obj.Plots.GeoSectorSearch &&
      XE.Obj.Plots.GeoSimpleArrow &&
      XE.Obj.Plots.GeoSmoothPolygon &&
      XE.Obj.Plots.GeoTriFlag &&
      XE.Obj.Plots.ParticleSystem &&
      XE.Obj.Plots.ParticleSystemFireWork &&
      XE.Obj.Plots.ParticleSystemTails
    ) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

onBeforeUnmount(() => {
  _earth = _earth && _earth.destroy();
});
</script>
