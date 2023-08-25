export const earthProps = {
  /**
   * 容器id
   */
  container: {
    type: String,
    require: true,
    default: 'earthContainer'
  },
  /**
   * 是否显示指北针控件
   */
  showCompass: {
    type: Boolean, //参数类型
    require: false, //是否必须
    default: false //默认值
  },
  /**
   * 指北针控件位置
   */
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
  /**
   * 是否显示比例尺控件
   */
  showDistanceLegend: {
    type: Boolean, //参数类型
    require: false, //是否必须
    default: false //默认值
  },
  /**
   * 比例尺控件位置
   */
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
  /**
   * 是否显示logo控件
   */
  showDefaultBasemap: {
    type: Boolean, //参数类型
    require: false, //是否必须
    default: false //默认值
  }
};
export const earthEmits = [
  /**
   * 地球加载完成
   */
  'onReady' //地球加载完成
];
