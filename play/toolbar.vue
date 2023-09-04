<template>
    <epsplanet-toolbar :mode="mode" :position="position">
        <epsplanet-button v-for="(item, i) in components" :key="i" :icon="item.icon" :title="item.label"
            :position="item.position" :type="item.type" :panel="item.panel">
            <template v-slot="data">
                <component :is="item.component" :btnClass="data.btnClass"></component>
            </template>
        </epsplanet-button>
    </epsplanet-toolbar>
</template>

<script setup lang="ts">
defineProps({
    mode: {
        type: String,
        default: 'vertical'
    },
    position: {
        type: Object,
        default: () => {
            return {
                top: '50px',
                left: '20px'
            }
        }
    },
    components: {
        type: Array,
        default: () => {
            return []
        }
    }
})
</script>