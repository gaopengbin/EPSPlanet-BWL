<template>
  <div v-show="data.show" class="epsplanet-popover" :class="data.randomClass" :id="data.randomClass">
    <!-- 边缘拖拽缩放 -->
    <div class="resizeTop" v-resizeTop:id="data.randomClass" :data-dockMode="dockMode"></div>
    <div class="resizeBottom" v-resizeBottom:id="data.randomClass"></div>
    <div class="resizeLeft" v-resizeLeft:id="data.randomClass"></div>
    <div class="resizeRight" v-resizeRight:id="data.randomClass" :data-dockMode="dockMode"></div>
    <div class="resizeBottomLeft" v-resizeBottomLeft:id="data.randomClass"></div>
    <div class="resizeBottomRight" v-resizeBottomRight:id="data.randomClass"></div>
    <div v-if="data.opened" class="tool-panel" :class="data.randomClass">
      <div class="tool-header" v-drag v-show="data.showTitle">
        {{ title }}
        <i class="iconfont icon-close" @click="closePanel"></i>
        <i class="iconfont icon-minus" @click="hiddenPanel" v-show="!dockMode"></i>
      </div>
      <div class="tool-content">
        <slot :btnClass="data.randomClass" />
        <div class="collapse" :class="dockMode" v-show="dockMode" @click="collapse">
          <i class="iconfont" :class="data.collapseIcon"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import './style/index.scss';
