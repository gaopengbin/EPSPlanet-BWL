<!--
 * @Description: 
 * @Date: 2023-02-09 14:28:42
 * @Author: didi
 * @LastEditTime: 2023-05-24 11:29:22
-->
<template>
  <div>
    <!-- <ea-button>按钮</ea-button>
    <ea-earth />
    <Button>123</Button>
    <Earth /> -->
    <Test />
    <el-button></el-button>
    <ep-earth @onReady="ready" />
    <!-- <ElButton></ElButton> -->
  </div>
</template>
<script lang="ts" setup>
import { test, test2, emitter, useEarth } from 'epsplanet'
// import { test } from 'epsplanet/lib/src/utils'
// test2(1)
// useEarth().then((res) => {
//   console.log(res)
// })
// console.log(test, test2, emitter)

const ready = (e: any) => {
  console.log(e)
}
// import {} from ''
// import { Button } from '@epsplanet/components';
// import { Earth } from '@epsplanet/components';
</script>
