<template>
    <div class="child">
        没出意外！
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
    background-color: rgb(211, 211, 211);
}
</style>
