<template>
  <div class="epsplanet-panel-base" style="width: 296px">
    <el-form ref="form" label-width="70px">
      <el-form-item :label="title">
        <el-color-picker
          v-model="uicolor"
          show-alpha
          @active-change="changeColor"
        ></el-color-picker>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useEarth } from '../../utils';
import { ElForm, ElFormItem, ElColorPicker } from 'element-plus';
defineOptions({ name: 'EpsplanetSilhouette' });

const title = '轮廓颜色';
const length = ref(0.5);
const uicolor = ref('rgba(11, 211, 34, 0.8)');

let earth: any;
onMounted(() => {
  earth = useEarth();
  earth.postProcess.silhouette.enabled = true;
});
onBeforeUnmount(() => {
  earth.postProcess.silhouette.enabled = false;
});
function changeColor(val: string | null): any {
  if (!val) return;
  let v = val.split('(')[1].split(')')[0].split(',');
  let cc: number[] = [];
  v.forEach((c: any, i: number) => {
    if (i == 3) {
      cc.push(Number(c));
    } else {
      cc.push(Number(c) / 255.0);
    }
  });
  earth.postProcess.silhouette.color = cc;
}
</script>
