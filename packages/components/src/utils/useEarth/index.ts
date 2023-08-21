import { emitter } from '../common'

/**
 * 获取earth实例
 * @param containerId 容器id
 * @returns earth
 */
export function useEarth(containerId?: string) {
    return new Promise((resolve, reject) => {
        emitter.on('earthReady', earth => {
            resolve(earth)
        })
    })
}
