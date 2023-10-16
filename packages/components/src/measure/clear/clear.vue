
 <!-- noPanel -->

 <script lang="ts">
 import { onMounted, defineComponent } from "vue";
 import { useEarth, changeBtnState } from '../../utils';
 
 export default defineComponent({
   name: "EpsplanetMeasureClear",
   props: ["btnClass"],
   setup(props) {
     let earth: any;
     onMounted(async () => {
       earth = useEarth();
       earth.analyzation.measurement.clearResults();
       if (earth.analyzation.measurement.clearThreeDArea) {
         earth.analyzation.measurement.clearThreeDArea();
       }
       if (earth.analyzation.measurement.clearGroundDistance) {
         earth.analyzation.measurement.clearGroundDistance();
       }
       if (earth.analyzation.measurement.clearAzimuth) {
         earth.analyzation.measurement.clearAzimuth();
       }
       earth.terrainEffect.depthTest = false;
       changeBtnState(props.btnClass, false);
     });
   },
 });
 </script>
 