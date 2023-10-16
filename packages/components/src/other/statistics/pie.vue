<template>
    <div class="chartDiv">
        <div id="eChart">

        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType, watch } from 'vue';

let props = defineProps({
    data: {
        type: Array as PropType<any[]>,
        required: true,
        default: () => []
    },
    defaultProps: {
        type: Object as PropType<any>,
        required: true,
        default: () => {
            return {
                name: 'name',
                value: 'value'
            }
        }
    }
})
let { data, defaultProps } = props;
import * as echarts from 'echarts';
import { onMounted, onUnmounted, ref } from 'vue';


let myChart: any;
function init(d, prop) {
    let data = d.map((item) => {
        return {
            value: item[prop.value],
            name: item[prop.name]
        }
    })
    if (myChart) {

    } else {
        myChart = echarts.init(document.getElementById('eChart') as HTMLDivElement);
    }

    const option = {
        title: {
            text: '服务统计结果',
            // subtext: '纯属虚构',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                name: '统计占比',
                type: 'pie',
                radius: '50%',
                data: data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, .5)'
                    }
                }
            }
        ]
    };
    myChart.setOption(option);
}
onMounted(() => {
    init(data, defaultProps)
    let elementResizeDetectorMaker = require("element-resize-detector");
    var erd = elementResizeDetectorMaker();
    // var erdUltraFast = elementResizeDetectorMaker({
    //     strategy: "scroll",
    //     callOnAdd: true, //callOnAdd选项，用于确定在添加侦听器时是否应调用它们。默认为true。
    //     //如果为true，则确保在添加侦听器后将对其进行调用。如果为false，则在添加侦听器时将不保证其
    //     //被调用（不会阻止其被调用）
    //     debug: true,
    // });
    erd.listenTo(document.querySelector("#eChart"), function (element) {
        if (myChart) {
            myChart.resize();
        }
    });
})
defineExpose({
    init
})



</script>

<style scoped>
#eChart {
    width: 100%;
    height: 100%;
}

.chartDiv {
    /* width: 300px;
    height: 300px; */
    width: 100%;
    height: 100%;
}
</style>