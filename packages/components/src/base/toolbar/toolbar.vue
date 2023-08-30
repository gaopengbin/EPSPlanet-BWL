<template>
  <div class="tool-bar" :class="mode" :style="style" ref="toolbar">
    <i
      v-if="collapsable"
      class="iconfont"
      :class="collapseIcon"
      @click="collapse"
      :title="isCollapse ? '展开' : '收缩'"
    ></i>
    <!-- <span @click="collapse">收缩</span> -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import './style/index.scss';
import { toolbarProps } from './toolbar';
defineOptions({ name: 'EpsplanetToolbar' });

const props = defineProps(toolbarProps);

const toolbar = ref<any>(null);
const isCollapse = ref(false);
const { mode, collapsable, position } = props;
const style = position;
console.log(style);
let height: number;
const collapseIcon = ref('icon-zhankai');

onMounted(() => {
  height = toolbar.value?.clientHeight - 10;
});
function collapse() {
  if (!toolbar.value.style.height) {
    toolbar.value.style.height = height + 'px';
  }
  setTimeout(() => {
    if (isCollapse.value) {
      collapseIcon.value = 'icon-zhankai';
      toolbar.value.style.height = height + 'px';
    } else {
      collapseIcon.value = 'icon-shouqi';
      toolbar.value.style.height = '10px';
    }
    isCollapse.value = !isCollapse.value;
  }, 10);
}
</script>
