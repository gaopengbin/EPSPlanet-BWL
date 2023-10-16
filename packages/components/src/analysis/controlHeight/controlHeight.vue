<template>
  <div class="epsplanet-panel-base controlHeightAnalysis" style="width: 296px">
    <el-form ref="form" label-width="50px" label-position="left">
      <el-form-item label="模式">
        <el-radio-group @change="selectMode" v-model="radio">
          <el-radio label="all">整体控高</el-radio>
          <el-radio label="custom">自定义控高</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="模型">
        <el-select size="small" v-model="selectTileset" placeholder="请选择模型" @change="changeTileset"
          @visible-change="xiala" value-key="index">
          <el-option v-for="item in tilesetList" :key="item.index" :label="item.name" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="高度">
        <el-slider v-model="LimitedHeight" :min="sliderMin" :max="sliderMax" :step="0.1" show-input
          :show-input-controls="false"></el-slider>
      </el-form-item>
      <el-form-item label="操作">
        <el-button @click="creating = !creating" :disabled="disabled">创建</el-button>
        <el-button @click="editing = !editing" :disabled="disabled">编辑</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang='ts'>
/* eslint-disable */
import "./style/index.scss";
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
  watch,
} from "vue";
import { useEarth, getExtremum } from '../../utils';

export default defineComponent({
  name: "EpsplanetControlHeight",
  props: [],
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    let spanTips: any;
    let _controlHeightCzmObj: any;
    let classificationpolygon: any;
    let polygonHeight: any;
    let secondRef: any;
    let secondName: any;
    const data = reactive({
      radio: "all", //选择是否为自定义绘制
      tilesetList: [] as any[], //服务列表
      selectTileset: undefined, //要进行分析的服务
      _controlHeightCzmObj, //控高图层对象
      _controlHeightRef: undefined, //控高图层标识
      creating: false, //是否绘制
      editing: false, //是否编辑
      LimitedHeight: 0, //绝对限制高度
      relativeLimitHeight: 0, //相对限制高度
      minHeight: 0, //最小高度
      maxHeight: 0, //最大高度
      disposer: [] as any[], //储存绑定事件
      position: [] as any[], //裁剪面坐标
      secondRef, //第二服务标识
      secondName, //第二服务名称
      disabled: true, //按钮是否可用
      classificationpolygon, //单体化图层
      sliderMin: 0, //滑块最小值
      sliderMax: 500, //滑块最大值
      polygonHeight, //绘制面
      spanTips,
    });
    //监听绝对高度变化，实时计算控高面的相对高度
    watch(
      () => data.LimitedHeight,
      (val) => {
        data.position[2] = val;
        data.relativeLimitHeight = data.minHeight + val;
      }
    );
    //监听绘制事件是否结束，结束后计算绘制区域最高和最低高程
    watch(
      () => data.creating,
      (val) => {
        if (!val) {
          WordsFollowMouseDOM(2);
          if (data.classificationpolygon.positions.length > 5) {
            getMinAndMaxHeight(data.classificationpolygon.positions);
          }
        } else {
          WordsFollowMouseDOM(1);
          removeSecondServer();
        }
      }
    );
    //监听编辑功能，结束后更新控高面
    watch(
      () => data.editing,
      (val) => {
        if (!val && data.classificationpolygon.positions.length > 5) {
          data.polygonHeight.czmObject.positions =
            data.classificationpolygon.positions;
        }
      }
    );
    onMounted(() => {
      earth = useEarth();
      //初始化功能，判断是否有控高面生成
      if (!data._controlHeightCzmObj) {
        data.spanTips = document.createElement("span");
        data.spanTips.style.position = "absolute";
        data.spanTips.style.color = "#fff";
        data.spanTips.style.backgroundColor = "#333";
        document.body.appendChild(data.spanTips);
        init();
      } else {
        earth.sceneTree.$refs.controlheight.czmObject.show = false;
      }
    });
    onBeforeUnmount(() => {
      document.body.removeChild(data.spanTips);
      del();
    });
    function init() {
      selectMode("all");
    }
    function selectMode(e: any) {
      if (e == "all") {
        // 向图层树添加控高面
        if (data.classificationpolygon) {
          del();
        }
        data.disabled = true;
        earth.sceneTree.root.children.push({
          ref: "controlheight",
          czmObject: {
            name: "控高面",
            xbsjType: "ClippingPlane",
            showHelper: true,
            rotation: [0, 1.57079637, 0],
          },
        });
        //获取控高面对象
        let controlheight = earth.sceneTree.$refs.controlheight;
        data._controlHeightCzmObj = controlheight.czmObject;
        data._controlHeightRef = controlheight.ref;
        data._controlHeightCzmObj.show = false;
        data.disposer = [];
        //双向绑定显隐事件和滑块调整位置事件
        data.disposer.push(
          XE.MVVM.bind(
            thisVue,
            "position",
            data._controlHeightCzmObj,
            "position"
          )
        );
      } else {
        //向图层添加分类面并双向绑定事件
        data.disabled = false;
        if (data._controlHeightCzmObj) {
          del();
        }
        data.classificationpolygon = new XE.Obj.ClassificationPolygon(
          earth
        );
        data.disposer.push(
          XE.MVVM.bind(
            thisVue,
            "creating",
            data.classificationpolygon,
            "creating"
          ),
          XE.MVVM.bind(
            thisVue,
            "editing",
            data.classificationpolygon,
            "editing"
          ),
          XE.MVVM.bind(
            thisVue,
            "relativeLimitHeight",
            data.classificationpolygon,
            "extrudedHeight"
          ),
          XE.MVVM.watch(() => {
            data.creating = data.classificationpolygon.creating;
            data.editing = data.classificationpolygon.editing;
          })
        );
      }
    }
    function xiala(e: any) {
      if (e) {
        // 开启下拉时填充内容
        clear();
        data.tilesetList = [];
        earth.tilesetCollection.forEach((t: any, index: any) => {
          data.tilesetList.push({
            name: t.name,
            index: index,
          });
        });
      }
    }
    function changeTileset(t: any) {
      let tileset = earth.tilesetCollection[t.index];
      // 选中服务后定位到服务
      earth.sceneTree.root.children.forEach((t: any) => {
        if (t.czmObject.guid == tileset.guid) {
          t.czmObject.flyTo();
        }
      });
      if (data.radio == "all") {
        // 若为全域控高，再添加一个相同服务从来套壳，然后绑定控高面
        earth.sceneTree.root.children.forEach((t: any) => {
          if (t.czmObject.guid == tileset.guid) {
            data._controlHeightCzmObj.position = JSON.parse(
              JSON.stringify(t.czmObject.xbsjPosition)
            );
            data.position = data._controlHeightCzmObj.position;
            data.LimitedHeight = Number(data.position[2].toFixed(1));
            data.sliderMin =
              Number(data.LimitedHeight.toFixed(0)) - 30 < 0
                ? 0
                : Number(data.LimitedHeight.toFixed(0)) - 30;
            data.sliderMax = Number(data.LimitedHeight.toFixed(0)) + 300;
            data.secondRef = t.ref + "ReplicationService";
            data.secondName = t.czmObject.name + "ReplicationService";
            let secondServer = {
              ref: data.secondRef,
              czmObject: JSON.parse(JSON.stringify(t.czmObject)),
            };
            secondServer.czmObject.xbsjStyle = JSON.stringify({
              color: {
                conditions: [["true", "rgba(255, 0, 0,0.5)"]],
              },
            });
            secondServer.czmObject.name = data.secondName;
            secondServer.czmObject.xbsjGuid = "";
            secondServer.czmObject.xbsjClippingPlanes = {
              planes: [data._controlHeightCzmObj.xbsjGuid],
            };
            earth.sceneTree.root.children.push(secondServer);
            var ellipsoid = earth.czm.viewer.scene.globe.ellipsoid;
            var cartesian3 = t.czmObject._tileset.boundingSphere.center;
            var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var point = turf.point([lng, lat]);
            var distance = t.czmObject._tileset.boundingSphere.radius / 1000;
            var destination1 = turf.destination(point, distance, 0);
            var destination2 = turf.destination(point, distance, 90);
            var destination3 = turf.destination(point, distance, 180);
            var destination4 = turf.destination(point, distance, 270);
            let positions: any = [];
            positions.push(
              Cesium.Math.toRadians(destination4.geometry.coordinates[0]),
              Cesium.Math.toRadians(destination1.geometry.coordinates[1]),
              Cesium.Math.toRadians(destination2.geometry.coordinates[0]),
              Cesium.Math.toRadians(destination1.geometry.coordinates[1]),
              Cesium.Math.toRadians(destination2.geometry.coordinates[0]),
              Cesium.Math.toRadians(destination3.geometry.coordinates[1]),
              Cesium.Math.toRadians(destination4.geometry.coordinates[0]),
              Cesium.Math.toRadians(destination3.geometry.coordinates[1])
            );
            earth.sceneTree.root.children.push({
              ref: "PolygonHeight",
              czmObject: {
                xbsjType: "Polygon",
                positions: positions,
                height: data.LimitedHeight,
                color: [1, 1, 0, 0.2],
                outline: {
                  color: [1, 0, 0, 0.5],
                },
              },
            });
            data.polygonHeight = earth.sceneTree.$refs.PolygonHeight;
            let polegonCzm = data.polygonHeight.czmObject;
            data.disposer.push(
              XE.MVVM.bind(thisVue, "LimitedHeight", polegonCzm, "height")
            );
          }
        });
      }
    }
    // 根据绘制范围获取最低最高高程
    function getMinAndMaxHeight(positions: any) {
      let positionsArr: any = [];
      for (let i = 0; i < positions.length; i += 2) {
        positionsArr.push([positions[i], positions[i + 1]]);
      }
      getExtremum.getExtremum(earth, positionsArr, 5).then((res: any) => {
        data.minHeight = Number(res[0].toFixed(1));
        data.maxHeight = Number(res[1].toFixed(1));
        data.relativeLimitHeight = data.minHeight;
        data.sliderMin = 0;
        data.sliderMax =
          Number((data.maxHeight - data.minHeight).toFixed(0)) + 30;
        data.classificationpolygon.height = data.maxHeight + 30;
        data.classificationpolygon.show = true;
        data.classificationpolygon.color = [1, 0, 0, 0.5];
        earth.sceneTree.root.children.push({
          ref: "PolygonHeight",
          czmObject: {
            xbsjType: "Polygon",
            positions: positions,
            color: [1, 1, 0, 0.2],
            outline: {
              color: [1, 0, 0, 0.5],
            },
          },
        });
        data.polygonHeight = earth.sceneTree.$refs.PolygonHeight;
        let polegonCzm = data.polygonHeight.czmObject;
        data.disposer.push(
          XE.MVVM.bind(thisVue, "relativeLimitHeight", polegonCzm, "height")
        );
      });
    }
    function WordsFollowMouseDOM(hintwords: any) {
      document.addEventListener("mousemove", function (e) {
        data.spanTips.style.left = e.clientX + 8 + "px";
        data.spanTips.style.top = e.clientY + 2 + "px";
        switch (hintwords) {
          case 1:
            data.spanTips.innerHTML = "shift + 鼠标右键结束绘制";
            data.spanTips.style.display = "block";
            break;
          default:
            data.spanTips.innerHTML = "";
            data.spanTips.style.display = "none";
            break;
        }
      });
    }
    //清除结果
    function clear() {
      removeSecondServer();
      data.selectTileset = undefined;
      if (
        data._controlHeightCzmObj &&
        earth.sceneTree.$refs.controlheight
      ) {
        earth.sceneTree.$refs.controlheight.czmObject.positions = [];
      }
      if (data.classificationpolygon) {
        data.classificationpolygon.show = false;
      }
      data.maxHeight = 0;
      data.minHeight = 0;
    }
    // 移除已经添加的secondServer服务
    function removeSecondServer() {
      earth.sceneTree.root.children.forEach((t: any, index: any) => {
        if (data.secondRef != undefined && t.ref == data.secondRef) {
          earth.sceneTree.root.children.splice(index, 1);
          data.secondRef = undefined;
        }
      });
      earth.sceneTree.root.children.forEach((t: any, index: any) => {
        if (
          data.polygonHeight != undefined &&
          t.ref == data.polygonHeight.ref
        ) {
          earth.sceneTree.root.children.splice(index, 1);
          data.polygonHeight = undefined;
        }
      });
    }
    //销毁并释放
    function del() {
      data.sliderMin = 0;
      data.sliderMax = 500;
      data.LimitedHeight = 0;
      removeSecondServer();
      if (data._controlHeightCzmObj) {
        earth.sceneTree.root.children.forEach((t: any, index: any) => {
          if (
            data._controlHeightRef != undefined &&
            t.ref == data._controlHeightRef
          ) {
            earth.sceneTree.root.children.splice(index, 1);
            data._controlHeightRef = undefined;
          }
        });
        data._controlHeightCzmObj = undefined;
      }
      if (data.classificationpolygon) {
        data.classificationpolygon.destroy();
      }
      if (data.disposer) {
        data.disposer.forEach((d: any) => d());
        data.disposer.length = 0;
      }
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      selectMode,
      changeTileset,
      xiala,
      del,
    };
  },
});
</script>