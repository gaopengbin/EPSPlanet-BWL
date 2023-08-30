export const statusbarProps = {
  /**
   * @description 相机经纬度
   */
  showCamera: {
    type: Boolean,
    require: false,
    default: true
  },
  /**
   * @description 相机高度
   */
  showHeight: {
    type: Boolean,
    require: false,
    default: true
  },
  /**
   * @description FPS 帧率
   */
  showFPS: {
    type: Boolean,
    require: false,
    default: true
  },
  /**
   * @description 俯仰角
   */
  showPitch: {
    type: Boolean,
    require: false,
    default: true
  },
  /**
   * @description 方位角
   */
  showHeading: {
    type: Boolean,
    require: false,
    default: true
  },
  /**
   * @description 偏航角
   */
  showRoll: {
    type: Boolean,
    require: false,
    default: true
  },
  /**
   * @description 移动速度
   */
  showVelocity: {
    type: Boolean,
    require: false,
    default: true
  },
  /**
   * @description 鼠标位置
   */
  showMouse: {
    type: Boolean,
    require: false,
    default: true
  }
};
