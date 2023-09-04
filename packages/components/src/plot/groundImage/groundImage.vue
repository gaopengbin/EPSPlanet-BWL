<template>
  <div class="epsplanet-panel-base" style="width: 450px">
    <el-form ref="form" label-width="70px">
      <el-form-item label="图片名称">
        <el-input
          v-model="name"
          placeholder="未命名图片"
          size="small"
        ></el-input>
      </el-form-item>
      <el-form-item label="宽">
        <el-slider
          v-model="width"
          :min="1"
          :max="200"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <el-form-item label="高">
        <el-slider
          v-model="height"
          :min="1"
          :max="200"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <el-form-item label="角度">
        <el-slider
          v-model="rotation"
          :min="1"
          :max="360"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <el-form-item label="图片">
        <el-input
          v-model="imageUrl"
          placeholder="请输入图片地址"
          type="text"
          @change="changeImage"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="tool-panel-button">
      <el-button size="small" @click="creating = true">创建</el-button>
      <el-button size="small" @click="creating = true">变更位置</el-button>
      <!-- <el-button size="small" @click="del">删除</el-button> -->
      <el-button size="small" @click="save">保存</el-button>
    </div>
    <PlotManager type="groundImage" @handle-edit="handleEdit" />
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent
} from 'vue';
import { useEarth } from '../../utils';
import PlotManager from '../plotmanager/plotmanager.vue';

export default defineComponent({
  name: 'EpsplanetGroundImage',
  components: {
    PlotManager
  },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      name: '未命名图片',
      creating: false,
      editing: false,
      width: 20,
      height: 15,
      rotation: 0,
      // imageUrl: require("~/assets/sunway.png"),
      imageUrl: 'Epsplanet_Assets/assets/sunway.png',
      ground: true,
      _disposer: [0],
      isSaved: false
    });
    let _groundImageCzm: any;
    onMounted(() => {
      earth = useEarth();
      init();
    });
    onBeforeUnmount(() => {
      del();
    });
    function init() {
      let groundImageCzm = new XE.Obj.GroundImage(earth);
      // groundImageCzm.imageUrls[0] = "~/assets/sunway.png";
      _groundImageCzm = groundImageCzm;
      // groundImageCzm.creating = true;
      groundImageCzm.autoWidth = false;
      groundImageCzm.autoHeight = false;
      groundImageCzm.width = 20;
      groundImageCzm.height = 15;
      console.log(groundImageCzm);
      data._disposer = [];
      data._disposer.push(
        XE.MVVM.bind(thisVue, 'name', groundImageCzm, 'name'),
        XE.MVVM.bind(thisVue, 'creating', groundImageCzm, 'creating'),
        XE.MVVM.bind(thisVue, 'editing', groundImageCzm, 'editing'),
        XE.MVVM.bind(thisVue, 'width', groundImageCzm, 'width'),
        XE.MVVM.bind(thisVue, 'height', groundImageCzm, 'height'),
        XE.MVVM.bindDegreeRadian(
          thisVue,
          'rotation',
          groundImageCzm,
          'rotation'
        ),
        XE.MVVM.bind(thisVue, 'origin', groundImageCzm, 'origin'),
        XE.MVVM.watch(
          () => data.imageUrl,
          () => {
            groundImageCzm.imageUrls[0] = data.imageUrl;
          }
        )
      );
    }
    function changeImage(e: any) {
      _groundImageCzm.imageUrls[0] = e;
    }
    function save() {
      data.isSaved = true;
      const sceneObject = new XE.SceneTree.Leaf(_groundImageCzm);
      earth.sceneTree.plots.groundImage.children.push(sceneObject);
      // thisVue.confirm(sceneObject);
    }
    function del() {
      if (_groundImageCzm && !data.isSaved) {
        _groundImageCzm.destroy();
        _groundImageCzm = undefined;
      }
      if (data._disposer) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
    }
    function handleEdit() {}
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      changeImage,
      save,
      del,
      handleEdit
    };
  }
});
</script>
