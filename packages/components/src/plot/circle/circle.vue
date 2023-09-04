<template>
  <div class="epsplanet-panel-base" style="width: 450px">
    <el-form ref="formRef" :model="form" label-width="70px">
      <el-form-item label="名称">
        <el-input
          v-model="form.name"
          size="small"
          placeholder="请输入15字符以内"
          maxlength="15"
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
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="边框">
            <el-switch v-model="form.outlineshow" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="贴地">
            <el-switch v-model="form.ground" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="显示面积" label-width="75px">
            <el-switch v-model="showArea" />
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
      <el-button size="small" @click="save" :disabled="creating || disabledBtn"
        >保存</el-button
      >
    </div>
    <PlotManager type="circle" @handle-edit="handleEdit" />
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
  name: 'EpsplanetCircle',
  components: { PlotManager },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      destroyArray: [] as any,
      color: 'rgba(0,255,0,0.1)',
      outlineColor: 'rgba(0,255,0,1)',
      creating: false,
      editing: false,
      isSaved: false,
      formRef: '',
      disabledBtn: true,
      enabled: true,
      showLabel: false,
      showArea: false,
      lastCzmobj: undefined as any,
      isEditing: false,
      form: {
        name: '圆形对象',
        show: true,
        outlineshow: true,
        ground: true,
        width: 2
      }
    });
    let _circleDraw: any;
    const methods = {
      init() {
        data.isSaved = false;
        let circleDraw = new XE.Obj.Plots.GeoCircle(earth);
        _circleDraw = circleDraw;
        console.log(earth);
        circleDraw.name = '未命名圆形对象';

        data.destroyArray = [];
        data.destroyArray.push(
          XE.MVVM.bind(thisVue, 'creating', circleDraw, 'creating'),
          XE.MVVM.bind(thisVue, 'form.name', circleDraw, 'name'),
          XE.MVVM.bind(thisVue, 'editing', circleDraw, 'editing'),
          XE.MVVM.bind(thisVue, 'form.outlineshow', circleDraw, 'outlineShow'),
          XE.MVVM.bind(thisVue, 'showArea', circleDraw, 'showArea'),
          // XE.MVVM.bind(thisVue, "form.width", _circleDraw, "outlineWidth"),
          XE.MVVM.bind(thisVue, 'form.ground', circleDraw, 'ground'),
          XE.MVVM.bind(thisVue, 'form.width', circleDraw, 'outlineWidth'),

          XE.MVVM.watch(
            () => [...circleDraw.positions],
            () => {
              // pin.position =
              //   circleDraw.positions[circleDraw.positions.length - 1];
              if (circleDraw.positions.length == 1 && circleDraw.creating) {
                // pin.innerHTML =
                //   '<div style="cursor:pointer;position:absolute;width:300px;left:6px;line-height:15px;color:white;"><span style="padding:2px;border-radius:2px;text-stroke:2px #000;font-size:14px;color:#ffffff;background-color:rgba(50,50,50,0.5)">点击左键确定圆心位置</span></div>';
              } else if (circleDraw.positions.length == 2) {
                // pin.innerHTML =
                //   '<div style="cursor:pointer;position:absolute;width:300px;left:6px;line-height:15px;color:white;"><span style="padding:2px;border-radius:2px;text-stroke:2px #000;font-size:14px;color:#ffffff;background-color:rgba(50,50,50,0.5)">点击左键确定圆半径</span></div>';
              } else if (circleDraw.positions.length == 3) {
                // pin.enabled = false;
                data.disabledBtn = false;
              }
            }
          )

          // XE.MVVM.watch(circleDraw, 'creating', () => {
          //   pin.enabled = circleDraw.creating;
          // })
        );
      },
      creating1() {
        data.creating = !data.creating;
        // pin.enabled = !pin.enabled;
      },
      del() {
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
              methods.cancelEdit(data.lastCzmobj);
            });
        }
        // pin.enabled = false;
        _circleDraw.creating = false;
        if (data.destroyArray) {
          data.destroyArray.forEach((d: any) => d());
          data.destroyArray.length = 0;
        }
        if (_circleDraw && !data.isSaved && !data.isEditing) {
          _circleDraw.destroy();
          _circleDraw = undefined;
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
        _circleDraw.color = cc;
      },
      handleEdit(czmObject) {
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
              methods.cancelEdit(data.lastCzmobj);
              console.log(data.lastCzmobj, czmObject);
              data.lastCzmobj = czmObject;
            });
        } else {
          data.lastCzmobj = czmObject;
        }

        methods.reBind(czmObject);
      },
      reBind(czmObject) {
        data.isEditing = true;
        if (data.destroyArray.length) {
          data.destroyArray.forEach((d: any) => d());
          data.destroyArray.length = 0;
        }
        let circleDraw = earth.getObject(czmObject.xbsjGuid);
        _circleDraw = circleDraw;
        data.color = methods.reColor(circleDraw.color);
        data.outlineColor = methods.reColor(circleDraw.outlineColor);
        data.disabledBtn = false;
        data.destroyArray = [];
        data.destroyArray.push(
          XE.MVVM.bind(thisVue, 'creating', circleDraw, 'creating'),
          XE.MVVM.bind(thisVue, 'form.name', circleDraw, 'name'),
          XE.MVVM.bind(thisVue, 'editing', circleDraw, 'editing'),
          XE.MVVM.bind(thisVue, 'form.outlineshow', circleDraw, 'outlineShow'),
          XE.MVVM.bind(thisVue, 'showArea', circleDraw, 'showArea'),
          // XE.MVVM.bind(thisVue, "form.width", _circleDraw, "outlineWidth"),
          XE.MVVM.bind(thisVue, 'form.ground', circleDraw, 'ground'),
          XE.MVVM.bind(thisVue, 'form.width', circleDraw, 'outlineWidth')
        );
      },
      cancelEdit(czmObject) {
        earth.getObject(czmObject.xbsjGuid).xbsjFromJSON(czmObject);
      },
      reColor(color) {
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
        _circleDraw.outlineColor = cc;
      },
      save() {
        data.isSaved = true;
        if (data.isEditing) {
          ElMessage.success('修改成功');
          data.isEditing = false;
          data.lastCzmobj = undefined;
        } else {
          const sceneObject = new XE.SceneTree.Leaf(_circleDraw);
          earth.sceneTree.plots.circle.children.push(sceneObject);
          // thisVue.confirm(sceneObject);
          ElMessage({
            message: '保存成功!',
            type: 'success'
          });
        }
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
