import { h, isVNode, render, resolveComponent } from 'vue';
import panel from '../../base/panel/panel.vue';
import type { AppContext, ComponentPublicInstance, VNode } from 'vue';
// const shared = require('@vue/shared');
import { hasOwn } from '@vue/shared';
// const hasOwn = shared.hasOwn;
// import { hasOwn } from "element-plus/lib/utils"
// import ElementPlus from 'element-plus';
// import EPSPlanetBWL from '../../../index';
// import { createApp } from 'vue'
// import App from '../../../../../examples/App.vue'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// const app = createApp(App)
// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//     app.component(key, component)
// }
// app.use(ElementPlus)
// app.use(EPSPlanetBWL)

let widgets: any = [];

const initInstance = (
  props: any,
  container: HTMLElement,
  appContext: AppContext | null = null,
  slot: any | null = null
) => {
  const vnode = h(panel, props);
  vnode.appContext = appContext;
  render(vnode, container);
  document.body.appendChild(container.firstElementChild!);
  return vnode.component;
};

export function usePanel(
  options: any,
  appContext?: AppContext | null,
  slot?: VNode | String
) {
  // console.log(options, appContext, slot)
  if (
    (options.onlyOne && options.type == 'panel') ||
    options.type == 'switch'
  ) {
    let wgt = haveRendered(slot);
    if (wgt) {
      if (options.type == 'panel') {
        if (wgt.show) {
          wgt.hiddenPanel();
        } else {
          wgt.show = true;
        }
      } else {
        if (wgt.opened) {
          wgt.closePanel();
        } else {
          wgt.opened = true;
        }
      }

      return wgt;
    }
  }

  const container = document.createElement('div');
  const instance = initInstance(options, container, appContext, slot)!;
  const vm = instance?.proxy as any;

  for (const prop in options) {
    if (hasOwn(options, prop) && !hasOwn(vm.$props, prop)) {
      vm[prop as string] = options[prop];
    }
  }
  if (isVNode(slot)) {
    if (!(slot as any).type.components) {
      (slot as any).type.components = {};
    }
    (slot as any).type.components = Object.assign(
      (slot as any).type.components,
      appContext?.app._context.components
    );
    //把参数传给内容组件
    if (options.param) {
      slot.props = {
        ...options.param
      };
    }

    // (slot as any).type.components = Object.assign((slot as any).type.components, app._context.components);
    instance.slots.default = () => [slot];
    if (options.type == 'panel' || options.type == 'switch') {
      // widgets.push(instance.proxy)
    }
    // console.log(instance.proxy);

    // debugger
    // if (instance.exposeProxy) {
    //     Object.assign((instance.proxy as any), instance.exposeProxy);
    // }
    (instance.exposeProxy as any).openPanel();
    (instance.proxy as any).opened = true;
    // 把内容组件实例挂载到面板组件上

    (instance.proxy as any).getComponent = async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(slot.component?.proxy);
        }, 100);
      });
    };

    return instance.proxy;
  } else if (typeof slot === 'string') {
    const component = resolveComponent(slot) as VNode;
    // console.log(component)
    const vn = h(slot);
    // console.log(vn)
    // instance.slots.default = () => []
  }
  // console.log(slot, vm)
}

export function getWidgets() {
  return widgets;
}

export function pushWidget(wgt: any) {
  widgets.push(wgt);
}

export function haveRendered(wgt: any) {
  // debugger
  let haveWidget;
  for (let i = 0; i < widgets.length; i++) {
    const widget = widgets[i];
    if (widget.component == wgt.type.name) {
      haveWidget = widget;
      return widget;
    }
  }
  if (!haveWidget) {
    return false;
  }
}

export function removeWidget(wgt: any) {
  let index = widgets.indexOf(wgt);
  if (index > -1) {
    widgets.splice(index, 1);
  }
  // console.log(widgets)
}

export function removeAllWidgets() {
  widgets.forEach((wgt: any) => {
    wgt.destory();
  });
  widgets = [];
}
