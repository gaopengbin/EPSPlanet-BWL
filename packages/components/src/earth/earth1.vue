<template>
    <div id="container">Icon1</div>
</template>
  
<script lang="ts" setup>
import { onMounted } from 'vue';
import { emitter } from '../utils';
defineOptions({ name: 'ea-earth' });
onMounted(() => {
    const earth = new XE.Earth('container');
    console.log(earth);
    emitter.emit('earthReady', earth);
})

</script>
  