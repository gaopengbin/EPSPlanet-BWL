<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { useEarth } from '../../utils';
defineOptions({ name: 'EpsplanetNightvision' });

let earth: any;
onMounted(() => {
  earth = useEarth();
  earth.postProcess.nightVision.enabled = true;
});
onBeforeUnmount(() => {
  earth.postProcess.nightVision.enabled = false;
});
</script>
