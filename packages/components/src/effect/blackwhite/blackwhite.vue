<template>
  <div class="epsplanet-panel-base" style="width: 296px">
    <el-form ref="form" label-width="70px">
      <el-form-item :label="title">
        <el-slider v-model="gradations" :min="min" :max="max" :step="step" show-input
          :show-input-controls="false"></el-slider>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useEarth } from '../../utils';
import { ElForm, ElFormItem, ElSlider } from 'element-plus';
defineOptions({ name: 'EpsplanetBlackwhite' });

const title = '黑白程度';
const gradations = ref(5);
const min = ref(1);
const max = ref(20);
const step = ref(0.1);

watch(gradations, (val) => {
  earth.postProcess.blackAndWhite.gradations = val;
});
let earth: any;
onMounted(() => {
  earth = useEarth();
  earth.postProcess.blackAndWhite.enabled = true;
});
onBeforeUnmount(() => {
  earth.postProcess.blackAndWhite.enabled = false;
});
</script>
