class globalConfig {
    configUrl = 'EPSPlanet_SDK/config.json'
    instance: globalConfig | null = null
    constructor() {
        // this.instance = null
    }

    getInstance() {
        if (this.instance) {
            return this.instance
        } else {
            this.instance = new globalConfig()
            return this.instance
        }
    }

    setConfigUrl(url: string) {
        this.configUrl = url
    }

    async getConfig() {
        const res = await fetch(this.configUrl)
        const data = await res.json()
        return data
    }

}

let useConfig = new globalConfig()
let getConfig = () => useConfig.getConfig()
let setConfigUrl = (url: string) => useConfig.setConfigUrl(url)
export {
    globalConfig,
    useConfig,
    getConfig,
    setConfigUrl
} 
