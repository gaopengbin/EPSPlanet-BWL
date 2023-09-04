<template>
  <div class="epsplanet-panel-base" style="width: 450px">
    <el-form ref="form" label-width="70px">
      <el-form-item label="点标名称">
        <el-input
          v-model="name"
          placeholder="未命名点标绘"
          size="small"
        ></el-input>
      </el-form-item>
      <el-form-item label="图标大小">
        <el-slider
          v-model="size"
          :min="1"
          :max="100"
          style="width: 200px"
          show-input
          :show-input-controls="false"
        >
        </el-slider>
      </el-form-item>
      <el-form-item label="内容">
        <el-input
          v-model="text"
          placeholder="请输入内容"
          size="small"
        ></el-input>
      </el-form-item>
      <el-form-item label="图标">
        <el-select v-model="makiIcon" placeholder="请选择">
          <el-option
            v-for="item in makiIconList"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          >
            <span style="float: left; color: black">{{ item.label }}</span>
            <el-image
              style="float: right"
              :src="item.thumbnail"
              fit="fill"
            ></el-image>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="扩展文本">
        <el-input
          v-model="extText"
          placeholder="请输入内容"
          size="small"
        ></el-input>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="文本字体">
            <el-select
              v-model="extTextFontFamily"
              placeholder="请选择"
              style="width: 150px"
            >
              <el-option
                v-for="item in fontFamily"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文本大小">
            <el-input-number
              v-model="extTextFontSize"
              :precision="0"
              :step="1"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="左右偏移">
            <el-input-number
              v-model="extTextPixelOffset[0]"
              :precision="0"
              :step="1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上下偏移">
            <el-input-number
              v-model="extTextPixelOffset[1]"
              :precision="0"
              :step="1"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="背景">
            <el-color-picker
              v-model="fillColor"
              show-alpha
              @active-change="changeFillColor"
            ></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="边框">
            <el-color-picker
              v-model="OutlineColor"
              show-alpha
              @active-change="changeOutlineColor"
            ></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="tool-panel-button">
      <el-button size="small" @click="init" :disabled="editable"
        >创建</el-button
      >
      <el-button
        size="small"
        @click="creating = !creating"
        :disabled="!editable"
        >变更位置</el-button
      >
      <!-- <el-button size="small" @click="del">删除此点</el-button> -->
      <el-button size="small" @click="save" :disabled="!editable"
        >保存</el-button
      >
    </div>
    <PlotManager type="point" @handle-edit="handleEdit" />
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
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

