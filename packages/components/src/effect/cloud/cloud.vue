<template>
  <div class="epsplanet-panel-base" style="width: 296px">
    <el-form ref="form" label-width="70px">
      <el-form-item :label="title">
        <el-slider
          v-model="aroundTime"
          :min="min"
          :max="max"
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
defineOptions({ name: 'EpsplanetCloud' });

const title = '环绕周期';
const aroundTime = ref(120);
const min = ref(1);
const max = ref(200);

watch(aroundTime, (val) => {
  earth.weather.cloud.aroundTime = val;
});
let earth: any;
onMounted(() => {
  earth = useEarth();
  console.log('环绕周期');
  earth.weather.cloud.enabled = true;
});
onBeforeUnmount(() => {
  earth.weather.cloud.enabled = false;
});
</script>

<style scoped></style>
