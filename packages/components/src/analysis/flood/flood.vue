<template>
  <div class="epsplanet-panel-base" style="width: 450px">
    <el-form ref="form" label-width="120px" v-loading="loading" element-loading-text="正在提取高程..."
      element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-form-item label="绘制范围">
        <el-button @click="init" style="margin-right: 10px" class="tool">绘制</el-button>
        <!-- <shp2Geojson @importDone="importDone" /> -->
      </el-form-item>
      <el-form-item label="采样间隔(m)">
        <el-slider v-model="sample" :min="0" :max="maxSample" :step="0.01" show-input :show-input-controls="false"
          style="width: 73%"></el-slider>
        <el-button class="tool" @click="getSample"> 采样 </el-button>
        <el-tooltip content="通过采样获取最大最小高度" placement="bottom" effect="customized">
          <el-icon color="gray">
            <InfoFilled />
          </el-icon>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="最小高度(m)">
        <el-slider v-model="minHeight" :min="0" :max="minWaterHeight * 2" :step="0.1" show-input
          :show-input-controls="false"></el-slider>
      </el-form-item>
      <el-form-item label="最大高度(m)">
        <el-slider v-model="maxHeight" :min="minWaterHeight" :max="maxWaterHeight" :step="0.1" show-input
          :show-input-controls="false"></el-slider>
      </el-form-item>
      <el-form-item label="水淹速度(mm/s)">
        <el-slider v-model="speed" :min="0" :max="1000" :step="0.1" show-input :show-input-controls="false">
        </el-slider>
      </el-form-item>
      <el-form-item label="预计淹没时间">
        <!-- {{ needTime }} -->
        <el-input v-model="needTime" size="small" disabled></el-input>
      </el-form-item>
    </el-form>
    <div class="tool-panel-button">
      <!-- <el-button @click="init" size="small" type="primary">创建</el-button> -->
      <el-button @click="start" size="small">开始</el-button>
      <el-button @click="clearResult" size="small">清除</el-button>
    </div>
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
import { useEarth, ceilNumber, getExtremum, calcCellSize } from '../../utils';
// import shp2Geojson from "../../../others/shp2Geojson.vue";

