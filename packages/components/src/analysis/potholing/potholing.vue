<template>
  <div class="epsplanet-panel-base potholing" style="width: 296px">
    <el-form ref="form" label-width="60px">
      <el-form-item label="名称">
        <el-input v-model="name" placeholder="未命名开挖分析" size="small"></el-input>
      </el-form-item>
      <el-form-item label="选择">
        <el-select size="small" v-model="selectTileset" placeholder="请选择" @change="changeTileset" @visible-change="xiala"
          value-key="index" popper-class="tool-panel-popper">
          <el-option v-for="item in tilesetList" :key="item.index" :label="item.name" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="深度">
        <el-slider v-model="deep" :min="-100" :max="100" :step="0.1" show-input :show-input-controls="false"></el-slider>
      </el-form-item>
      <el-form-item label="显隐">
        <el-switch v-model="show" inactive-color="#dcdfe6"></el-switch>
      </el-form-item>
    </el-form>
    <div class="tool-panel-button">
      <el-button @click="creating = !creating">创建</el-button>
      <el-button @click="editing = !editing">编辑</el-button>
      <!-- <el-button @click="clear">清除</el-button> -->
      <el-button size="small" @click="save">保存</el-button>
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
  watch,
} from "vue";
import { useEarth } from '../../utils';

export default defineComponent({
  name: "EpsplanetPotholing",
  props: [],
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      name: "未命名开挖分析",
      tilesetList: [{}],
      selectTileset: undefined,
      creating: false,
      editing: false,
      show: true,
      baseHeight: 0,
      height: 100,
      deep: 0,
      bottomTextureRotationEditing: false,
      applyToTerrain: false,
      sampledDistance: 10,
      wallImageUrl: "",
      wallImageHeight: 3,
      imageHeight: 3.0,
      wallImageWidthScale: 1,
      bottomImageUrl: "",
      bottomImageHeight: 3,
      bottomImageWidthScale: 1,
      _disposer: [0],
      isSaved: false,
      tips: "shift + 鼠标右键结束绘制",
    });
    let _cutCzmObj: any;
    onMounted(async () => {
      earth = useEarth();
      init();
    });
    onBeforeUnmount(() => {
      del();
    });
    watch(
      () => data.deep,
      (val) => {
        data.height = Number((data.baseHeight - val).toFixed(2));
      }
    );
    function init() {
      let cutsurface = new XE.Obj.CutSurface(earth);
      _cutCzmObj = cutsurface;
      cutsurface.creating = true;
      _cutCzmObj = cutsurface;
      // cutsurface.height = 350;
      data._disposer = [];
      data._disposer.push(
        XE.MVVM.bind(thisVue, "name", cutsurface, "name"),
        XE.MVVM.bind(thisVue, "creating", cutsurface, "creating"),
        XE.MVVM.bind(thisVue, "editing", cutsurface, "editing"),
        XE.MVVM.bind(thisVue, "show", cutsurface, "show"),
        XE.MVVM.bind(thisVue, "height", cutsurface, "height"),
        XE.MVVM.watch(
          () => cutsurface.creating,
          () => {
            if (!cutsurface.creating) {

              // debugger
              setTimeout(() => {
                let baseHeight = cutsurface.sampledPositions[0][2]
                data.height = Number(cutsurface.height.toFixed(2));
                data.baseHeight = baseHeight;
                // data.baseHeight = Number(baseHeight.toFixed(2));
                data.deep = Number((baseHeight - data.height).toFixed(2));
              }, 1500);

            }
          }
        )
      );
    }

    function xiala() {
      data.tilesetList = [];
      earth.tilesetCollection.forEach((t: { name: any }, index: any) => {
        data.tilesetList.push({
          name: t.name,
          index: index,
        });
      });
    }
    function changeTileset(t: any) {
      console.log(_cutCzmObj);
      let tileset = earth.tilesetCollection[t.index];
      earth.tilesetCollection.forEach(
        (t: any) => (tileset.xbsjFlattenGuid = "")
      );
      tileset.xbsjFlattenGuid = _cutCzmObj.getDiscardGuid();
    }
    function save() {
      data.isSaved = true;
      const sceneObject = new XE.SceneTree.Leaf(_cutCzmObj);
      earth.sceneTree.root.children.push(sceneObject);
      thisVue.confirmAnalysis(sceneObject);
    }
    function del() {
      if (_cutCzmObj && !data.isSaved) {
        _cutCzmObj.destroy();
        _cutCzmObj = undefined;
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
      xiala,
      changeTileset,
      save,
      del,
    };
  },
});
</script>