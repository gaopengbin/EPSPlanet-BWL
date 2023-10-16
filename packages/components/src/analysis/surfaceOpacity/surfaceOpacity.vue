<template>
  <div class="tool-panel-base" style="width: 350px">
    <el-form ref="form" label-width="100px">
      <!-- <el-form-item>
        <el-switch 
        v-model="subSurfaceEnabled" 
        active-text="开启全透"
        inactive-text="关闭全透"
        ></el-switch>
      </el-form-item> -->
      <el-form-item label="地表不透明度">
        <el-slider v-model="surfaceOpacity" :min="0" :max="1" :step="0.01" show-input
          :show-input-controls="false"></el-slider>
        <!-- <input type="range" :value="surfaceOpacity" :min="0" :max="1" :step="0.01" style="width: 200px" /> -->
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import {
  reactive,
  toRefs,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { useEarth } from '../../utils';

export default defineComponent({
  name: "EpsplanetSurfaceOpacity",
  props: [],
  setup() {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      _disposer: [] as any,
      // subSurfaceEnabled: false, // 是否开启地下模式
      surfaceOpacity: 0.8 as number, // 地表透明度
    });

    onMounted(async () => {
      earth = useEarth();
      // init();
      earth.czm.scene.globe.translucency.enabled = true
      earth.czm.scene.globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(
        400.0,
        0.0,
        800.0,
        data.surfaceOpacity
      );
    });
    onBeforeUnmount(() => {
      del();
    });
    watch(
      //  监听数值变化
      () => data.surfaceOpacity,
      (newVal, old) => {
        if (earth && earth.czm.scene.globe) {
          earth.czm.scene.globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(
            400.0,
            0.0,
            800.0,
            newVal
          );
        }
        // earth.terrainEffect.surfaceOpacity = newVal;
      }
    );
    function init() {
      earth.czm.scene.globe.depthTestAgainstTerrain = false;
      data._disposer.push(
        // XE.MVVM.bind(
        //   thisVue,
        //   "subSurfaceEnabled",
        //   earth.terrainEffect,
        //   "subSurfaceEnabled"
        // ),
        XE.MVVM.bind(
          thisVue,
          "surfaceOpacity",
          earth.terrainEffect,
          "surfaceOpacity"
        )
      );
    }

    function del() {
      data._disposer.forEach((d: any) => d());
      data._disposer.length = 0;
      earth.czm.scene.globe.translucency.enabled = false
    }
    return {
      ...toRefs(data),
      init,
      // formatTooltip,
      del,
    };
  },
});
</script>

