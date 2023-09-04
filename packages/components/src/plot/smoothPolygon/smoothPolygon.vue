<template>
  <div class="epsplanet-panel-base smooth-polygon" style="width: 450px">
    <!-- <el-scrollbar height="202px"> -->
    <el-form ref="form" label-width="70px" inline>
      <el-form-item label="名称">
        <el-input
          v-model="name"
          placeholder="请输入15个以内字符"
          size="small"
          maxlength="15"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="边框宽度">
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
          <el-form-item label="边框颜色">
            <el-color-picker
              v-model="wireFrameColor"
              @change="changeColor('box')"
              show-alpha
            ></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="填充颜色">
            <el-color-picker
              v-model="fillColor"
              @change="changeColor('fill')"
              show-alpha
            ></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="显示边框">
            <el-switch
              v-model="outlineShow"
              active-color="#13ce66"
              inactive-color="#dcdfe6"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否贴地">
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
      <el-button size="small" @click="init">创建</el-button>
      <el-button size="small" @click="editing = !editing">编辑</el-button>
      <el-button size="small" @click="save" :disabled="!editable"
        >保存</el-button
      >
    </div>
    <!-- </el-scrollbar> -->
    <el-divider />
    <PlotManager type="smoothPolygon" @handle-edit="handleEdit" />
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
  name: 'EpsplanetSmoothPolygon',
  props: [],
  components: {
    PlotManager
  },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      name: '平滑多边形对象', //多边形名称
      outlineWidth: 2, //边框线的宽度，单位m
      outlineShow: true, //有无边框
      wireFrameColor: 'rgba(0,255,0,1)', //边框颜色
      fillColor: 'rgba(0,255,0,0.3)', //填充颜色
      editing: false, //是否启用编辑
      ground: true, //是否贴地
      showArea: false, //是否显示面积
      editable: false
    });
    let earth: any;
    let _SmoothPolygon: any; //平滑多边形对象
    let isSaved: any = false; //是否挂载到sceneTree.root下
    let bindList: any;
    let lefthandler: any; //鼠标左击事件
    let righthandler: any; //鼠标右击事件
    let curczmObj: any = undefined; //PlotManager组件里选中的要编辑的对象
    let isEditing: boolean = false; //PlotManager组件里切换编辑对象时判断当前是否有正在编辑的情况；
    onMounted(() => {
      earth = useEarth();
    });
    onBeforeUnmount(() => {
      try {
        del();
      } catch (error) {
        console.log(error);
      }
    });
    const init = () => {
      // 创建平滑多边形
      if (!isSaved && _SmoothPolygon) _SmoothPolygon.destroy();
      let SmoothPolygon: any;
      SmoothPolygon = new XE.Obj.Plots.GeoSmoothPolygon(earth);
      data.editable = true;
      _SmoothPolygon = SmoothPolygon;
      SmoothPolygon.name = data.name;
      SmoothPolygon.ground = data.ground;
      SmoothPolygon.outlineWidth = data.outlineWidth;
      SmoothPolygon.outlineShow = data.outlineShow;
      SmoothPolygon.creating = true;
      // 数据鼠标左击事件
      lefthandler = new Cesium.ScreenSpaceEventHandler(
        earth.czm.viewer.scene.canvas
      );

      // 数据绑定
      bindList = [
        //双向绑定的属性
        { name: 'name' },
        { name: 'creating' },
        { name: 'editing' },
        { name: 'ground' },
        { name: 'outlineWidth' },
        { name: 'outlineShow' },
        { name: 'showArea' }
      ];
      bindList.forEach((el: any) => {
        el.unbind = XE.MVVM.bind(thisVue, el.name, SmoothPolygon, el.name);
      });

      changeColor('box');
      changeColor('fill');
    };
    // 改变颜色
    const changeColor = (val) => {
      let cc = [];
      if (val == 'box' && _SmoothPolygon) {
        cc = cc.concat(transColorToCesium(data.wireFrameColor));
        _SmoothPolygon.outlineColor = cc;
      }
      if (val == 'fill' && _SmoothPolygon) {
        cc = cc.concat(transColorToCesium(data.fillColor));
        _SmoothPolygon.color = cc;
      }
    };
    // 把rgba颜色转换为cesium通用的颜色格式（0，1）
    const transColorToCesium = (val: any) => {
      let v = val.split('(')[1].split(')')[0].split(',');
      let cc: any = [];
      v.forEach((c: any, i: number) => {
        if (i == 3) {
          cc.push(Number(c));
        } else {
          cc.push(Number(c) / 255.0);
        }
      });
      return cc;
    };
    const del = () => {
      if (isEditing) {
        isSaved = true;
        ElMessageBox.confirm('上个修改未保存，是否保存？', 'Warning', {
          confirmButtonText: '保存',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            ElMessage.success('保存成功！');
            isSaved = false;
          })
          .catch(() => {
            ElMessage.info('取消保存');
            cancelEdit(curczmObj);
            isSaved = false;
          });
      }
      //解除与平滑多边形的属性绑定
      if (bindList) {
        bindList.forEach((el: any) => {
          el.unbind();
        });
        bindList.length = 0;
      }
      //销毁平滑多边形对象
      if (_SmoothPolygon && !isSaved && !isEditing) {
        _SmoothPolygon.destroy();
        _SmoothPolygon = undefined;
      }
      //销毁左、右点击事件
      if ((lefthandler || righthandler) && !isSaved) {
        lefthandler = lefthandler && lefthandler.destroy();
        righthandler = righthandler && righthandler.destroy();
      }
      isSaved = false;
    };
    const save = () => {
      _SmoothPolygon.editing = false;
      isSaved = true;
      data.editable = false;
      let leaf = earth.sceneTree.plots.smoothPolygon.children.find(
        (item) => item.czmObject.xbsjGuid == _SmoothPolygon.xbsjGuid
      );
      if (leaf) {
        ElMessage.success('修改成功');
        isEditing = false;
      } else {
        const sceneObject = new XE.SceneTree.Leaf(_SmoothPolygon);
        earth.sceneTree.plots.smoothPolygon.children.push(sceneObject);
        ElMessage.success('保存成功');
        _SmoothPolygon = undefined;
      }
      del();
    };
    const handleEdit = (czmObject) => {
      console.log('当前对象:', czmObject);
      //重复点击当前编辑行的编辑功能
      if (curczmObj && czmObject.xbsjGuid == curczmObj.xbsjGuid) {
        return;
      }
      if (isEditing) {
        ElMessageBox.confirm('上个修改未保存，是否保存？', 'Warning', {
          confirmButtonText: '保存',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            ElMessage.success('保存成功！');
            curczmObj = czmObject;
          })
          .catch(() => {
            ElMessage.info('取消保存');
            cancelEdit(curczmObj);
            curczmObj = czmObject;
          });
      } else {
        curczmObj = czmObject;
      }
      reBind(czmObject);
    };
    const cancelEdit = (czmObject) => {
      earth.getObject(czmObject.xbsjGuid).xbsjFromJSON(czmObject);
    };
    const reBind = (czmObject) => {
      isEditing = true;
      if (bindList) {
        bindList.forEach((el: any) => {
          el.unbind();
        });
        bindList.length = 0;
        bindList = [];
      }
      let smoothpolygon = earth.getObject(czmObject.xbsjGuid);
      _SmoothPolygon = smoothpolygon;
      data.fillColor = reColor(smoothpolygon.color);
      data.wireFrameColor = reColor(smoothpolygon.outlineColor);
      data.editable = true;
      bindList = [
        //双向绑定的属性
        { name: 'name' },
        { name: 'creating' },
        { name: 'editing' },
        { name: 'ground' },
        { name: 'outlineWidth' },
        { name: 'outlineShow' },
        { name: 'showArea' }
      ];
      bindList.forEach((el: any) => {
        el.unbind = XE.MVVM.bind(thisVue, el.name, smoothpolygon, el.name);
      });
    };
    const reColor = (color) => {
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
    };

    const refData = toRefs(data);
    return {
      ...refData,
      init,
      changeColor,
      transColorToCesium,
      save,
      del,
      handleEdit
    };
  }
});
</script>
