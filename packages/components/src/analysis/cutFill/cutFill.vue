<template>
  <div class="epsplanet-panel-base" :style="{ width: showTable ? '750px' : '400px' }">
    <el-row>
      <el-col :span="showTable ? 12 : 24">
        <el-form ref="form" class="cutFillForm" label-width="100px">
          <el-form-item label="绘制范围">
            <el-button class="tool" @click="draw" style="margin-right: 10px">绘制</el-button>
            <!-- <shp2Geojson @importDone="importDone" /> -->
          </el-form-item>
          <el-form-item label="采样间隔(m)">
            <el-input-number v-model="gridWidth" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="基准高程(m)">
            <el-input-number v-model="height" :precision="2" :step="0.1" />
          </el-form-item>
          <!-- <el-form-item label="挖填目标">
            <el-radio-group v-model="cutFillType" class="ml-4">
              <el-radio label="1" size="large">平面</el-radio>
              <el-radio label="2" size="large">倾斜模型</el-radio>
            </el-radio-group>
          </el-form-item> -->
          <el-form-item label="选择模型" v-show="cutFillType == '2'">
            <el-select size="small" v-model="selectTileset" placeholder="请选择" @change="changeTileset"
              @visible-change="xiala" value-key="index" popper-class="tool-panel-popper" style="width:250px">
              <el-option v-for="item in tilesetList" :key="item.index" :label="item.name" :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="tool-panel-button">
          <el-button @click="start" size="small">开始</el-button>
          <el-button @click="clearResult" size="small">清除</el-button>
        </div>
      </el-col>
      <el-col :span="12" v-if="showTable">
        <el-table :data="tableData" border size="small" table-layout="auto" style="width: 100%">
          <el-table-column prop="type" label="土方计算结果" align="center">
            <el-table-column prop="type" label="类别" width="100" />
            <el-table-column prop="value" label="值" width="130" />
            <el-table-column prop="unit" label="单位" />
          </el-table-column>
        </el-table>
        <span style="font-size: small; color: rgb(255, 255, 255)">注：挖填总量为正值是需要填入，为负值即为需要挖出</span>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
  watch,
} from "vue";
import { useEarth } from '../../utils';
// import shp2Geojson from "../../../others/shp2Geojson.vue";
import { ElLoading } from "element-plus";

