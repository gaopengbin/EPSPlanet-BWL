
<script lang="ts">
/* eslint-disable */
import {
  reactive,
  toRefs,
  defineComponent,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useEarth, changeBtnState } from '../../utils';
export default defineComponent({
  name: "EpsplanetMeasureGroundArea",
  props: ["btnClass"],
  setup(props) {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      measurementType: "NONE",
      _areaGround: undefined as any,
      areaGround: 0,
      areaGroundInterval: 0.00,
      creating: false,
      editing: false,
      width: 0,
      color: "rgba(0,255,0,1)",
      ground: true,
      _disposer: [] as any,
      _creating: [] as any,
      // measuring: true,
      _temGeometry: [] as any,
      _labels: [] as any,
    });
    onMounted(async () => {
      earth = useEarth();
      earth.analyzation.measurement.clearThreeDAreaFunctions.push(del);
      init();
    });

    function init() {
      data._creating = [];
      data._temGeometry = [];
      data._labels = [];
      areaGroundMeasure();
    }

    function areaGroundMeasure() {
      earth.analyzation.measurement.type = "SPACE_AREA_GROUD";
      if (!earth.terrainEffect.depthTest) {
        // thisVue.$root.$earthUI.promptInfo("使用此功能需要打开深度检测，已为您自动打开！", "warning");
        earth.terrainEffect.depthTest = true;
      }
      data._areaGround = new XE.Obj.CustomPrimitiveExt.Image(earth);
      console.log(data._areaGround)
      data._areaGround.isCreating = true;
      data._areaGround.creating = true;
      data._areaGround.imageUrl = null;
      data._areaGround._customPrimitive.pass = 8;
      data._areaGround._customPrimitive.color = [0, 1, 0, 0.5];
      updateCreatingBind();
      data._creating.push(
        // XE.MVVM.bind(thisVue, "measuring", data._areaGround, "creating"),
        // XE.MVVM.bind(thisVue, "editing", data._areaGround, "editing"),
        XE.MVVM.watch(
          () => data._areaGround.creating,
          () => {
            calculateArea();
            changeBtnState(props.btnClass, false);
          }
        )
      );
      data._temGeometry.push(data._areaGround);
    }
    function calculateArea() {
      if (data._areaGround.positions.length > 2) {
        data.areaGround = Number(data._areaGround.totalArea);
        // console.log(data._areaGround, data.areaGround);
        // debugger
        if (isNaN(data.areaGround)) {
          data.areaGround = 0;
        }
        if (data.areaGroundInterval === 0 && data.areaGround > 1) {
          data._areaGround.interpolationDistance =
            Math.sqrt(data.areaGround) / 10;
          data._areaGround.offsetHeight = 0.5;
          data._areaGround.interpolation = true;
        }
        let temPrimitive = new XE.Obj.CustomPrimitive(earth);
        // console.log(temPrimitive);

        setTimeout(() => {
          temPrimitive.position = data._areaGround._customPrimitive.position;
          temPrimitive.positions = data._areaGround._customPrimitive.positions;
          temPrimitive.primitiveType = 1;

          let indices: any = [];
          for (
            let i = 0;
            i < data._areaGround._customPrimitive.indices.length - 2;
            i += 3
          ) {
            let i1 = data._areaGround._customPrimitive.indices[i];
            let i2 = data._areaGround._customPrimitive.indices[i + 1];
            let i3 = data._areaGround._customPrimitive.indices[i + 2];
            indices.push(i1);
            indices.push(i2);
            indices.push(i2);
            indices.push(i3);
            indices.push(i3);
            indices.push(i1);
          }
          // console.log(indices);
          // indices的长度为12时，显示的是平面面积
          if (indices.length === 12) {
            alert("当前包围面积过小，仅显示平面面积。若要计算立面面积，请绘制较大的包围面。")
          }
          temPrimitive.indices = indices;
          // console.log(temPrimitive);
          data._temGeometry.push(temPrimitive);
          data._labels.forEach((l) => l.destroy());
          data._labels = [];
          let lb = createLabel({
            pos: data._areaGround._customPrimitive.position,
            dis: Math.round(data._areaGround.totalArea * 100) / 100 + "平方米",
          });
          data._labels.push(lb);
          // console.log(data._areaGround.totalArea);
        }, 100);
      }
      updateCreatingBind();
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
    function updateCreatingBind() {
      data._creating.forEach((d) => d());
      data._creating = [];
      // let self = thisVue;
      if (data._labels.length > 0) {
        data._labels.forEach((l) => {
          data._temGeometry.push(l);
        });
        data._labels = [];
        data.measurementType = "NONE";
      }
    }
    function del() {
      if (thisVue._disposers) {
        thisVue._disposers.forEach((d) => d());
        thisVue._disposers.length = 0;
      }
      if (data._areaGround) {
        data._areaGround.destroy();
        data._areaGround = undefined;
      }
      if (thisVue.pins) {
        thisVue.pins.forEach((pin) => {
          pin.destroy();
        });
      }
      if (data._temGeometry) {
        data._temGeometry.forEach((d) => d.destroy());
        data._temGeometry = [];
      }
      data._labels.forEach((l) => l.destroy());
      data._labels = [];
      earth.analyzation.measurement.type = "NONE";
      earth.terrainEffect.depthTest = false;
    }

    return {
      ...toRefs(data),
    };
  },
});
</script>
