import * as turf from '@turf/turf'
import axios from 'axios';
import e2g from './esri2Geo';
let getSubLayer, baseUrl, access;
axios.get('Epsplanet_Assets/widgets/base/baseConfig.json').then(res => {
    getSubLayer = res.data.pick.getSubLayers;
    baseUrl = res.data.baseUrl;
    access = res.data.access;
})
export class PickVector {
    earth: any;
    handler: any;
    layers: any;
    hightLightGeoJSON: any;
    highLightPolygon: any;
    highLightMultiPolygon: any;
    pickList: any;
    highLightPolyline: any;
    highLightPoint: any;
    stopPick: boolean;
    constructor(earth: any) {
        this.earth = earth;
        this.handler = new Cesium.ScreenSpaceEventHandler(earth.czm.scene.canvas);
        this.stopPick = false;
        this.pickList = []
        this.highLightPolygon = new XE.Obj.Polygon(earth);
        this.highLightPolygon.show = false;
        this.highLightPolygon.ground = true;
        this.highLightPolygon.color = [0, 1, 1, 0.6];
        this.highLightPolygon.outline.color = [0, 0, 1, 1];
        this.highLightPolyline = new XE.Obj.Polyline(earth);
        this.highLightPolyline.show = false;
        this.highLightPolyline.width = 4;
        this.highLightPolyline.material.XbsjColorMaterial.color = [0, 1, 1, 1];
        this.highLightPolyline.ground = true;
        this.highLightPoint = earth.czm.viewer.entities.add({
            // name: e.Equipment_Name,
            position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
            point: {
                pixelSize: 15,
                color: Cesium.Color.AQUA,
                outlineWidth: 5,
                outlineColor: Cesium.Color.WHITE,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
        });
        this.highLightMultiPolygon = []
        // this.highLightPoint = new XE.Obj.Point(earth);
        // this.highLightPoint.show = false;
        // this.highLightPoint.ground = true;
    }

    getVectorLayers() {
        this.layers = [];
        this.earth._xbsjImageries.forEach(czmobj => {
            let layer = czmobj.toAllJSON()
            //先按影像类型，筛选出可识别矢量图层 和 show=true
            if (layer.xbsjImageryProvider.type != 'XbsjImageryProvider' && layer.show) {
                this.layers.push(layer)
            }
        })
        return this.layers
    }
    private clearHighLight() {
        this.highLightPolygon.positions = []
        this.highLightPolygon.holePositions = []
        this.highLightPolygon.show = false;
        this.highLightPolyline.positions = []
        this.highLightPolyline.show = false;
        this.highLightPoint.show = false;
        this.pickList = []
        this.highLightMultiPolygon.forEach(p => {
            p.destroy()
        })
        this.highLightMultiPolygon = []
        if (this.hightLightGeoJSON) {
            console.log(this.hightLightGeoJSON)
            this.earth.czm.viewer.dataSources.remove(this.hightLightGeoJSON)
        }
    }
    public async pick(polygon, where, callback) {
        // return new Promise(resolve => {
        this.clearHighLight()
        this.getVectorLayers()

        let positions: any = []

        if (polygon) {
            polygon.positions.forEach(p => {
                positions.push([
                    Cesium.Math.toDegrees(p[0]),
                    Cesium.Math.toDegrees(p[1])
                ])
            })
            positions.push(positions[0])
            let turlPolygon = turf.polygon([positions])
            //根据图层范围与拾取点是否相交进行一次筛选，大大减少了请求次数
            for (let i = 0; i < this.layers.length; i++) {
                const l = this.layers[i];
                let isCross = this.isCross(l, turlPolygon)
                if (isCross) {
                    //如果在范围内就可以进行查询了
                    let ready1, ready2;
                    if (l.xbsjImageryProvider.type == 'ArcGisMapServerImageryProvider') {
                        ready1 = await this.arcgisQuery(l, [positions], where)
                    } else if (l.xbsjImageryProvider.type == 'WebMapTileServiceImageryProvider') {
                        ready2 = await this.geoserverWmts(l, [positions])
                    }
                }
            }
            callback(this.pickList)
        } else {
            for (let i = 0; i < this.layers.length; i++) {
                const l = this.layers[i];
                let ready1, ready2;
                if (l.xbsjImageryProvider.type == 'ArcGisMapServerImageryProvider') {
                    ready1 = await this.arcgisQuery(l, false, where)
                } else if (l.xbsjImageryProvider.type == 'WebMapTileServiceImageryProvider') {
                    ready2 = await this.geoserverWmts(l, false)
                }

            }
            console.log(this.pickList)
            callback(this.pickList)
        }



    }

    private arcgisQuery(layer, bufferCoordinates, where) {
        console.log('开始arcgis查询')
        return new Promise(async (resolve, reject) => {
            // try {
            let url = layer.xbsjImageryProvider.ArcGisMapServerImageryProvider.url;

            if (url.includes('?f=pjson')) {
                url = url.split('?f=pjson')[0]
            }
            let result = await Cesium.Resource.fetchJson(url + '?f=pjson');

            for (let i = 0; i < result.layers.length; i++) {
                let layerInfo = result.layers[i];
                let requestUrl = url + '/' + i + '/query';
                let params = {
                    outFields: "*",
                    returnGeometry: true,
                    spatialRel: "esriSpatialRelIntersects",
                    geometryType: "esriGeometryPolygon",
                    where: where,
                    f: "pjson",
                    geometry: { rings: bufferCoordinates },
                    inSR: { "wkid": 4326, "latestWkid": 4326 },
                    outSR: { "wkid": 4326, "latestWkid": 4326 },
                }

                let urlEncode;
                if (bufferCoordinates) {
                    urlEncode = requestUrl +
                        "?geometry=" + JSON.stringify(params.geometry) +
                        "&inSR=" + JSON.stringify(params.inSR) +
                        "&outSR=" + JSON.stringify(params.outSR) +
                        '&outFields=*&f=pjson&returnGeometry=' + params.returnGeometry +
                        '&spatialRel=' + params.spatialRel +
                        '&geometryType=' + params.geometryType +
                        '&where=' + params.where;
                } else {
                    urlEncode = requestUrl +
                        "?where=" + params.where +
                        "&inSR=" + JSON.stringify(params.inSR) +
                        "&outSR=" + JSON.stringify(params.outSR) +
                        '&outFields=*&f=pjson&returnGeometry=' + params.returnGeometry +
                        '&spatialRel=' + params.spatialRel
                }

                try {
                    let res = await axios.get(encodeURI(urlEncode))
                    if (res.data.features.length > 0) {
                        e2g.toGeoJSON(res.data, (err, geojson) => {
                            if (err) {
                                console.log(err)
                            } else {
                                // this.highLight(geojson)
                                this.pickList.push(...geojson.features)
                            }
                        })
                    }
                } catch (error) {
                    console.log(error)
                }


            }
            resolve(true)
            // } catch (error) {
            //     console.log(error)
            //     resolve(false)
            // }
        })
    }

    private geoserverWmts(layer, bufferCoordinates) {
        return new Promise(async resolve => {
            debugger
            let layerInfo = (await axios.get(baseUrl + getSubLayer + layer.customProp + '?access=' + access)).data.data
            let sublayer = layerInfo.layerNames.toString();
            let url = layer.xbsjImageryProvider.WebMapTileServiceImageryProvider.url;
            url = url.split('gwc/')[0];
            let layers = layer.xbsjImageryProvider.WebMapTileServiceImageryProvider.layer;
            // let workspace = layers.split(':')[0];
            let workspace = layerInfo.workspace;
            // let layerName = layers.split(':')[1];
            let bufferStr = this.pointsToDegreesArray(bufferCoordinates[0])
            //先查询获取图层中geometry字段的名称，很重要，名称错误会导致查询失败，而且这个字段名发布出来还不一样
            let geometryField = 'the_geom'
            try {
                let DescribeFeatureType = (await axios.get(url + workspace + "/ows?service=WFS&version=1.0.0&request=DescribeFeatureType&typeName=" + sublayer + "&maxFeatures=50&outputFormat=application%2Fjson")).data.featureTypes[0].properties;
                geometryField = DescribeFeatureType.find(e => e.type.includes('gml:')).name;
            } catch (error) {
                geometryField = 'the_geom'
            }



            let wfsUrl = url + workspace + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + sublayer + "&maxFeatures=10&outputFormat=json&srsName=EPSG:4326&filter=";
            let filter = `<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml"><Intersects><PropertyName>${geometryField}</PropertyName><gml:Polygon srsName="EPSG:4326"><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>${bufferStr}</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></Intersects></Filter>`

            let res = await axios.get(wfsUrl + encodeURI(encodeURI(filter)))
            // this.highLight(res.data)
            this.pickList.push(...res.data.features)
            resolve(true)
        })


    }

    drawMultiPolygon(coordinates) {
        let multiPolygonCollection: any = []
        coordinates.forEach(polygon => {
            if (polygon.length > 1) {
                let coordinates: any = []
                let hole: any = []
                coordinates = polygon[0]
                hole = polygon[1].concat(polygon[1])
                let holePositions: any = [];
                hole.forEach((p) => {
                    holePositions.push(
                        turf.degreesToRadians(p[0]),
                        turf.degreesToRadians(p[1])
                    );
                });
                let positions: any = [];
                coordinates.forEach((p) => {
                    positions.push(
                        turf.degreesToRadians(p[0]),
                        turf.degreesToRadians(p[1])
                    );
                });
                console.log('hight计算完')
                let polygonObj = new XE.Obj.Polygon(this.earth);
                polygonObj.positions = positions;
                polygonObj.holePositions = holePositions
                polygonObj.show = false;
                polygonObj.ground = true;
                polygonObj.color = [0, 1, 1, 0.6];
                polygonObj.outline.color = [0, 0, 1, 1];
                multiPolygonCollection.push(polygonObj)
            } else {
                let coordinates = polygon[0];
                let positions: any = [];
                coordinates.forEach((p) => {
                    positions.push(
                        turf.degreesToRadians(p[0]),
                        turf.degreesToRadians(p[1])
                    );
                });
                console.log('hight计算完')
                let polygonObj = new XE.Obj.Polygon(this.earth);
                // let config = {
                //     xbsjType: 'Polygon',
                //     positions: positions
                // }
                // polygonObj.xbsjFromJSON(config)
                polygonObj.positions = positions;
                polygonObj.show = true;
                polygonObj.ground = true;
                polygonObj.color = [0, 1, 1, 0.6];
                polygonObj.outline.color = [0, 0, 1, 1];
                multiPolygonCollection.push(polygonObj)
                console.log('huizhiwan')
            }
        })
        return multiPolygonCollection
    }

    public highLight(geojson) {
        this.clearHighLight()

        if (geojson.geometry.type == 'Point') {
            this.highLightPoint.position = Cesium.Cartesian3.fromDegrees(...geojson.geometry.coordinates)
            this.highLightPoint.show = true;
        } else {
            Cesium.GeoJsonDataSource.load(geojson, {
                stroke: Cesium.Color.BLUE,
                fill: Cesium.Color.AQUA.withAlpha(0.8),
                strokeWidth: 3,
                clampToGround: true
            }).then(ds => {
                this.hightLightGeoJSON = ds
                this.earth.czm.viewer.dataSources.add(ds)
            })
        }

        return
        console.log('hight')
        this.clearHighLight()
        if (geojson.geometry.type == 'Polygon') {
            if (geojson.geometry.coordinates.length > 1) {
                let coordinates: any = []
                let hole: any = []
                coordinates = geojson.geometry.coordinates[0]
                hole = geojson.geometry.coordinates[1].concat(geojson.geometry.coordinates[1])
                let holePositions: any = [];
                hole.forEach((p) => {
                    holePositions.push(
                        turf.degreesToRadians(p[0]),
                        turf.degreesToRadians(p[1])
                    );
                });
                let positions: any = [];
                coordinates.forEach((p) => {
                    positions.push(
                        turf.degreesToRadians(p[0]),
                        turf.degreesToRadians(p[1])
                    );
                });
                console.log('hight计算完')
                this.highLightPolygon.holePositions = holePositions
                this.highLightPolygon.positions = positions
                this.highLightPolygon.show = true
            } else {
                let coordinates = turf.coordAll(geojson);
                let positions: any = [];
                coordinates.forEach((p) => {
                    positions.push(
                        turf.degreesToRadians(p[0]),
                        turf.degreesToRadians(p[1])
                    );
                });
                console.log('hight计算完')
                this.highLightPolygon.positions = positions

                this.highLightPolygon.show = true
            }
        } else if (geojson.geometry.type == 'MultiPolygon') {
            let multiPolygonCollection = this.drawMultiPolygon(geojson.geometry.coordinates)
            this.highLightMultiPolygon = multiPolygonCollection
            // if (geojson.geometry.coordinates[0].length > 1) {
            //     let coordinates: any = []
            //     let hole: any = []
            //     coordinates = geojson.geometry.coordinates[0][0]
            //     hole = geojson.geometry.coordinates[0][1]
            //     let holePositions: any = [];
            //     hole.forEach((p) => {
            //         holePositions.push(
            //             turf.degreesToRadians(p[0]),
            //             turf.degreesToRadians(p[1])
            //         );
            //     });
            //     let positions: any = [];
            //     coordinates.forEach((p) => {
            //         positions.push(
            //             turf.degreesToRadians(p[0]),
            //             turf.degreesToRadians(p[1])
            //         );
            //     });
            //     this.highLightPolygon.holePositions = holePositions
            //     this.highLightPolygon.positions = positions

            //     this.highLightPolygon.show = true
            // } else {
            //     let coordinates = turf.coordAll(geojson);
            //     let positions: any = [];
            //     coordinates.forEach((p) => {
            //         positions.push(
            //             turf.degreesToRadians(p[0]),
            //             turf.degreesToRadians(p[1])
            //         );
            //     });

            //     this.highLightPolygon.positions = positions

            //     this.highLightPolygon.show = true
            // }
        }
        else if (geojson.geometry.type == 'LineString' || geojson.geometry.type == 'MultiLineString') {
            let coordinates = turf.coordAll(geojson);
            let positions: any = [];
            coordinates.forEach((p) => {
                positions.push([
                    turf.degreesToRadians(p[0]),
                    turf.degreesToRadians(p[1]),
                    0
                ]
                );
            });

            this.highLightPolyline.positions = positions

            this.highLightPolyline.show = true
        } else if (geojson.geometry.type == 'Point') {
            this.highLightPoint.position = Cesium.Cartesian3.fromDegrees(...geojson.geometry.coordinates)
            this.highLightPoint.show = true;
        }

    }
    private Cartesian2ToWGS84(viewer, position) {
        var ray = viewer.camera.getPickRay(position);
        var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let lon = Cesium.Math.toDegrees(cartographic.longitude)
        let lat = Cesium.Math.toDegrees(cartographic.latitude)
        let alt = cartographic.height
        return { lon: lon, lat: lat, alt: alt }
    }
    private Buffer(mode, params) {
        let position = params.position;
        let unit = params.unit;
        let value = params.value;
        if (mode.toLowerCase() == 'point') {
            let pointF = turf.point(position);
            let buffered = turf.buffer(pointF, value, { units: unit });
            let coordinates = buffered.geometry.coordinates;
            let points = coordinates[0];
            let degreesListStr = this.pointsToDegreesArray(points);
            return { buffered, coordinates }
        } else if (mode.toLowerCase == 'polyline') {

        } else if (mode.toLowerCase == 'polygon') {

        }

    }
    private pointsToDegreesArray(points) {
        let degreesArray = "";
        points.map(item => {
            degreesArray += item[0] + "," + item[1] + " "
        });
        return degreesArray;
    }

    private isCross(layer, buffer) {
        if (!layer.rectangle) return false
        let extent = layer.rectangle.map(p => p = p * 180 / Math.PI)
        let polygon0 = turf.polygon([[
            [extent[0], extent[1]],
            [extent[0], extent[3]],
            [extent[2], extent[3]],
            [extent[2], extent[1]],
            [extent[0], extent[1]],
        ]])
        let polygon1 = buffer;
        // Cesium.GeoJsonDataSource.load(polygon0).then(ds => {
        //     this.earth.czm.viewer.dataSources.add(ds)
        // })
        // Cesium.GeoJsonDataSource.load(polygon1).then(ds => {
        //     this.earth.czm.viewer.dataSources.add(ds)
        // })

        let notJoint = turf.booleanDisjoint(polygon0, polygon1)
        // let isCross = turf.booleanCrosses(polygon0, polygon1)
        return !notJoint
    }

    public destroy() {
        this.clearHighLight()
        this.earth.czm.viewer.entities.remove(this.highLightPoint)
        this.highLightPolyline.destroy()
        this.highLightPolygon.destroy()
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.destroy();
    }
}