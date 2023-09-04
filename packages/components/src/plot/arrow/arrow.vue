<template>
  <div class="tool-panel-base arrow">
    <el-form ref="formRef" :model="form" label-width="75px">
      <el-form-item label="名称" class="label">
        <el-input
          v-model="form.name"
          size="small"
          placeholder="请输入10字符以内"
          maxlength="10"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="宽度" class="label">
        <el-slider
          v-model="form.width"
          :min="1"
          :max="50"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <div v-show="seniorItem">
        <el-form-item label="宽度比例">
          <el-slider
            v-model="form.widthProportion"
            :min="0.04"
            :max="0.1"
            :step="0.01"
            show-input
            :show-input-controls="false"
          ></el-slider>
        </el-form-item>
        <el-form-item label="宽幅比例">
          <el-slider
            v-model="form.wProportion"
            :min="0"
            :max="0.2"
            :step="0.01"
            show-input
            :show-input-controls="false"
          ></el-slider>
        </el-form-item>
        <el-form-item label="箭头高度">
          <el-slider
            v-model="form.arrowH"
            :min="0.05"
            :max="0.2"
            :step="0.01"
            show-input
            :show-input-controls="false"
          ></el-slider>
        </el-form-item>
        <el-form-item label="箭头宽度">
          <el-slider
            v-model="form.arrowW"
            :min="1.8"
            :max="5"
            :step="0.1"
            show-input
            :show-input-controls="false"
          ></el-slider>
        </el-form-item>
      </div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="边框">
            <el-switch v-model="form.outlineshow" size="small" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="填充">
            <el-color-picker
              v-model="color"
              show-alpha
              @active-change="changeColor"
            ></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="tool-panel-button">
      <el-button size="small" @click="creating1">创建</el-button>
      <el-button
        size="small"
        @click="editing = !editing"
        :disabled="creating || disabledBtn"
        >编辑</el-button
      >
      <!-- <el-button size="small" @click="del">清除</el-button> -->
      <el-button size="small" @click="seniorItem = !seniorItem"
        >高级设置</el-button
      >
      <el-button size="small" @click="save" :disabled="creating || disabledBtn"
        >保存</el-button
      >
    </div>
    <PlotManager type="arrow" />
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import './style/index.scss';
import { ElMessage } from 'element-plus';
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
  name: 'EpsplanetArrow',
  components: { PlotManager },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      test: true,
      color: 'rgba(0,255,0,0.1)',
      creating: false,
      editing: false,
      isSaved: false,
      formRef: '',
      destroyArray: [''],
      seniorItem: false,
      disabledBtn: true,
      form: {
        name: '',
        outlineshow: true,
        ground: true,
        width: 2,
        widthProportion: 0.06,
        wProportion: 0.1,
        arrowH: 0.15,
        arrowW: 2
      }
    });
    let dArrowDraw: any;
    let pin: any;
    const methods = {
      init() {
        data.isSaved = false;
        pin = new XE.Obj.Plots.GeoPin(earth);
        dArrowDraw = new XE.Obj.Plots.GeoArrow(earth);
        //dArrowDraw.creating = true;
        dArrowDraw.name = '未命名箭头对象';
        data.destroyArray = [];

        pin.enabled = false;
        data.destroyArray.push(
          XE.MVVM.bind(thisVue, 'form.name', dArrowDraw, 'name'),
          XE.MVVM.bind(thisVue, 'editing', dArrowDraw, 'editing'),
          XE.MVVM.bind(thisVue, 'creating', dArrowDraw, 'creating'),
          XE.MVVM.bind(thisVue, 'form.outlineshow', dArrowDraw, 'outlineShow'),
          // XE.MVVM.bind(data, "outlineWidth", circleDraw, "outlineWidth"),
          XE.MVVM.bind(thisVue, 'form.ground', dArrowDraw, 'ground'),
          XE.MVVM.bind(thisVue, 'form.width', dArrowDraw, 'outlineWidth'),
          XE.MVVM.bind(
            thisVue,
            'form.arrowH',
            dArrowDraw,
            'arrowMaxHeightScale'
          ),
          XE.MVVM.bind(
            thisVue,
            'form.arrowW',
            dArrowDraw,
            'arrowWingWidthScale'
          ),
          XE.MVVM.bind(
            thisVue,
            'form.widthProportion',
            dArrowDraw,
            'minWidthScale'
          ),
          XE.MVVM.bind(
            thisVue,
            'form.wProportion',
            dArrowDraw,
            'dynamicWidthScale'
          ),
          XE.MVVM.watch(
            () => [...dArrowDraw.positions],
            () => {
              if (!pin.enabled) {
                return;
              }
              pin['position'] =
                dArrowDraw.positions[dArrowDraw.positions.length - 1];
              if (dArrowDraw.positions.length == 1 && dArrowDraw.creating) {
                pin['innerHTML'] =
                  '<div style="cursor:pointer;position:absolute;width:300px;left:6px;line-height:15px;color:white;"><span style="padding:2px;border-radius:2px;text-stroke:2px #000;font-size:14px;color:#ffffff;background-color:rgba(50,50,50,0.5)">绘制完毕后点击右键+shift结束绘制</span></div>';
              }
              // let pos = [...pin.position];
              // this.extTextPosition = `\n经度:${((pos[0] / Math.PI) * 180).toFixed(6)}°\n纬度:${((pos[1] / Math.PI) * 180).toFixed(6)}°`;
              // this.extTextPosition = `\n经度:${(pos[0]/Math.PI*180).toFixed(3)}°\n纬度:${(pos[1]/Math.PI*180).toFixed(3)}°\n高度:${pos[2].toFixed(3)}米`;
            }
          ),
          XE.MVVM.watch(dArrowDraw, 'creating', () => {
            pin.enabled = dArrowDraw.creating;
            data.disabledBtn = dArrowDraw.creating;
          })
        );
      },
      creating1() {
        data.creating = !data.creating;
        pin.enabled = !pin.enabled;
      },
      del() {
        pin['enabled'] = false;
        dArrowDraw.creating = false;
        if (data.destroyArray) {
          data.destroyArray.forEach((d: any) => d());
          data.destroyArray.length = 0;
        }
        if (dArrowDraw && !data.isSaved) {
          dArrowDraw.destroy();
          dArrowDraw = undefined;
        }
      },
      changeColor(val) {
        let v = val.split('(')[1].split(')')[0].split(',');
        let cc: any[] = [];
        v.forEach((c, i) => {
          if (i == 3) {
            cc.push(Number(c));
          } else {
            cc.push(Number(c) / 255.0);
          }
        });
        dArrowDraw.color = cc;
      },
      changeOutlineColor(val) {
        let v = val.split('(')[1].split(')')[0].split(',');
        let cc: any[] = [];
        v.forEach((c, i) => {
          if (i == 3) {
            cc.push(Number(c));
          } else {
            cc.push(Number(c) / 255.0);
          }
        });
        dArrowDraw.outlineColor = cc;
      },
      save() {
        data.isSaved = true;
        const sceneObject = new XE.SceneTree.Leaf(dArrowDraw);
        earth.sceneTree.plots.arrow.children.push(sceneObject);
        // thisVue.confirm(sceneObject);
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
    return { ...toRefs(data), ...methods };
  }
});
</script>