export default defineComponent({
  name: "EpsplanetFlood",
  props: [],
  components: {
    // shp2Geojson,
  },
  setup() {
    const { proxy,ctx } = getCurrentInstance() as any;
    // const ctx = getCurrentInstance();
    let sunwayearth: any;
    const thisVue = proxy;
    const data = reactive({
      creating: false,
      editing: false,
      sample: 1,
      maxSample: 100,
      waterPositions: [] as any,
      minWaterHeight: 0,
      maxWaterHeight: 0,
      maxHeight: 0,
      minHeight: 0,
      speed: 0.001,
      _waterEntities: undefined,
      timer: undefined,
      entities: [] as any,
      loading: false,
      needTime: "0",
    });
    let _waterCzm: any;
    let _disposers: any = [];
    watch(
      () => data.speed,
      () => {
        computeTime();
      }
    );
    onMounted(() => {
      sunwayearth = useEarth();
      // init();
      console.log('1111');
    });
    onBeforeUnmount(() => {
      del();
    });

    watch(
      () => data.creating,
      () => {
        console.log(data.creating,'222');
      }
    );

    function init() {
      sunwayearth.czm.viewer.scene.globe.depthTestAgainstTerrain = true;
      if (_waterCzm) {
        _waterCzm.creating = true;
      } else {
        let polygon = new XE.Obj.Plots.GeoPolygon(sunwayearth);
        _waterCzm = polygon;
        _disposers = [];
        data.creating = true
        // _waterCzm.creating = true;
        console.log(ctx);
        _disposers.push(
          XE.MVVM.bind(ctx, "creating", polygon, "creating"),

          XE.MVVM.watch(
            () => polygon.creating,
            () => {
              // polygon.creating = data.creating;
              console.log(polygon.creating, data.creating);
              if (!polygon.creating && polygon.positions.length > 2) {
                let cellsize = calcCellSize(polygon.positions);
                data.sample = Number(cellsize);
                data.maxSample = ceilNumber(cellsize);
                console.log(cellsize);
              } else {
                polygon.show = true;
              }
            }
          )
        );
        // polygon.creating = true;
        console.log(polygon);
      }
    }
    function init2(positions) {
      sunwayearth.czm.viewer.scene.globe.depthTestAgainstTerrain = true;
      if (_waterCzm) {
        _waterCzm.positions = positions;
        _waterCzm.flyTo();
      } else {
        let polygon = new XE.Obj.Plots.GeoPolygon(sunwayearth);
        polygon.positions = positions;
        _waterCzm = polygon;
        _waterCzm.flyTo();
      }
      let cellsize = calcCellSize(positions);
      data.sample = Number(cellsize);
      data.maxSample = ceilNumber(cellsize);
      console.log(cellsize);
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
        positions.push([
          turf.degreesToRadians(p[0]),
          turf.degreesToRadians(p[1]),
        ]);
      });
      init2(positions);
    }
    function getSample() {
      clearWater();
      let positions: any = [];
      for (let i = 0; i < _waterCzm.positions.length; i++) {
        const p = _waterCzm.positions[i];
        positions.push(...p);
      }
      setTimeout(() => {
        samples(positions);
      }, 100);
    }
    async function samples(positions) {
      let res = await getExtremum(
        sunwayearth,
        _waterCzm.positions,
        data.sample
      );

      data.minHeight = Number(res[0].toFixed(3));
      data.maxHeight = Number(res[1].toFixed(3));
      console.log(data.minHeight, data.maxHeight);
      data.maxWaterHeight = data.maxHeight * 2;
      data.minWaterHeight = data.minHeight;
      let posList: any = []
      for (let i = 0; i < _waterCzm.positions.length; i++) {
        const p = _waterCzm.positions[i];
        // if (p.length == 2) {
        // p.push(p[0], p[1], data.minWaterHeight)
        // }
        posList.push(p[0], p[1], data.minWaterHeight);
      }
      data.waterPositions = posList;
    }
    function getLowerHeight(coordinates: string | any[]) {
      let heightList: any = [];
      for (let i = 2; i < coordinates.length; i += 3) {
        const p = coordinates[i];
        heightList.push(p);
      }
      let minHeight = Math.min(...heightList);
      return Number(minHeight.toFixed(3));
    }
    function drawWater(targetHeight: number, adapCoordi: any, speed: number) {
      // debugger;
      let waterHeight = data.minHeight;

      let entity = sunwayearth.czm.viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromRadiansArrayHeights(adapCoordi),
          material: new Cesium.Color.fromBytes(64, 157, 253, 150),
          perPositionHeight: true,
          extrudedHeight: new Cesium.CallbackProperty(function (
            time: any,
            result: any
          ) {
            // console.log(time, result);
            //此处用属性回调函数，直接设置extrudedHeight会致使闪烁。
            waterHeight += speed / 40;
            if (waterHeight > targetHeight) {
              waterHeight = targetHeight; //给个最大值
            }
            return waterHeight;
          },
            false),
        },
      });

      data._waterEntities = entity;
    }
    function start() {
      // debugger;
      if (data._waterEntities) {
        clearWater();
      }
      computeTime();
      drawWater(data.maxHeight, data.waterPositions, data.speed);
    }
    function clearResult() {
      if (data._waterEntities) {
        sunwayearth.czm.viewer.entities.remove(data._waterEntities);
        data._waterEntities = undefined;
      }
      if (_waterCzm) {
        _waterCzm.show = false;
        _waterCzm._polygon.positions = [];
      }
    }
    function clearWater() {
      if (data._waterEntities) {
        sunwayearth.czm.viewer.entities.remove(data._waterEntities);
        data._waterEntities = undefined;
      }
      // if (_waterCzm) {
      //     _waterCzm.show = false;
      //     _waterCzm._polygon.positions = [];
      // }
    }
    function del() {
      if (data._waterEntities) {
        sunwayearth.czm.viewer.entities.remove(data._waterEntities);
        data._waterEntities = undefined;
      }
      if (_waterCzm) {
        _waterCzm.destroy();
        _waterCzm = undefined;
      }
      if (_disposers) {
        _disposers.forEach((d: () => any) => d());
        _disposers.length = 0;
      }
    }
    function computeTime() {
      let time = ((data.maxHeight - data.minHeight) / data.speed) * 1000;
      //   console.log(time);
      data.needTime = formatSeconds(time);
      console.log(data.needTime);
    }
    function formatSeconds(value: any) {
      var theTime: any = parseInt(value); // 需要转换的时间秒
      var floatSec = (value % 1).toFixed(2);
      console.log(theTime);
      var theTime1 = 0; // 分
      var theTime2 = 0; // 小时
      var theTime3 = 0; // 天
      if (theTime > 60) {
        theTime1 = parseInt(theTime / 60 + "");
        theTime = parseInt((theTime % 60) + "");
        if (theTime1 > 60) {
          theTime2 = parseInt(theTime1 / 60 + "");
          theTime1 = parseInt((theTime1 % 60) + "");
          if (theTime2 > 24) {
            //大于24小时
            theTime3 = parseInt(theTime2 / 24 + "");
            theTime2 = parseInt((theTime2 % 24) + "");
          }
        }
      }
      var result = "";
      if (theTime > 0) {
        result = "" + (parseInt(theTime) + Number(floatSec)) + "秒";
      }
      if (theTime1 > 0) {
        result = "" + parseInt(theTime1 + "") + "分" + result;
      }
      if (theTime2 > 0) {
        result = "" + parseInt(theTime2 + "") + "小时" + result;
      }
      if (theTime3 > 0) {
        result = "" + parseInt(theTime3 + "") + "天" + result;
      }
      return result;
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      importDone,
      getSample,
      getLowerHeight,
      drawWater,
      start,
      clearResult,
      clearWater,
      computeTime,
      formatSeconds,
      del,
    };
  },
});
</script>