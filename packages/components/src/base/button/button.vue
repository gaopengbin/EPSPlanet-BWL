<template>
  <div class="epsplanet-button" :class="data.randomClass">
    <i
      class="iconfont"
      :class="icon"
      @click="openPanel"
      :title="title"
      :style="{ color: data.iconColor }"
    ></i>
    <el-button @click="openPanel" v-if="btnName">{{ btnName }}</el-button>
  </div>
  <!-- 弹出面板 -->
  <teleport :to="data.container" v-if="data.toContainer">
    <div
      v-show="data.show && hasPanel"
      class="epsplanet-popover"
      :class="data.randomClass"
      :id="data.randomClass"
    >
      <!-- 边缘拖拽缩放 -->
      <div
        class="resizeTop"
        v-resizeTop:id="data.randomClass"
        :data-dockMode="dockMode"
      ></div>
      <div class="resizeBottom" v-resizeBottom:id="data.randomClass"></div>
      <div class="resizeLeft" v-resizeLeft:id="data.randomClass"></div>
      <div
        class="resizeRight"
        v-resizeRight:id="data.randomClass"
        :data-dockMode="dockMode"
      ></div>
      <div
        class="resizeBottomLeft"
        v-resizeBottomLeft:id="data.randomClass"
      ></div>
      <div
        class="resizeBottomRight"
        v-resizeBottomRight:id="data.randomClass"
      ></div>

      <div v-if="data.opened" class="tool-panel" :class="data.randomClass">
        <div class="tool-header" v-drag v-show="data.showTitle">
          {{ title }}
          <i class="iconfont icon-close" @click="closePanel"></i>
          <i
            class="iconfont icon-minus"
            @click="hiddenPanel"
            v-show="!dockMode"
          ></i>
        </div>
        <div class="tool-content">
          <slot :btnClass="data.randomClass" />
          <!-- 边缘吸附按钮 -->
          <div
            class="collapse"
            :class="dockMode"
            v-show="dockMode"
            @click="collapse"
          >
            <i class="iconfont" :class="data.collapseIcon"></i>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import './style/index.scss';
