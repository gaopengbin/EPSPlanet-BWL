
export const earthProps = {
    params: {
        type: Object,
        require: false,
        default: null
    },
    container: {
        type: String,
        require: true,
        default: "earthContainer"
    },
    showCompass: {
        type: Boolean, //参数类型
        require: false, //是否必须
        default: false,  //默认值
    },
    compassStyle: {
        type: Object,
        require: false,
        default: {
            left: undefined,
            top: 30,
            right: 30,
            bottom: undefined
        }
    },
    showDistanceLegend: {
        type: Boolean, //参数类型
        require: false, //是否必须
        default: false,  //默认值
    },
    distanceLegendStyle: {
        type: Object,
        require: false,
        default: {
            left: undefined,
            top: undefined,
            right: 30,
            bottom: 20
        }
    },
    showDefaultBasemap: {
        type: Boolean, //参数类型
        require: false, //是否必须
        default: false,  //默认值
    },
}
export const earthEmits = [
    "onReady",//地球加载完成
]
