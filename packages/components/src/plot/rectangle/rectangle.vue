<template>
  <div class="epsplanet-panel-base" style="width: 500px">
    <el-form ref="form" label-width="100px" :inline="true">
      <el-form-item label="名称">
        <el-input
          v-model="name"
          placeholder="请输入10个以内字符"
          size="small"
          maxlength="15"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="旋转度(弧度)">
        <el-slider
          v-model="rotation"
          :min="0"
          :max="Math.PI"
          :step="0.01"
          show-input
          :show-input-controls="false"
          style="width: 200px"
        ></el-slider>
      </el-form-item>
      <el-form-item label="线宽">
        <el-slider
          v-model="outlineWidth"
          :min="1"
          :max="50"
          style="width: 200px"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>

      <el-row>
        <el-col :span="8">
          <el-form-item label="边框">
            <el-color-picker
              v-model="outlineColor"
              show-alpha
              @active-change="changeOutlineColor"
            ></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="填充">
            <el-color-picker
              v-model="inlineColor"
              show-alpha
              @active-change="changeColor"
            ></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="边框">
            <el-switch
              v-model="outlineShow"
              active-color="#13ce66"
              inactive-color="#dcdfe6"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="贴地">
            <el-switch
              v-model="ground"
              active-color="#13ce66"
              inactive-color="#dcdfe6"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="显示面积">
            <el-switch
              v-model="showArea"
              active-color="#13ce66"
              inactive-color="#dcdfe6"
            ></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="tool-panel-button">
      <el-button size="small" @click="init" :disabled="creating"
        >创建</el-button
      >
      <el-button size="small" @click="editing = !editing" :disabled="!editable"
        >编辑</el-button
      >
      <el-button size="small" @click="save" :disabled="!editable"
        >保存</el-button
      >
    </div>
    <PlotManager type="rectangle" @handle-edit="handleEdit" />
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
  onBeforeUnmount
} from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useEarth, rgbaStrToArr, rgbaArrToStr } from '../../utils';
import PlotManager from '../plotmanager/plotmanager.vue';
export default defineComponent({
  name: 'EpsplanetRectangle',
  props: [],
  components: {
    PlotManager
  },
  setup() {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      _polygonCzm: undefined as any,
      _disposers: [] as any,
      name: '未命名矩形',
      outlineWidth: 1,
      outlineShow: true,
      ground: true,
      outlineColor: 'rgba(0,255,0,1)',
      inlineColor: 'rgba(0,255,0,0.1)',
      creating: false,
      editing: false,
      isSaved: false,
      editable: false,
      rotation: 0,
      showArea: false,
      lastCzmobj: undefined as any,
      isEditing: false
    });

    onMounted(() => {
      earth = useEarth();
    });
    onBeforeUnmount(() => {
      del();
    });

    function init() {
      if (data.isSaved) {
        del();
        init();
      } else {
        thisVue._polygonCzm = new XE.Obj.Plots.GeoRectangle(earth);
        thisVue._polygonCzm.name = data.name;
        thisVue._polygonCzm.color = rgbaStrToArr(thisVue.inlineColor);
        thisVue._polygonCzm.outlineColor = rgbaStrToArr(thisVue.outlineColor);
        // console.log(thisVue._polygonCzm);
        thisVue._polygonCzm.creating = true;
        thisVue.editable = true;
        thisVue._disposers = [];
        bindAttr();
      }
    }
    function bindAttr() {
      thisVue._disposers = [];
      const attrs = [
        'name',
        'creating',
        'editing',
        'rotation',
        'showArea',
        'outlineShow',
        'outlineWidth',
        'ground'
      ];
      attrs.forEach((attr) => {
        thisVue._disposers.push(
          XE.MVVM.bind(thisVue, attr, thisVue._polygonCzm, attr)
        );
      });
    }
    function changeColor(val) {
      if (thisVue._polygonCzm) {
        thisVue._polygonCzm.color = rgbaStrToArr(val);
      }
    }

    function changeOutlineColor(val) {
      if (thisVue._polygonCzm) {
        thisVue._polygonCzm.outlineColor = rgbaStrToArr(val);
      }
    }
    function handleEdit(czmObject) {
      if (data.lastCzmobj && data.lastCzmobj.xbsjGuid == czmObject.xbsjGuid)
        return;

      if (data.isEditing) {
        ElMessageBox.confirm('上个修改未保存，是否保存？', 'Warning', {
          confirmButtonText: '保存',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            ElMessage.success('保存成功！');
            data.lastCzmobj = czmObject;
          })
          .catch(() => {
            ElMessage.info('取消保存');
            cancelEdit(data.lastCzmobj);
            // console.log(data.lastCzmobj, czmObject);
            data.lastCzmobj = czmObject;
          });
      } else {
        data.lastCzmobj = czmObject;
      }

      reBind(czmObject);
    }
    function reBind(czmObject) {
      data.isEditing = true;
      dispose();
      let polygonCzm = earth.getObject(czmObject.xbsjGuid);
      thisVue._polygonCzm = polygonCzm;
      data.inlineColor = rgbaArrToStr(polygonCzm.color);
      data.outlineColor = rgbaArrToStr(polygonCzm.outlineColor);
      data.editable = true;
      bindAttr();
    }
    function cancelEdit(czmObject) {
      earth.getObject(czmObject.xbsjGuid).xbsjFromJSON(czmObject);
    }

    function save() {
      data.isSaved = true;
      if (data.isEditing) {
        ElMessage.success('修改成功');
        data.isEditing = false;
        data.editing = false;
      } else {
        const sceneObject = new XE.SceneTree.Leaf(thisVue._polygonCzm);
        earth.sceneTree.plots.rectangle.children.push(sceneObject);
        data.editable = false;
        ElMessage.success('保存成功');
        // console.log(earth.sceneTree.plots.rectangle);
      }
      data.editable = false;
      dispose();
    }
    function dispose() {
      if (thisVue._disposers) {
        thisVue._disposers.forEach((d) => d());
        thisVue._disposers.length = 0;
      }
    }
    function del() {
      dispose();
      if (data.isEditing) {
        ElMessageBox.confirm('上个修改未保存，是否保存？', 'Warning', {
          confirmButtonText: '保存',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            ElMessage.success('保存成功！');
          })
          .catch(() => {
            ElMessage.info('取消保存');
            cancelEdit(data.lastCzmobj);
          });
      }
      if (thisVue._polygonCzm && !thisVue.isSaved && !data.isEditing) {
        thisVue._polygonCzm.destroy();
        thisVue._polygonCzm = undefined;
      }
      data.isSaved = false;
    }

    return {
      ...toRefs(data),
      init,
      changeOutlineColor,
      changeColor,
      handleEdit,
      save
    };
  }
});
</script>
