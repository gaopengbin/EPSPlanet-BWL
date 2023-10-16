<template>
  <div class="epsplanet-panel-base" style="width: 100%">
    <el-form ref="form" label-width="70px">
      <el-form-item label="采样间距">
        <el-input-number v-model="samplinginterval" :step="1" :max="1000"></el-input-number>
      </el-form-item>
    </el-form>
    <div class="myBarChart" ref="mains"></div>
    <div class="tool-panel-button">
      <el-button @click="init()" size="small">创建</el-button>
      <el-button @click="editing = true" size="small">编辑</el-button>
      <el-button @click="del()" size="small">清除</el-button>
    </div>
  </div>
</template>
<script lang='ts'>
/* eslint-disable */
import "./style/index.scss";
import * as echarts from "echarts";
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
  watch,
  ref,
} from "vue";
import { useEarth, getDisAndLabelPos } from '../../utils';
import elementResizeDetectorMaker from "element-resize-detector";
export default defineComponent({
  name: "EpsplanetProfile",
  props: [],
  setup(props, context) {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      creating: false,
      editing: false,
      _labels: [] as any,
      samplinginterval: 3,
      // _result: undefined as any,
      // _chart: undefined as any,
    });
    let _disGroud: any;
    let _chart: any;
    let _result: any;
    let _disposers: any = [];
    watch(
      () => data.samplinginterval,
      () => {
        updateMeasure(_disGroud.positions);
      }
    );
    onMounted(() => {
      earth = useEarth();
      init();
      watchResize();
    });
    onBeforeUnmount(() => {
      del();
      if (_chart) {
        _chart.dispose();
      }
    });
    function watchResize() {
      // let elementResizeDetectorMaker = require("element-resize-detector");
      var erd = elementResizeDetectorMaker(null);
      // var erdUltraFast = elementResizeDetectorMaker({
      //   strategy: "scroll",
      //   callOnAdd: true, //callOnAdd选项，用于确定在添加侦听器时是否应调用它们。默认为true。
      //   //如果为true，则确保在添加侦听器后将对其进行调用。如果为false，则在添加侦听器时将不保证其
      //   //被调用（不会阻止其被调用）
      //   debug: true,
      // });
      erd.listenTo(null, document.querySelector(".myBarChart"), function (element) {
        if (_chart) {
          _chart.resize();
        }
      });
    }
    function init() {
      if (_disGroud) {
        return;
      }
      earth.czm.scene.globe.depthTestAgainstTerrain = true;
      let disGroud = new XE.Obj.Plots.GeoPolyline(earth);
      _disGroud = disGroud;
      console.log(disGroud);
      disGroud.creating = true;
      //   let disposer = [];
      _disposers = [];
      _disposers.push(
        XE.MVVM.bind(thisVue, "creating", disGroud, "creating"),
        XE.MVVM.bind(thisVue, "editing", disGroud, "editing"),
        XE.MVVM.watch(
          () => disGroud.creating,
          () => {
            data.creating = disGroud.creating;
          }
        ),
        XE.MVVM.watch(
          () => disGroud.editing,
          () => {
            data.editing = disGroud.editing;
          }
        ),
        XE.MVVM.watch(
          () => ({
            positions: [...disGroud.positions],
          }),
          () => {
            updateMeasure(disGroud.positions);
          }
        )
      );
      _chart = echarts.init(proxy.$refs.mains);
    }

    function updateMeasure(p: any) {
      if (data._labels) {
        data._labels.forEach((l: { destroy: () => any }) => l.destroy());
      }

      data._labels = [];
      if (p.length > 1) {
        var it = data.samplinginterval;
        var result = getDisAndLabelPos(p, it, earth);
        if (!result) {
          return;
        }
        _result = result;
        var labels = result.label;

        labels.forEach((l: { dis: any; pos: any }) => {
          var lb = createLabel(l);
          data._labels.push(lb);
        });
        drawLine();
      }
    }
    function createLabel(option: { dis: any; pos: any }) {
      let p = new XE.Obj.Plots.GeoPin(earth);
      p.innerHTML =
        '<div style="cursor:pointer;position: absolute;width:300px;left:6px; line-height:15px;color: white;">' +
        '<span style="padding:2px;border-radius: 2px;text-stroke:2px #000;font-size: 14px;color:#ffffff;background-color: rgba(50,50,50,0.5)">' +
        option.dis +
        "</span></div>"; //-webkit-text-stroke:0.6px #000;
      p.position = option.pos;
      p._pin.show = false;

      return p;
    }

    /*画图*/
    function drawLine() {
      // 绘制柱状图图表
      let resultdata = _result.sample,
        xdata = [] as any,
        ydata = [] as any,
        // data = {},
        min,
        max;
      resultdata.forEach((element: any) => {
        xdata.push(element.distance);
        ydata.push(Number(element.height.toFixed(2)));
      });

      _chart.setOption({
        tooltip: {
          trigger: "axis",
          // position: function (pt: any[]) {
          //   return [pt[0], "10%"];
          // },
          position: function (
            point: any[],
            params: any,
            dom: any,
            rect: any,
            size: { viewSize: any[]; contentSize: any[] }
          ) {
            //其中point为当前鼠标的位置，size中有两个属性：viewSize和contentSize，分别为外层div和tooltip提示框的大小;
            var x = point[0]; //
            var y = point[1];
            var viewWidth = size.viewSize[0];
            var viewHeight = size.viewSize[1];
            var boxWidth = size.contentSize[0];
            var boxHeight = size.contentSize[1];
            var posX = 0; //x坐标位置
            var posY = 0; //y坐标位置

            if (x < boxWidth) {
              //左边放不开
              posX = 5;
            } else {
              //左边放的下
              posX = x - boxWidth;
            }

            if (y < boxHeight) {
              //上边放不开
              posY = 5;
            } else {
              //上边放得下
              posY = y - boxHeight;
            }
            return [posX, posY];
          },
          formatter(params: any[]) {
            const item = params[0];
            // console.log(item);
            item.data = resultdata[item.dataIndex];
            return (
              "<span>所在位置 " +
              item.data.longitude.toFixed(6) +
              "°," +
              item.data.latitude.toFixed(6) +
              "°</span><br/><span>距起点 " +
              item.name +
              "米</span><br/>" +
              item.seriesName +
              " " +
              "<span style='color:rgb(255, 70, 131);font-weight:bold;'>" +
              item.value +
              "米</span>"
            );
          },
        },
        // title: {
        //   left: "center",
        //   text: "大数据量面积图"
        // },
        grid: {
          left: 50, //距离左边的距离
          right: 25, //距离右边的距离
          bottom: 60, //距离下边的距离
          top: 25, //距离上边的距离
        },
        xAxis: {
          type: "category",
          // boundaryGap: false,
          data: xdata,
          axisLabel: {
            interval: 3,
            rotate: 40,
            textStyle: {
              color: "rgba(96,98,102,1)", //坐标值得具体的颜色
            },
            formatter: "{value} 米",
          },
          axisLine: {
            lineStyle: {
              type: "solid",
              color: "rgb(255, 70, 131)", //坐标线的颜色
              width: "2", //坐标线的宽度
            },
            // onZero: false,
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          // boundaryGap: [0, "100%"],
          // minInterval: 1, //设置成1保证坐标轴分割刻度显示成整数
          // axisLine: {
          //   lineStyle: {
          //     type: "solid",
          //     color: "rgba(85,85,85,0.6)", //坐标线的颜色
          //     width: "2"
          //   }
          // },
          max: function (value: { max: any }) {
            return value.max;
          },
          min: function (value: { min: any }) {
            return value.min;
          },
          axisLabel: {
            interval: 0,
            rotate: 40,
            textStyle: {
              color: "rgba(96,98,102,1)", //坐标值得具体的颜色
            },
            formatter: "{value} 米",
          },
          axisTick: {
            show: false,
          },
          //网格样式
          splitLine: {
            show: true,
          },
        },
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 100,
          },
        ],
        series: [
          {
            name: "高程值",
            type: "line",
            smooth: true,
            symbol: "none",
            sampling: "average",
            itemStyle: {
              color: "rgb(255, 70, 131)",
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "rgb(255, 158, 68)",
                },
                {
                  offset: 1,
                  color: "rgb(255, 70, 131)",
                },
              ]),
            },
            data: ydata,
          },
        ],
      });
    }
    function del() {
      if (_disGroud) {
        _disGroud.destroy();
        _disGroud = undefined;
      }
      if (data._labels) {
        data._labels.forEach((e: { destroy: () => void }) => {
          e.destroy();
        });
        data._labels = [];
      }
      if (_disposers) {
        _disposers.forEach((d: () => any) => d());
        _disposers.length = 0;
      }
      if (_chart) {
        _chart.clear();
      }
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      del,
    };
  },
});
</script>