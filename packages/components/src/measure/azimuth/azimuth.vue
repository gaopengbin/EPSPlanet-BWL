<!-- <template>
  <div class="tool-panel-base" style="width: 296px">
    <el-form ref="form" label-width="70px" :inline="true">
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
      <el-form-item label="颜色">
        <el-color-picker
          v-model="color"
          show-alpha
          @active-change="changeColor"
        ></el-color-picker>
      </el-form-item>
      <el-form-item label="贴地">
        <el-switch
          v-model="ground"
          active-color="#13ce66"
          inactive-color="#dcdfe6"
        ></el-switch>
      </el-form-item>
    </el-form>
    <div class="tool-panel-button">
      <el-button size="small" @click="editing = true">编辑</el-button>
      <el-button size="small" @click="save">保存</el-button>
    </div>
  </div>
</template> -->

<script lang="ts">
/* eslint-disable */
import {
  reactive,
  toRefs,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
watch,
} from "vue";
import { useEarth, changeBtnState } from '../../utils';

export default defineComponent({
  name: "EpsplanetMeasureAzimuth",
  props: ["btnClass"],
  setup(props) {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      _polylineCzm: undefined,
      creating: false,
      editing: false,
      width: 0,
      color: "rgba(0,255,0,1)",
      color1: "rgba(255,255,0,1)",
      ground: false,
      _disposer: [0],
      isSaved: false,
      _creating: [0],
      measuring: false,
      _labels: [0],
      _temGeometry: [0],
    });
    onMounted(async () => {
      earth = useEarth();
      earth.analyzation.measurement.clearAzimuth = () => del();
      thisVue._creating = []
      thisVue._disposer = []
      thisVue._labels = []
      thisVue._temGeometry = []
      angleMeasure();
    });
    onBeforeUnmount(() => {
      del();
    });


    function angleMeasure() {
      updateCreatingBind();
      thisVue._angle2 = new XE.Obj.Plots.GeoPolylineArrow(earth);
      thisVue._angle2.color = [255, 255, 0, 1];
      thisVue._angle = new XE.Obj.Plots.GeoPolylineArrow(earth);
      // thisVue._angle.ground = false;
      // thisVue._angle.width = 2;
      // thisVue._angle.isCreating = true;
      thisVue._angle.creating = true;

      thisVue._creating.push(
        XE.MVVM.bind(thisVue, "width", thisVue._angle, "width"),
        XE.MVVM.bind(thisVue, "ground", thisVue._angle, "ground"),
        XE.MVVM.bind(thisVue, "editing", thisVue._angle, "editing"),
        XE.MVVM.watch(
          () => ({
            positions: [...thisVue._angle.positions],
          }),
          () => {
            thisVue._labels.forEach((l) => l.destroy());
            thisVue._labels = [];
            if (thisVue._angle.positions.length >= 2) {
              thisVue._angle2.positions[0] = thisVue._angle.positions[0];
              thisVue._angle2.positions[1] = [...thisVue._angle2.positions[0]];
              thisVue._angle2.positions[1][1] =
                thisVue._angle2.positions[1][1] +
                0.00000001 * earth._camera.position[2];
              let lb = createLabel({
                pos: thisVue._angle2.positions[1],
                dis: "N",
              });
              thisVue._labels.push(lb);
            }
            if (thisVue._angle.positions.length == 1) {
              let l = {
                dis: "左键添加点，右键删除点，shift+右键完成",
                pos: thisVue._angle.positions[0],
              };
              let lb = createLabel(l);
              thisVue._labels.push(lb);
            } else if (thisVue._angle.positions.length == 2) {
              var result = XE.Tool.Math.hpr(
                thisVue._angle.positions[0],
                thisVue._angle.positions[1]
              );
              if (result) {
                let lb1 = createLabel({
                  pos: thisVue._angle.positions[1],
                  dis:
                    Math.round(
                      (((result[0] * 180) / Math.PI + 90) % 360) * 100
                    ) /
                      100 +
                    "度",
                });
                thisVue._labels.push(lb1);
              }
            } else if (thisVue._angle.positions.length > 2) {
              thisVue._angle.editing = true;
              // thisVue._angle2.destroy();
            } else if (thisVue._angle.positions.length == 0) {
              thisVue._angle2.destroy();
            }
          }
        ),
        XE.MVVM.watch(() => thisVue._angle.creating, () => {
          changeBtnState(props.btnClass, false);
        })
      );

      thisVue._temGeometry.push(thisVue._angle);
      thisVue.measurementType = "SPACE_ANGLE";

      // window._angle = thisVue._angle;
      // window._angle2 = thisVue._angle2;
    }
    function updateCreatingBind() {
      if (thisVue._creating) {
        thisVue._creating.forEach((d) => d());
        thisVue._creating = [];
      }
      if (thisVue._labels.length > 0) {
        thisVue._labels.forEach((l) => {
          thisVue._temGeometry.push(l);
        });
        thisVue._labels = [];
        thisVue.measurementType = "NONE";
      }
    }
    function createLabel(option) {
      let p = new XE.Obj.Plots.GeoPin(earth);
      p.innerHTML =
        '<div style="cursor:pointer;position: absolute;width:300px;left:6px; line-height:15px;color: white;">' +
        '<span style="padding:2px;border-radius: 2px;text-stroke:2px #000;font-size: 14px;color:#ffffff;background-color: rgba(50,50,50,0.5)">' +
        option.dis +
        "</span></div>";
      p.position = option.pos;
      // p._pin.show = false;
      return p;
    }
    function changeColor(val) {
      let v = val
        .split("(")[1]
        .split(")")[0]
        .split(",");
      let cc: any = [];
      v.forEach((c, i) => {
        if (i == 3) {
          cc.push(Number(c));
        } else {
          cc.push(Number(c) / 225.0);
        }
      });
      thisVue._angle.color = cc;
    }

    function del() {
      if (thisVue._disposers) {
        thisVue._disposers.forEach((d) => d());
        thisVue._disposers.length = 0;
      }
      if (thisVue._angle && !thisVue.isSaved) {
        thisVue._angle.destroy();
        thisVue._angle = undefined;
      }
      if (thisVue._angle2 && !thisVue.isSaved) {
        thisVue._angle2.destroy();
        thisVue._angle2 = undefined;
      }
      if (thisVue._labels && thisVue._labels.length)
        thisVue._labels.forEach((l) => l.destroy());
    }
    function save() {
      thisVue.isSaved = true;
      const sceneObject = new XE.SceneTree.Leaf(thisVue._angle);
      earth.sceneTree.root.children.push(sceneObject);
      confirm(sceneObject);
    }

    return {
      ...toRefs(data),
      changeColor,
      save,
    };
  },
});
</script>

<style scoped></style>
