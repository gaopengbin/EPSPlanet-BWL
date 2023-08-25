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

    <EpsplanetEarth container="testA" :showDefaultBasemap="true" @onReady="ready" :showCompass="showCompass" />
    <EpsplanetButton :title="'球'" :icon="'icon-tool_wsjg'" type="panel" :position="position" :panel="panel">
      <Child />
    </EpsplanetButton>
    <!-- <ElButton></ElButton> -->

    <!-- <Earth :container="'tes'" /> -->
  </div>
</template>
<script lang="ts" setup>
import { getCurrentInstance, ref, h } from 'vue';
// import { useEarth, Earth, Test } from 'epsplanet';
// import { useEarth, Earth, Test, usePanel, getWidgets, haveRendered } from 'epsplanet';
import { useEarth, Earth, Test, usePanel, getWidgets, haveRendered } from '@epsplanet/components';
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
};
const openPanel = async () => {
  console.log(getWidgets(), haveRendered(h(Child)));
  let wgt = usePanel({
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
  }, context?.appContext, h(Child))
  console.log(wgt, await wgt.getComponent());
};
</script>
