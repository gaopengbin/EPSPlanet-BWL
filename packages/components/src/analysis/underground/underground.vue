
<script lang="ts">
/* eslint-disable */
import { defineComponent, onMounted, onBeforeUnmount } from "vue";
import { useEarth } from '../../utils';

export default defineComponent({
  name: "EpsplanetUnderground",
  props: [],
  setup() {
    let earth: any;
    let originPos: any;
    let originRot: any;
    onMounted(async () => {
      earth = useEarth();
      earth.terrainEffect.subSurfaceEnabled = true;
    });
    function getSampleHeight(scene, p) {
      var c = new Cesium.Cartographic.fromRadians(p[0], p[1]);
      return scene.sampleHeight(c);
    }
    function getTerrainHeight(p) {
      return new Promise((resolve) => {
        var c = new Cesium.Cartographic.fromRadians(p[0], p[1]);
        let promise = Cesium.sampleTerrainMostDetailed(
          earth._viewer.terrainProvider,
          [c]
        );
        Cesium.when(promise, (updatedPositions) => {
          console.log(updatedPositions);
          resolve(updatedPositions[0].height);
        });
      });
    }
    onBeforeUnmount(async () => {
      // console.log("dedede", originPos);
      earth.terrainEffect.subSurfaceEnabled = false;
      // earth.camera.flyTo(originPos, 0, originRot);
      earth.czm.scene.globe.depthTestAgainstTerrain = false;
      let pos = earth.camera.position;
      console.log(pos);
      let rotation = earth.camera.rotation;
      originPos = [...pos];
      originRot = [...rotation];
      let height = await getTerrainHeight([...pos]);
      // console.log(height);
      if (!height) {
        height = getSampleHeight(earth._scene, [...pos]);
        // console.log(height);
      }
      console.log(height);
      if (height) {
        earth.camera.flyTo([pos[0], pos[1], Number(height) + 10], 10, [
          rotation[0],
          -0.1,
          rotation[2],
        ]);
      }
    });
  },
});
</script>
