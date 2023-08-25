export const buttonProps = {
  params: {
    type: Object,
    require: false,
    default: null
  },
  icon: {
    type: String,
    require: false,
    default: ''
  },
  btnName: {
    type: String,
    require: false,
    default: ''
  },
  title: {
    type: String,
    require: false,
    default: ''
  },
  position: {
    type: Object,
    require: false,
    default: {
      top: 0,
      left: 0
    }
  },
  type: {
    // 按钮类型 : panel,switch,trigger
    type: String,
    require: false,
    default: 'panel'
  },
  hasPanel: {
    type: Boolean,
    require: false,
    default: true
  },
  panel: {
    type: Object,
    require: false,
    default: {
      size: undefined,
      position: { top: 10, left: 10 },
      dockMode: undefined
    }
  }
};

export const buttonEmits = ['click'];
