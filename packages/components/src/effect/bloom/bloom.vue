<template>
  <div class="epsplanet-panel-base" style="width: 296px">
    <el-form ref="form" label-width="70px">
      <el-form-item :label="label.contrast">
        <el-slider
          v-model="contrast"
          :min="0"
          :max="255"
          :step="1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
      <el-form-item :label="label.brightness">
        <el-slider
          v-model="brightness"
          :min="-1"
          :max="1"
          :step="0.1"
          show-input
          :show-input-controls="false"
        ></el-slider>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useEarth } from '../../utils';
import { ElForm, ElFormItem, ElSlider } from 'element-plus';
defineOptions({ name: 'EpsplanetBloom' });

const label = {
  glowOnly: '仅发光图',
  contrast: '对比度',
  brightness: '亮度',
  delta: '光程差',
  sigma: 'sigma',
  stepSize: 'stepSize'
};

const glowOnly = ref(false);
const contrast = ref(128);
const brightness = ref(-0.3);
const delta = ref(1.0);
const sigma = ref(3.78);
const stepSize = ref(5.0);

watch(contrast, (val) => {
  earth.postProcess.bloom.contrast = val;
});
watch(brightness, (val) => {
  earth.postProcess.bloom.brightness = val;
});
let earth: any;
onMounted(() => {
  earth = useEarth();
  earth.postProcess.bloom.enabled = true;
});
onBeforeUnmount(() => {
  earth.postProcess.bloom.enabled = false;
});
</script>
