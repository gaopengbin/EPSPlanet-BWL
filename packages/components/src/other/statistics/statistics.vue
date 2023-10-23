<template>
    <div class="query">
        <el-form ref="form" label-width="100px" :inline="false" class="queryForm">
            <el-form-item label="查询字段">
                <el-autocomplete v-model="data.queryField" :fetch-suggestions="querySearch" clearable
                    class="inline-input w-50" placeholder="输入查询字段" @select="handleSelectQuery" />
                <el-checkbox v-model="data.isQueryPlot" label="检索标绘" size="large" />
            </el-form-item>
            <el-form-item label="查询字段值" class="queryField">
                <el-input v-model="data.queryValue" placeholder="输入查询字段值" maxlength="15" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="统计字段">
                <el-autocomplete v-model="data.statisticField" :fetch-suggestions="querySearch" clearable
                    class="inline-input w-50" placeholder="输入统计字段" @select="handleSelectStat" />
            </el-form-item>
            <el-form-item label="统计方式">
                <el-radio-group v-model="data.statisticWay">
                    <el-radio label="count">数量</el-radio>
                    <el-radio label="sum">求和</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-button @click="drawPolygon">绘制面</el-button>
        <el-button @click="clearPolygon">清除面</el-button>
        <el-button @click="startQuery">开始统计</el-button>
        <el-button @click="clearQuery">清除统计</el-button>
        <!-- <el-button @click="queryPlots">查询标绘</el-button> -->
        <el-button class="export" @click="exportExcel" v-show="data.currentTab == '统计结果'">导出表格</el-button>
        <el-icon class="showEchart" color="gray" title="饼图" @click="showEchart" v-show="data.currentTab == '统计结果'">
            <PieChart />
        </el-icon>
        <!-- <el-button class="export" @click="showEchart" v-show="data.currentTab == '统计结果'">饼图</el-button> -->
        <el-button class="flyto" @click="flyTo" v-show="data.currentTab == '检索详情'">定位范围</el-button>
        <el-tabs type="border-card" v-loading="data.loading" v-model="data.currentTab">

            <el-tab-pane label="统计结果" name="统计结果">
                <el-table :data="data.tableList" border height="350" id="resTable">
                    <el-table-column v-for="item in data.sTableHeader" :prop="item.prop" :label="item.label" />
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="检索详情" name="检索详情">
                <el-pagination v-show="data.pageList.length" small layout="prev, pager, next" :page-size="1"
                    :total="data.pageList.length" @current-change="currentChange" />
                <el-table :data="data.tableData" border height="350">
                    <el-table-column prop="name" label="属性名" />
                    <el-table-column prop="value" label="属性值" />
                </el-table>

            </el-tab-pane>
        </el-tabs>

        <!-- <el-table :data="data.tableList" border height="350">
            <el-table-column v-for="item in data.fields" :prop="item.field" :label="item.field" />
        </el-table> -->
    </div>
</template>



<script setup>
import { onMounted, reactive, toRefs, onBeforeUnmount, h } from 'vue'
import { PickVector } from './pickVector'
import { useEarth, usePanel, haveRendered } from '../../utils';
import axios from 'axios'
import htmlToExcel from './exportExcel'
import { queryPlot } from './queryPlot'
import { flyTo as flyToTarget } from './flyTo'
import Pie from './pie.vue'
defineOptions({ name: 'EpsplanetStatistics' });
const data = reactive({
    pageList: [],
    tableData: [],
    queryField: '',
    statisticField: '',
    queryValue: '',
    fields: [],
    tableList: [],//横向表格
    statisticWay: 'count',
    queryFieldType: '',
    statisticFieldType: '',
    isQueryPlot: false,
    currentGeometry: null,
    loading: false,
    currentTab: '统计结果',
    sTableHeader: [
        {
            prop: 'name',
            label: '统计字段'
        },
        {
            prop: 'count',
            label: '统计结果'
        }
    ]

})
let earth, pickVector, polygon;
onMounted(async () => {
    earth = useEarth();
    pickVector = new PickVector(earth)
    getFields()
})

const exportExcel = () => {
    htmlToExcel.getExcel('#resTable', '统计结果')
}

let widget;

