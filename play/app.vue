<template>
  <div>
    <Test :title="''" />
    <el-button @click="openPanel">弹框测试</el-button>

    <EpsplanetEarth
      container="testA"
      :showDefaultBasemap="true"
      @onReady="ready"
      :showCompass="showCompass"
    >
      <EpsplanetStatusbar :showCamera="false" />
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
  haveRendered
} from '@epsplanet/components';
import Child from './child.vue';

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
