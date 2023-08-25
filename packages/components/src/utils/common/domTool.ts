import { useEarth } from "../useEarth";

export function changeBtnState(className: String, state: boolean): void {
    if (!className) return
    let app: any = document.getElementById('app')
    let theme = app.getAttribute('data-sunwayTheme')
    let el: any = document.getElementsByClassName(
        "epsplanet-button " + className
    )[0].children[0];
    if (state) {

        el.style.color = "aqua";
    } else {
        if (theme == 'dark') {
            el.style.color = "aliceblue";
        } else {
            el.style.color = "";
        }

    }
}

/**
  * 获取元素范围边界
  * @param ele 
  */
export function getElementBounds(ele: HTMLElement) {
    if (!ele) return null;
    const rect = ele.getBoundingClientRect();

    const top = document.documentElement.clientTop;

    const left = document.documentElement.clientLeft;

    return {

        top: rect.top - top,
        left: rect.left - left,
        bottom: rect.bottom - top,
        right: rect.right - left,
        width: rect.width,
        height: rect.height
    }
}

export function panelDock(type: string, ele: HTMLElement, earth: any) {
    let bounds = getElementBounds(ele);
    let mapBounds = getElementBounds(earth._viewer.container)
    if (!bounds || !mapBounds) return
    switch (type.toLowerCase()) {
        case 'left':
            ele.style.top = mapBounds.top + 'px'
            ele.style.left = '0px'
            ele.style.height = mapBounds.height + 'px'
            changeMapSize(earth, 'margin-left', bounds.width + 'px')
            break;
        case 'bottom':
            ele.style.left = mapBounds.left + 'px'
            ele.style.bottom = '0px'
            ele.style.width = mapBounds.width + 'px'
            ele.style.width = mapBounds.width + 'px'
            // changeMapSize(earth, 'margin-bottom', bounds.height + 'px')
            changeMapSize(earth, 'height', `calc(100% - ${bounds.height}px)`)
            break;
        default:
            break;
    }
}

export async function panelDockCollapse(type: string, ele: HTMLElement, isCollapse: boolean) {
    let earth = await useEarth();
    if (isCollapse) {
        expand(type, ele, earth)
    } else {
        collapse(type, ele, earth)
    }
}
function expand(type: string, ele: HTMLElement, earth: any) {
    let bounds = getElementBounds(ele);
    let mapBounds = getElementBounds(earth._viewer.container)
    if (!bounds || !mapBounds) return
    switch (type.toLowerCase()) {
        case 'left':
            ele.style.top = mapBounds.top + 'px'
            ele.style.left = '0px'
            ele.style.height = mapBounds.height + 'px'
            changeMapSize(earth, 'margin-left', bounds.width + 'px')
            changeMapSize(earth, 'width', 'auto')
            break;
        case 'bottom':
            ele.style.left = mapBounds.left + 'px'
            ele.style.bottom = '0px'
            ele.style.width = mapBounds.width + 'px'
            changeMapSize(earth, 'height', `calc(100% - ${bounds.height}px)`)
            break;

        default:
            break;
    }
}
function collapse(type: string, ele: HTMLElement, earth: any) {
    let bounds = getElementBounds(ele);
    let mapBounds = getElementBounds(earth._viewer.container)
    if (!bounds || !mapBounds) return
    switch (type.toLowerCase()) {
        case 'left':
            // ele.style.top = mapBounds.top + 'px'
            ele.style.left = - bounds.width + 'px'
            // ele.style.height = mapBounds.height + 'px'
            changeMapSize(earth, 'margin-left', '0px')
            changeMapSize(earth, 'width', '100%')
            break;
        case 'bottom':
            // ele.style.left = mapBounds.left + 'px'
            ele.style.bottom = -bounds.height + 'px'
            ele.style.top = 'auto'
            changeMapSize(earth, 'height', '100%')
            break;

        default:
            break;
    }
}
/**
 * 调整地图容器尺寸
 * @param earth
 */
export function changeMapSize(earth: any, mode: any, size: any) {
    let container = earth._viewer.container;
    // container.style.width = 'auto'
    container.style[mode] = size
}

export async function resizeMapSize(earth?: any) {
    if (!earth) {
        earth = await useEarth();
        if (!earth) return
    }

    let container = earth._viewer.container;
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.margin = '0'

}