const showEchart = () => {
    let hrd = haveRendered(h(Pie))
    if (hrd) {
        widget = hrd
    } else {
        widget = usePanel(
            {
                title: "统计饼图",
                type: "panel",
                panel: {
                    position: { top: 300, left: 300 },
                    size: { width: 400, height: 400 },
                },
                param: {
                    data: data.tableList,
                    defaultProps: {
                        name: data.statisticField,
                        value: data.statisticWay
                    }
                }
            },
            null,
            h(Pie)
        )
    }

}

const drawPolygon = () => {
    if (polygon) {
        polygon.creating = true
    } else {
        polygon = new XE.Obj.Plots.GeoPolygon(earth)
        polygon.creating = true
    }
}

const clearPolygon = () => {
    if (polygon) {
        polygon.destroy()
        polygon = null
    }
}

const queryPlots = () => {
    let res = queryPlot(earth, { field: 'name', value: data.queryValue })
}

// 开始检索统计
const startQuery = () => {
    data.loading = true
    let where = ''
    if (data.queryField == '' || data.queryValue == '') {
        where = '1=1'
    } else {
        if (data.queryFieldType == 'esriFieldTypeString') {
            where = `${data.queryField} like '%${data.queryValue}%'`
        } else if (data.queryFieldType == 'esriFieldTypeInteger' || data.queryFieldType == 'esriFieldTypeDouble' || data.queryFieldType == 'esriFieldTypeSingle') {
            where = `${data.queryField}=${data.queryValue}`
        } else if (data.queryFieldType == 'esriFieldTypeDate') {
            where = `${data.queryField}='${data.queryValue}'`
        } else if (data.queryFieldType == 'esriFieldTypeOID') {
            where = `${data.queryField}=${data.queryValue}`
        } else {
            where = `${data.queryField}='${data.queryValue}'`
        }
    }
    let queryPlotRes = []
    if (data.isQueryPlot) {
        queryPlotRes = queryPlot(earth, { field: 'name', value: data.queryValue })
        data.pageList = queryPlotRes
        currentChange(1)
        data.loading = false
    } else {
        pickVector.pick(polygon, where, res => {
            formatTableListData(res)
            data.pageList = res
            // data.pageList = data.pageList.concat(queryPlotRes)
            currentChange(1)
            data.loading = false
        })
    }

    data.sTableHeader = [
        {
            prop: data.statisticField,
            label: data.statisticField ? data.statisticField : '统计字段'
        },
        {
            prop: data.statisticWay,
            label: data.statisticWay == 'count' ? '数量' : '总和'
        }
    ]



}

//这里做了统计的功能
const formatTableListData = (res) => {
    let tableList = []
    res.forEach(item => {
        let obj = {}
        Object.keys(item.properties).map(key => {
            obj[key] = item.properties[key]
        })
        tableList.push(obj)
    })
    // data.tableList = tableList
    let sum = 0
    let result = tableList.reduce((prev, cur) => {
        let index = prev.findIndex(item => item[data.statisticField] == cur[data.statisticField])
        if (index == -1) {
            if (cur[data.statisticField]) {
                if (data.statisticWay == 'count') {
                    cur.count = 1
                } else {
                    if (typeof cur[data.statisticField] == 'number') {
                        sum += cur[data.statisticField]
                    }
                }
                prev.push(cur)
            }

        } else {
            if (data.statisticWay == 'count') {
                if (!prev[index].count) prev[index].count = 1
                else prev[index].count++
                // prev[index].count++
            } else {
                // if (!prev[index].sum) prev[index].sum = cur[data.statisticField]
                // else prev[index].sum += cur[data.statisticField]
                if (typeof cur[data.statisticField] == 'number') {
                    sum += cur[data.statisticField]
                }
            }
        }
        return prev
    }, [])
    if (data.statisticWay == 'sum') {
        data.tableList = [
            {
                [data.statisticField]: data.statisticField + '总和',
                sum: sum
            }
        ]
    } else {
        data.tableList = result
    }
    if (widget) {
        widget.getComponent().then(comp => {
            comp._.exposed.init(data.tableList, {
                name: data.statisticField,
                value: data.statisticWay
            })
        })
    }

}