export default defineComponent({
  name: "EpsplanetCutFilling",
  components: {
    // shp2Geojson,
  },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    let cutFillComputing: any;
    let loadService: any;

    const thisVue = proxy;
    const data = reactive({
      _disposer: [] as any,
      sample: 1,
      maxSample: 100,
      baseHeight: 0,
      cutFillType: "1",
      tilesetList: [] as any,
      selectTileset: undefined as any,
      polygonCreating: false,
      progress: 0.0,
      progressText: "0.0%",
      computing: false,
      gridWidth: 1.0,
      height: 0,
      results: {
        gridWidth: 0.0,
        area: 0.0,
        cut: 0.0,
        fill: 0.0,
        total: 0.0,
      },
      res1: { gridWidth: 0.0, area: 0.0, cut: 0.0, fill: 0.0, total: 0.0 },
      res2: { gridWidth: 0.0, area: 0.0, cut: 0.0, fill: 0.0, total: 0.0 },
      oneOk: false,
      twoOk: false,
      tableData: [] as any,
      showTable: false,
    });
    onMounted(() => {
      earth = useEarth();
      init();
    });
    onBeforeUnmount(() => {
      del();
    });
    watch(
      () => data.computing,
      (val) => {
        if (!val) {
          if (loadService) {
            loadService.close();
          }
          if (data.progress == 1) {
            data.showTable = true;
            let tableData = [
              {
                type: "总面积",
                value: data.results.area.toFixed(4),
                unit: "平方米",
              },
              {
                type: "采样间距",
                value: data.results.gridWidth.toFixed(2),
                unit: "米",
              },
              {
                type: "挖方",
                value: data.results.cut.toFixed(4),
                unit: "立方米",
              },
              {
                type: "填方",
                value: data.results.fill.toFixed(4),
                unit: "立方米",
              },
              {
                type: "挖填总量",
                value: data.results.total.toFixed(4),
                unit: "立方米",
              },
            ];
            data.tableData = tableData;
            console.log(tableData);
            if (data.cutFillType == "2") {
              if (data.oneOk) {
                console.log("看来第二次也ok");
                data.res2 = JSON.parse(JSON.stringify(data.results));
                data.twoOk = true;
                compute2Res();
              } else {
                data.oneOk = true;
                console.log("第一次刚完");
                data.res1 = JSON.parse(JSON.stringify(data.results));
                compute2();
              }
            }
          }
        }
      }
    );
    watch(
      () => data.progress,
      (val) => {
        data.progressText = (val * 100).toFixed(2) + "%";
        if (loadService) {
          if (data.cutFillType == "2") {
            if (data.oneOk) {
              loadService.setText("目标模型分析" + data.progressText);
            } else {
              loadService.setText("当前模型分析" + data.progressText);
            }
          } else {
            loadService.setText("计算中" + data.progressText);
          }
        }
      }
    );
    function init() {
      cutFillComputing = earth.analyzation.cutFillComputing;
      const bind = XE.MVVM.bind;
      const props = [
        "polygonCreating",
        "progress",
        "computing",
        "gridWidth",
        "height",
        "results.gridWidth",
        "results.area",
        "results.cut",
        "results.fill",
        "results.total",
      ];
      props.forEach((p) => {
        data._disposer.push(bind(thisVue, p, cutFillComputing, p));
      });
    }
    function draw() {
      data.polygonCreating = true;
    }
    function importDone(geojson) {
      let type = turf.getType(geojson);
      console.log(type);
      let flatten = turf.flatten(geojson);
      console.log(flatten);
      let union = turf.union(...flatten.features);
      console.log(union);
      // let feature = flatten.features[0];
      let coordinates = turf.coordAll(union);
      let positions: any = [];
      coordinates.forEach((p) => {
        positions.push(
          turf.degreesToRadians(p[0]),
          turf.degreesToRadians(p[1])
        );
      });
      cutFillComputing.positions = positions;
      cutFillComputing._polygon.flyTo();
      //   init2(positions);
    }
    function xiala() {
      data.tilesetList = [];
      earth.tilesetCollection.forEach((t: any, index: any) => {
        data.tilesetList.push({
          name: t.name,
          index: index,
        });
      });
    }
    function start() {
      if (cutFillComputing.positions.length == 0) {
        alert("请先绘制范围");
        return;
      }
      //选择倾斜模型需要进行两次计算，
      if (data.cutFillType == "2" && data.twoOk) {
        data.oneOk = false;
        data.twoOk = false;
      }
      loadService = ElLoading.service({
        text: "0.0%",
        target: ".cutFillForm",
      });
      cutFillComputing.compute();
    }
    //对选择的倾斜模型再进行一次计算，就是换个模型重新计算
    function compute2() {
      console.log("开始第二次", data.selectTileset);
      earth.tilesetCollection.forEach((s) => (s.show = false));
      earth.tilesetCollection[data.selectTileset.index].show = true;
      setTimeout(() => {
        cutFillComputing.clearResults();
        start();
      }, 1000);

      //   cutFillComputing.compute();
    }
    function compute2Res() {
      let r1 = data.res1;
      let r2 = data.res2;
      let result = [
        {
          type: "总面积",
          value: r1.area.toFixed(4),
          unit: "平方米",
        },
        {
          type: "采样间距",
          value: r1.gridWidth.toFixed(2),
          unit: "米",
        },
        {
          type: "挖方",
          value: (r2.cut - r1.cut).toFixed(4),
          unit: "立方米",
        },
        {
          type: "填方",
          value: (r2.fill - r1.fill).toFixed(4),
          unit: "立方米",
        },
        {
          type: "挖填总量",
          value: (r2.total - r1.total).toFixed(4),
          unit: "立方米",
        },
      ];
      data.tableData = result;
    }
    function clearResult() {
      cutFillComputing.clearResults();
      cutFillComputing.polygonCreating = false;
      cutFillComputing.positions = [];
      data.showTable = false;
    }
    function changeTileset() { }
    function del() {
      if (data._disposer) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
      cutFillComputing.clearResults();
      cutFillComputing.polygonCreating = false;
      cutFillComputing.positions = [];
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      draw,
      importDone,
      start,
      clearResult,
      xiala,
      changeTileset,
      del,
    };
  },
});
</script>