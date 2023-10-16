<template>
  <div class="epsplanet-panel-base sunshine">
    <div class="demo-date-picker">
      <el-row>
        <el-col :span="4">
          <span class="demonstration">日期选择:</span>
        </el-col>
        <el-col :span="20">
          <el-date-picker v-model="dateV" type="daterange" unlink-panels start-placeholder="开始日期" end-placeholder="结束日期"
            @change="dateChange($event)" class="floatstyle" />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4">
          <label class="demonstration">时间选择:</label>
        </el-col>
        <el-col :span="20">
          <el-time-picker v-model="timeV" is-range start-placeholder="开始时刻" end-placeholder="结束时刻"
            @change="timeChange($event)" class="floatstyle" />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4">
          <label class="demonstration">时间流速:</label>
        </el-col>
        <el-col :span="20">
          <el-input-number v-model="timeflowrate" :min="1" :max="60" class="floatstyle" />
          <el-select v-model="timeMultiple" class="floatstyle2">
            <el-option v-for="item in timeUnit" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <!-- <el-col :span="4" :pull="7"> -->
        <!-- <span class="demonstration">秒</span> -->
        <!-- <el-select v-model="timeMultiple" class="floatstyle">
            <el-option v-for="item in timeUnit" :key="item.value" :label="item.label" :value="item.value" />
          </el-select> -->
        <!-- </el-col> -->
      </el-row>
      <el-row>
        <el-col :span="4">
          <label class="demonstration">当前时间:</label>
        </el-col>
        <el-col :span="20">
          <el-input v-model="curtime" class="floatstyle3" />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4">
          <label class="demonstration">自动播放:</label>
        </el-col>
        <el-col :span="20">
          <el-button type="primary" @click="play(false)">播放</el-button>
          <el-button type="primary" @click="pause">暂停</el-button>
          <el-button type="primary" @click="play(true)">继续播放</el-button>
        </el-col>

      </el-row>
    </div>
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
} from "vue";
import { useEarth } from '../../utils';
import moment from 'moment'

