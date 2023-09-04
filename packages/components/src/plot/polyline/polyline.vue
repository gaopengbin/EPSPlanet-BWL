<template>
  <div class="epsplanet-panel-base polyline" style="width: 450px">
    <el-form ref="form" label-width="70px" :inline="false">
      <el-form-item label="折线名称">
        <el-input
          v-model="name"
          placeholder="未命名折线"
          maxlength="15"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="线型">
        <el-select
          v-model="material"
          placeholder="请选择"
          @change="lineTypeChange"
        >
          <el-option
            v-for="item in lineTypes"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="线宽">
        <el-slider
          v-model="width"
          :min="1"
          :max="100"
          :step="1"
          style="width: 200px"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>

      <el-form-item
        label="间隔宽度"
        v-show="material == 'XbsjPolylineDashMaterial'"
      >
        <el-slider
          v-model="gapWidth"
          :min="1"
          :max="200"
          :step="1"
          style="width: 200px"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>

      <el-form-item label="流动速率" v-show="material == 'XbsjODLineMaterial'">
        <el-slider
          v-model="totoalFrame"
          :min="1"
          :max="200"
          :step="1"
          style="width: 200px"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <!--  通用 -->
          <el-form-item label="颜色">
            <el-color-picker
              v-model="color"
              show-alpha
              @active-change="changeColor"
            ></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!--  仅虚线 -->
          <el-form-item
            label="间隔颜色"
            v-show="material == 'XbsjPolylineDashMaterial'"
          >
            <el-color-picker
              v-model="gapColor"
              show-alpha
              @active-change="changeGapColor"
            ></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="贴地">
            <el-switch
              v-model="ground"
              active-color="#13ce66"
              inactive-color="#dcdfe6"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示距离">
            <el-switch
              v-model="showLength"
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
      <el-button size="small" :disabled="!editable" @click="editing = true"
        >编辑</el-button
      >
      <!-- <el-button size="small" @click="del">清除</el-button> -->
      <el-button size="small" :disabled="!editable" @click="save"
        >保存</el-button
      >
    </div>
    <EpsplanetPlotManager type="polyline" @handle-edit="handleEdit" />
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
import { ElMessage, ElMessageBox } from 'element-plus';
export default defineComponent({
  name: 'EpsplanetPolyline',
  props: [],
  components: {
    PlotManager
  },
  setup() {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      name: '未命名折线',
      creating: false,
      editing: false,
      editable: false,
      material: 'XbsjColorMaterial',
      lineTypes: [
        {
          label: '纯色',
          value: 'XbsjColorMaterial'
        },
        {
          label: '箭头',
          value: 'XbsjPolylineArrowMaterial'
        },
        {
          label: '虚线',
          value: 'XbsjPolylineDashMaterial'
        },
        {
          label: '流光',
          value: 'XbsjODLineMaterial'
        }
      ],
      width: 1,
      gapWidth: 50,
      totoalFrame: 100,
      color: 'rgba(0,255,0,1)',
      gapColor: 'rgba(255,255,255,1)',
      ground: true,
      showLength: false,
      _disposer: [] as any,
      isSaved: false,
      isEditing: false,
      lastCzmobj: undefined
    });
    let _polylineCzm: any;

    onMounted(() => {
      earth = useEarth();
    });
    onBeforeUnmount(() => {
      del();
    });
    function init() {
      if (data.isSaved) {
        console.log('上个已保存，开始绘制新的');
        del();
        init();
      } else {
        let polylineCzm = new XE.Obj.Plots.GeoPolyline(earth);
        polylineCzm.name = data.name;
        polylineCzm.creating = true;
        polylineCzm._polyline.material.type = data.material;
        data.editable = true;
        _polylineCzm = polylineCzm;
        changeColor(data.color);

        data._disposer = [];
        data._disposer.push(
          XE.MVVM.bind(thisVue, 'name', polylineCzm, 'name'),
          XE.MVVM.bind(thisVue, 'creating', polylineCzm, 'creating'),
          XE.MVVM.bind(thisVue, 'editing', polylineCzm, 'editing'),
          XE.MVVM.bind(thisVue, 'width', polylineCzm, 'width'),
          XE.MVVM.bind(thisVue, 'ground', polylineCzm, 'ground'),
          XE.MVVM.bind(thisVue, 'showLength', polylineCzm, 'showLength'),
          XE.MVVM.watch(
            () => polylineCzm.creating,
            () => {
              data.creating = polylineCzm.creating;
            }
          ),
          XE.MVVM.watch(
            () => polylineCzm.editing,
            () => {
              data.editing = polylineCzm.editing;
            }
          )
        );

        if (data.material == 'XbsjPolylineDashMaterial') {
          changeGapColor(data.gapColor);
          data._disposer.push(
            XE.MVVM.bind(
              thisVue,
              'gapWidth',
              polylineCzm._polyline.material.XbsjPolylineDashMaterial,
              'dashLength'
            )
          );
        }
        if (data.material == 'XbsjODLineMaterial') {
          data._disposer.push(
            XE.MVVM.bind(
              thisVue,
              'totoalFrame',
              polylineCzm._polyline.material.XbsjODLineMaterial,
              'totoalFrameCount'
            )
          );
        }
      }
    }
    function changeColor(val: any) {
      if (!data.isEditing && !data.editable) return;
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
      if (_polylineCzm) {
        switch (data.material) {
          case 'XbsjColorMaterial':
            _polylineCzm.color = cc;
            break;
          case 'XbsjPolylineArrowMaterial':
            _polylineCzm._polyline.material.XbsjPolylineArrowMaterial.color =
              cc;
            break;
          case 'XbsjODLineMaterial':
            _polylineCzm._polyline.material.XbsjODLineMaterial.color = cc;
            break;
          case 'XbsjPolylineDashMaterial':
            _polylineCzm._polyline.material.XbsjPolylineDashMaterial.color = cc;
            break;

          default:
            break;
        }
      }
    }
    function changeGapColor(val: any) {
      if (!data.isEditing && !data.editable) return;
      let v = val.split('(')[1].split(')')[0].split(',');
      let cc: any = [];
      v.forEach((c: any, i: number) => {
        if (i == 3) {
          cc.push(Number(c));
        } else {
          cc.push(Number(c) / 255.0);
        }
      });
      if (_polylineCzm) {
        _polylineCzm._polyline.material.XbsjPolylineDashMaterial.gapColor = cc;
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
    function lineTypeChange(type) {
      data.material = type;
      if (_polylineCzm) {
        _polylineCzm._polyline.material.type = type;
        changeColor(data.color);
        if (data.material == 'XbsjPolylineDashMaterial') {
          changeGapColor(data.gapColor);
          data._disposer.push(
            XE.MVVM.bind(
              thisVue,
              'gapWidth',
              _polylineCzm._polyline.material.XbsjPolylineDashMaterial,
              'dashLength'
            )
          );
        }
        if (data.material == 'XbsjODLineMaterial') {
          data._disposer.push(
            XE.MVVM.bind(
              thisVue,
              'totoalFrame',
              _polylineCzm._polyline.material.XbsjODLineMaterial,
              'totoalFrameCount'
            )
          );
        }
      }
    }

    function save() {
      data.isSaved = true;
      if (data.isEditing) {
        ElMessage.success('修改成功');
        data.isEditing = false;
        data.lastCzmobj = undefined;
      } else {
        const sceneObject = new XE.SceneTree.Leaf(_polylineCzm);
        earth.sceneTree.plots.polyline.children.push(sceneObject);
        ElMessage.success('保存成功');
      }
      data.editable = false;
      if (data._disposer) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
    }
    function del() {
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
      if (_polylineCzm && !data.isSaved && !data.isEditing) {
        _polylineCzm.destroy();
        _polylineCzm = undefined;
      }
      if (data._disposer) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
      data.isSaved = false;
    }
    function handleEdit(czmObject) {
      if (data.lastCzmobj == czmObject) return;
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

      let polylineCzm = earth.getObject(czmObject.xbsjGuid);
      _polylineCzm = polylineCzm;
      if (_polylineCzm._polyline.material.type == 'XbsjPolylineDashMaterial') {
        data.gapColor = reColor(
          polylineCzm._polyline.material.XbsjPolylineDashMaterial.color
        );
      }
      data.color = reColor(polylineCzm.color);
      data.material = polylineCzm._polyline.material.type;
      data.editable = true;
      data._disposer = [];
      data._disposer.push(
        XE.MVVM.bind(thisVue, 'name', polylineCzm, 'name'),
        XE.MVVM.bind(thisVue, 'creating', polylineCzm, 'creating'),
        XE.MVVM.bind(thisVue, 'editing', polylineCzm, 'editing'),
        XE.MVVM.bind(thisVue, 'width', polylineCzm, 'width'),
        XE.MVVM.bind(thisVue, 'ground', polylineCzm, 'ground'),
        XE.MVVM.bind(thisVue, 'showLength', polylineCzm, 'showLength'),
        XE.MVVM.watch(
          () => polylineCzm.creating,
          () => {
            data.creating = polylineCzm.creating;
          }
        ),
        XE.MVVM.watch(
          () => polylineCzm.editing,
          () => {
            data.editing = polylineCzm.editing;
          }
        )
      );
    }
    function cancelEdit(czmObject) {
      earth.getObject(czmObject.xbsjGuid).xbsjFromJSON(czmObject);
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      changeColor,
      changeGapColor,
      lineTypeChange,
      save,
      del,
      handleEdit
    };
  }
});
</script>
