<template>
    <div class="epsplanet-panel-base plotManager">
        <div class="pointTable">
            <div class="typeSelect" v-show="showTypeSelect">
                <button @click="tableData = pointData">点</button>
                <button @click="tableData = polylineData">线</button>
            </div>

            <el-table :data="tableData" :border="true" size="small" table-layout="auto" style="width: 100%"
                @selection-change="handleSelectionChange" :highlight-current-row="true">
                <el-table-column type="selection" width="55" />
                <el-table-column type="index" width="50" label="序号" />
                <el-table-column prop="czmObject.name" label="标绘名称" min-width="150" />
                <el-table-column fixed="right" label="操作" width="120">
                    <template #default="scope">
                        <el-icon @click.prevent="locate(scope.row)" title="定位">
                            <Location />
                        </el-icon>
                        <el-icon @click.prevent="showItem(scope.row)" v-show="getShow(scope.row)" title="显隐">
                            <View />
                        </el-icon>
                        <el-icon @click.prevent="showItem(scope.row)" v-show="!getShow(scope.row)" title="显隐">
                            <Hide />
                        </el-icon>
                        <el-icon @click.prevent="edit(scope.row)" title="编辑">
                            <Edit />
                        </el-icon>
                        <el-popconfirm confirm-button-text="是" cancel-button-text="否" icon-color="#626AEF" title="确定删除该图形?"
                            @confirm="deleteItem(scope.row)">
                            <template #reference>
                                <el-icon title="删除">
                                    <Delete />
                                </el-icon>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>

            <!-- <el-button @click="exportJson" size="small" class="exportBtn"
        >导出<el-icon><Download /></el-icon
      ></el-button> -->
            <!-- <el-link type="info" @click="exportJson" class="exportBtn"
        >导出GeoJson</el-link
      > -->

            <el-dropdown class="exportBtn" @command="handleCommand" v-if="$props.type != 'flatten'">
                <span class="el-dropdown-link">
                    导出为...
                    <!-- <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon> -->
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="geojson">geojson</el-dropdown-item>
                        <el-dropdown-item command="kml">kml</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import "./style/index.scss"
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useEarth, combineGeojson, toKML } from '../../utils';
import { plotManagerProps, plotManagerEmits } from './plotManager'
import {
    Download,
    Location,
    View,
    Hide,
    Delete,
    Edit,
    ArrowDown,
} from "@element-plus/icons-vue";
import { ElTable, ElTableColumn, ElIcon, ElPopconfirm, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessage } from 'element-plus';
defineOptions({ name: 'EpsplanetPlotManager' });
const props = defineProps(plotManagerProps);
const emit = defineEmits(plotManagerEmits);
const { type } = props

const showTypeSelect = ref(true);
if (type) {
    showTypeSelect.value = false
}
const tableData = ref<any>([]);
const pointData = ref<any>([]);
const polylineData = ref<any>([]);
const polygonData = ref<any>([]);
const rectangleData = ref<any>([]);
const circleData = ref<any>([]);
const doubleArrowData = ref<any>([]);
const arrowData = ref<any>([]);
const waterData = ref<any>([]);
const smoothpolygonData = ref<any>([]);
const particleData = ref<any>([]);
const customPrimitiveData = ref<any>([]);
const seletedItem = ref<any>([]);
let disposer: any = []
let earth: any;

