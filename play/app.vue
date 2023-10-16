<template>
  <div>
    <Test :title="''" />
    <el-button @click="openPanel">弹框测试</el-button>

    <EpsplanetEarth container="testA" :showDefaultBasemap="true" @onReady="ready" :showCompass="showCompass">
      <EpsplanetStatusbar :showCamera="false" />
      <EpsplanetButton :title="'球'" :icon="'icon-tool_wsjg'" type="panel" :position="position" :panel="panel">
        <!-- <Child /> -->
        <EpsplanetCloud />
        <!-- <EpsplanetLayerList /> -->
      </EpsplanetButton>
    </EpsplanetEarth>

    <toolbar :position="position" :components="comps"></toolbar>
  </div>
</template>
<script lang="ts" setup>
import { getCurrentInstance, ref, h } from 'vue';
import toolbar from './toolbar.vue';
// import { useEarth, Earth, Test } from 'epsplanet';
// import { useEarth, Earth, Test, usePanel, getWidgets, haveRendered } from 'epsplanet';
import {
  useEarth,
  Earth,
  Test,
  usePanel,
  getWidgets,
  haveRendered,
  useConfig,
  getConfig
} from '@epsplanet/components';
import Child from './child.vue';
console.log(useConfig.getConfig(),getConfig());
const context = getCurrentInstance();
// console.log(context);
const position = ref({
  left: 10,
  top: 600
});
const panel = ref({
  size: {
    width: '300px',
    height: '300px'
  },
  position: {
    left: 10,
    top: 10
  }
});
// let earth = useEarth();
const showCompass = ref(true);
const ready = (e: any) => {
  // console.log(e);
  e.sceneTree.root.children.push({
    czmObject: {
      xbsjType: 'Imagery',
      name: '贺兰山东麓',
      rectangle: [
        1.8549608612104038, 0.6759967905155257, 1.8554696069610521,
        0.6763643920091744
      ],
      xbsjImageryProvider: {
        ArcGisMapServerImageryProvider: {
          url: 'http://120.48.115.17:6080/arcgis/rest/services/Map/MapServer'
        },
        type: 'ArcGisMapServerImageryProvider'
      }
    }
  });
  e.sceneTree.root.children.push({
    czmObject: {
      "xbsjType": "Tileset",
      "xbsjGuid": "d3266895-4795-41a1-92f3-46be5edc6532",
      "name": "未命名瓦片",
      "url": "http://localhost/gis/%E5%80%BE%E6%96%9C%E5%88%87%E7%89%87/%E5%A4%A7%E9%9B%81%E5%A1%94/tileset.json",
      "xbsjPosition": [
        1.9017002809975097,
        0.5972446887154512,
        3.0624089850964736e-9
      ],
      "xbsjClippingPlanes": {},
      "xbsjCustomShader": {}
    }
  })
  e.sceneTree.root.children[1].czmObject.flyTo()
};
const openPanel = async () => {
  console.log(getWidgets(), haveRendered(h(Child)));
  let wgt = usePanel(
    {
      title: '测试',
      component: 'Child',
      type: 'panel',
      panel: {
        size: {
          width: '300px',
          height: '300px'
        },
        position: {
          left: 10,
          top: 10
        }
      }
    },
    context?.appContext,
    h(Child)
  );
  console.log(wgt, await wgt.getComponent());
};
const comps = ref([
  {
    label: '水淹分析',
    component: 'EpsplanetFlood',
    icon: 'icon-tool_dxhz_dianbiao',
    panel: {
      position: { top: 50, left: 50 }
    }
  },
  {
    label: '点标',
    component: 'EpsplanetPoint',
    icon: 'icon-tool_dxhz_dianbiao',
    panel: {
      position: { top: 50, left: 50 }
    }
  },
  {
    label: '折线',
    component: 'EpsplanetPolyline',
    icon: 'icon-tool_dxhz_zhexian',
    panel: {
      position: { top: 50, left: 50 }
    }
  },
  {
    label: '多边形',
    component: 'EpsplanetPolygon',
    icon: 'icon-tool_dxhz_dbx',
    panel: {
      position: { top: 50, left: 50 }
    }
  },
  {
    label: '贴地图片',
    component: 'EpsplanetGroundImage',
    icon: 'icon-tool_dxhz_dbx',
    panel: {
      position: { top: 50, left: 50 }
    }
  },
  {
    label: '贴地道路',
    component: 'EpsplanetGroundRoad',
    icon: 'icon-tool_dxhz_dbx',
    panel: {
      position: { top: 50, left: 50 }
    }
  }
]);
</script>