export default defineComponent({
  name: 'EpsplanetPoint',
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
      name: '未命名点标绘',
      creating: false,
      makiIconList: [] as any,
      makiIcon: '',
      text: '',
      size: 48,
      fillColor: 'rgba(255,255,255,1)',
      OutlineColor: 'rgba(6,131,6,1)',
      extText: '',
      extTextPosition: '',
      extTextTrue: '',
      extTextFont: '48px 宋体',
      extTextFontFamily: '宋体',
      fontFamily: [] as any,
      extTextFontSize: 48,
      extTextPixelOffset: [20, -15],
      _disposers: [] as any,
      isSaved: false,
      editable: false,
      isEditing: false,
      lastCzmobj: undefined
    });
    let _pinCzm: any;
    watch(
      () => data.extTextFontFamily,
      (val) => {
        data.extTextFont =
          data.extTextFontSize + 'px ' + data.extTextFontFamily;
      }
    );
    watch(
      () => data.extTextFontSize,
      (val) => {
        data.extTextFont =
          data.extTextFontSize + 'px ' + data.extTextFontFamily;
      }
    );
    onMounted(async () => {
      earth = useEarth();
      axios
        .get('Epsplanet_Assets/widgets/plot/point/config.json')
        .then((res) => {
          data.fontFamily = res.data.fontFamily;
        });
      let makiIconList = XE.Obj.Pin.MakiIcon;
      for (const key in makiIconList) {
        if (Object.hasOwnProperty.call(makiIconList, key)) {
          const value = makiIconList[key];
          data.makiIconList.push({
            label: key,
            value: value,
            thumbnail: await getThumb(key)
          });
        }
      }
    });
    onBeforeUnmount(() => {
      if (data.isEditing) {
        ElMessageBox.confirm('修改未保存，是否保存？', 'Warning', {
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
      del();
    });
    function getThumb(label) {
      return new Promise(async (resolve) => {
        // const pinBuilder = new Cesium.PinBuilder();
        let pic = await earth._pinBuilder.fromMakiIconId(
          label,
          Cesium.Color.TRANSPARENT,
          48,
          Cesium.Color.TRANSPARENT
        );
        resolve(pic.toDataURL());
      });
    }
    function init() {
      if (data.isSaved) {
        console.log('上个已保存，开始绘制新的');
        del();
        init();
      } else {
        let pin = new XE.Obj.Pin(earth);
        pin.name = data.name;
        console.log(pin);
        pin.pinBuilder.extTextPixelOffset = data.extTextPixelOffset;
        pin.pinBuilder.extTextFont = data.extTextFont;
        data.editable = true;
        _pinCzm = pin;
        pin.creating = true;

        data._disposers = [];
        data._disposers.push(
          XE.MVVM.bind(thisVue, 'creating', pin, 'creating'),
          XE.MVVM.bind(thisVue, 'name', pin, 'name'),
          XE.MVVM.bind(thisVue, 'text', pin.pinBuilder, 'text'),
          XE.MVVM.bind(thisVue, 'size', pin.pinBuilder, 'size'),
          XE.MVVM.bind(thisVue, 'makiIcon', pin.pinBuilder, 'makiIcon'),
          XE.MVVM.bind(thisVue, 'extText', pin.pinBuilder, 'extText'),
          XE.MVVM.bind(thisVue, 'extTextFont', pin.pinBuilder, 'extTextFont'),
          XE.MVVM.bind(
            thisVue,
            'extTextPixelOffset',
            pin.pinBuilder,
            'extTextPixelOffset'
          )
        );
      }
    }

    function changeFillColor(val: string) {
      let v = val.split('(')[1].split(')')[0].split(',');
      let cc: any = [];
      v.forEach((c: any, i: number) => {
        if (i == 3) {
          cc.push(Number(c));
        } else {
          cc.push(Number(c) / 255.0);
        }
      });
      _pinCzm.pinBuilder.fillColor = cc;
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
      _pinCzm.pinBuilder.outlineColor = cc;
    }
    function del() {
      if (data._disposers) {
        data._disposers.forEach((d: any) => d());
        data._disposers.length = 0;
      }

      if (_pinCzm && !data.isSaved && !data.isEditing) {
        _pinCzm.destroy();
        _pinCzm = undefined;
      }
      data.isSaved = false;
    }
    function save() {
      data.isSaved = true;
      if (data.isEditing) {
        ElMessage.success('修改成功');
        data.isEditing = false;
      } else {
        const sceneObject = new XE.SceneTree.Leaf(_pinCzm);
        earth.sceneTree.plots.point.children.push(sceneObject);
        data.editable = false;
      }

      if (data._disposers) {
        data._disposers.forEach((d: any) => d());
        data._disposers.length = 0;
      }
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
          })
          .catch(() => {
            ElMessage.info('取消保存');
            cancelEdit(data.lastCzmobj);
          });
      }
      console.log(czmObject);
      data.lastCzmobj = czmObject;
      reBind(czmObject);
    }
    function reBind(czmObject) {
      data.isEditing = true;
      if (data._disposers) {
        data._disposers.forEach((d: any) => d());
        data._disposers.length = 0;
      }

      let pin = earth.getObject(czmObject.xbsjGuid);
      _pinCzm = pin;
      data.editable = true;
      data._disposers = [];
      data._disposers.push(
        XE.MVVM.bind(thisVue, 'creating', pin, 'creating'),
        XE.MVVM.bind(thisVue, 'name', pin, 'name'),
        XE.MVVM.bind(thisVue, 'text', pin.pinBuilder, 'text'),
        XE.MVVM.bind(thisVue, 'size', pin.pinBuilder, 'size'),
        XE.MVVM.bind(thisVue, 'makiIcon', pin.pinBuilder, 'makiIcon'),
        XE.MVVM.bind(thisVue, 'extText', pin.pinBuilder, 'extText'),
        XE.MVVM.bind(thisVue, 'extTextFont', pin.pinBuilder, 'extTextFont'),
        XE.MVVM.bind(
          thisVue,
          'extTextPixelOffset',
          pin.pinBuilder,
          'extTextPixelOffset'
        )
      );
    }
    function cancelEdit(czmObject) {
      // let pin = new XE.Obj.Pin(earth);
      // pin.xbsjFromJSON(czmObject);
      earth.getObject(czmObject.xbsjGuid).xbsjFromJSON(czmObject);
    }
    const refData = toRefs(data);
    return {
      ...refData,
      _pinCzm,
      init,
      changeFillColor,
      changeOutlineColor,
      del,
      save,
      handleEdit,
      getThumb
    };
  }
});
</script>
<style scoped></style>
