
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { useEarth } from '../../utils';
defineOptions({ name: 'EpsplanetRain' });

let earth: any;
onMounted(() => {
    earth = useEarth();
    earth.weather.rainPostProcess.enabled = true;
});
onBeforeUnmount(() => {
    earth.weather.rainPostProcess.enabled = false;
});
</script>
  