import {
  randomId,
  panelDock,
  panelDockCollapse,
  resizeMapSize,
  directives,
  useEarth,
  getWidgets,
  pushWidget,
  removeWidget,
  removeAllWidgets
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

import { panelProps, panelEmits } from "./panel";
import axios from "axios";
import { getCurrentInstance, onBeforeMount, onMounted, reactive, watch } from 'vue';
defineOptions({ name: 'EpsplanetPanel' });

const props = defineProps(panelProps);
const emit = defineEmits(panelEmits);
const { title, panel, } = props;

const dockShowTitle = panel?.showTitle;
const dockMode = panel?.showTitle;
const ctx = getCurrentInstance() as any
const { proxy } = getCurrentInstance() as any;
const data = reactive({
  opened: false,
  show: true,
  randomClass: "",
  collapseIcon: "icon-zuo",
  showTitle: true,
  isCollapse: true,
});
let earth: any;
defineExpose({
  ...data,
  openPanel,
  closePanel
})
watch(
  () => data.opened,
  (newVal) => {
    if (newVal) {
      if (!panel) return;
      setTimeout(() => {
        let dom = document.getElementsByClassName(
          "tool-panel " + data.randomClass
        )[0] as HTMLElement;
        if (panel.dockMode == "left" || panel.dockMode == "right") {
          if (panel.size) {
            dom.style.width = panel.size.width + "px";
            dom.style.height = "100%";
          }
          (dom.children[0] as HTMLElement).dataset.dragable = "false";
          let p = document.getElementsByClassName(
            "epsplanet-popover " + data.randomClass
          )[0] as HTMLElement;
          panelDock(panel.dockMode, p, earth);
          data.isCollapse = false;
        } else if (panel.dockMode == "top" || panel.dockMode == "bottom") {
          if (panel.size) {
            dom.style.width = "100%";
            dom.style.height = panel.size.height + "px";
          }
          (dom.children[0] as HTMLElement).dataset.dragable = "false";
          let p = document.getElementsByClassName(
            "epsplanet-popover " + data.randomClass
          )[0] as HTMLElement;
          panelDock(panel.dockMode, p, earth);
          data.isCollapse = false;
        } else {
          let pop = dom.parentElement as HTMLElement;
          if (panel.size) {
            pop.style.width = panel.size.width + "px";
            pop.style.height = panel.size.height + "px";
          }
          if (panel.position) {
            pop.style.top = panel.position.top + "px";
            pop.style.left = panel.position.left + "px";
            pop.style.bottom = panel.position.bottom + "px";
            pop.style.right = panel.position.right + "px";
          }
        }
      }, 10);
    }
  }
);
watch(
  () => data.isCollapse,
  (val) => {
    switch (dockMode.toLowerCase()) {
      case "left":
        data.collapseIcon = val ? "icon-you" : "icon-zuo";
        break;
      case "bottom":
        data.collapseIcon = val ? "icon-shouqi" : "icon-zhankai";
        break;

      default:
        break;
    }
  }
);

onBeforeMount(() => {
  earth = useEarth();
  data.randomClass = randomId();
  if (panel && panel.dockMode) {
    switch (dockMode.toLowerCase()) {
      case "left":
        data.collapseIcon = "icon-zuo";
        break;
      case "bottom":
        data.collapseIcon = "icon-zhankai";
        break;

      default:
        break;
    }
    data.showTitle = dockShowTitle;
  } else {
    data.showTitle = true;
  }
});
onMounted(() => {
  axios.get('/Epsplanet_Assets/widgets/base/panel/config.json').then((res: any) => {
    if (res.data.onlyOne) {
      if (getWidgets().length > 0) {
        removeAllWidgets()
      }
    }
    pushWidget(proxy);
  })
  setTimeout(() => {
    setInterval(
      () => {
        checkPosition()
      }, 100
    )
  }, 1000);
});

function checkPosition() {
  let pop = document.getElementsByClassName(
    "epsplanet-popover " + data.randomClass
  )[0] as HTMLElement;
  let popParent = pop.parentElement as HTMLElement;

  let left = parseInt(pop.style.left);
  if (left < 0) {
    pop.style.left = 0 + 'px'
  } else if (left > popParent.clientWidth - pop.clientWidth) {
    pop.style.left = popParent.clientWidth - pop.clientWidth + 'px'
  }
}
//打开弹框
function openPanel() {
  data.opened = true;
  data.show = true;
  if (!panel) return;
  setTimeout(() => {
    let dom = document.getElementsByClassName(
      "tool-panel " + data.randomClass
    )[0] as HTMLElement;
    if (panel.dockMode == "left" || panel.dockMode == "right") {
      if (panel.size) {
        dom.style.width = panel.size.width + "px";
        dom.style.height = "100%";
      }
      (dom.children[0] as HTMLElement).dataset.dragable = "false";
      let p = document.getElementsByClassName(
        "epsplanet-popover " + data.randomClass
      )[0] as HTMLElement;
      panelDock(panel.dockMode, p, earth);
      data.isCollapse = false;
    } else if (panel.dockMode == "top" || panel.dockMode == "bottom") {
      if (panel.size) {
        dom.style.width = "100%";
        dom.style.height = panel.size.height + "px";
      }
      (dom.children[0] as HTMLElement).dataset.dragable = "false";
      let p = document.getElementsByClassName(
        "epsplanet-popover " + data.randomClass
      )[0] as HTMLElement;
      panelDock(panel.dockMode, p, earth);
      data.isCollapse = false;
    } else {
      let pop = dom.parentElement as HTMLElement;
      if (panel.size) {
        pop.style.width = panel.size.width + "px";
        pop.style.height = panel.size.height + "px";
      }
      if (panel.position) {
        pop.style.top = panel.position.top + "px";
        pop.style.left = panel.position.left + "px";
        pop.style.bottom = panel.position.bottom + "px";
        pop.style.right = panel.position.right + "px";
      }
    }
  }, 10);

}

//隐藏弹窗
function hiddenPanel() {
  emit("minimize");
  data.show = false;
}
//销毁弹框
function closePanel() {
  removeWidget(proxy)
  emit("close");
  data.opened = false;
  data.show = false;
  if (dockMode) {
    resizeMapSize();
  }
}
function destory() {
  emit("close");
  data.opened = false;
  data.show = false;
  if (dockMode) {
    resizeMapSize();
  }
}
//折叠/展开面板
function collapse() {
  let p = document.getElementsByClassName(
    "epsplanet-popover " + data.randomClass
  )[0] as HTMLElement;
  panelDockCollapse(dockMode, p, data.isCollapse);
  data.isCollapse = !data.isCollapse;
}

</script>
<style scoped></style>