onMounted(() => {
    earth = useEarth();
    disposer.push(
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.point.toJSONStr();
                }
            },
            () => {
                getPointList();
                refresh();
            }
        ),
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.polyline.toJSONStr();
                }
            },
            () => {
                getPolylineList();
                refresh();
            }
        ),
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.polygon.toJSONStr();
                }
            },
            () => {
                getPolygonList();
                refresh();
            }
        ),
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.rectangle.toJSONStr();
                }
            },
            () => {
                getRectangleList();
                refresh();
            }
        ),
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.circle.toJSONStr();
                }
            },
            () => {
                getCircleList();
                refresh();
            }
        ),
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.doubleArrow.toJSONStr();
                }
            },
            () => {
                getDoubleArrowList();
                refresh();
            }
        ),
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.arrow.toJSONStr();
                }
            },
            () => {
                getArrowList();
                refresh();
            }
        ),
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.water.toJSONStr();
                }
            },
            () => {
                getWaterList();
                refresh();
            }
        ),
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.smoothPolygon.toJSONStr();
                }
            },
            () => {
                getSmoothPolygonList();
                refresh();
            }
        ),
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.particle.toJSONStr();
                }
            },
            () => {
                getParticList();
                refresh();
            }
        ),
        XE.MVVM.watch(
            () => {
                if (earth.sceneTree) {
                    return earth.sceneTree.plots.particle.toJSONStr();
                }
            },
            () => {
                getcustomPrimitiveList();
                refresh();
            }
        ),
        // XE.MVVM.watch(
        //     () => {
        //         if (earth.sceneTree) {
        //             return earth.sceneTree.analysis.flatten.toJSONStr();
        //         }
        //     },
        //     () => {
        //         getFlatten();
        //         refresh();
        //     }
        // )
    );
});
function getPointList() {
    let list = earth.sceneTree.plots.point.toJSON().children;
    pointData.value = list;
}
function getPolylineList() {
    let list: any = [];
    earth.sceneTree.plots.polyline.children.forEach((p) => {
        let json = p.toJSON();
        if (p.czmObject) {
            json.czmObject._polyline = p.czmObject._polyline.toAllJSON();
        }
        list.push(json);
    });
    polylineData.value = list;
}
function getPolygonList() {
    let list = earth.sceneTree.plots.polygon.toJSON().children;
    polygonData.value = list;
}
function getRectangleList() {
    let list: any = [];
    earth.sceneTree.plots.rectangle.children.forEach((p) => {
        let json = p.toJSON();
        if (p.czmObject) {
            json.czmObject._polygon = p.czmObject._polygon.toJSON();
        }
        list.push(json);
    });
    rectangleData.value = list;
}
function getCircleList() {
    let list: any = [];
    earth.sceneTree.plots.circle.children.forEach((p) => {
        let json = p.toJSON();
        if (p.czmObject) {
            json.czmObject._polygon = p.czmObject._polygon.toJSON();
        }
        list.push(json);
    });
    // let list = earth.sceneTree.plots.circle.toJSON().children;
    circleData.value = list;
}
function getDoubleArrowList() {
    let list = earth.sceneTree.plots.doubleArrow.toJSON().children;
    doubleArrowData.value = list;
}
function getArrowList() {
    let list = earth.sceneTree.plots.arrow.toJSON().children;
    arrowData.value = list;
}
function getWaterList() {
    let list = earth.sceneTree.plots.water.toJSON().children;
    waterData.value = list;
    // console.log(list);
}
function getSmoothPolygonList() {
    let list: any = [];
    earth.sceneTree.plots.smoothPolygon.children.forEach((p) => {
        let json = p.toJSON();
        if (p.czmObject) {
            json.czmObject._polygon = p.czmObject._polygon.toJSON();
        }
        list.push(json);
    });
    smoothpolygonData.value = list;
    // console.log(list);
}
function getParticList() {
    let list = earth.sceneTree.plots.particle.toJSON().children;
    particleData.value = list;
}
// customPrimitiveData
function getcustomPrimitiveList() {
    let list = earth.sceneTree.plots.particle.toJSON().children;
    particleData.value = list;
}
// function getFlatten() {
//     let list = earth.sceneTree.analysis.flatten.toJSON().children;
//     data.flattenData = list;
// }

function refresh() {
    if (!props.type) return;
    switch (props.type) {
        case "point":
            tableData.value = pointData.value;
            break;
        case "polyline":
            tableData.value = polylineData.value;
            break;
        case "polygon":
            tableData.value = polygonData.value;
            break;
        case "rectangle":
            tableData.value = rectangleData.value;
            break;
        case "circle":
            tableData.value = circleData.value;
            break;
        case "doubleArrow":
            tableData.value = doubleArrowData.value;
            break;
        case "arrow":
            tableData.value = arrowData.value;
            break;
        case "water":
            tableData.value = waterData.value;
            break;
        case "smoothPolygon":
            tableData.value = smoothpolygonData.value;
            break;
        case "particle":
            tableData.value = particleData.value;
            break;
        // case "flatten":
        //     tableData.value = data.flattenData;
        // break;
        default:
            break;
    }
}
//多选
function handleSelectionChange(val) {
    console.log(val);
    seletedItem.value = val;
}

