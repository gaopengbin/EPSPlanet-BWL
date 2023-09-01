<template>
  <div class="epsplanet-panel-base" style="width: 296px">
    <el-form ref="form" label-width="70px">
      <el-form-item :label="title">
        <el-slider v-model="brightness" :min="min" :max="max" show-input :show-input-controls="false"
          :step="step"></el-slider>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useEarth } from '../../utils';
import { ElForm, ElFormItem, ElSlider } from 'element-plus';
defineOptions({ name: 'EpsplanetBrightness' });

const title = '亮度';
const brightness = ref(0.6);
const min = ref(0);
const max = ref(4);
const step = ref(0.1);

watch(brightness, (val) => {
  earth.postProcess.brightness.brightness = val;
});
let earth: any;
onMounted(() => {
  earth = useEarth();
  earth.postProcess.brightness.enabled = true;
});
onBeforeUnmount(() => {
  earth.postProcess.brightness.enabled = false;
});
</script>
