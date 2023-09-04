<template>
  <div class="epsplanet-panel-base groundroad" style="width: 450px">
    <el-form ref="form" label-width="70px">
      <el-form-item label="道路名称">
        <el-input
          v-model="name"
          placeholder="未命名道路"
          size="small"
        ></el-input>
      </el-form-item>
      <el-form-item label="路宽(米)">
        <el-slider
          v-model="width"
          :min="1"
          :max="100"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <el-form-item label="路型">
        <el-select v-model="pathImg" placeholder="请选择">
          <el-option
            v-for="item in imgList"
            :key="item.label"
            :label="item.label"
            :value="item.path"
          >
            <span style="float: left; color: black">{{ item.label }}</span>
            <el-image
              style="width: 36px; height: 30px; float: right"
              :src="item.path"
              fit="fill"
            ></el-image>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div class="tool-panel-button">
      <el-button size="small" @click="creating = true">创建</el-button>
      <el-button size="small" @click="editing = true">编辑</el-button>
      <!-- <el-button size="small" @click="del">删除</el-button> -->
      <el-button size="small" @click="save">保存</el-button>
    </div>
    <PlotManager type="groundRoad" />
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
  name: 'EpsplanetGroundRoad',
  components: {
    PlotManager
  },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      name: '未命名道路',
      creating: false,
      editing: false,
      width: 0,
      color: '',
      ground: true,
      imgList: [{}],
      pathImg: 'Epsplanet_Assets/assets/roadImg/单车道-沥青.jpg',
      _disposer: [0],
      isSaved: false
    });
    let _roadCzm: any;
    onMounted(() => {
      earth = useEarth();
      init();
    });
    onBeforeUnmount(() => {
      del();
    });
    function init() {
      getImgList();
      let roadCzm = new XE.Obj.Road(earth);
      console.log(roadCzm);
      _roadCzm = roadCzm;
      roadCzm.creating = true;
      console.log(roadCzm);
      data._disposer = [];
      data._disposer.push(
        XE.MVVM.bind(thisVue, 'name', roadCzm, 'name'),
        XE.MVVM.bind(thisVue, 'creating', roadCzm, 'creating'),
        XE.MVVM.bind(thisVue, 'editing', roadCzm, 'editing'),
        XE.MVVM.bind(thisVue, 'width', roadCzm, 'width'),
        XE.MVVM.bind(thisVue, 'pathImg', roadCzm, 'imageUrl')
      );
    }
    function getImgList() {
      const files = import.meta.globEager('/Epsplanet_Assets/assets/roadImg/*');
      data.imgList = [];
      for (let i = 0; i < Object.keys(files).length; i++) {
        const img = Object.keys(files)[i];
        // const imgPath = imgFilePath + "/" + img.split("/")[1];
        const imgName = img.split('/').pop();
        data.imgList.push({
          label: imgName,
          path: img
        });
      }
      console.log(data.imgList);
    }
    function save() {
      data.isSaved = true;
      const sceneObject = new XE.SceneTree.Leaf(_roadCzm);
      earth.sceneTree.plots.groundRoad.children.push(sceneObject);
      // thisVue.confirm(sceneObject);
    }
    function del() {
      if (_roadCzm && !data.isSaved) {
        _roadCzm.destroy();
        _roadCzm = undefined;
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
      save,
      del
    };
  }
});
</script>
