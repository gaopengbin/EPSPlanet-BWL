<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { useEarth } from '../../utils';
defineOptions({ name: 'EpsplanetMosaic' });

let earth: any;
onMounted(() => {
  earth = useEarth();
  earth.postProcess.mosaic.enabled = true;
});
onBeforeUnmount(() => {
  earth.postProcess.mosaic.enabled = false;
});
</script>
