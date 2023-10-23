<template>
    <div class="simpleQuery">
        <el-form>
            <el-form-item label="图层">
                <el-select v-model="layerGuid" placeholder="请选择" @change="changeLayer">
                    <el-option v-for="item in layers" :key="item.xbsjGuid" :label="item.name"
                        :value="item.xbsjGuid"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="字段">
                <el-select v-model="field" placeholder="请选择" @change="changeField">
                    <el-option v-for="item in fields" :key="item" :label="item" :value="item"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="字段值">
                <el-input v-model="searchValue" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">查询</el-button>
                <el-button type="primary" @click="flyTo">定位</el-button>
                <el-button type="primary" @click="clearResult">清除</el-button>
                <!-- <el-button>Cancel</el-button> -->
            </el-form-item>
        </el-form>
        <div class="result">
            <el-pagination v-show="pageList.length" small layout="prev, pager, next" :page-size="1" :total="pageList.length"
                @current-change="currentChange" />
            <el-table :data="tableData" border height="350">
                <el-table-column prop="name" label="属性名" />
                <el-table-column prop="value" label="属性值" />
            </el-table>
        </div>
    </div>
</template>
<script>
import { useEarth } from "@epsplanet/components"
import axios from "axios"
import { flyTo as flyToTarget } from './flyTo'
import { PickVector } from './pickVector'
export default {
    name: 'query',
    data() {
        return {
            layers: [],
            layerGuid: '',
            fields: [],
            field: '',
            searchValue: '',
            pageList: [],
            tableData: [],

        }
    },
    methods: {
        getLayers() {
            this._earth._xbsjImageries.forEach((item) => {
                if (item.xbsjImageryProvider.type == 'WebMapServiceImageryProvider') {
                    this.layers.push(item.toJSON())
                }
            })
            console.log(this.layers)
        },
        changeLayer(l) {
            console.log(l)
            this.layer = this._earth.getObject(l).toJSON()
            console.log(this.layer)
            this.getFields()
        },
        getFields() {
            let wmsUrl = this.layer.xbsjImageryProvider.WebMapServiceImageryProvider.url
            let layerName = this.layer.xbsjImageryProvider.WebMapServiceImageryProvider.layers
            this.wmsUrl = wmsUrl
            this.layerName = layerName
            let url = `${wmsUrl}?service=WFS&version=1.1.0&request=DescribeFeatureType&typeName=${layerName}&outputFormat=application/json`
            axios.get(url).then((res) => {
                console.log(res)
                let fields = res.data.featureTypes[0].properties
                fields.forEach((item) => {
                    this.fields.push(item.name)
                })
            })
        },
        changeField(f) {
            console.log(f)
        },
        search() {
            let url = `${this.wmsUrl}?service=WFS&version=1.1.0&request=GetFeature&typeName=${this.layerName}&outputFormat=application/json&cql_filter=`;
            if (this.field && this.searchValue) {
                url += `${this.field} LIKE '%${this.searchValue}%'`
            } else {
                url += `1=1`
            }
            axios.get(encodeURI(url)).then((res) => {
                console.log(res)
                this.pageList = res.data.features
                this.currentChange(1)
            })
        },
        currentChange(cur) {
            if (this.pageList.length == 0) return
            let feature = this.pageList[cur - 1];
            this.currentGeometry = feature
            if (feature.czmObject) {
                // feature = feature.czmObject
                let table = []
                Object.keys(feature.czmObject).map(key => {
                    table.push({
                        name: key,
                        value: feature.czmObject[key]
                    })
                })
                this.tableData = table;
            } else {
                this.pickVector.highLight(feature)
                let table = []
                Object.keys(feature.properties).map(key => {
                    table.push({
                        name: key,
                        value: feature.properties[key]
                    })
                })
                this.tableData = table;
            }
        },
        flyTo() {
            if (this.currentGeometry) {
                if (this.currentGeometry.czmObject) {
                    this_earth.getObject(this.currentGeometry.czmObject.xbsjGuid).flyTo()
                } else {
                    if (this.pickVector) {
                        if (this.pickVector.hightLightGeoJSON) {
                            flyToTarget(this._earth, this.pickVector.hightLightGeoJSON.entities.values)
                        }
                        if (this.pickVector.highLightMultiPolygon.length > 0) {
                            let positions = []
                            this.pickVector.highLightMultiPolygon.forEach(item => {
                                positions.push(
                                    ...Cesium.Cartesian3.fromRadiansArray(item.positions)
                                )
                            })
                            let boundingSphere = Cesium.BoundingSphere.fromPoints(positions)
                            this._earth.czm.camera.flyToBoundingSphere(boundingSphere)
                        }
                        else if (this.pickVector.highLightPolygon.positions?.length > 0) {
                            this.pickVector.highLightPolygon.flyTo()
                        } else if (this.pickVector.highLightPolyline.positions?.length > 0) {
                            this.pickVector.highLightPolyline.flyTo()
                        }
                        else if (this.pickVector.highLightPoint?.show) {
                            this._earth.czm.viewer.flyTo(this.pickVector.highLightPoint)
                        }
                    }
                }
            }
        },
        clearResult() {
            this.pageList = []
            this.tableData = []
            this.fields = []
            if (this.pickVector) {
                this.pickVector.clearHighLight()
            }
            this.layerGuid = ''
            this.field = ''
            this.searchValue = ''
        }
    },
    mounted() {
        console.log('query mounted');
        this._earth = useEarth();
        this.getLayers()
        this.pickVector = new PickVector(this._earth)
    },
    beforeDestroy() {
        console.log('query beforeDestroy');
        if (this.pickVector) {
            this.pickVector.destroy()
        }
        this.clearResult()  
    }
}
</script>
<style>
.simpleQuery {
    width: 300px;
    padding: 10px;
}
</style>