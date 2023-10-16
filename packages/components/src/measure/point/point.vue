
 <!-- noPanel -->

<script lang="ts">
import { onMounted, onBeforeUnmount, defineComponent } from "vue";
import { useEarth, changeBtnState } from '../../utils';
export default defineComponent({
  name: "EpsplanetMeasurePoint",
  props: ["btnClass"],
  setup(props) {
    let earth: any;
    let _disposer: any = [];
    onMounted(async () => {
      earth = useEarth();
      earth.analyzation.measurement.type = "POINT";
      _disposer.push(
        XE.MVVM.watch(
          () => earth.analyzation.measurement.type,
          (newValue: any) => {
            if (newValue == "NONE") {
              changeBtnState(props.btnClass, false);
            }
          }
        )
      );
    });
    onBeforeUnmount(() => {
      _disposer.forEach((d: any) => d());
    });
  },
});
</script>
 