<template>
  <div class="epsplanet-panel-base" style="width: 296px">
    <el-form ref="form" label-width="60px">
      <el-form-item :label="label.width">
        <el-slider v-model="width" :min="1" :max="10" :step="0.1" show-input :show-input-controls="false"></el-slider>
      </el-form-item>
      <el-form-item :label="label.spacing">
        <el-slider v-model="spacing" :min="1" :max="300" :step="1" show-input :show-input-controls="false"></el-slider>
      </el-form-item>
      <el-form-item :label="label.color">
        <el-color-picker v-model="uicolor" show-alpha @active-change="changeColor"></el-color-picker>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang='ts'>
/* eslint-disable */
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
} from "vue";
import { useEarth } from '../../utils';

export default defineComponent({
  name: "EpsplanetContour",
  props: [],
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      label: {
        width: "线宽",
        spacing: "间距",
        color: "颜色",
      },
      width: 1,
      spacing: 100,
      color: [],
      uicolor: "rgba(249, 42, 0, 1)",
    });
    let _disposer: any = [];
    onMounted(() => {
      earth = useEarth();
      init();
    });
    onBeforeUnmount(() => {
      del();
    });

    function init() {
      earth.terrainEffect.contour.enabled = true;
      _disposer.push(
        XE.MVVM.bind(
          thisVue,
          "width",
          earth.terrainEffect.contour,
          "width"
        ),
        XE.MVVM.bind(
          thisVue,
          "spacing",
          earth.terrainEffect.contour,
          "spacing"
        )
      );
    }

    function changeColor(val: string) {
      let v = val.split("(")[1].split(")")[0].split(",");
      let cc: any = [];
      v.forEach((c: any, i: number) => {
        if (i == 3) {
          cc.push(Number(c));
        } else {
          cc.push(Number(c) / 255.0);
        }
      });
      earth.terrainEffect.contour.color = cc;
    }
    function del() {
      earth.terrainEffect.contour.enabled = false;
      if (_disposer) {
        _disposer.forEach((d: any) => d());
        _disposer.length = 0;
      }
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      changeColor,
      del,
    };
  },
});
</script>