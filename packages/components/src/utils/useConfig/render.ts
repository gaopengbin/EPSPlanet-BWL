import { AppContext, h, render } from "vue";
import button from "../../base/button/button.vue";
import { getConfig } from ".";
import { useEarthAsync } from "../useEarth";

const initInstance = (
    props: any,
    container: HTMLElement,
    appContext: AppContext | null = null,
    slot: any | null = null
) => {
    const vnode = h(button, props);
    vnode.appContext = appContext;
    render(vnode, container);
    document.body.appendChild(container.firstElementChild!);
    return vnode.component;
};

interface BtnOptions {
    title: string,
    icon: string,
    type: string,
    component: string,
    props?: any,
    panel?: any,
    position?: any,
    container?: any,
}

function renderBtn(appContext: any, options: BtnOptions) {
    const container = document.createElement('div');
    //获取组件
    let slot = h(appContext.components[options.component]);
    const instance = initInstance(options, container, appContext, slot)!;
    const vm = instance?.proxy as any;
    if (options.props) {
        slot.props = {
            ...options.props
        };
    }
    instance.slots.default = () => [slot];
    return instance;
}

function renderWidget(appContext: any, options: BtnOptions) {
    let widget = h(appContext.components[options.component]);
    const container = document.createElement('div');
    const vnode = h(widget, options?.props);
    vnode.appContext = appContext;
    render(vnode, container);
    if (options.container) {
        let parent = document.querySelector(options.container);
        if (parent) {
            parent.appendChild(container.firstElementChild!);
        } else {
            document.body.appendChild(container.firstElementChild!);
        }
    } else {
        document.body.appendChild(container.firstElementChild!);
    }
    return vnode.component;
}

function renderBtns(appContext: any, options: BtnOptions[]) {
    const widgets: any = []
    options.forEach((item) => {
        if (item.type == 'nopanel') {
            let w = renderWidget(appContext, item)
            widgets.push(w)
        } else {
            let w = renderBtn(appContext, item)
            widgets.push(w)
        }
    })
    console.log(widgets)
}

async function renderLayers(layers: any[]) {
    let earth = await useEarthAsync();
    earth.sceneTree.root.children.push(...layers)
}

function renderConfig(appContext: AppContext) {
    getConfig().then((res: any) => {
        renderBtns(appContext, res.widget)
        renderLayers(res.layer)
    })
}

export {
    initInstance,
    renderBtn,
    renderBtns,
    renderConfig
}