function saveContentToFile(content, filename) {
    var link = document.createElement("a");
    var blob = new Blob([content]);
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
function exportJson() {
    let json = combineGeojson(seletedItem.value);
    let kml = toKML(seletedItem.value);
    console.log(json, kml);
    // seletedItem.value.forEach((e) => {
    //   saveContentToFile(JSON.stringify(e), e.czmObject.name + ".json");
    // });
}
function handleCommand(type) {
    switch (type) {
        case "geojson":
            let json = combineGeojson(seletedItem.value);
            saveContentToFile(JSON.stringify(json), props.type + ".json");
            break;
        case "kml":
            let kml = toKML(seletedItem.value);
            saveContentToFile(kml, props.type + ".kml");
            break;

        default:
            break;
    }
}
function locate(e) {
    console.log(e);
    earth.getObject(e.czmObject.xbsjGuid).flyTo();
}
function showItem(e) {
    if (e.czmObject.xbsjType == "FlattenedPolygonCollection") {
        earth.getObject(e.czmObject.xbsjGuid).enabled = !earth.getObject(
            e.czmObject.xbsjGuid
        ).enabled;
    } else if (e.czmObject.xbsjType == "GeoPolygon") {
        let czmobj = earth.getObject(e.czmObject.xbsjGuid);
        console.log(czmobj._label);
        // debugger
        czmobj.show = !czmobj.show;
        if (czmobj._label.originShow !== undefined) {
            // return
            if (czmobj._label.originShow) {
                czmobj._label.show = czmobj.show;
            }
        } else {
            if (czmobj._label.show) {
                czmobj._label.show = czmobj.show;
                czmobj._label.originShow = true
            } else {
                czmobj._label.originShow = false
            }
        }

        console.log(czmobj._label.show);
        // czmobj._label.enabled = czmobj.show;
    }
    else {
        earth.getObject(e.czmObject.xbsjGuid).show = !earth.getObject(
            e.czmObject.xbsjGuid
        ).show;
    }
}
function getShow(e) {
    if (e.czmObject.xbsjType == "FlattenedPolygonCollection") {
        return earth.getObject(e.czmObject.xbsjGuid).enabled;
    } else {
        return earth.getObject(e.czmObject.xbsjGuid).show;
    }
}
function deleteItem(e) {
    let item = earth.getObject(e.czmObject.xbsjGuid);
    // console.log(item);
    removeLayersByCzmobject(item, earth);
}
//删除czmObject对象
function removeLayersByCzmobject(czmObject: any, earth: any) {
    if (czmObject.xbsjType === "GeoPolygon") {
        if (czmObject._label) {
            earth.czm.viewer.entities.remove(czmObject._label);
        }
    }
    if (czmObject.xbsjType === "FlattenedPolygonCollection") {
        getczmObjectParent(earth.sceneTree.analysis[props.type].children);
    }
    else {
        getczmObjectParent(earth.sceneTree.plots[props.type].children);
    }

    function removeNode(node: any) {
        node.parent.children.remove(node);
        ElMessage.success("删除成功");
    }
    function getczmObjectParent(treeList: any) {
        treeList.forEach((node) => {
            if (node.children && node.children.length > 0) {
                getczmObjectParent(node.children);
            } else {
                if (node.czmObject.guid === czmObject.guid) {
                    removeNode(node);
                }
            }
        });
    }
}
//编辑
function edit(current) {
    console.log(current);
    emit("handleEdit", current.czmObject);
}
function del() {
    disposer.forEach((d) => d());
}
onBeforeUnmount(() => {
    del();
});
</script>
  