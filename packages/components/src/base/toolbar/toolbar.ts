export const toolbarProps = {
  mode: {
    type: String,
    require: false,
    default: 'vertical'
  },
  position: {
    type: Object,
    require: false,
    default: {
      top: 0,
      left: 0
    }
  },
  collapsable: {
    type: Boolean,
    require: false,
    default: false
  }
};
