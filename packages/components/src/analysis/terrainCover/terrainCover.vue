 <!-- noPanel -->

 <script lang="ts">
import { onMounted, onBeforeUnmount, defineComponent } from "vue";
import { useEarth } from '../../utils';
export default defineComponent({
  name: "EpsplanetTerrainCover",
  props: [],
  setup() {
    let earth: any;
    onMounted(async () => {
      earth = useEarth();
      earth.czm.scene.globe.depthTestAgainstTerrain = true;
    });
    onBeforeUnmount(() => {
      earth.czm.scene.globe.depthTestAgainstTerrain = false;
    });
  },
});
</script>
 