export default defineComponent({
  name: "EpsplanetSunShine",
  props: [],
  setup() {
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    let earth: any;
    const data = reactive({
      dateV: [] as any, //日期
      timeV: [] as any, //一天内时间
      timeflowrate: 3600,//时间流速，默认1小时
      timeflowUnit: '秒',//时间流速单位
      curtime: "",//当前时间显示
      timeMultiple: 1 as number,//时间倍数
      timeUnit: [{ label: '秒', value: 1 }, { label: '分', value: 60 }, { label: '时', value: 3600 }, { label: '天', value: 86400 }]
    });

    let timehandle: any;
    let viewer: any;
    let specialPlay: boolean = false;
    onMounted(async () => {
      earth = useEarth();
      viewer = earth.czm.viewer;
      methods.init();
    });
    onBeforeUnmount(() => {
      methods.del();
    });

    const methods = {
      init() {
        //是否开启抗锯齿
        if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {//判断是否支持图像渲染像素化处理
          viewer.resolutionScale = window.devicePixelRatio;
        }
        viewer.scene.fxaa = true;
        viewer.scene.postProcessStages.fxaa.enabled = true;

        // viewer.scene.globe.enableLighting = true; //开启场景光照
        // viewer.shadows = true; //开启阴影
        earth.effect.shadow.enabled = true;

        //设置当前日期时间
        let curdatetime = new Date();
        // data.curtime = moment(curdatetime).format('YYYY-MM-DD HH:mm:ss');
        data.dateV = [curdatetime, curdatetime];
        data.timeV = [curdatetime, curdatetime];
      },

      dateChange(val) {
        let curtimed = methods.splicetime(val[0], data.timeV[0]);
      },

      timeChange(val) {
        let curtimet = methods.splicetime(data.dateV[0], val[0]);
      },
      //根据日期、时刻 拼接出完整的时间
      splicetime(dateP, timeP) {
        let year = dateP.getFullYear();
        let month = dateP.getMonth();
        let day = dateP.getDate();
        let hours = timeP.getHours();
        let minute = timeP.getMinutes();
        let seconds = timeP.getSeconds();
        // "q+" : Math.floor((date.getMonth()+3)/3), //季度 
        // "S"  : date.getMilliseconds()             //毫秒 
        let date = new Date(year, month, day, hours, minute, seconds);
        // console.log("拼接的时间为：", date);
        return date
      },

      play(next: boolean) {
        let startTime = methods.splicetime(data.dateV[0], data.timeV[0]);
        let currentTime = methods.splicetime(data.dateV[0], data.timeV[0]);
        let stopTime = methods.splicetime(data.dateV[1], data.timeV[1]);
        clearInterval(timehandle);
        if (data.timeV[0].getTime() == data.timeV[1].getTime() && data.timeflowrate * data.timeMultiple >= 86400) {
          specialPlay = true;
        }
        else { specialPlay = false; }
        // 判断是重新播放还是继续播放
        if (!next) {
          // 时间一样则跳到当前时间的日照
          if (startTime.getTime() == stopTime.getTime()) {
            viewer.clock.currentTime = Cesium.JulianDate.fromDate(startTime);
          }
          // 时间不一样时
          else {
            // 时刻一样，且流速大于1天
            if (specialPlay) {
              methods.specialPlayf();
            }
            else {
              viewer.clock.startTime = Cesium.JulianDate.fromDate(startTime);
              viewer.clock.currentTime = Cesium.JulianDate.fromDate(currentTime);
              viewer.clock.stopTime = Cesium.JulianDate.fromDate(stopTime);
              viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; //UNBOUNDED表示时间会一直前进；CLAMPED表示只在开始和结束时间之间，到端点就停止；LOOP_STOP表示在开始结束时间之间不停的循环；
              viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
              viewer.clock.multiplier = data.timeflowrate * data.timeMultiple;
              viewer.clock.shouldAnimate = true;
              // viewer.clock.tick();

              //vue的watch只能侦听响应式属性，viewer.clock.currentTime监听不了，在cesium中也无法监听这个属性。。。吐了。。。
              timehandle = setInterval(() => {
                let jscurrentTime = Cesium.JulianDate.toDate(viewer.clock.currentTime);
                data.curtime = moment(jscurrentTime).format('YYYY-MM-DD HH:mm:ss');
              }, 100)
            }
          }
        }
        // 继续播放
        else {
          if (specialPlay) {
            methods.specialPlayf(true);
          }
          else {
            viewer.clock.shouldAnimate = true;
          }
        }

      },
      // 日期不一样，时刻一样，且流速大于1天时执行的阴影函数
      specialPlayf(continu: boolean = false) {
        let startTime = methods.splicetime(data.dateV[0], data.timeV[0]);
        let stopTime = methods.splicetime(data.dateV[1], data.timeV[1]);
        viewer.clock.currentTime = !continu ? Cesium.JulianDate.fromDate(startTime) : viewer.clock.currentTime;

        timehandle = setInterval(() => {
          let jscurrentTime = Cesium.JulianDate.toDate(viewer.clock.currentTime);
          if (jscurrentTime.getTime() - stopTime.getTime() < 0) {
            let jsnewTime = new Date(jscurrentTime.getTime() + (data.timeflowrate * data.timeMultiple) * 1000);
            data.curtime = moment(jsnewTime).format('YYYY-MM-DD HH:mm:ss');
            viewer.clock.currentTime = Cesium.JulianDate.fromDate(jsnewTime);
          } else { clearInterval(timehandle); }
        }, 100)
      },

      pause() {
        //取消定时器
        clearInterval(timehandle);
        viewer.clock.shouldAnimate = false;

      },
      del() {
        viewer.clock.shouldAnimate = false;
        viewer.scene.globe.enableLighting = false; //关闭场景光照
        // viewer.shadows = false; //关闭阴影
        earth.effect.shadow.enabled = false;

      },

    };
    const refData = toRefs(data);
    return {
      ...refData,
      ...methods,
    };
  },
});
</script>