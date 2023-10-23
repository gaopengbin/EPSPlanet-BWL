<template>
  <div class="testC">
    {{ name }}
    <!-- <el-button>按钮</el-button> -->
  </div>
</template>

<script lang="ts" setup>
import './style/index.less';
// import { defineProps, defineEmits } from 'vue';
import { Pros } from './props';
let pp = defineProps(Pros);
const { name } = pp;
import { useEarth } from '../utils';

const earth = useEarth();

console.log(pp);

</script>
