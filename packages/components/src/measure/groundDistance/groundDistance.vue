
<script lang="ts">
/* eslint-disable */
import {
  reactive,
  toRefs,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useEarth, changeBtnState, getDisAndLabelPos } from '../../utils';
export default defineComponent({
  name: "EpsplanetMeasureGroundDistance",
  props: ["btnClass"],
  setup(props) {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      _polylineCzm: undefined,
      // creating: false,
      editing: false,
      width: 5,
      color: "rgba(0,255,0,1)",
      ground: true,
      _disposer: [],
      _disGroundLabels: [],
      disGroundinterval: 0,
    })
    onMounted(async () => {
      earth = useEarth();
      earth.analyzation.measurement.clearGroundDistanceFunctions.push(del)
      // earth.analyzation.measurement.clearGroundDistance = () => del();
      init();
    })
    onBeforeUnmount(() => {
      // del();
    })

    function init() {
      thisVue._disGroundLabels = [];
      thisVue._polylineCzm = new XE.Obj.Plots.GeoPolyline(earth);
      thisVue._polylineCzm.creating = true;

      thisVue._disposers = [];
      thisVue._disposers.push(
        // XE.MVVM.bind(thisVue, "creating", thisVue._polylineCzm, "creating"),
        XE.MVVM.bind(thisVue, "editing", thisVue._polylineCzm, "editing"),
        XE.MVVM.bind(thisVue, "width", thisVue._polylineCzm, "width"),
        XE.MVVM.bind(thisVue, "ground", thisVue._polylineCzm, "ground"),
        XE.MVVM.watch(
          () => [...thisVue._polylineCzm.positions],
          () => {
            updateMeasure(thisVue._polylineCzm.positions);
          }
        ),
        XE.MVVM.watch(() => thisVue._polylineCzm.creating,
          () => changeBtnState(props.btnClass, false)
        )
      );
    }

    function updateMeasure(p) {
      if (thisVue._disGroundLabels) {
        thisVue._disGroundLabels.forEach((l) => l.destroy());
        thisVue._disGroundLabels = [];
      }

      if (p.length === 1) {
        let l = {
          dis: "左键添加点, 右键删除点, shift+右键完成",
          pos: p[0],
        };
        let lb = createLabel(l);
        thisVue._disGroundLabels.push(lb);
      } else if (p.length > 1) {
        let it = thisVue.disGroundinterval;
        let result = getDisAndLabelPos(p, it, earth);
        if (!result) {
          return;
        }
        thisVue._result = result;
        let labels = result.label;

        labels.forEach((l) => {
          let lb = createLabel(l);
          thisVue._disGroundLabels.push(lb);
        });
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
      p._pin.show = false;
      return p;
    }
    function del() {
      if (thisVue._disposers) {
        thisVue._disposers.forEach((d) => d());
        thisVue._disposers.length = 0;
      }
      if (thisVue._polylineCzm) {
        thisVue._polylineCzm.destroy();
        thisVue._polylineCzm = undefined;
      }
      if (thisVue._disGroundLabels) thisVue._disGroundLabels.forEach((l) => l.destroy());
      thisVue._disGroundLabels = [];
    }


    return {
      ...toRefs(data)
    }
  }
})
</script>
