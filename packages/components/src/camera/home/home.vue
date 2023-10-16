<!-- noPanel -->

<script lang="ts">
import { onMounted, defineComponent } from "vue";
import { useEarth, changeBtnState } from '../../utils';

export default defineComponent({
  name: "EpsplanetCameraHome",
  props: ["btnClass"],
  setup(props) {
    let earth: any;
    onMounted(async () => {
      earth = useEarth();
      earth.cameraViewManager.globe.flyTo();
      changeBtnState(props.btnClass, false);
    });
  },
});
</script>
