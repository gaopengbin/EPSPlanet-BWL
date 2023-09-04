<template>
  <div class="epsplanet-panel-base" style="width: 450px">
    <el-form ref="form" label-width="70px" :inline="true">
      <el-form-item label="名称">
        <el-input
          v-model="name"
          placeholder="未命名多边形"
          size="small"
          maxlength="15"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="线宽">
        <el-slider
          v-model="outlineWidth"
          :min="1"
          :max="100"
          :step="1"
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
              v-model="color"
              show-alpha
              @active-change="changeColor"
            ></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="显示名称">
            <el-switch
              v-model="showLabel"
              active-color="#13ce66"
              inactive-color="#dcdfe6"
            ></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="边框">
            <el-switch
              v-model="outlineShow"
              inactive-color="#dcdfe6"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="贴地">
            <el-switch v-model="ground" inactive-color="#dcdfe6"></el-switch>
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
      <el-button size="small" @click="init" :disabled="editable"
        >创建</el-button
      >
      <el-button size="small" @click="editing = true" :disabled="!editable"
        >编辑</el-button
      >
      <!-- <el-button size="small" @click="del">清除</el-button> -->
      <el-button size="small" @click="save" :disabled="!editable"
        >保存</el-button
      >
    </div>
    <PlotManager type="polygon" @handle-edit="handleEdit" />
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
  defineComponent,
  watch
} from 'vue';
import {
  ElForm,
  ElFormItem,
  ElSlider,
  ElSelect,
  ElInput,
  ElOption,
  ElImage,
  ElInputNumber,
  ElColorPicker,
  ElButton
} from 'element-plus';
import { useEarth } from '../../utils';
import PlotManager from '../plotmanager/plotmanager.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default defineComponent({
  name: 'EpsplanetPolygon',
  props: [],
  components: {
    PlotManager,
    ElForm,
    ElFormItem,
    ElSlider,
    ElSelect,
    ElInput,
    ElOption,
    ElImage,
    ElInputNumber,
    ElColorPicker,
    ElButton
  },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      name: '未命名多边形',
      creating: false,
      editing: false,
      outlineShow: true,
      outlineWidth: 0,
      color: 'rgba(0,255,0,0.1)',
      outlineColor: 'rgba(0,255,0,1)',
      ground: true,
      _disposer: [] as any,
      isSaved: false,
      editable: false,
      showArea: false,
      isEditing: false,
      lastCzmobj: undefined as any,
      showLabel: true
    });
    let _polygonCzm: any;
    onMounted(() => {
      earth = useEarth();
    });
    onBeforeUnmount(() => {
      del();
    });
    watch(
      () => data.showLabel,
      () => {
        if (_polygonCzm?._label) {
          _polygonCzm._label.show = data.showLabel;
        }
      }
    );
    watch(
      () => data.name,
      () => {
        if (_polygonCzm?._label) {
          _polygonCzm._label.label.text = data.name;
        }
      }
    );
    function init() {
      if (data.isSaved) {
        console.log('上个已保存，开始绘制新的');
        del();
        init();
      } else {
        let polygonCzm = new XE.Obj.Plots.GeoPolygon(earth);
        polygonCzm.name = data.name;
        _polygonCzm = polygonCzm;
        changeColor(data.color);
        changeOutlineColor(data.outlineColor);
        polygonCzm.creating = true;
        console.log(polygonCzm);
        data.editable = true;
        data._disposer = [];
        data._disposer.push(
          XE.MVVM.bind(thisVue, 'name', polygonCzm, 'name'),
          XE.MVVM.bind(thisVue, 'creating', polygonCzm, 'creating'),
          XE.MVVM.bind(thisVue, 'editing', polygonCzm, 'editing'),
          XE.MVVM.bind(thisVue, 'outlineShow', polygonCzm, 'outlineShow'),
          XE.MVVM.bind(thisVue, 'outlineWidth', polygonCzm, 'outlineWidth'),
          XE.MVVM.bind(thisVue, 'ground', polygonCzm, 'ground'),
          XE.MVVM.bind(thisVue, 'showArea', polygonCzm, 'showArea'),
          XE.MVVM.watch(
            () => polygonCzm.creating,
            () => {
              data.creating = polygonCzm.creating;
              if (!polygonCzm.creating) {
                createLabel();
              }
            }
          ),
          XE.MVVM.watch(
            () => polygonCzm.editing,
            () => {
              data.editing = polygonCzm.editing;
              if (!polygonCzm.editing) {
                if (polygonCzm._label) {
                  polygonCzm._label.position =
                    _polygonCzm._billboardEnt._position._value;
                }
              }
            }
          ),
          XE.MVVM.watch(
            () => polygonCzm.show,
            () => {
              if (polygonCzm._label && !polygonCzm.show) {
                polygonCzm._label.show = false;
              }
            }
          )
        );
      }
    }

    function createLabel() {
      let cartesian3 = _polygonCzm._billboardEnt._position._value;

      let label = earth.czm.viewer.entities.add({
        position: cartesian3,
        label: {
          text: data.name,
          font: '18px sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#ffffff'),
          outlineColor: Cesium.Color.fromCssColorString('#000000'),
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -40),
          showBackground: false,
          backgroundColor:
            Cesium.Color.fromCssColorString('#000000').withAlpha(0.7)
        }
      });

      // 带颜色的输出
      console.log('%clabel', 'color:red;font-size:14px;', label);
      _polygonCzm._label = label;
    }

    function changeColor(val: string) {
      if (val == '') {
        val = 'rgba(0,0,0,0)';
      }
      let v = val.split('(')[1].split(')')[0].split(',');
      let cc: any = [];
      v.forEach((c: any, i: number) => {
        if (i == 3) {
          cc.push(Number(c));
        } else {
          cc.push(Number(c) / 255.0);
        }
      });
      if (_polygonCzm) {
        _polygonCzm.color = cc;
      }
    }
    function changeOutlineColor(val: string) {
      let v = val.split('(')[1].split(')')[0].split(',');
      let cc: any = [];
      v.forEach((c: any, i: number) => {
        if (i == 3) {
          cc.push(Number(c));
        } else {
          cc.push(Number(c) / 255.0);
        }
      });
      if (_polygonCzm) {
        _polygonCzm.outlineColor = cc;
      }
    }
    function reColor(color) {
      let rgba =
        'rgba(' +
        color[0] * 255 +
        ',' +
        color[1] * 255 +
        ',' +
        color[2] * 255 +
        ',' +
        color[3] +
        ')';
      return rgba;
    }
    function save() {
      data.isSaved = true;
      _polygonCzm.editing = false;
      if (data.isEditing) {
        ElMessage.success('修改成功');
        data.isEditing = false;
        data.lastCzmobj = undefined;
      } else {
        const sceneObject = new XE.SceneTree.Leaf(_polygonCzm);
        earth.sceneTree.plots.polygon.children.push(sceneObject);
        data.editable = false;
        ElMessage.success('保存成功');
      }
      data.editable = false;
      if (data._disposer) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
      _polygonCzm = undefined;
    }
    function del() {
      if (_polygonCzm) {
        _polygonCzm.editing = false;
      }
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
      if (_polygonCzm && !data.isSaved && !data.isEditing) {
        _polygonCzm._label && _polygonCzm._label.destroy();
        _polygonCzm.destroy();
        _polygonCzm = undefined;
      }
      if (data._disposer) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
      data.isSaved = false;
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
            console.log(data.lastCzmobj, czmObject);
            data.lastCzmobj = czmObject;
          });
      } else {
        data.lastCzmobj = czmObject;
      }

      reBind(czmObject);
    }
    function reBind(czmObject) {
      data.isEditing = true;
      if (data._disposer) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
      let polygonCzm = earth.getObject(czmObject.xbsjGuid);
      _polygonCzm = polygonCzm;
      _polygonCzm._label.originShow = undefined;
      data.showLabel = polygonCzm._label.show;
      data.color = reColor(polygonCzm.color);
      data.outlineColor = reColor(polygonCzm.outlineColor);
      data.editable = true;
      data._disposer = [];
      data._disposer.push(
        XE.MVVM.bind(thisVue, 'name', polygonCzm, 'name'),
        XE.MVVM.bind(thisVue, 'creating', polygonCzm, 'creating'),
        XE.MVVM.bind(thisVue, 'editing', polygonCzm, 'editing'),
        XE.MVVM.bind(thisVue, 'outlineShow', polygonCzm, 'outlineShow'),
        XE.MVVM.bind(thisVue, 'outlineWidth', polygonCzm, 'outlineWidth'),
        XE.MVVM.bind(thisVue, 'ground', polygonCzm, 'ground'),
        XE.MVVM.bind(thisVue, 'showArea', polygonCzm, 'showArea'),
        XE.MVVM.watch(
          () => polygonCzm.creating,
          () => {
            data.creating = polygonCzm.creating;
          }
        ),
        XE.MVVM.watch(
          () => polygonCzm.editing,
          () => {
            data.editing = polygonCzm.editing;
          }
        ),
        XE.MVVM.watch(
          () => polygonCzm.show,
          () => {
            if (polygonCzm._label && !polygonCzm.show) {
              polygonCzm._label.show = false;
            }
          }
        )
      );
    }
    function cancelEdit(czmObject: any) {
      earth.getObject(czmObject.xbsjGuid).xbsjFromJSON(czmObject);
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      changeColor,
      changeOutlineColor,
      save,
      del,
      handleEdit
    };
  }
});
</script>