// 获取所有图层的字段
const getFields = () => {
    let layers = pickVector.getVectorLayers()
    layers.forEach(layer => {
        if (layer.show == false) return
        let url = layer.xbsjImageryProvider.ArcGisMapServerImageryProvider.url
        axios.get(url + '?f=pjson').then(res => {
            res.data.layers?.forEach(async l => {
                let layerJson = await axios(url + '/' + l.id + '?f=pjson')
                for (let i = 0; i < layerJson.data.fields.length; i++) {
                    const item = layerJson.data.fields[i];
                    if (data.fields.findIndex(e => e.field == item.name) == -1) {
                        data.fields.push({
                            value: item.alias,
                            field: item.name,
                            type: item.type
                        })
                    }
                }
            })
        })
    })
}

// 字段输入时联想
const querySearch = (queryString, cb) => {
    const results = queryString
        ? data.fields.filter(createFilter(queryString))
        : data.fields
    // call callback function to return suggestions
    // console.log(results)
    cb(results)
}
// 字段输入时联想
const createFilter = (queryString) => {
    return (res) => {
        return (
            res.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
    }
}
// 从联想词中选择检索字段
const handleSelectQuery = (item) => {
    data.queryFieldType = item.type
}
// 从联想词中选择统计字段
const handleSelectStat = (item) => {
    data.statisticFieldType = item.type
}

// 检索详情翻页
const currentChange = (cur) => {
    if (data.pageList.length == 0) return
    let feature = data.pageList[cur - 1];
    data.currentGeometry = feature
    if (feature.czmObject) {
        // feature = feature.czmObject
        let table = []
        Object.keys(feature.czmObject).map(key => {
            table.push({
                name: key,
                value: feature.czmObject[key]
            })
        })
        data.tableData = table;
    } else {
        pickVector.highLight(feature)
        let table = []
        Object.keys(feature.properties).map(key => {
            table.push({
                name: key,
                value: feature.properties[key]
            })
        })
        data.tableData = table;
    }

};

const flyTo = () => {
    if (data.currentGeometry) {
        if (data.currentGeometry.czmObject) {
            earth.getObject(data.currentGeometry.czmObject.xbsjGuid).flyTo()
        } else {
            if (pickVector) {

                if (pickVector.hightLightGeoJSON) {
                    flyToTarget(earth, pickVector.hightLightGeoJSON.entities.values)
                }

                if (pickVector.highLightMultiPolygon.length > 0) {
                    let positions = []
                    pickVector.highLightMultiPolygon.forEach(item => {
                        positions.push(
                            ...Cesium.Cartesian3.fromRadiansArray(item.positions)
                        )
                    })
                    let boundingSphere = Cesium.BoundingSphere.fromPoints(positions)
                    earth.czm.camera.flyToBoundingSphere(boundingSphere)
                }
                else if (pickVector.highLightPolygon.positions?.length > 0) {
                    pickVector.highLightPolygon.flyTo()
                } else if (pickVector.highLightPolyline.positions?.length > 0) {
                    pickVector.highLightPolyline.flyTo()
                }
                else if (pickVector.highLightPoint?.show) {
                    earth.czm.viewer.flyTo(pickVector.highLightPoint)

                }
            }
        }
    }
}

const clearQuery = () => {
    data.pageList = []
    data.tableData = []
    data.tableList = []
    data.currentGeometry = null
    if (pickVector) {
        pickVector.clearHighLight()
    }
    data.queryField = ''
    data.statisticField = ''
    data.queryValue = ''
    data.statisticWay = 'count'
    data.queryFieldType = ''
    data.statisticFieldType = ''
    data.isQueryPlot = false
    data.currentTab = '统计结果'
    if (polygon) {
        polygon.destroy()
        polygon = null
    }
}

onBeforeUnmount(() => {
    if (pickVector) {
        pickVector.destroy()
    }
    clearQuery()
})


</script>

<style lang="scss" scoped>
.query {
    width: 500px;


    .el-checkbox {
        margin-left: 20px;
    }

    .queryForm {
        width: 420px;
    }

    .queryField {
        width: 292px;
    }

    .el-tabs {
        margin-top: 10px;
        margin-left: 10px;
    }

    .export,
    .flyto {
        position: relative;
        top: 46px;
        right: -16px;
        z-index: 9;
    }

    .showEchart {
        position: relative;
        top: 50px;
        right: 100px;
        z-index: 9;

        &:hover {
            cursor: pointer;
            color: aqua;
        }
    }
}
</style>