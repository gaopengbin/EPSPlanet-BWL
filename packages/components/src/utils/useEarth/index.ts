import { emitter } from '../common';
import { useStore } from '../strore';

/**
 * 获取earth实例
 * @param containerId 容器id
 * @returns earth
 */
export function useEarth(containerId?: string) {
  const { setEarth, getEarth } = useStore();
  const earth = getEarth(containerId);
  if (earth) {
    return earth;
  } else {
    return new Promise((resolve, reject) => {
      emitter.on('earthReady', (e: any) => {
        setEarth(e._viewer.container.id, e);
        resolve(e);
      });
    });
  }
}

export function useEarthAsync(containerId?: string) {
  const { setEarth, getEarth } = useStore();
  const earth = getEarth(containerId);
  if (earth) {
    return Promise.resolve(earth);
  } else {
    return new Promise((resolve, reject) => {
      emitter.on('earthReady', (e: any) => {
        setEarth(e._viewer.container.id, e);
        resolve(e);
      });
    });
  }
}

/**
 * 获取已加载的earth列表
 * @returns earth列表Map对象
 */
export function getEarthList() {
  const { getEarthList } = useStore();
  return getEarthList();
}
