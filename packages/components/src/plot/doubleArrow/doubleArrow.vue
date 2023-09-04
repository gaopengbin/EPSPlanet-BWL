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
      <el-form-item label="宽度">
        <el-slider
          v-model="form.width"
          :min="1"
          :max="50"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="边框">
            <el-switch v-model="form.outlineshow" size="small" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="贴地">
            <el-switch v-model="form.ground" size="small" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="填充">
            <el-color-picker
              v-model="color"
              show-alpha
              @active-change="changeColor"
            ></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="边框">
            <el-color-picker
              v-model="outlineColor"
              show-alpha
              @active-change="changeOutlineColor"
            ></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="tool-panel-button">
      <el-button size="small" @click="creating1()">创建</el-button>
      <el-button
        size="small"
        @click="editing1()"
        :disabled="creating || disabledBtn"
        >编辑</el-button
      >
      <!-- <el-button size="small" @click="del">清除</el-button> -->
      <el-button size="small" @click="save" :disabled="creating || disabledBtn"
        >保存</el-button
      >
    </div>
    <PlotManager type="doubleArrow" />
  </div>
</template>

<script lang="ts">
/* eslint-disable */
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
  name: 'EpsplanetDoubleArrow',
  components: { PlotManager },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      color: 'rgba(0,255,0,0.1)',
      outlineColor: 'rgba(0,255,0,1)',
      creating: false,
      editing: false,
      isSaved: false,
      formRef: '',
      destroyArray: [''],
      disabledBtn: true,
      form: {
        name: '',
        show: true,
        outlineshow: true,
        ground: true,
        width: 2
      }
    });
    let dArrowDraw: any;
    let pin: any;
    const methods = {
      editing1() {
        if (data.editing) {
          data.editing = false;
        } else {
          data.editing = true;
        }
      },
      creating1() {
        data.creating = !data.creating;
        pin.enabled = !pin.enabled;
      },
      init() {
        data.isSaved = false;
        dArrowDraw = new XE.Obj.Plots.GeoDoubleArrow(earth);
        dArrowDraw.name = '未命名双箭头';
        //dArrowDraw.creating = true;
        data.destroyArray = [];
        pin = new XE.Obj.Plots.GeoPin(earth);
        pin.enabled = false;
        data.destroyArray.push(
          XE.MVVM.bind(thisVue, 'form.name', dArrowDraw, 'name'),
          XE.MVVM.bind(thisVue, 'editing', dArrowDraw, 'editing'),
          XE.MVVM.bind(thisVue, 'creating', dArrowDraw, 'creating'),
          XE.MVVM.bind(thisVue, 'form.outlineshow', dArrowDraw, 'outlineShow'),
          // XE.MVVM.bind(data, "outlineWidth", circleDraw, "outlineWidth"),
          XE.MVVM.bind(thisVue, 'form.ground', dArrowDraw, 'ground'),
          XE.MVVM.bind(thisVue, 'form.width', dArrowDraw, 'outlineWidth'),
          XE.MVVM.watch(
            () => [...dArrowDraw.positions],
            () => {
              pin.position =
                dArrowDraw.positions[dArrowDraw.positions.length - 1];
              if (dArrowDraw.positions.length == 1 && dArrowDraw.creating) {
                pin.innerHTML =
                  '<div style="cursor:pointer;position:absolute;width:300px;left:6px;line-height:15px;color:white;"><span style="padding:2px;border-radius:2px;text-stroke:2px #000;font-size:14px;color:#ffffff;background-color:rgba(50,50,50,0.5)">点击左键确定双箭头左底点</span></div>';
              } else if (dArrowDraw.positions.length == 2) {
                pin.innerHTML =
                  '<div style="cursor:pointer;position:absolute;width:300px;left:6px;line-height:15px;color:white;"><span style="padding:2px;border-radius:2px;text-stroke:2px #000;font-size:14px;color:#ffffff;background-color:rgba(50,50,50,0.5)">点击左键确定双箭头右底点</span></div>';
              } else if (dArrowDraw.positions.length == 3) {
                pin.enabled = false;
                data.disabledBtn = false;
              }
            }
          )
          //   XE.MVVM.watch(dArrowDraw, 'creating', () => {
          //   pin.show = dArrowDraw.creating;
          // })
        );
      },
      del() {
        pin.enabled = false;
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
        earth.sceneTree.plots.doubleArrow.children.push(sceneObject);
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

<style lang="scss" scoped></style>
