<template>
  <div class="epsplanet-panel-base lineOfSight">
    <el-form label-width="120px">
      <el-form-item label="说明">
        <span>直线：鼠标左键添加点，右键删除点</span><br />
        <span>圆形：鼠标左键添加圆心，移动并再次点击选择半径</span>
      </el-form-item>
      <el-form-item label="绘制模式">
        <el-radio v-model="drawMode" label="line">直线</el-radio>
        <el-radio v-model="drawMode" label="circle">圆形</el-radio>
      </el-form-item>
      <el-form-item label="通视线夹角(度)" v-show="drawMode === 'circle'">
        <el-slider v-model="angle" :min="1" :max="90" :step="1" show-input :show-input-controls="false"></el-slider>
      </el-form-item>
    </el-form>
    <div class="tool-panel-button">
      <el-button @click="initPlot" size="small">创建</el-button>
      <el-button @click="editing = !editing" size="small">编辑</el-button>
      <el-button @click="deleteAll" size="small">删除全部</el-button>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import "./style/index.scss";
import {
  reactive,
  toRefs,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  defineComponent,
} from "vue";
import { useEarth, createPolylinePrimitive } from '../../utils';

export default defineComponent({
  name: "EpsplanetLineOfSight",
  props: [],
  setup() {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      _polylineCzm: undefined as any, // 线段对象
      _circleCzm: undefined as any, // 圆对象
      _radius: 0, // 圆的半径
      _disposer: [] as any, // 用于销毁双向绑定资源数组
      angle: 5, // 线夹角
      creating: false, // 是否处于创建状态
      currentLines: [] as any, // 当前通视线集合
      editing: false, // 是否处于编辑状态
      webMercatorProjection: undefined, // 用于存储球面墨卡托投影
      drawMode: "line", // 通视分析模式：直线或圆
      objectsToExclude: [] as any, // 计算直线与场景交点时需要排除的对象
      visibleLines: [] as any, // 通视线集合，用于清理
    });
    let handler: any;

    onMounted(() => {
      earth = useEarth();
      earth.czm.scene.globe.depthTestAgainstTerrain = true; // 开启深度监测
      // initPlot();
    });
    onBeforeUnmount(() => {
      earth.czm.scene.globe.depthTestAgainstTerrain = false; // 关闭深度监测
      deleteAll();
    });
    // 初始化
    function initPlot() {
      // data._disposer = [];
      // data.objectsToExclude = [];
      // data.visibleLines = [];
      clearBind();
      data.webMercatorProjection = new Cesium.WebMercatorProjection(
        earth.czm.scene.globe.ellipsoid
      );
      if (data.drawMode === "line") {
        // 创建Polyline对象
        let polylineCzm = new XE.Obj.Plots.GeoPolyline(earth);
        polylineCzm.arcType = "NONE";
        polylineCzm.ground = false;
        polylineCzm.creating = true;
        polylineCzm.color = [1, 1, 0, 0.5];
        data._polylineCzm = polylineCzm;

        data._disposer.push(
          XE.MVVM.bind(thisVue, "editing", polylineCzm, "editing"),
          // 绘制两个点后自动计算
          XE.MVVM.watch(
            () => polylineCzm.positions.length,
            () => {
              if (polylineCzm.positions.length > 2) {
                // console.log("计算");
                polylineCzm.creating = false;
                polylineCzm.show = false;
                updateCurrent();
                showIntersection(
                  polylineCzm.positions[0],
                  polylineCzm.positions[1]
                );
              }
            }
          ),
          // 监听editing属性，编辑结束后重新计算通视线
          XE.MVVM.watch(polylineCzm, "editing", () => {
            if (!polylineCzm.editing && polylineCzm.positions.length > 1) {
              polylineCzm.show = false;
              clearCurrent();
              showIntersection(
                polylineCzm.positions[0],
                polylineCzm.positions[1]
              );
            } else {
              // data.visibleLines.forEach((d: any) => (d.show = false));
              polylineCzm.show = true;
            }
          })
        );
      } else if (data.drawMode === "circle") {
        // 圆的操作基本同上，只是需要计算一周的通视线
        let circleCzm = new XE.Obj.Plots.GeoCircle(earth);
        circleCzm.ground = false;
        circleCzm.creating = true;
        circleCzm.color = [1, 1, 0, 0.5];
        data._circleCzm = circleCzm;

        data._disposer.push(
          XE.MVVM.bind(thisVue, "editing", circleCzm, "editing"),
          XE.MVVM.watch(circleCzm, "creating", () => {
            if (!circleCzm.creating && circleCzm.positions.length > 1) {
              circleCzm.show = false;
              updateCurrent();
              constructCircle(circleCzm.positions[0], circleCzm.positions[1]);
            }
          }),
          XE.MVVM.watch(circleCzm, "editing", () => {
            if (!circleCzm.editing && circleCzm.positions.length > 1) {
              circleCzm.show = false;
              clearCurrent();
              constructCircle(circleCzm.positions[0], circleCzm.positions[1]);
            } else {
              // data.visibleLines.forEach((d: any) => (d.show = false));
              circleCzm.show = true;
            }
          })
        );
      }
    }

    // 绘制通视分析线
    function drawVisibleLine(firstPoint: any, secPoint: any, color: any) {
      let positions = [firstPoint, secPoint];
      let newPrimitive = createPolylinePrimitive(positions, color);
      earth.czm.scene.primitives.add(newPrimitive);
      data.currentLines.push(newPrimitive);
      data.visibleLines.push(newPrimitive);
    }

    // 利用射线，判断直线与场景模型是否有交互点，并画出可视范围
    function showIntersection(viewPointRad: any, destPointRad: any) {
      let viewPoint = Cesium.Cartographic.toCartesian(
        new Cesium.Cartographic(
          viewPointRad[0],
          viewPointRad[1],
          viewPointRad[2]
        )
      );
      let destPoint = Cesium.Cartographic.toCartesian(
        new Cesium.Cartographic(
          destPointRad[0],
          destPointRad[1],
          destPointRad[2]
        )
      );
      // console.log(viewPoint, destPoint);
      // 计算射线的方向
      let direction = Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.subtract(
          destPoint,
          viewPoint,
          new Cesium.Cartesian3()
        ),
        new Cesium.Cartesian3()
      );
      // 建立射线
      let ray = new Cesium.Ray(viewPoint, direction);

      // 寻找射线与场景交点
      let result = earth.czm.scene.pickFromRay(
        ray,
        data.objectsToExclude
      );

      if (
        Cesium.defined(result) &&
        Cesium.defined(result.object) &&
        Cesium.defined(result.position)
      ) {
        // 结果坐标转换（笛卡尔转弧度）
        let resCart = new Cesium.Cartographic.fromCartesian(result.position);
        let resRadPosition = [
          resCart.longitude,
          resCart.latitude,
          resCart.height,
        ];
        if (data.drawMode === "line") {
          data._radius = getDistance(viewPointRad, destPointRad);
        }

        // 判断射线与场景模型是否有交互点，排除交互点是地球表面的情况，绘制线
        // 这里判断距离时要注意二者需在投影坐标系下进行比较，否则会出现误差
        if (isWithinRadius(resRadPosition, viewPointRad, data._radius)) {
          drawVisibleLine(resRadPosition, viewPointRad, [0.43, 1, 0.16, 1]); // 可视区域
          drawVisibleLine(resRadPosition, destPointRad, [1, 0, 0, 1]); // 不可视区域
        } else {
          drawVisibleLine(viewPointRad, destPointRad, [0.43, 1, 0.16, 1]);
        }
      } else {
        drawVisibleLine(viewPointRad, destPointRad, [0.43, 1, 0.16, 1]);
      }
    }

    // 构造圆形通视区域
    function constructCircle(centerPos: any, pos: any) {
      // 数组坐标转投影坐标
      let centerProjected = radToProjected(centerPos);

      // 计算半径
      data._radius = getDistance(centerPos, pos);

      // 遍历一周，这里i为角度
      for (let i = 0; i < 360; i += data.angle) {
        // 角度转弧度
        let radians = Cesium.Math.toRadians(i);

        // 计算圆弧上的目标点坐标
        let toPoint = new Cesium.Cartesian3(
          centerProjected.x + data._radius * Math.cos(radians),
          centerProjected.y + data._radius * Math.sin(radians),
          centerProjected.z
        );

        // 投影坐标转弧度数组坐标
        toPoint = (data.webMercatorProjection as any).unproject(toPoint);
        let endPos = [toPoint.longitude, toPoint.latitude, toPoint.height];
        showIntersection(centerPos, endPos);
      }
    }

    // 弧度坐标（数组形式）转投影坐标
    function radToProjected(pos: any) {
      return (data.webMercatorProjection as any).project(
        new Cesium.Cartographic(pos[0], pos[1], pos[2])
      );
    }

    // 计算两点平面距离（投影坐标系下）
    function getDistance(p1: any, p2: any) {
      let p1Projected = radToProjected(p1);
      let p2Projected = radToProjected(p2);
      let d = Math.sqrt(
        Math.pow(p1Projected.x - p2Projected.x, 2) +
        Math.pow(p1Projected.y - p2Projected.y, 2)
      );
      return d ? d : d + 1;
    }

    // 判断一个点是否在圆内，如果是直线模式则直接返回true
    function isWithinRadius(position: any, centerPos: any, radius: any) {
      return getDistance(position, centerPos) < radius;
    }
    // 更新当前线集合
    function updateCurrent() {
      data.currentLines = [] as any;
    }

    // 删除当前线
    function clearCurrent() {
      // console.log("before: ", data.currentLines);
      if (data.currentLines.length) {
        data.currentLines.forEach((d: any) => d.destroy());
        data.currentLines.length = 0;
      }
    }

    // 清除所有已绘制的通视线
    function deleteVisibleLines() {
      if (data.visibleLines.length) {
        data.visibleLines.forEach((d: any) => d.destroy());
        data.visibleLines.length = 0;
      }
    }
    // 清除绑定事件
    function clearBind() {
      if (data._disposer.length > 0) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
      if (handler) {
        handler = handler && handler.destroy();
      }
    }

    // 销毁绑定属性和点线元素
    function deleteAll() {
      deleteVisibleLines();
      clearBind();
      if (data._polylineCzm) {
        data._polylineCzm =
          data._polylineCzm && (data._polylineCzm as any).destroy();
      }
      if (data._circleCzm) {
        data._circleCzm = data._circleCzm && (data._circleCzm as any).destroy();
      }
    }

    const refData = toRefs(data);
    return {
      ...refData,
      deleteAll,
      initPlot,
    };
  },
});
</script>
