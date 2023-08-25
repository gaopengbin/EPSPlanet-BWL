export const panelProps = {
  title: {
    type: String,
    require: false,
    default: '标题'
  },
  panel: {
    type: Object,
    require: false
  },
  param: {
    type: Object,
    require: false,
    default: {
      test: 1
    }
  }
};

export const panelEmits = ['close', 'minimize'];
