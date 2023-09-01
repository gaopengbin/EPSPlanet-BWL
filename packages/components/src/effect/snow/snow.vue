<template>
  <div class="epsplanet-panel-base" style="width: 296px">
    <el-form ref="form" label-width="70px">
      <el-form-item :label="title">
        <el-slider v-model="alpha" :min="min" :max="max" :step="step" show-input :show-input-controls="false"></el-slider>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useEarth } from '../../utils';
import { ElForm, ElFormItem, ElSlider } from 'element-plus';
defineOptions({ name: 'EpsplanetSnow' });

const title = '积雪程度';
const alpha = ref(0.6);
const min = ref(0);
const max = ref(1);
const step = ref(0.1);

watch(alpha, (val) => {
  earth.weather.snowPostProcess.alpha = val;
});
let earth: any;
onMounted(() => {
  earth = useEarth();
  earth.weather.snowPostProcess.enabled = true;
});
onBeforeUnmount(() => {
  earth.weather.snowPostProcess.enabled = false;
});
</script>
