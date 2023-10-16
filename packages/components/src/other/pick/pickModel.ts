import axios, { CancelTokenSource } from "axios";

export class PickModel {
    earth: any;
    handler: any;
    layers: any[];
    servers: any[];
    pickedTileset: any;
    originColor = "";
    constructor(earth: any) {
        this.earth = earth
        this.handler = new Cesium.ScreenSpaceEventHandler(earth.czm.scene.canvas);
        this.layers = []
        axios
            .get("Epsplanet_Assets/widgets/pick/config.json")
            .then((res) => {
                // thisVue.serverURL = res.data.serverWfs;
                this.layers = res.data.layers;
            })
            .catch((err) => {
                // ElMessage.error("加载配置文件失败");
            });

        this.servers = []
        axios.get("Epsplanet_Assets/widgets/base/baseConfig.json").then(res => {
            this.servers = res.data.pick.vectorServers;
        })
    }
    /**
     * pick
     */
    public pick(callback) {
        // return new Promise(resolve => {
        this.handler.setInputAction(async (click) => {
            // this.pickedTileset.xbsjStyle = undefined
            // let position = this.earth.czm.viewer.scene.pickPosition(click.position)
            let pickObj = [this.earth.czm.viewer.scene.pick(click.position)]
            // let pickObj = this.earth.czm.viewer.scene.drillPick(click.position)
            if (pickObj.length == 0 || pickObj[0] == undefined) {
                // this.earth.sceneTree.$refs.pin1.czmObject.customProp = false;
                // return
                callback(null)
            }
            this.clearHighLight()
            let flag = false;
            let i = 0;
            do {
                let obj = pickObj[i];
                if (!obj) return
                let allowPicking = obj.tileset ? obj.tileset.xbsjTileset.allowPicking : undefined
                i++
                if (!Cesium.defined(obj) || !obj.getPropertyNames || !allowPicking) {
                    // this.earth.sceneTree.$refs.pin1.czmObject.customProp = false;
                    callback(null)
                } else {
                    // let times = 0
                    // let interval = setInterval(() => {
                    //     obj.show = !obj.show
                    //     times++
                    //     if (times >= 6) {
                    //         clearInterval(interval)
                    //         obj.show = true
                    //     }
                    // }, 300)
                    // let cartographic = Cesium.Cartographic.fromCartesian(position)
                    // this.earth.sceneTree.$refs.pin1.czmObject.position = [cartographic.longitude, cartographic.latitude, cartographic.height]
                    let tileset = obj.tileset.xbsjTileset
                    // this.pickedTileset = tileset;
                    this.pickedTileset = obj;
                    this.originColor = obj.color;
                    obj.color = Cesium.Color.AQUA.withAlpha(.5);
                    // let id = obj.getProperty('id')
                    // if (id) {
                    //     tileset.xbsjStyle = JSON.stringify({
                    //         color: {
                    //             conditions: [
                    //                 ["${id} === '" + id + "'", "rgb(0, 255, 255,1)"],
                    //                 // ["true", "rgba(255, 255, 255,1)"]
                    //             ]
                    //         }
                    //     });
                    // }
                    const layer: any = this.layers.find(
                        (el: any) => el.entityName === tileset.name
                    );
                    if (layer) {
                        const configList = Object.getOwnPropertyNames(layer.config);
                        configList.forEach((param) => (tileset[param] = layer.config[param]));
                        // 临时新增一个serviceName属性来传到requestURL里面
                        tileset.serviceName = layer.serviceName;
                        const rawId = obj.getProperty(tileset.entityId);
                        if (rawId && typeof rawId === "string") {
                            let id;
                            if (rawId.indexOf("{") !== -1) {
                                id = rawId.substring(rawId.indexOf("{"));
                            } else if (rawId.indexOf(":") !== -1) {
                                id = rawId.split(':')[1]
                            } else {
                                id = rawId;
                            }
                            const query = `${tileset.serverId}=%27${id}%27`;
                            const requestURL = this.getRequestURL(tileset, query);
                            if (requestURL) {
                                let newKeyMap: any = this.filterArr(tileset, tileset.keyMap);
                                axios
                                    .post(requestURL)
                                    .then((r) => {
                                        let features;
                                        if (
                                            r.status === 200 &&
                                            r.statusText === "OK" &&
                                            r.data.features
                                        ) {
                                            features = r.data.features;
                                            let pageList = this.getPageList(tileset, features, newKeyMap);
                                            callback({ propertyList: pageList, obj })
                                            // createInfoTable(thisVue.pageList[0]);
                                        } else {
                                            // ElMessage.error(
                                            //   "未查询到属性" + czmObject.serverId + "对应的值"
                                            // );
                                            simplePick()
                                            return;
                                        }
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        simplePick()
                                        //   ElMessage.error("查询出错");
                                    });
                            } else {
                                console.log("暂不支持此类型服务查询");
                                simplePick()
                                return;
                            }
                        } else {
                            console.log("未找到实体字段");
                            simplePick()
                            return;
                        }
                        flag = true
                    } else if (this.servers.length > 0) {
                        if (obj.getPropertyNames().length <= 2 && obj.getProperty('name') && obj.getProperty('name').indexOf('{') > -1) {
                            this.getPropFromServer(this.servers, obj).then(res => {
                                callback(res)
                            }).catch(err => {
                                console.log(err)
                                simplePick()
                            })
                        } else {
                            simplePick()
                        }
                    }
                    else {
                        simplePick()
                    }
                    function simplePick() {
                        let PropertyNames = obj.getPropertyNames()
                        let propertyList: any = []
                        PropertyNames.forEach(property => {
                            propertyList.push({
                                name: property,
                                value: obj.getProperty(property)
                            })
                        })
                        callback({ propertyList, obj })
                        flag = true
                    }
                }
            } while (!flag && i <= pickObj.length);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        // })
    }

    //针对管线模型的点和线进行属性查询
    getPipeProp(obj, serverurl) {
        return new Promise(async resolve => {
            try {
                let [type, featureGUID] = obj.getProperty('name').split(':')
                let lys = (await axios.get(serverurl + '?f=pjson')).data.layers;
                let ly_P = lys.find(ly => {
                    return (ly.name == type + '_P')
                })
                let ly_L = lys.find(ly => {
                    return (ly.name == type + '_L')
                })
                // console.log(ly_P, ly_L, type, featureGUID)
                axios.get(serverurl + '/find', {
                    params: {
                        searchText: featureGUID,
                        contains: true,
                        layers: ly_L.id,
                        f: 'pjson'
                    }
                }).then(res => {
                    if (res.data.results[0]) {
                        let attr = res.data.results[0].attributes
                        var result = Object.keys(attr).map(function (key) {
                            return {
                                name: key,
                                value: attr[key]
                            };
                        });
                        resolve({ propertyList: result, obj })
                    }
                })
                axios.get(serverurl + '/find', {
                    params: {
                        searchText: featureGUID,
                        contains: true,
                        layers: ly_P.id,
                        f: 'pjson'
                    }
                }).then(res => {
                    if (res.data.results[0]) {
                        let attr = res.data.results[0].attributes
                        var result = Object.keys(attr).map(function (key) {
                            return {
                                name: key,
                                value: attr[key]
                            };
                        });
                        resolve({ propertyList: result, obj })
                    }
                })
            } catch (error) {
                // console.log(error)
                // resolve(false)
            }

        })
    }

    // 判断响应是否包含需要的结果
    isDesiredResult(response: any): boolean {
        // 这里可以根据具体的逻辑进行判断
        console.log(response)
        if (response) {
            return true;
        } else {
            return false;
        }
    }

    getPropFromServer(urls, obj) {
        return new Promise(resolve => {
            // let urls = this.servers;
            // 创建一个数组，用来存放CancelTokenSource对象
            const sources: CancelTokenSource[] = [];
            // 创建一个数组，用来存放Promise对象
            const promises: Promise<any>[] = [];
            // 遍历urls数组，为每个url创建一个Promise和一个CancelTokenSource
            for (let url of urls) {
                // 创建CancelTokenSource对象
                const source = axios.CancelToken.source();
                // 将其添加到sources数组中
                sources.push(source);
                // 创建Promise对象，并将其添加到promises数组中
                promises.push(
                    this.getPipeProp(obj, url)
                );
            }

            // 使用Promise.race方法并发请求所有的url，并返回第一个完成的响应
            Promise.race(promises)
                .then((response) => {
                    // 如果响应包含需要的结果，则打印出来，并取消其他的请求
                    if (this.isDesiredResult(response)) {
                        resolve(response)
                        for (let source of sources) {
                            source.cancel();
                        }
                    }
                    // 否则继续等待其他的响应完成或失败
                })
                .catch((error) => {
                    // 如果发生错误，则打印出来，并取消其他的请求
                    console.error(error);
                    for (let source of sources) {
                        source.cancel();
                    }
                });
        })
    }

    clearHighLight() {
        if (this.pickedTileset) {
            // this.pickedTileset.xbsjStyle = undefined
            this.pickedTileset.color = this.originColor;
            this.pickedTileset = undefined;
            this.originColor = ""
        }
    }
    // 记录当前鼠标位置经纬度
    getMousePos = (czmObject) => {
        return {
            lng: (czmObject.xbsjPosition[0] * 180) / Math.PI,
            lat: (czmObject.xbsjPosition[1] * 180) / Math.PI,
        };
    };
    // 拼接查询字符串
    getRequestURL = (czmObject, query) => {
        let requestURL: string;
        let mousePos = this.getMousePos(czmObject);
        const url = czmObject.serverURL;
        if (czmObject.serverType === "arcgis_rest") {
            // arcgis server发布的服务查询
            const outFields =
                czmObject.outFields.length === 0
                    ? "*"
                    : "[" + czmObject.outFields + "]";
            requestURL = `
                    ${url}/query?where=${query}
                    &text=
                    &objectIds=
                    &time=
                    &geometry=
                    &geometryType=esriGeometryEnvelope
                    &inSR=
                    &spatialRel=esriSpatialRelIntersects
                    &relationParam=
                    &outFields=${outFields}
                    &returnGeometry=false
                    &maxAllowableOffset=
                    &geometryPrecision=
                    &outSR=
                    &returnIdsOnly=false
                    &returnCountOnly=false
                    &orderByFields=
                    &groupByFieldsForStatistics=
                    &outStatistics=
                    &returnZ=false
                    &returnM=false
                    &gdbVersion=
                    &returnDistinctValues=false
                    &f=json
                  `;
            return requestURL;
        } else if (czmObject.serverType === "geoserver") {
            requestURL = `
                      ${url}/wms?request=GetFeatureInfo
                      &service=WMS
                      &version=1.1.0
                      &layers=${czmObject.serviceName}
                      &styles=
                      &srs=epsg%3A4326
                      &bbox=${mousePos.lng - 0.1},${mousePos.lat - 0.1},${mousePos.lng + 0.1
                },${mousePos.lat + 0.1}
                      &width=101
                      &height=101
                      &query_layers=${czmObject.serviceName}
                      &info_format=application%2Fjson
                      &x=50
                      &y=50
                      &buffer=15
                      &cql_filter=${query}
                      `;
            return requestURL;
        } else return;
    };
    // 过滤字段，不包含filter字段且只保留outfields中的字段
    filterArr = (czmObject, arr) => {
        // let names = Object.getOwnPropertyNames(feature.properties)
        let newNames1 = arr.filter(
            (x) =>
                !czmObject.filter.some((item) =>
                    x instanceof Object ? x.attribute === item : x === item
                )
        );
        if (czmObject.outFields.length) {
            let newNames2 = newNames1.filter((x) =>
                czmObject.outFields.some((item) =>
                    x instanceof Object ? x.attribute === item : x === item
                )
            );
            return newNames2;
        }
        return newNames1;
    };
    // 将所有查询到的数据加入pageList
    getPageList = (czmObject, features, keyMap) => {
        let flag;
        const serverType = czmObject.serverType;
        // 根据服务类型不同，确定是用attributes还是properties来找属性
        const attrName =
            serverType === "arcgis_rest" ? "attributes" : "properties";
        const keys = this.filterArr(czmObject, Object.keys(features[0][attrName]));

        // keyMap中没有的字段仍然显示英文
        keys.forEach((key) => {
            flag = false;
            for (let i = 0; i < keyMap.length; i++) {
                const item = keyMap[i];
                if (item.attribute === key) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                keyMap.push({ attribute: key, alias: key });
            }
        });

        // 写入pageList
        let propList: any = []
        features.forEach((item) => {
            // let props: any = [];
            keyMap.forEach((key) => {
                propList.push({
                    name: key.alias,
                    value: item[attrName][key.attribute],
                });
            });
            // propList.push(props);
        });
        return propList
    };
    public destroy() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.destroy();
        this.clearHighLight();
    }
}