import {
  randomId,
  panelDock,
  panelDockCollapse,
  resizeMapSize,
  directives,
  useEarth
} from '../../utils';
const {
  vDrag,
  vResizeBottom,
  vResizeBottomLeft,
  vResizeBottomRight,
  vResizeLeft,
  vResizeRight,
  vResizeTop
} = directives;
import { buttonProps, buttonEmits } from './button';
import {
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  reactive,
  watch
} from 'vue';
defineOptions({ name: 'EpsplanetButton' });
const ctx = getCurrentInstance();
// console.log(ctx)
const props = defineProps(buttonProps);
const emit = defineEmits(buttonEmits);
const { btnName, icon, title, position, type, hasPanel, panel } = props;
const dockShowTitle = panel?.showTitle;
const dockMode = panel?.showTitle;
const data = reactive({
  show: false,
  opened: false,
  randomClass: randomId(),
  iconColor: '',
  collapseIcon: 'icon-zuo',
  config: {} as any,
  dockMode: dockMode,
  showTitle: dockShowTitle,
  isCollapse: true,
  toContainer: false,
  container: '#app'
});
defineExpose(data);
watch(
  () => data.isCollapse,
  (val) => {
    switch (dockMode.toLowerCase()) {
      case 'left':
        data.collapseIcon = val ? 'icon-you' : 'icon-zuo';
        break;
      case 'bottom':
        data.collapseIcon = val ? 'icon-shouqi' : 'icon-zhankai';
        break;

      default:
        break;
    }
  }
);
onBeforeMount(() => {
  data.randomClass = randomId();

  if (panel.dockMode) {
    switch (data.dockMode.toLowerCase()) {
      case 'left':
        data.collapseIcon = 'icon-zuo';
        break;
      case 'bottom':
        data.collapseIcon = 'icon-zhankai';
        break;

      default:
        break;
    }
    data.showTitle = dockShowTitle;
  } else {
    data.showTitle = true;
  }
});
let earth: any;
onMounted(async () => {
  let earth: any = await useEarth();
  if (earth) {
    data.container = earth.czm.viewer.container;
    data.toContainer = true;
  }
  //按钮位置
  let button = document.getElementsByClassName(
    'epsplanet-button ' + data.randomClass
  )[0] as HTMLElement;
  button.style.top = position.top + 'px';
  button.style.left = position.left + 'px';
  button.style.right = position.right + 'px';
  button.style.bottom = position.bottom + 'px';

  setTimeout(() => {
    if (panel) {
      setInterval(() => {
        checkPosition();
      }, 100);
    }
  }, 500);
});
function checkPosition() {
  let pop = document.getElementsByClassName(
    'epsplanet-popover ' + data.randomClass
  )[0] as HTMLElement;
  if (!pop) return;
  let popParent = pop.parentElement as HTMLElement;

  if (popParent.clientHeight == 0 || popParent.clientWidth == 0) {
    // console.log('隐藏了，不用动')
    return;
  }

  let left = parseInt(pop.style.left);
  if (left < 0) {
    pop.style.left = 0 + 'px';
  } else if (left > popParent.clientWidth - pop.clientWidth) {
    pop.style.left = popParent.clientWidth - pop.clientWidth + 'px';
  }
}
//隐藏弹窗
function hiddenPanel() {
  data.show = false;
}
//销毁弹框
function closePanel() {
  data.iconColor = '';
  data.opened = false;
  data.show = false;
  if (dockMode) {
    resizeMapSize();
  }
}
//打开/显示弹框
function openPanel() {
  // debugger
  if (type == 'panel') {
    if (!data.opened) {
      data.iconColor = 'aqua';
      data.opened = true;
      data.show = true;

      setTimeout(() => {
        let dom = document.getElementsByClassName(
          'tool-panel ' + data.randomClass
        )[0] as HTMLElement;
        if (panel.dockMode == 'left' || panel.dockMode == 'right') {
          (dom.children[0] as HTMLElement).dataset.dragable = 'false';
          let p = document.getElementsByClassName(
            'epsplanet-popover ' + data.randomClass
          )[0] as HTMLElement;
          if (panel.size) {
            p.style.width = panel.size.width + 'px';
            p.style.height = '100%';
          }
          panelDock(panel.dockMode, p, earth);
          data.isCollapse = false;
        } else if (panel.dockMode == 'top' || panel.dockMode == 'bottom') {
          (dom.children[0] as HTMLElement).dataset.dragable = 'false';
          let p = document.getElementsByClassName(
            'epsplanet-popover ' + data.randomClass
          )[0] as HTMLElement;
          if (panel.size) {
            p.style.width = '100%';
            p.style.height = panel.size.height + 'px';
          }
          panelDock(panel.dockMode, p, earth);
          data.isCollapse = false;
        } else {
          if (panel.size) {
            let p = document.getElementsByClassName(
              'epsplanet-popover ' + data.randomClass
            )[0] as HTMLElement;
            p.style.width = panel.size.width + 'px';
            p.style.height = panel.size.height + 'px';
          }
          if (panel.position) {
            // debugger
            let pop = dom.parentElement as HTMLElement;
            if (pop.style.top == '') {
              pop.style.top = panel.position.top + 'px';
            }
            if (pop.style.left == '') {
              pop.style.left = panel.position.left + 'px';
            }
            if (pop.style.right == '') {
              pop.style.right = panel.position.right + 'px';
            }
            if (pop.style.bottom == '') {
              pop.style.bottom = panel.position.bottom + 'px';
            }

            // pop.style.left = panel.position.left + "px";
            // pop.style.right = panel.position.right + "px";
            // pop.style.bottom = panel.position.bottom + "px";
          }
        }

        emit('click', ctx);
      }, 10);
    } else {
      emit('click', ctx);
      data.show = !data.show;
    }
  } else if (type == 'switch') {
    emit('click', ctx);
    data.iconColor = data.iconColor == '' ? 'aqua' : '';
    data.opened = !data.opened;
  } else if (type == 'trigger') {
    emit('click', ctx);
    // data.iconColor = data.iconColor == "" ? "aqua" : "";
    let el: any = document.getElementsByClassName(
      'epsplanet-button ' + data.randomClass
    )[0].children[0];
    let state = el.style.color == 'aqua';
    el.style.color = el.style.color == '' ? 'aqua' : '';
    data.iconColor = el.style.color;
    data.opened = false;
    setTimeout(() => {
      data.opened = true;
    }, 10);
  }
}
//折叠/展开面板
function collapse() {
  let p = document.getElementsByClassName(
    'epsplanet-popover ' + data.randomClass
  )[0] as HTMLElement;
  panelDockCollapse(dockMode, p, data.isCollapse);
  data.isCollapse = !data.isCollapse;
}
</script>
