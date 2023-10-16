<template>
  <div class="epsplanet-panel-base" style="width: 296px">
    <el-form ref="form" label-width="80px">
      <el-form-item label="水平广角">
        <el-slider
          v-model="fovH"
          :min="1"
          :max="179"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <el-form-item label="垂直广角">
        <el-slider
          v-model="fovV"
          :min="1"
          :max="179"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
    </el-form>
    <div class="tool-panel-button">
      <el-button @click="twoPostionsEditing = true" size="mini">拾取</el-button>
      <el-button @click="positionEditing = true" size="mini">平移</el-button>
      <el-button @click="rotationEditing = true" size="mini">旋转</el-button>
    </div>
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
  name: "EpsplanetViewshed",
  props: [],
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      twoPostionsEditing: false,
      positionEditing: false,
      rotationEditing: false,
      fovH: 80,
      fovV: 60,
      _disposer: [] as any,
    });
    let _viewshed: any;
    onMounted(async () => {
      earth = await useEarth();
      init();
    });
    onBeforeUnmount(() => {
      del();
    });
    function init() {
      earth.czm.viewer.scene.globe.depthTestAgainstTerrain = true;
      let viewshed = new XE.Obj.Viewshed(earth);
      _viewshed = viewshed;
      console.log(viewshed);
      data._disposer = [];

      data._disposer.push(
        XE.MVVM.bind(
          thisVue,
          "twoPostionsEditing",
          viewshed,
          "twoPostionsEditing"
        ),
        // XE.MVVM.bind(thisVue, "positionEditing", viewshed, "positionEditing"),
        XE.MVVM.bind(thisVue, "rotationEditing", viewshed, "rotationEditing"),
        XE.MVVM.bindDegreeRadian(thisVue, "fovH", viewshed, "fovH"),
        XE.MVVM.bindDegreeRadian(thisVue, "fovV", viewshed, "fovV"),
        XE.MVVM.watch(
          () => viewshed.twoPostionsEditing,
          () => {
            data.twoPostionsEditing = viewshed.twoPostionsEditing;
            console.log(viewshed)
            // if(viewshed.twoPostionsEditing) {
            //   viewshed.position = [];
            //   viewshed.rotation = [];
            // }
          }
        ),
        XE.MVVM.watch(
          () => viewshed.positionEditing,
          () => {
            data.positionEditing = viewshed.positionEditing;
          }
        ),
        XE.MVVM.watch(
          () => viewshed.rotationEditing,
          () => {
            data.rotationEditing = viewshed.rotationEditing;
          }
        )
      );
    }

    function setAsCamera() {
      if (_viewshed) {
        _viewshed.setPositionWithCurrentCamera();
      }
    }
    function del() {
      if (_viewshed) {
        _viewshed.destroy();
        _viewshed = undefined;
      }
      if (data._disposer) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      setAsCamera,
      del,
    };
  },
});
</script>