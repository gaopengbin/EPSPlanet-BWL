<!--
 * @Description: 
 * @Date: 2023-02-09 14:28:42
 * @Author: didi
 * @LastEditTime: 2023-05-24 11:29:22
-->
<template>
  <div>
    <!-- <ea-button>按钮</ea-button>
    <ea-earth />
    <Button>123</Button>
    <Earth /> -->
    <Test :title="''" />
    <el-button @click="openPanel">弹框测试</el-button>

    <EpsplanetEarth container="testA" :showDefaultBasemap="true" @onReady="ready" :showCompass="showCompass">
      <EpsplanetStatusbar :showCamera="false" />
    </EpsplanetEarth>
    <EpsplanetButton :title="'球'" :icon="'icon-tool_wsjg'" type="panel" :position="position" :panel="panel">
      <!-- <Child /> -->
      <!-- <EpsplanetCloud /> -->
      <EpsplanetLayerList />
    </EpsplanetButton>
    <!-- <ElButton></ElButton> -->
    <EpsplanetBasemap />
    <EpsplanetToolbar :position="{ top: '50px', left: '20px' }">
      <EpsplanetButton :title="'球'" :icon="'icon-tool_wsjg'" type="panel" :position="position" :panel="panel">
        <!-- <Child /> -->
        <!-- <EpsplanetCloud /> -->
        <EpsplanetLayerList />
      </EpsplanetButton>
      <EpsplanetButton :title="'球'" :icon="'icon-tool_wsjg'" type="panel" :position="position" :panel="panel">
        <!-- <Child /> -->
        <EpsplanetCloud />
        <!-- <EpsplanetLayerList /> -->
      </EpsplanetButton>
    </EpsplanetToolbar>
    <EpsplanetToolbar mode="horizontal" :position="{ top: '150px', left: '20px' }">
      <EpsplanetButton :title="'球'" :icon="'icon-tool_wsjg'" type="panel" :position="position" :panel="panel">
        <!-- <Child /> -->
        <!-- <EpsplanetCloud /> -->
        <EpsplanetLayerList />
      </EpsplanetButton>
      <EpsplanetButton :title="'球'" :icon="'icon-tool_wsjg'" type="panel" :position="position" :panel="panel">
        <!-- <Child /> -->
        <!-- <EpsplanetCloud /> -->
        <!-- <EpsplanetLayerList /> -->
        <EpsplanetPoint />
      </EpsplanetButton>
    </EpsplanetToolbar>
  </div>
</template>
<script lang="ts" setup>
import { getCurrentInstance, ref, h } from 'vue';
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
</script>
