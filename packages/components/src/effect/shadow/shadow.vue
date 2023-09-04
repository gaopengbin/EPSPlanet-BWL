<template>
  <div class="epsplanet-panel-base" style="width: 296px">
    <el-form ref="form" label-width="70px">
      <el-form-item :label="label.darkness">
        <el-slider
          v-model="darkness"
          :min="0"
          :max="1"
          :step="0.01"
          show-input
          :show-input-controls="false"
        >
        </el-slider>
      </el-form-item>
      <el-form-item :label="label.maximumDistance">
        <el-slider
          v-model="maximumDistance"
          :min="1"
          :max="1000"
          :step="1"
          show-input
          :show-input-controls="false"
        >
        </el-slider>
      </el-form-item>
      <el-form-item :label="label.terrainShadow">
        <el-switch v-model="terrainShadow" inactive-color="#dcdfe6"></el-switch>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useEarth } from '../../utils';
import { ElForm, ElFormItem, ElSlider, ElSwitch } from 'element-plus';
defineOptions({ name: 'EpsplanetShadow' });

const label = {
  darkness: '暗度',
  maximumDistance: '最大距离',
  normalOffset: '法向量偏移',
  terrainShadow: '地形阴影',
  softShadows: '软阴影'
};

const terrainShadow = ref(true);
const softShadows = ref(false);
const size = ref(2048);
const darkness = ref(0.3);
const maximumDistance = ref(5000);
const normalOffset = ref(true);

watch(terrainShadow, (val) => {
  earth.effect.shadow.terrainShadow = val;
});
watch(softShadows, (val) => {
  earth.effect.shadow.softShadows = val;
});
watch(normalOffset, (val) => {
  earth.effect.shadow.normalOffset = val;
});
watch(darkness, (val) => {
  earth.effect.shadow.darkness = val;
});
watch(maximumDistance, (val) => {
  earth.effect.shadow.maximumDistance = val;
});
let earth: any;
onMounted(() => {
  earth = useEarth();
  earth.effect.shadow.enabled = true;
});
onBeforeUnmount(() => {
  earth.effect.shadow.enabled = false;
});
</script>
