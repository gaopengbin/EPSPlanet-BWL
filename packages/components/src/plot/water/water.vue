<template>
  <div class="tool-panel-base" style="width: 296px">
    <el-form ref="formRef" :model="form" label-width="50px">
      <el-form-item label="名称">
        <el-input
          v-model="form.name"
          size="small"
          placeholder="请输入10字符以内"
          maxlength="10"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="速度">
        <el-slider
          v-model="form.animationSpeed"
          :min="0.05"
          :max="100"
          :step="0.01"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <el-form-item label="强度">
        <el-slider
          v-model="form.specularIntensity"
          :min="0.1"
          :max="500"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <el-form-item label="振幅">
        <el-slider
          v-model="form.amplitude"
          :min="1"
          :max="100"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <el-row>
        <el-col :span="8">
          <el-form-item label="水面">
            <el-switch v-model="form.show" size="small" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="边框">
            <el-switch v-model="form.outlineshow" size="small" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="贴地">
            <el-switch v-model="form.ground" size="small" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
  <!-- <h1>{{layername}}</h1> -->
  <div class="tool-panel-button">
    <el-button size="small" @click="form.creating = !form.creating"
      >创建</el-button
    >
    <el-button
      size="small"
      @click="form.editing = !form.editing"
      :disabled="creating || disabledBtn"
      >编辑</el-button
    >
    <el-button size="small" @click="save()" :disabled="creating || disabledBtn"
      >保存</el-button
    >
  </div>
  <PlotManager type="water" />
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
import { ElMessage } from 'element-plus';
import { useEarth } from '../../utils';
import PlotManager from '../plotmanager/plotmanager.vue';

export default defineComponent({
  name: 'EpsplanetWater',
  components: { PlotManager },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      creating: false,
      editing: false,
      isSaved: false,
      formRef: '',
      destroyArray: [''],
      disabledBtn: true,
      form: {
        name: '',
        animationSpeed: 10,
        specularIntensity: 5,
        sliderValue3: 2,
        show: true,
        outlineshow: true,
        ground: true,
        amplitude: 5,
        creating: false,
        editing: false
      }
    });
    let _waterDraw: any;
    let pin: any;
    let waterDraw;
    const methods = {
      init() {
        data.isSaved = false;
        pin = new XE.Obj.Plots.GeoPin(earth);
        waterDraw = new XE.Obj.Water(earth);
        console.log(waterDraw);
        (waterDraw.name = '未命名水面对象'), (_waterDraw = waterDraw);
        data.destroyArray = [];
        let position = [0, 0, 0];
        data.destroyArray.push(
          XE.MVVM.bind(thisVue, 'form.name', waterDraw, 'name'),
          XE.MVVM.bind(thisVue, 'form.creating', waterDraw, 'creating'),
          XE.MVVM.bind(thisVue, 'form.editing', waterDraw, 'editing'),
          XE.MVVM.bind(thisVue, 'form.show', waterDraw, 'show'),
          XE.MVVM.bind(thisVue, 'form.outlineshow', waterDraw.outline, 'show'),
          XE.MVVM.bind(
            thisVue,
            'form.animationSpeed',
            waterDraw,
            'animationSpeed'
          ),
          XE.MVVM.bind(thisVue, 'form.amplitude', waterDraw, 'amplitude'),
          XE.MVVM.bind(
            thisVue,
            'form.specularIntensity',
            waterDraw,
            'specularIntensity'
          ),
          XE.MVVM.bind(thisVue, 'form.ground', waterDraw, 'ground'),
          XE.MVVM.watch(
            () => [...waterDraw.positions],
            () => {
              waterDraw.positions.forEach((element, index) => {
                position[index] = element;
              });

              if (waterDraw.positions.length == 2) {
                pin.position = position;
                pin.innerHTML =
                  '<div style="cursor:pointer;position:absolute;width:300px;left:6px;line-height:15px;color:white;"><span style="padding:2px;border-radius:2px;text-stroke:2px #000;font-size:14px;color:#ffffff;background-color:rgba(50,50,50,0.5)">点击左键绘制水面,按住shift+右键完成绘制</span></div>';
              } else {
                pin.enabled = false;
              }
            }
          ),
          XE.MVVM.watch(waterDraw, 'creating', () => {
            pin.enabled = waterDraw.creating;
            data.disabledBtn = false;
          })
        );
      },
      del() {
        pin.enabled = false;
        _waterDraw.creating = false;
        if (data.destroyArray) {
          data.destroyArray.forEach((d: any) => d());
          data.destroyArray.length = 0;
        }
        if (_waterDraw && !data.isSaved) {
          _waterDraw.destroy();
          _waterDraw = undefined;
        }
      },
      save() {
        data.isSaved = true;
        const sceneObject = new XE.SceneTree.Leaf(_waterDraw);
        earth.sceneTree.plots.water.children.push(sceneObject);
        ElMessage({
          message: '保存成功!',
          type: 'success'
        });
        data.disabledBtn = true;
        methods.del();
        methods.init();
      }
    };
    onMounted(() => {
      earth = useEarth();
      methods.init();
    });
    onBeforeUnmount(() => {
      methods.del();
    });
    return { ...methods, ...toRefs(data) };
  }
});
</script>
