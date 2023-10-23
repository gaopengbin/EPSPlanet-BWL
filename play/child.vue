<template>
    <div class="child">
        123
        <el-button>123</el-button>
    </div>
</template>

<script lang="ts" setup>
import { useEarth } from '@epsplanet/components';
import { toRaw } from 'vue';
// console.log(useEarth, getEarthList)
let earth = toRaw(useEarth())
console.log(earth,window.earth,toRaw(earth))
let polyline = new XE.Obj.Plots.GeoPolyline(earth)
polyline.creating = true
XE.MVVM.watch(
  () => polyline.creating,
  () => {
    console.log('creating', polyline.creating)
  },
)

</script>
<style lang="scss">
.child {
    width: 100px;
    height: 100px;
    background-color: red;
}
</style>
