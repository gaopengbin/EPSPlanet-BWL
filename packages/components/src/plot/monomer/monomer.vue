<template>
  <div class="epsplanet-panel-base monomer" style="width: 296px">
    <el-tabs v-model="tabCheck">
      <el-tab-pane label="常规" name="1">
        <el-form ref="form11" :model="form" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="form.name" placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="底部高度">
            <el-slider
              v-model="form.bottomHeight"
              :min="0"
              :max="1000"
              show-input
              :show-input-controls="false"
              :step="0.1"
            ></el-slider>
          </el-form-item>
          <el-form-item label="顶部高度">
            <el-slider
              v-model="form.topHeight"
              :min="0"
              :max="1000"
              show-input
              :show-input-controls="false"
              :step="0.1"
            ></el-slider>
          </el-form-item>
          <el-form-item label="颜色">
            <el-color-picker v-model="selectColor" show-alpha></el-color-picker>
          </el-form-item>
          <el-form-item label="操作">
            <el-button-group>
              <el-button @click="creatNewClass">创建</el-button>
              <el-button @click="editing = !editing">编辑</el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="属性" name="2">
        <span>事件</span>
        <el-select v-model="operationEvent" placeholder="请选择点击事件">
          <el-option
            v-for="item in selectOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-input
          type="textarea"
          v-model="form.textarea"
          placeholder="请输入属性"
        ></el-input>
      </el-tab-pane>
    </el-tabs>
    <el-button-group>
      <el-button @click="clear">取消</el-button>
      <el-button @click="save">保存</el-button>
    </el-button-group>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import './style/index.scss';
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
  watch
} from 'vue';
import { useEarth } from '../../utils';

export default defineComponent({
  name: 'EpsplanetMonomer',
  props: [],
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    let _classificationpolygon: any;
    const data = reactive({
      tabCheck: '1', //切换
      form: {
        name: '',
        topHeight: 0,
        bottomHeight: 0,
        color: [1, 1, 0, 0.5],
        textarea: "//p对象即为当前模型\nalert('名称：'+p.name);"
      }, //表单
      selectOptions: [
        {
          label: '单击',
          value: 'onclick'
        }
      ], //事件
      operationEvent: undefined, //选择的事件
      editing: false, //编辑
      _disposers: [] as any[],
      selectColor: 'rgba(255, 255, 0, 0.5)',
      _classificationpolygon
    });
    watch(
      // 监听颜色属性，将字符串转为数组
      () => data.selectColor,
      (val) => {
        let arr: any = val.substring(5, val.length - 1).split(', ');
        for (let index = 0; index < arr.length; index++) {
          if (index == 3) {
            arr[index] = Number(arr[index]);
          } else {
            arr[index] = arr[index] / 255;
          }
        }
        data.form.color = arr;
      }
    );
    onMounted(() => {
      earth = useEarth();
      init();
    });
    onBeforeUnmount(() => {
      del();
    });
    function init() {
      earth.interaction.picking.enabled = true;
      var classificationpolygon = new XE.Obj.ClassificationPolygon(earth);
      data._classificationpolygon = classificationpolygon;
      classificationpolygon.creating = true;
      data._disposers = [];
      data._disposers.push(
        XE.MVVM.bind(thisVue, 'editing', classificationpolygon, 'editing'),
        XE.MVVM.bind(
          thisVue,
          'form.topHeight',
          classificationpolygon,
          'height'
        ),
        XE.MVVM.bind(
          thisVue,
          'form.bottomHeight',
          classificationpolygon,
          'extrudedHeight'
        ),
        XE.MVVM.bind(thisVue, 'form.color', classificationpolygon, 'color')
      );
    }
    function creatNewClass() {
      clear();
      init();
    }
    function save() {
      if (data._classificationpolygon) {
        data._classificationpolygon.name = data.form.name;
        if (data.operationEvent) {
          if (data.operationEvent == 'onclick') {
            data._classificationpolygon.evalString = `
            p.onclick=()=>{
              ${data.form.textarea}
            }
            `;
          }
        }
        let json = data._classificationpolygon.toJSON();
        let classificationpolygon = new XE.Obj.ClassificationPolygon(earth);
        classificationpolygon.xbsjFromJSON(json);
        const sceneObject = new XE.SceneTree.Leaf(classificationpolygon);
        earth.sceneTree.root.children.push(sceneObject);
        confirmHaplochromatization(sceneObject);
        let timeOut = setTimeout(() => {
          clear();
          clearTimeout(timeOut);
        }, 1000);
      }
    }
    //单体化保存组
    function confirmHaplochromatization(czmObject: any) {
      if (!earth.haplochromatization) {
        earth.haplochromatization = [];
      }
      earth.haplochromatization.push(czmObject);
    }
    function clear() {
      del();
      earth.interaction.picking.enabled = true;
      data.form = {
        name: '',
        topHeight: 0,
        bottomHeight: 0,
        color: [1, 1, 0, 0.5],
        textarea: "//p对象即为当前模型\nalert('名称：'+p.name);"
      };
      data.operationEvent = undefined;
      data.editing = false;
      data._disposers = [];
      data.selectColor = 'rgba(255, 255, 0, 0.5)';
      data._classificationpolygon = undefined;
    }
    function del() {
      earth.interaction.picking.enabled = false;
      if (data._disposers) {
        data._disposers.forEach((e: any) => e());
        data._disposers.length = 0;
      }
      if (data._classificationpolygon) {
        data._classificationpolygon.destroy();
        data._classificationpolygon = undefined;
      }
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      save,
      clear,
      del,
      creatNewClass
    };
  }
});
</script>
