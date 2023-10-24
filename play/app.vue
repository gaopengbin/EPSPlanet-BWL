<template>
  <div>
    <!-- <Test :title="''" /> -->
    <!-- <el-button @click="openPanel">弹框测试</el-button> -->

    <EpsplanetEarth container="testA" :showDefaultBasemap="true" @onReady="ready" :showCompass="showCompass"
      style="height: 96vh;">
      <!-- <EpsplanetStatusbar :showCamera="false" /> -->
      <EpsplanetButton :title="'组件测试'" :icon="'icon-tool_wsjg'" type="panel" :position="position" :panel="panel">
        <Child />
        <!-- <EpsplanetCloud /> -->
        <!-- <EpsplanetLayerList /> -->
        <!-- <query /> -->
        <!-- <fontClass /> -->
      </EpsplanetButton>
    </EpsplanetEarth>

    <!-- <toolbar :position="position" :components="comps"></toolbar> -->
  </div>
</template>
<script lang="ts" setup>
import { getCurrentInstance, ref, h } from 'vue';
import toolbar from './toolbar.vue';
import query from './query/index.vue';
import fontClass from './fontClass/index.vue';
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
  getConfig,
  renderBtn
} from '@epsplanet/components';
import Child from './child.vue';
import changeTheme from './changeTheme/index.vue';
import { renderBtns } from '@epsplanet/components/src/utils/useConfig/render';
console.log(useEarth);

const context = getCurrentInstance();
// console.log(context);
context?.appContext.app.component('changeTheme', changeTheme);

let btns = [
  {
    title: '测试',
    component: 'EpsplanetPolygon',
    icon: 'icon-tool_wsjg',
    type: 'panel',
    position: {
      left: 10,
      top: 90
    },
    panel: {
      position: {
        left: 50,
        top: 50
      }
    }
  },
  {
    title: '测试',
    component: 'EpsplanetPolygon',
    icon: 'icon-tool_wsjg',
    type: 'panel',
    position: {
      left: 10,
      top: 50
    },
    panel: {
      position: {
        left: 10,
        top: 10
      }
    }
  }
]
// renderBtns(context?.appContext, btns);
// renderBtn(context?.appContext, {
//   title: '测试',
//   component: 'EpsplanetPolygon',
//   icon: 'icon-tool_wsjg',
//   type: 'panel',
//   position: {
//     left: 10,
//     top: 10
//   },
//   panel: {
//     position: {
//       left: 10,
//       top: 10
//     }
//   }
// });
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
  // e.sceneTree.root.children.push(

  // );
  // e.sceneTree.root.children.push()
  // e.sceneTree.root.children[1].czmObject.flyTo()
};
const openPanel = async () => {
  console.log(getWidgets(), haveRendered(h(Child)));
  let wgt = usePanel(
    {
      title: '测试',
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
  // console.log(wgt, await wgt.getComponent());
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
    component: 'EpsplanetLineOfSight',
    icon: 'icon-tool_dxhz_dbx',
    panel: {
      position: { top: 50, left: 50 }
    }
  },
  {
    label: '贴地道路',
    component: 'test',
    icon: 'icon-tool_dxhz_dbx',
    panel: {
      position: { top: 50, left: 50 }
    }
  }
]);
</script>
<style lang="scss">
html,
body {
  margin: 0;
}
</style>