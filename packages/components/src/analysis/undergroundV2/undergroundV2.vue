<!-- <template>
  <div class="tool-panel-base" style="width: 350px">
    <el-form ref="form" label-width="100px">
      <el-form-item>
        <el-switch 
        v-model="subSurfaceEnabled" 
        active-text="开启全透"
        inactive-text="关闭全透"
        ></el-switch>
      </el-form-item>
      <el-form-item label="地表透明度">
        <input type="range"
          :value="surfaceOpacity"
          min="0"
          max="1"
          step="0.01"
          style="width: 200px"
        />
      </el-form-item>
    </el-form>
  </div>
</template> -->

<script lang="ts">
/* eslint-disable */
import { defineComponent, onMounted, onBeforeUnmount } from "vue";
import { useEarth } from '../../utils';

export default defineComponent({
  name: "EpsplanetUndergroundV2",
  props: [],
  setup() {
    let earth: any;
    let originPos: any;
    let originRot: any;
    onMounted(async () => {
      earth = useEarth();
      earth.czm.scene.globe.translucency.enabled = true
      // earth.terrainEffect.subSurfaceEnabled = true;
      // earth.czm.scene.globe.depthTestAgainstTerrain = true;
      let pos = earth.camera.position;
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
        earth.camera.flyTo([pos[0], pos[1], Number(height)], 10, [
          rotation[0],
          -0.1,
          rotation[2],
        ]);
      }
      // earth.czm.scene.globe.depthTestAgainstTerrain = false;
      function getSampleHeight(scene, p) {
        var c = new Cesium.Cartographic.fromRadians(p[0], p[1]);
        return scene.sampleHeight(c);
      }
      function getTerrainHeight(p) {
        return new Promise((resolve) => {
          var c = new Cesium.Cartographic.fromRadians(p[0], p[1]);
          // let promise = Cesium.sampleTerrainMostDetailed(
          //   earth._viewer.terrainProvider,
          //   [c]
          // );

          // Cesium.when(promise, (updatedPositions) => {
          //   console.log(updatedPositions);
          //   resolve(updatedPositions[0].height);
          // });
          // 改为最新版本Ceisum的写法
          Cesium.sampleTerrainMostDetailed(
            earth._viewer.terrainProvider,
            [c]
          ).then((updatedPositions) => {
            console.log(updatedPositions);
            resolve(updatedPositions[0].height);
          });

        });
      }

      // console.log(getSampleHeight(earth._scene, [...pos]));
    });
    onBeforeUnmount(() => {
      // earth.terrainEffect.subSurfaceEnabled = true;
      earth.czm.scene.globe.translucency.enabled = false
      earth.camera.flyTo(originPos, 0, originRot);
      earth.czm.scene.globe.depthTestAgainstTerrain = true;
    });
  },
});
</script>
