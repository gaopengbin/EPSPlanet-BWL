<template>
    <div>
        <el-select v-model="value" class="m-2" placeholder="Select">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
const value = ref('light');
const options = ref([
    {
        value: 'dark',
        label: 'dark'
    },
    {
        value: 'light',
        label: 'light'
    },
    {
        value: 'colorful',
        label: 'colorful'
    }
]);
watch(value, (val) => {
    console.log(val);
    document.getElementsByTagName('html')[0].setAttribute('data-sunwayTheme', val);
    if (val == 'dark') {
        document.getElementsByTagName('html')[0].classList.add('dark');
        document.getElementsByTagName('html')[0].classList.remove('light');
    } else if (val == 'light') {
        document.getElementsByTagName('html')[0].classList.remove('dark');
        document.getElementsByTagName('html')[0].classList.add('light');
    } else {
        // document.getElementsByTagName('html')[0].classList.remove('dark');
        // document.getElementsByTagName('html')[0].classList.remove('light');
        // document.documentElement 是全局变量时
        const el = document.documentElement
        // const el = document.getElementById('xxx')

        // 获取 css 变量
        getComputedStyle(el).getPropertyValue(`--el-color-primary`)

        // 设置 css 变量
        el.style.setProperty('--el-color-primary', 'red')
    }
});
</script>

<style scoped></style>